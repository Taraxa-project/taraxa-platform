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
): Validator {
  log.debug('Enforcing validator: ' + account.toHexString(), [
    account.toHexString(),
  ]);
  let validator = Validator.load(account.toHexString());
  if (validator === null) {
    validator = new Validator(account.toHexString());
    validator.account = account.toHexString();
    validator.deleted = false;
    validator.delegations = [];
    validator.undelegations = [];
    validator.commissionChanges = [];
    const dpos = DPOS.bind(event.address);

    const call = dpos.try_getValidator(account);

    if (call.reverted) {
      // in case the call reverted that means that the validator has been deleted from the contract so we need to delete it from the store
      // store.remove("Validator", validator.id);
      validator.deleted = true;
      log.warning(`Validator ${validator.id} marked as deleted!`, [validator.id]);
      return validator;
    };

    const chainData = call.value;

    if (isRegistration) {
      const firstDelegation = extractInitialDelegationFromContract(
        chainData,
        account,
        event
      );
      validator.delegations = [firstDelegation.id];
    }

    const firstCommissionSet = new CommissionChange(
      event.transaction.hash.toHexString()
    );
    firstCommissionSet.applianceBlock = event.block.number.toI32();
    firstCommissionSet.commission = chainData.commission;
    firstCommissionSet.registrationBlock =
      chainData.last_commission_change.toI32();
    firstCommissionSet.validator = account.toHexString();
    firstCommissionSet.save();
    validator.commissionChanges = [firstCommissionSet.id];
  }
  validator.save();
  return validator;
}

function extractInitialDelegationFromContract(
  chainData: DPOS__getValidatorResultValidator_infoStruct,
  account: Address,
  event: ethereum.Event
): Delegation {
  const firstDelegation = getOrInitDelegation(event);
  firstDelegation.amount = chainData.total_stake;
  firstDelegation.delegator = chainData.owner.toHexString();
  firstDelegation.validator = account.toHexString();
  firstDelegation.save();
  return firstDelegation;
}

function getOrInitDelegation(event: ethereum.Event): Delegation {
  const delegationId = event.transaction.hash.toHexString();
  let delegation = Delegation.load(delegationId);
  if (delegation === null) {
    delegation = new Delegation(delegationId);
  }
  return delegation;
}

function getOrInitUndelegation(validator: Address, delegator: Address): Undelegation {
  const delegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  let undelegation = Undelegation.load(delegationId);
  if (undelegation === null) {
    undelegation = new Undelegation(delegationId);
  }
  return undelegation;
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
  let newDelegation = getOrInitDelegation(event);
  // Update Validator
  const validatorData = enforceValidatorFromContract(validator, event);
  const delegationExistsForValidator = findString(
    validatorData.delegations,
    newDelegation.id
  );
  if (delegationExistsForValidator && delegationExistsForValidator !== '') {
    newDelegation.amount = newDelegation.amount.plus(amount);
    newDelegation.save();
  } else {
    validatorData.delegations = validatorData.delegations.concat([
      newDelegation.id,
    ]);
    newDelegation.validator = validatorData.id;
    newDelegation.delegator = delegator.toHexString();
    newDelegation.amount = amount;
  }

  validatorData.save();

  // Save current delegation
  newDelegation.save();
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const validatorData = enforceValidatorFromContract(validator, event);

  const undelegation = getOrInitUndelegation(validator, delegator);
  undelegation.delegator = delegator.toHexString();
  undelegation.validator = validator.toHexString();
  undelegation.canceled = false;
  undelegation.confirmed = false;
  const eligibility = event.block.number.plus(BigInt.fromI32(25000));
  undelegation.eligibilityBlock = eligibility;
  undelegation.stake = amount;
  undelegation.save();

  const hasUndelegation = findString(
    validatorData.undelegations,
    undelegation.id
  );
  if (!hasUndelegation) {
    // Update Validator
    validatorData.undelegations = validatorData.undelegations.concat([
      undelegation.id,
    ]);
  }

  let totalDelegation = BigInt.zero();
  let totalUndelegations = BigInt.zero();
  for (let i = 0; i < validatorData.delegations.length; i++) {
    const delegation = Delegation.load(validatorData.delegations[i]);
    if (delegation) {
      totalDelegation = totalDelegation.plus(delegation.amount);
    }
  }
  for (let i = 0; i < validatorData.undelegations.length; i++) {
    const undelegation = Delegation.load(validatorData.undelegations[i]);
    if (undelegation) {
      totalDelegation = totalUndelegations.plus(undelegation.amount);
    }
  }
  if (totalDelegation.le(totalDelegation)) {
    validatorData.deleted = true;
  }

  validatorData.save();
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const undelegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  const undelegation = Undelegation.load(undelegationId);
  if (undelegation !== null) {
    undelegation.canceled = true;
    undelegation.save();
  } else {
    log.error(`Cound not find undelegation ${undelegationId} to cancel`, [undelegationId]);
  }
}

export function handleUndelegateConfirmed(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const undelegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  const undelegation = Undelegation.load(undelegationId);
  if (undelegation !== null) {
    undelegation.confirmed = true;
    undelegation.save();
  } else {
    log.error(`Cound not find undelegation ${undelegationId} to confirm`, [undelegationId]);
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

  if (fromValidator !== null && toValidator !== null) {
    // Create delegations
    let newDelegationDataTo = getOrInitDelegation(event);
    newDelegationDataTo.delegator = delegator.toHexString();
    newDelegationDataTo.validator = toValidator.id;
    newDelegationDataTo.amount = newDelegationDataTo.amount.plus(amount);
    newDelegationDataTo.save();

    let newDelegationDataFrom = getOrInitDelegation(event);
    newDelegationDataFrom.delegator = delegator.toHexString();
    newDelegationDataFrom.validator = fromValidator.id;
    newDelegationDataFrom.amount = newDelegationDataFrom.amount.minus(amount);
    newDelegationDataFrom.save();

    // Update validators
    const alreadyDelegatedToValidator = findString(
      toValidator.delegations,
      newDelegationDataTo.id
    );
    if (!alreadyDelegatedToValidator || alreadyDelegatedToValidator === '') {
      toValidator.delegations = toValidator.delegations.concat([
        newDelegationDataTo.id,
      ]);
      toValidator.save();
    }

    const alreadyDelegatedFromValidator = findString(
      fromValidator.delegations,
      newDelegationDataFrom.id
    );
    if (!alreadyDelegatedFromValidator || alreadyDelegatedFromValidator === '') {
      fromValidator.delegations = fromValidator.delegations.concat([
        newDelegationDataFrom.id,
      ]);
      fromValidator.save();
    }
  }
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const validatorData = enforceValidatorFromContract(validator, event);
  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validatorData.id;
  commissionChange.registrationBlock = event.block.number.toI32();
  const appliance = event.block.number
    .plus(BigInt.fromI32(25000));
  commissionChange.applianceBlock = appliance.toI32();
  commissionChange.save();
  if (validatorData.commissionChanges) {
    validatorData.commissionChanges = validatorData.commissionChanges.concat([
      commissionChange.id,
    ]);
  } else {
    validatorData.commissionChanges = [commissionChange.id];
  }
}
