import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  DPOS,
  DPOS__getValidatorResultValidator_infoStruct,
  Delegated,
  Redelegated,
  Undelegated,
  ValidatorRegistered,
} from '../generated/DPOS/DPOS';
import {
  CommissionChange,
  Delegation,
  Undelegation,
  Validator,
} from '../generated/schema';

// Each of the handler functions honors the following flow:
// 1. Initializes the new schema object
// 2. Enforces validator already exists from chain
// 3. Fills the Schema Object with data from the event or from chain
// 4. Saves the new object
// 5. Updates all other objects mentioning the new one

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

// /**
//  * Basic maths for updating stake of validator
//  * @param validatorAddress hex address of validator
//  * @param addStake stake to add
//  * @param reduceStake stake to reduce
//  */
// function updateTotalStakeOfValidator(
//   validatorAddress: string,
//   addStake: BigInt = BigInt.zero(),
//   reduceStake: BigInt = BigInt.zero(),
//   own: boolean = false
// ): void {
//   const validatorInfo = BasicInfo.load(validatorAddress);
//   if (validatorInfo) {
//     if (addStake) {
//       validatorInfo.totalStake = validatorInfo.totalStake.plus(addStake);
//       if (own) {
//         validatorInfo.selfStake = validatorInfo.selfStake.plus(addStake);
//       } else {
//         validatorInfo.externalStake =
//           validatorInfo.externalStake.plus(addStake);
//       }
//     }
//     if (reduceStake) {
//       validatorInfo.totalStake = validatorInfo.totalStake.minus(reduceStake);
//       if (own) {
//         validatorInfo.selfStake = validatorInfo.selfStake.minus(reduceStake);
//       } else {
//         validatorInfo.externalStake =
//           validatorInfo.externalStake.minus(reduceStake);
//       }
//     }
//     validatorInfo.save();
//   }
// }

/**
 * Reads the validator info data from the contract and ensures the info exists in the subgraph.
 * In addition, if the validator didn't exist beforehand it adds the inital stake as the first delegation
 * as well as the initial commission as the first commission change
 * @param validator the validator to check the data for
 * @returns the validator object
 */
function getValidatorInfoFromContract(
  account: Address,
  event: ethereum.Event,
  isRegistration: boolean = false
): Validator {
  let validator = Validator.load(account.toHexString());
  if (validator === null) {
    validator = new Validator(account.toHexString());
    validator.account = account.toHexString();
    const dpos = DPOS.bind(event.address);

    const chainData = dpos.getValidator(account);

    validator.delegations = [];
    validator.undelegations = [];
    if (isRegistration) {
      const firstDelegation = extractInitialDelegatonFromContract(
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
  return validator;
}

function extractInitialDelegatonFromContract(
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

/**
 * Enforces if the validatorData is set for the provided address
 * @param validator validator hex address
 * @returns the validatorData object
 */
function enforceValidatorExists(
  validator: Address,
  event: ethereum.Event,
  isRegistration: boolean = false
): Validator {
  log.debug('Enforcing validator: ' + validator.toHexString(), [
    validator.toHexString(),
  ]);
  let validatorData = getValidatorInfoFromContract(
    validator,
    event,
    isRegistration
  );
  validatorData.save();
  return validatorData;
}

function getOrInitDelegation(event: ethereum.Event): Delegation {
  const delegationId = event.transaction.hash.toHexString();
  let delegation = Delegation.load(delegationId);
  if (delegation === null) {
    delegation = new Delegation(delegationId);
  }
  return delegation;
}

function getOrInitUndelegation(event: ethereum.Event): Undelegation {
  const delegationId = event.transaction.hash.toHexString();
  let undelegation = Undelegation.load(delegationId);
  if (undelegation === null) {
    undelegation = new Undelegation(delegationId);
  }
  return undelegation;
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  const validator = event.params.validator;
  log.debug('Registering validator' + validator.toHexString(), []);
  enforceValidatorExists(validator, event, true);
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;
  log.debug(
    'Handling delegation from ' +
      delegator.toHexString() +
      ' to ' +
      validator.toHexString(),
    []
  );
  let newDelegation = getOrInitDelegation(event);
  // Update Validator
  const validatorData = enforceValidatorExists(validator, event);
  const delegationExistsForValidator = findString(
    validatorData.delegations,
    newDelegation.id
  );
  log.info('Found delegation: ' + delegationExistsForValidator, []);
  if (delegationExistsForValidator && delegationExistsForValidator !== '') {
    log.info('delegation is: ' + delegationExistsForValidator, []);
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

  const validatorData = enforceValidatorExists(validator, event);

  const undelegation = getOrInitUndelegation(event);
  undelegation.delegator = delegator.toHexString();
  undelegation.validator = validator.toHexString();
  undelegation.canceled = false;
  undelegation.confirmed = false;
  undelegation.eligibilityBlock = event.block.number.plus(new BigInt(25000));
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

  validatorData.save();
}

export function handleRedelegated(event: Redelegated): void {
  const delegator = event.params.delegator;
  const from = event.params.from;
  const to = event.params.to;
  const amount = event.params.amount;

  // Update validators
  const fromValidator = enforceValidatorExists(from, event);
  const toValidator = enforceValidatorExists(to, event);

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

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const validatorData = enforceValidatorExists(validator, event);
  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validatorData.id;
  commissionChange.registrationBlock = event.block.number.toI32();
  commissionChange.applianceBlock = event.block.number
    .plus(new BigInt(25000))
    .toI32();
  commissionChange.save();
  if (validatorData.commissionChanges) {
    validatorData.commissionChanges = validatorData.commissionChanges.concat([
      commissionChange.id,
    ]);
  } else {
    validatorData.commissionChanges = [commissionChange.id];
  }
}
