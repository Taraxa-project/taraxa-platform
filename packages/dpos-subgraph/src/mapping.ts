import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  Delegated,
  Redelegated,
  RewardsClaimed,
  UndelegateCanceled,
  UndelegateConfirmed,
  Undelegated,
  ValidatorInfoSet,
  ValidatorRegistered,
  DPOS,
} from '../generated/DPOS/DPOS';
import {
  BasicInfo,
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

/**
 * Basic maths for updating stake of validator
 * @param validatorAddress hex address of validator
 * @param addStake stake to add
 * @param reduceStake stake to reduce
 */
function updateTotalStakeOfValidator(
  validatorAddress: string,
  addStake: BigInt = BigInt.zero(),
  reduceStake: BigInt = BigInt.zero(),
  own: boolean = false
): void {
  const validatorInfo = BasicInfo.load(validatorAddress);
  if (validatorInfo) {
    if (addStake) {
      validatorInfo.totalStake = validatorInfo.totalStake.plus(addStake);
      if (own) {
        validatorInfo.selfStake = validatorInfo.selfStake.plus(addStake);
      } else {
        validatorInfo.externalStake =
          validatorInfo.externalStake.plus(addStake);
      }
    }
    if (reduceStake) {
      validatorInfo.totalStake = validatorInfo.totalStake.minus(reduceStake);
      if (own) {
        validatorInfo.selfStake = validatorInfo.selfStake.minus(reduceStake);
      } else {
        validatorInfo.externalStake =
          validatorInfo.externalStake.minus(reduceStake);
      }
    }
    validatorInfo.save();
  }
}

/**
 * Reads the validator info data from the contract and ensures the info exists in the subgraph.
 * @param validator the validator to check the data for
 * @returns the basicInfo object
 */
function getValidatorInfoFromContract(
  validator: Address,
  event: ethereum.Event
): BasicInfo {
  let basicInfo = BasicInfo.load(validator.toHexString());
  if (!basicInfo) {
    basicInfo = new BasicInfo(validator.toHexString());
  }

  const dpos = DPOS.bind(event.address);

  const chainData = dpos.getValidator(validator);

  basicInfo.commission = chainData.commission;
  if (chainData.description) {
    basicInfo.description = chainData.description.toString();
  } else {
    basicInfo.description = '';
  }
  log.warning('Chain total stake: ' + chainData.total_stake.toString(), [
    chainData.total_stake.toString(),
  ]);
  basicInfo.totalStake = chainData.total_stake;
  basicInfo.lastCommissionChange = chainData.last_commission_change;
  basicInfo.owner = chainData.owner.toHexString();
  if (chainData.endpoint) {
    basicInfo.endpoint = chainData.endpoint.toString();
  } else {
    basicInfo.endpoint = '';
  }
  basicInfo.save();
  return basicInfo;
}

/**
 * Enforces if the validatorData is set for the provided address
 * @param validator validator hex address
 * @returns the validatorData object
 */
function enforceValidatorExists(validator: Address): Validator {
  log.info('Enforcing validator: ' + validator.toHexString(), [
    validator.toHexString(),
  ]);
  let validatorData = Validator.load(validator.toHexString());
  if (!validatorData) {
    validatorData = new Validator(validator.toHexString());
    validatorData.account = validator.toHexString();
    validatorData.currentDelegations = [];
    validatorData.commissionChanges = [];
    validatorData.save();
  }
  return validatorData;
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  const validator = event.params.validator;
  // enforceValidatorExists(validator, event);
  const validatorEntity = new Validator(validator.toHexString());
  validatorEntity.commissionChanges = [];
  validatorEntity.currentDelegations = [];
  validatorEntity.account = validator.toHexString();
  validatorEntity.save();
}

function getOrInitCurrentDelegation(
  delegator: Address,
  validator: Address
): Delegation {
  const delegationId = `${delegator.toHexString()}-${validator.toHexString()}`;
  let delegation = Delegation.load(delegationId);
  if (delegation) return delegation;
  delegation = new Delegation(delegationId);
  delegation.delegator = delegator.toHexString();
  delegation.validator = validator.toHexString();
  delegation.amount = BigInt.zero();
  delegation.save();
  return delegation;
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  // Init delegation
  let newCurrentDelegation = new Delegation(
    `${delegator.toHexString()}-${validator.toHexString()}`
  );

  // Update Validator
  const validatorData = enforceValidatorExists(validator);
  const delegationExistsForValidator = findString(
    validatorData.currentDelegations,
    newCurrentDelegation.id
  );
  if (delegationExistsForValidator) {
    newCurrentDelegation = Delegation.load(newCurrentDelegation.id)!;
    newCurrentDelegation.amount = newCurrentDelegation.amount.plus(amount);
    newCurrentDelegation.save();
  } else {
    validatorData.currentDelegations = validatorData.currentDelegations.concat([
      newCurrentDelegation.id,
    ]);
    newCurrentDelegation.validator = validatorData.id;
    newCurrentDelegation.amount = amount;
  }

  validatorData.save();

  // Save current delegation

  newCurrentDelegation.save();
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  // Init undelegation
  const currentId = `${delegator.toHexString()}-${validator.toHexString()}`;

  const validatorData = enforceValidatorExists(validator);

  const delegation = getOrInitCurrentDelegation(delegator, validator);
  delegation.amount = delegation.amount.minus(amount);
  delegation.save();

  const hasDelegation = findString(validatorData.currentDelegations, currentId);
  if (!hasDelegation) {
    // Update Validator
    validatorData.currentDelegations = validatorData.currentDelegations.concat([
      delegation.id,
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
  const fromValidator = enforceValidatorExists(from);
  const toValidator = enforceValidatorExists(to);

  // Create delegations
  let newDelegationDataTo = getOrInitCurrentDelegation(delegator, to);
  newDelegationDataTo.amount = newDelegationDataTo.amount.plus(amount);
  newDelegationDataTo.save();

  let newDelegationDataFrom = getOrInitCurrentDelegation(delegator, from);
  newDelegationDataFrom.amount = newDelegationDataFrom.amount.minus(amount);
  newDelegationDataFrom.save();

  // Update validators
  const alreadyDelegatedToValidator = findString(
    toValidator.currentDelegations,
    newDelegationDataTo.id
  );
  if (!alreadyDelegatedToValidator) {
    toValidator.currentDelegations = toValidator.currentDelegations.concat([
      newDelegationDataTo.id,
    ]);
    toValidator.save();
  }

  const alreadyDelegatedFromValidator = findString(
    fromValidator.currentDelegations,
    newDelegationDataFrom.id
  );
  if (!alreadyDelegatedFromValidator) {
    fromValidator.currentDelegations = fromValidator.currentDelegations.concat([
      newDelegationDataFrom.id,
    ]);
    fromValidator.save();
  }
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const validatorData = enforceValidatorExists(validator);
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
