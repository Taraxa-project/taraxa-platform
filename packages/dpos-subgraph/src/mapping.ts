import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  log,
  json,
} from '@graphprotocol/graph-ts';
import {
  CommissionRewardsClaimed,
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
  Delegator,
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
function enforceValidatorExists(
  validator: Address,
  event: ethereum.Event
): Validator {
  log.info('Enforcing validator: ' + validator.toHexString(), [
    validator.toHexString(),
  ]);
  let validatorData = Validator.load(validator.toHexString());
  if (!validatorData) {
    validatorData = new Validator(validator.toHexString());
    validatorData.account = validator.toHexString();
    validatorData.delegations = [];
    validatorData.undelegations = [];

    const info = getValidatorInfoFromContract(validator, event);
    validatorData.info = info.id;
    validatorData.save();
  }
  return validatorData;
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  const validator = event.params.validator;
  enforceValidatorExists(validator, event);
}

export function handleValidatorInfoSet(event: ValidatorInfoSet): void {
  const validator = event.params.validator;
  enforceValidatorExists(validator, event);
}

function getOrInitDelegator(delegator: Address): Delegator {
  let delegatorInfo = Delegator.load(delegator.toHexString());
  if (!delegatorInfo) {
    delegatorInfo = new Delegator(delegator.toHexString());
    delegatorInfo.account = delegator.toHexString();
    delegatorInfo.totalStake = BigInt.zero();
    delegatorInfo.rewards = BigInt.zero();
    delegatorInfo.delegations = [];
    delegatorInfo.undelegations = [];
  }
  return delegatorInfo;
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
  let newDelegation = new Delegation(event.transaction.hash.toHexString());
  let newCurrentDelegation = new Delegation(
    `${delegator.toHexString()}-${validator.toHexString()}`
  );

  const validatorData = enforceValidatorExists(validator, event);
  const delegationExistsForValidator = findString(
    validatorData.currentDelegations,
    newCurrentDelegation.id
  );
  if (delegationExistsForValidator) {
    newCurrentDelegation = Delegation.load(newCurrentDelegation.id)!;
    newCurrentDelegation.amount = newCurrentDelegation.amount.plus(amount);
    newCurrentDelegation.save();
  }

  const validatorInfo = BasicInfo.load(validatorData.info);
  if (validatorInfo) {
    const isOwnDelegation =
      validatorInfo.owner.toLowerCase() ===
      delegator.toHexString().toLowerCase();

    updateTotalStakeOfValidator(
      validator.toHexString(),
      amount,
      BigInt.zero(),
      isOwnDelegation
    );
  }

  validatorData.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);

  delegatorInfo.totalStake = delegatorInfo.totalStake.plus(amount);
  let delegationExistsForDelegator = findString(
    validatorData.currentDelegations,
    newCurrentDelegation.id
  );

  // If this is the first delegation from delegator -> validator we update the mappings
  if (!delegationExistsForDelegator) {
    // Update Delegator
    delegatorInfo.delegations = delegatorInfo.delegations.concat([
      newDelegation.id,
    ]);
    delegatorInfo.currentDelegations = delegatorInfo.currentDelegations.concat([
      newCurrentDelegation.id,
    ]);
    delegatorInfo.save();

    // Update Validator
    validatorData.currentDelegations = validatorData.currentDelegations.concat([
      newCurrentDelegation.id,
    ]);

    // Save current delegation
    newCurrentDelegation.delegator = delegatorInfo.id;
    newCurrentDelegation.validator = validatorData.id;
    newCurrentDelegation.amount = amount;
    newCurrentDelegation.save();
  }

  validatorData.delegations = validatorData.delegations.concat([
    newDelegation.id,
  ]);

  // Save Delegation
  newDelegation.delegator = delegatorInfo.id;
  newDelegation.validator = validatorData.id;
  newDelegation.amount = amount;
  newDelegation.save();
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  // Init undelegation
  const id = event.transaction.hash.toHexString();
  const currentId = `${delegator.toHexString()}-${validator.toHexString()}`;
  let newUnDelegationData = new Undelegation(id);

  const validatorData = enforceValidatorExists(validator, event);

  // Update Validator
  validatorData.undelegations = validatorData.undelegations.concat([
    newUnDelegationData.id,
  ]);

  // Update current Delegation of Validator
  const currentDelegation = Delegation.load(currentId);
  if (currentDelegation) {
    currentDelegation.amount = currentDelegation.amount.minus(amount);
    currentDelegation.save();
  }

  const validatorInfo = BasicInfo.load(validatorData.info);
  if (validatorInfo) {
    const isOwnUndelegation =
      validatorInfo.owner.toLowerCase() ===
      delegator.toHexString().toLowerCase();

    updateTotalStakeOfValidator(
      validator.toHexString(),
      BigInt.zero(),
      amount,
      isOwnUndelegation
    );
  }

  validatorData.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);

  delegatorInfo.totalStake = delegatorInfo.totalStake.minus(amount);
  delegatorInfo.undelegations = delegatorInfo.undelegations.concat([
    newUnDelegationData.id,
  ]);

  delegatorInfo.save();

  // Save Undelegation
  newUnDelegationData.delegator = delegatorInfo.id;
  newUnDelegationData.validator = validatorData.id;
  newUnDelegationData.stake = amount;
  newUnDelegationData.eligibilityBlock = event.block.number.plus(
    new BigInt(25000)
  );
  newUnDelegationData.confirmed = false;
  newUnDelegationData.canceled = false;
  newUnDelegationData.save();
}

