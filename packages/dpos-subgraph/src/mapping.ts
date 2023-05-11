import { Address, BigInt, ethereum, log, store } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  DPOS,
  DPOS__getValidatorResultValidator_infoStruct,
  Delegated,
  Redelegated,
  UndelegateCanceled,
  Undelegated,
  ValidatorRegistered,
} from '../generated/DPOS/DPOS';
import {
  CommissionChange,
  Delegation,
  Undelegation,
  Validator,
} from '../generated/schema';

/**
 * Reimplementation of string[].find()
 * @param array string[]
 * @param str str
 * @returns found string
 */
function findString(array: string[] | null, str: string): string {
  if (array === null) array = [];
  let found = '';
  for (let i = 0; i < array.length; ++i) {
    if (array[i].toLowerCase() === str.toLowerCase()) found = array[i];
    break;
  }
  return found;
}

/**
 * Reimplementation of string[].filter()
 * @param array string[]
 * @param str str
 * @returns filtered string[]
 */
function filterString(array: string[], str: string): string[] {
  if (array === null) array = [];
  let cleanArray: string[] = [];
  for (let i = 0; i < array.length; ++i) {
    if (array[i].toLowerCase() !== str.toLowerCase()) {
      cleanArray.push(array[i]);
    }
    break;
  }
  return cleanArray;
}

/**
 * Reads the validator info data from the contract and ensures it exists in the subgraph.
 * In addition, if the validator didn't exist beforehand it adds the inital stake as the first delegation
 * as well as the initial commission as the first commission change
 * @param validator the validator to check the data for
 * @returns the validator object
 */
function enforceValidatorFromContract(
  account: Address,
  event: ethereum.Event,
  isRegistration: boolean = false
): Validator | null {
  log.debug('Enforcing validator: ' + account.toHexString(), [
    account.toHexString(),
  ]);
  let validator = Validator.load(account.toHexString());
  if (validator && isRegistration) {
    log.debug(
      'Found corrupted validator data, cleaning the store for: ' +
        account.toHexString(),
      [account.toHexString()]
    );
    store.remove('Validator', validator.id);
  }
  if (!validator) {
    log.debug(
      `Validator ${account.toHexString()} not found in store. Creating...`,
      [account.toHexString()]
    );
    validator = new Validator(account.toHexString());
    validator.account = account.toHexString();
    validator.currentDelegationIds = [];
    const dpos = DPOS.bind(event.address);

    const call = dpos.try_getValidator(account);
    if (call.reverted || !call.value) {
      // in case the call reverted that means that the validator has been deleted from the contract so we need to delete it from the store
      store.remove('Validator', validator.id);
      log.warning(`Validator ${validator.id} marked as deleted!`, [
        validator.id,
      ]);
      return null;
    }

    const chainData = call.value;

    if (isRegistration) {
      const firstCommissionSet = new CommissionChange(
        event.transaction.hash.toHexString()
      );
      firstCommissionSet.applianceBlock = event.block.number.toI32();
      firstCommissionSet.commission = chainData.commission;
      firstCommissionSet.registrationBlock =
        chainData.last_commission_change.toI32();
      firstCommissionSet.validator = account.toHexString();
      firstCommissionSet.save();
    }
    validator.save();
  }
  return validator;
}

function getOrInitCurrentDelegation(
  validator: Address,
  delegator: Address
): Delegation {
  const delegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  let delegation = Delegation.load(delegationId);
  if (!delegation) {
    log.debug(`Delegation ${delegationId} not found in store. Creating...`, [
      delegationId,
    ]);
    delegation = new Delegation(delegationId);
    delegation.validator = validator.toHexString();
    delegation.delegator = delegator.toHexString();
    delegation.amount = BigInt.zero();
    delegation.save();
  }
  const validatorEntity = Validator.load(validator.toHexString());
  if (validatorEntity) {
    const hasDelegationId = findString(
      validatorEntity.currentDelegationIds,
      delegation.id
    );
    if (!hasDelegationId) {
      validatorEntity.currentDelegationIds =
        validatorEntity.currentDelegationIds.concat([delegation.id]);
      validatorEntity.save();
    }
  }
  return delegation;
}