export function handleRedelegated(event: Redelegated): void {
  const delegator = event.params.delegator;
  const from = event.params.from;
  const to = event.params.to;
  const amount = event.params.amount;

  // Init delegations from
  let newCurrentDelegationTo = `${delegator.toHexString()}-${to.toHexString()}`;

  // Update validators
  const validatorDataFrom = enforceValidatorExists(from, event);
  const validatorDataTo = enforceValidatorExists(to, event);

  // Create delegations
  let newDelegationDataTo = getOrInitCurrentDelegation(delegator, to);
  newDelegationDataTo.delegator = delegator.toHexString();
  newDelegationDataTo.validator = validatorDataTo.id;
  newDelegationDataTo.amount = newDelegationDataTo.amount.plus(amount);
  newDelegationDataTo.save();

  let newDelegationDataFrom = getOrInitCurrentDelegation(delegator, from);
  newDelegationDataFrom.delegator = delegator.toHexString();
  newDelegationDataFrom.validator = validatorDataFrom.id;
  newDelegationDataFrom.amount = newDelegationDataFrom.amount.minus(amount);
  newDelegationDataFrom.save();

  const delegation = new Delegation(event.transaction.hash.toHexString());
  delegation.delegator = delegator.toHexString();
  delegation.validator = validatorDataTo.id;
  delegation.amount = amount;
  delegation.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);
  delegatorInfo.delegations = delegatorInfo.delegations.concat([delegation.id]);
  const alreadyDelegatedToValidator = findString(
    delegatorInfo.currentDelegations,
    newCurrentDelegationTo
  );
  if (!alreadyDelegatedToValidator) {
    delegatorInfo.currentDelegations = delegatorInfo.currentDelegations.concat([
      newDelegationDataTo.id,
    ]);
  }
  delegatorInfo.save();

  // Update validators
  validatorDataTo.delegations = validatorDataTo.delegations.concat([
    delegation.id,
  ]);

  if (!alreadyDelegatedToValidator) {
    validatorDataTo.currentDelegations =
      validatorDataTo.currentDelegations.concat([newDelegationDataTo.id]);
  }

  const validatorInfoFrom = BasicInfo.load(validatorDataFrom.info);
  const validatorInfoTo = BasicInfo.load(validatorDataTo.info);
  if (validatorInfoFrom) {
    const isOwnUndelegationFrom =
      validatorInfoFrom.owner.toLowerCase() ===
      delegator.toHexString().toLowerCase();

    updateTotalStakeOfValidator(
      from.toHexString(),
      BigInt.zero(),
      amount,
      isOwnUndelegationFrom
    );
  }
  if (validatorInfoTo) {
    const isOwnDelegationTo =
      validatorInfoTo.owner.toLowerCase() ===
      delegator.toHexString().toLowerCase();

    updateTotalStakeOfValidator(
      to.toHexString(),
      amount,
      BigInt.zero(),
      isOwnDelegationTo
    );
  }

  validatorDataFrom.save();
  validatorDataTo.save();
}