function getOrInitUndelegation(
  validator: Address,
  delegator: Address
): Undelegation {
  const delegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  let undelegation = Undelegation.load(delegationId);
  if (!undelegation) {
    undelegation = new Undelegation(delegationId);
  }
  return undelegation;
}

function updateOrAddDelegation(
  newDelegation: Delegation,
  amount: BigInt,
  add: boolean
): void {
  if (add) {
    newDelegation.amount = newDelegation.amount.plus(amount);
  } else {
    newDelegation.amount = newDelegation.amount.minus(amount);
  }
  newDelegation.save();
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  const validator = event.params.validator;
  log.debug('Registering validator' + validator.toHexString(), []);
  enforceValidatorFromContract(validator, event, true);
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;
  log.debug('Handling delegation' + amount.toString(), [amount.toString()]);
  const validatorData = enforceValidatorFromContract(validator, event);

  if (!validatorData) return;

  const newCurrentDelegation = getOrInitCurrentDelegation(validator, delegator);

  // Update Validator
  updateOrAddDelegation(newCurrentDelegation, amount, true);
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;
  let validatorData = enforceValidatorFromContract(validator, event);

  if (!validatorData) return;

  const undelegation = getOrInitUndelegation(validator, delegator);
  log.debug('Handling undelegation' + undelegation.id, [undelegation.id]);
  undelegation.delegator = delegator.toHexString();
  undelegation.validator = validator.toHexString();
  undelegation.canceled = false;
  undelegation.confirmed = false;
  const eligibility = event.block.number.plus(BigInt.fromI32(25000));
  undelegation.eligibilityBlock = eligibility;
  undelegation.stake = amount;
  undelegation.save();
  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  updateOrAddDelegation(currentDelegation, amount, false);

  let totalCurrentDelegations = BigInt.zero();
  for (let i = 0; i < validatorData.currentDelegationIds.length; i++) {
    const delegation = Delegation.load(validatorData.currentDelegationIds[i]);
    if (delegation) {
      log.debug('Loaded current delegation: ' + delegation.id, [delegation.id]);
      totalCurrentDelegations = totalCurrentDelegations.plus(delegation.amount);
    }
  }
  if (totalCurrentDelegations.le(BigInt.zero())) {
    log.warning('Removing validator due to zero stake: ' + validatorData.id, [
      validatorData.id,
    ]);
    store.remove('Validator', validatorData.id);
  }
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const undelegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  const undelegation = Undelegation.load(undelegationId);
  if (undelegation) {
    undelegation.canceled = true;
    undelegation.save();
  } else {
    log.error(`Could not find undelegation ${undelegationId} to cancel`, [
      undelegationId,
    ]);
  }
  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.plus(event.params.amount);
  currentDelegation.save();
}

export function handleUndelegateConfirmed(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const undelegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  const undelegation = Undelegation.load(undelegationId);
  if (undelegation) {
    undelegation.confirmed = true;
    undelegation.save();
  } else {
    log.error(`Cound not find undelegation ${undelegationId} to confirm`, [
      undelegationId,
    ]);
  }
}

export function handleRedelegated(event: Redelegated): void {
  const delegator = event.params.delegator;
  const from = event.params.from;
  const to = event.params.to;
  const amount = event.params.amount;

  // Update validators
  const fromValidator = enforceValidatorFromContract(from, event);
  const toValidator = enforceValidatorFromContract(to, event);

  if (fromValidator && toValidator) {
    // Create delegations
    const currentDelegationDataTo = getOrInitCurrentDelegation(to, delegator);
    const currentDelegationDataFrom = getOrInitCurrentDelegation(
      from,
      delegator
    );

    // Update validators
    updateOrAddDelegation(currentDelegationDataFrom, amount, false);

    updateOrAddDelegation(currentDelegationDataTo, amount, true);
  }
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const validatorData = enforceValidatorFromContract(validator, event);

  if (!validatorData) return;

  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validatorData.id;
  commissionChange.registrationBlock = event.block.number.toI32();
  const appliance = event.block.number.plus(BigInt.fromI32(25000));
  commissionChange.applianceBlock = appliance.toI32();
  commissionChange.save();
}