export function handleUndelegateConfirmed(event: UndelegateConfirmed): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  enforceValidatorExists(validator, event);

  const validatorData = Validator.load(validator.toHexString());
  if (validatorData) {
    for (let i = 0; i < validatorData.undelegations.length; i++) {
      const undelegation = Undelegation.load(validatorData.undelegations[i]);
      if (undelegation) {
        if (
          undelegation.delegator.toLowerCase() ===
            delegator.toHexString().toLowerCase() &&
          undelegation.stake.equals(amount)
        ) {
          undelegation.confirmed = true;
          undelegation.save();
          return;
        }
      }
    }
  }
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  enforceValidatorExists(validator, event);
  const validatorData = Validator.load(validator.toHexString());
  if (validatorData) {
    for (let i = 0; i < validatorData.undelegations.length; i++) {
      const undelegation = Undelegation.load(validatorData.undelegations[i]);
      if (undelegation) {
        if (
          undelegation.delegator.toLowerCase() ===
            delegator.toHexString().toLowerCase() &&
          undelegation.stake.equals(amount)
        ) {
          undelegation.canceled = true;
          undelegation.save();
          return;
        }
      }
    }
    const delegation = getOrInitCurrentDelegation(delegator, validator);
    delegation.amount = delegation.amount.plus(amount);
    delegation.save();

    const delegatorData = getOrInitDelegator(delegator);
    const id = `${delegator.toHexString()}-${validator.toHexString()}`;
    const validatorHasDelegation = findString(
      validatorData.currentDelegations,
      id
    );
    const delegatorHasDelegation = findString(
      delegatorData.currentDelegations,
      id
    );
    if (!validatorHasDelegation) {
      validatorData.currentDelegations =
        validatorData.currentDelegations.concat([delegation.id]);
    }
    if (!delegatorHasDelegation) {
      delegatorData.currentDelegations =
        delegatorData.currentDelegations.concat([delegation.id]);
    }
    const validatorInfo = BasicInfo.load(validatorData.info);
    if (validatorInfo) {
      const isOwnDelegation =
        validatorInfo.owner.toLowerCase() ===
        delegator.toHexString().toLowerCase();

      updateTotalStakeOfValidator(
        validator.toHexString(),
        amount,
        BigInt.zero(),
        isOwnDelegation
      );
      validatorInfo.save();
    }
    validatorData.save();

    delegatorData.totalStake = delegatorData.totalStake.plus(amount);
    delegatorData.save();
  }
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  const account = event.params.account;
  const amount = event.params.amount;

  const delegator = Delegator.load(account.toHexString());
  if (delegator) {
    delegator.rewards = delegator.rewards.plus(amount);
    delegator.save();
  }
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const validatorData = enforceValidatorExists(validator, event);
  const basicInfo = BasicInfo.load(validatorData.info);
  if (basicInfo) {
    const commissionChange = new CommissionChange(
      event.block.hash.toHexString()
    );
    commissionChange.commission = commission;
    commissionChange.validator = validatorData.id;
    commissionChange.registrationBlock = event.block.number.toI32();
    commissionChange.applianceBlock = event.block.number
      .plus(new BigInt(25000))
      .toI32();
    commissionChange.save();
    basicInfo.lastCommissionChange = event.block.number;
    basicInfo.commission = commission;
    basicInfo.save();
  }
}

// export function handleGenesis(block: ethereum.Block): void {
//   if (!block.number.equals(BigInt.fromI32(1))) {
//     return;
//   }
//   log.info('Genesis block: ' + block.hash.toHexString(), [
//     block.hash.toHexString(),
//   ]);

//   const dpos = DPOS.bind(
//     Address.fromString('0x00000000000000000000000000000000000000FE')
//   );

//   let page = BigInt.zero();
//   let hasNextPage = true;
//   while (hasNextPage) {
//     const validatorData = dpos.getValidators(page);
//     hasNextPage = !validatorData.getEnd();

//     const validators = validatorData.getValidators();
//     for (let i = 0; i < validators.length; i++) {
//       const validator = validators[i];
//       const validatorId = validator.account.toHexString();

//       let validatorData = Validator.load(validatorId);
//       if (!validatorData) {
//         validatorData = new Validator(validatorId);
//         validatorData.account = validatorId;
//         validatorData.delegations = [];
//         validatorData.undelegations = [];
//         validatorData.currentDelegations = [];

//         let basicInfo = BasicInfo.load(validatorId);
//         if (!basicInfo) {
//           basicInfo = new BasicInfo(validatorId);

//           basicInfo.totalStake = BigInt.zero();
//           basicInfo.selfStake = BigInt.zero();
//           basicInfo.externalStake = BigInt.zero();
//           basicInfo.lastCommissionChange = BigInt.zero();

//           const validatorInfo = validator.info;
//           basicInfo.description = validatorInfo.description
//             ? validatorInfo.description.toString()
//             : '';
//           basicInfo.endpoint = validatorInfo.endpoint
//             ? validatorInfo.endpoint.toString()
//             : '';

//           basicInfo.commission = validatorInfo.commission;
//           basicInfo.owner = validatorInfo.owner.toHexString();
//           basicInfo.save();
//         }

//         validatorData.info = basicInfo.id;
//         validatorData.save();
//       }
//     }
//   }
// }
