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
function findString(array: string[], str: string): string {
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
  own: boolean
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

function getOrInitDelegator(delegator: Address) {
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

function getOrInitDelegation(delegator: Address, validator: Address) {
  const delegationId = `${delegator.toHexString()}-${validator.toHexString()}`;
  let delegation = Delegation.load(delegationId);
  if (delegation) return delegation;
  delegation = new Delegation(delegationId);
  delegation.delegator = delegator.toHexString();
  delegation.validator = validator.toHexString();
  delegation.amount = BigInt.zero();
  delegation.active = true;
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

  // Update Validator
  validatorData.currentDelegations = validatorData.currentDelegations.concat([
    newCurrentDelegation.id,
  ]);
  validatorData.delegations = validatorData.delegations.concat([
    newDelegation.id,
  ]);

  const validatorInfo = BasicInfo.load(validatorData.info);
  const isOwnDelegation =
    validatorInfo?.owner.toLowerCase() ===
    delegator.toHexString().toLowerCase();

  updateTotalStakeOfValidator(
    validator.toHexString(),
    amount,
    BigInt.zero(),
    isOwnDelegation
  );

  validatorData.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);

  delegatorInfo.totalStake = delegatorInfo.totalStake.plus(amount);
  delegatorInfo.delegations = delegatorInfo.delegations.concat([
    newCurrentDelegation.id,
  ]);
  delegatorInfo.save();

  // Save current delegation
  newCurrentDelegation.delegator = delegatorInfo.id;
  newCurrentDelegation.validator = validatorData.id;
  newCurrentDelegation.amount = amount;
  newCurrentDelegation.active = true;
  newCurrentDelegation.save();

  // Save Delegation
  newDelegation.delegator = delegatorInfo.id;
  newDelegation.validator = validatorData.id;
  newDelegation.amount = amount;
  newDelegation.active = true;
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
    if (currentDelegation.amount.isZero()) {
      currentDelegation.active = false;
    }
    currentDelegation.save();
  }

  const validatorInfo = BasicInfo.load(validatorData.info);
  const isOwnUndelegation =
    validatorInfo?.owner.toLowerCase() ===
    delegator.toHexString().toLowerCase();

  updateTotalStakeOfValidator(
    validator.toHexString(),
    BigInt.zero(),
    amount,
    isOwnUndelegation
  );

  validatorData.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);

  delegatorInfo.totalStake = delegatorInfo.totalStake.minus(amount);
  delegatorInfo.undelegations = delegatorInfo.undelegations.concat([
    newUnDelegationData.id,
  ]);

  // Update matching delegation if found
  const delegation = Delegation.load(id);
  if (delegation) {
    delegation.active = false;
    delegation.save();
  }

  delegatorInfo.save();

  // Save Undelegation
  newUnDelegationData.delegator = delegatorInfo.id;
  newUnDelegationData.validator = validatorData.id;
  newUnDelegationData.stake = amount;
  newUnDelegationData.eligibilityBlock = event.block.number.plus(
    new BigInt(25000)
  );
  newUnDelegationData.validator = validatorData.id;
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
  let newCurrentDelegationFrom = `${delegator.toHexString()}-${from.toHexString()}`;

  // Update validators
  const validatorDataFrom = enforceValidatorExists(from, event);
  const validatorDataTo = enforceValidatorExists(to, event);

  const currentDelegationFrom = Delegation.load(newCurrentDelegationFrom);
  if (currentDelegationFrom) {
    currentDelegationFrom.amount = currentDelegationFrom.amount.minus(amount);
    currentDelegationFrom.save();
  }

  // Create delegations
  let newDelegationData = getOrInitDelegation(delegator, to);
  newDelegationData.delegator = delegator.toHexString();
  newDelegationData.validator = validatorDataTo.id;
  newDelegationData.amount = newDelegationData.amount.plus(amount);
  newDelegationData.save();

  const delegation = new Delegation(event.transaction.hash.toHexString());
  delegation.delegator = delegator.toHexString();
  delegation.validator = validatorDataTo.id;
  delegation.amount = amount;
  delegation.save();

  // Update Delegator
  let delegatorInfo = getOrInitDelegator(delegator);
  delegatorInfo.delegations = delegatorInfo.delegations.concat([
    newDelegationData.id,
  ]);

  // Update validators
  validatorDataTo.delegations = validatorDataTo.delegations.concat([
    delegation.id,
  ]);

  validatorDataTo.currentDelegations = validatorDataTo.delegations.concat([
    newDelegationData.id,
  ]);

  const validatorInfoFrom = BasicInfo.load(validatorDataFrom.info);
  const validatorInfoTo = BasicInfo.load(validatorDataTo.info);
  const isOwnUndelegationFrom =
    validatorInfoFrom?.owner.toLowerCase() ===
    delegator.toHexString().toLowerCase();
  const isOwnDelegationTo =
    validatorInfoTo?.owner.toLowerCase() ===
    delegator.toHexString().toLowerCase();

  updateTotalStakeOfValidator(
    from.toHexString(),
    BigInt.zero(),
    amount,
    isOwnUndelegationFrom
  );
  updateTotalStakeOfValidator(
    to.toHexString(),
    amount,
    BigInt.zero(),
    isOwnDelegationTo
  );

  validatorDataFrom.save();
  validatorDataTo.save();
}

export function handleUndelegateConfirmed(event: UndelegateConfirmed): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  enforceValidatorExists(validator, event);
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const validatorData = enforceValidatorExists(validator, event);
  const relevantUndelegation = findString(
    validatorData.undelegations,
    delegator.toHexString()
  );
  const relevantDelegation = findString(
    validatorData.delegations,
    delegator.toHexString()
  );
  if (relevantUndelegation) {
    validatorData.undelegations = filterString(
      validatorData.undelegations,
      relevantUndelegation
    );
  }
  if (relevantDelegation) {
    const delegationData = DelegationData.load(relevantDelegation);
    if (delegationData) {
      const delegatorInfo = DelegatorInfo.load(
        `${delegationData.account}-${validator.toHexString()}`
      );
      if (delegatorInfo) {
        delegatorInfo.stake = delegatorInfo.stake.plus(amount);
        delegatorInfo.save();
      } else {
        const newDelegation = new DelegatorInfo(
          `${delegationData.delegator}-${validator.toHexString()}`
        );
        newDelegation.stake = amount;
        newDelegation.rewards = BigInt.zero();
        newDelegation.save();
      }
    }
  } else {
    const newDelegation = new DelegatorInfo(
      `${delegator.toHexString()}-${validator.toHexString()}`
    );
    newDelegation.stake = amount;
    newDelegation.rewards = BigInt.zero();
    newDelegation.save();
    const relevantDelegation = new DelegationData(delegator.toHexString());
    relevantDelegation.account = delegator.toHexString();
    relevantDelegation.delegator = newDelegation.id;
    relevantDelegation.validator = validator.toHexString();
    relevantDelegation.save();
  }
  validatorData.save();

  updateTotalStakeOfValidator(validator.toHexString(), amount, BigInt.zero());

  const undelegateCanceledEvent = new UndelegateCanceledEvent(
    event.transaction.hash.toHexString()
  );
  undelegateCanceledEvent.amount = amount;
  undelegateCanceledEvent.delegator = delegator.toHexString();
  undelegateCanceledEvent.validator = validator.toHexString();
  undelegateCanceledEvent.save();
}

export function handleCommissionRewardsClaimed(
  event: CommissionRewardsClaimed
): void {
  const account = event.params.account;
  const validator = event.params.validator;

  const validatorData = enforceValidatorExists(validator, event);
  const basicInfo = ValidatorBasicInfo.load(validatorData.info);
  if (basicInfo) {
    basicInfo.commissionReward = BigInt.zero();
    basicInfo.save();
  }
  const commissionRewardsClaimedEvent = new CommissionRewardsClaimedEvent(
    event.transaction.hash.toHexString()
  );
  commissionRewardsClaimedEvent.account = account.toHexString();
  commissionRewardsClaimedEvent.validator = validator.toHexString();
  commissionRewardsClaimedEvent.save();
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  const account = event.params.account;
  const validator = event.params.validator;

  const validatorData = enforceValidatorExists(validator, event);
  const relevantDelegation = findString(
    validatorData.delegations,
    account.toHexString()
  );
  if (relevantDelegation) {
    const delegation = DelegationData.load(relevantDelegation);
    if (delegation) {
      const delegatorInfo = DelegatorInfo.load(
        `${delegation.account}-${validator.toHexString()}`
      );
      if (delegatorInfo) {
        delegatorInfo.rewards = BigInt.zero();
        delegatorInfo.save();
      }
    }
  }

  const rewardsClaimedEvent = new RewardsClaimedEvent(
    event.transaction.hash.toHexString()
  );
  rewardsClaimedEvent.account = account.toHexString();
  rewardsClaimedEvent.validator = validator.toHexString();
  rewardsClaimedEvent.save();
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  enforceValidatorExists(validator, event);

  const commissionSetEvent = new CommissionSetEvent(
    event.transaction.hash.toHexString()
  );
  commissionSetEvent.commission = commission;
  commissionSetEvent.validator = validator.toHexString();
  commissionSetEvent.save();
}

export function handleGenesis(block: ethereum.Block): void {
  if (!block.number.equals(BigInt.fromI32(1))) {
    return;
  }
  log.info('Genesis block: ' + block.hash.toHexString(), [
    block.hash.toHexString(),
  ]);

  const dpos = DPOS.bind(
    Address.fromString('0x00000000000000000000000000000000000000FE')
  );

  let page = BigInt.zero();
  let hasNextPage = true;
  while (hasNextPage) {
    const validatorData = dpos.getValidators(page);
    hasNextPage = !validatorData.getEnd();

    const validators = validatorData.getValidators();
    for (let i = 0; i < validators.length; i++) {
      const validator = validators[i];
      const validatorId = validator.account.toHexString();

      let validatorData = ValidatorData.load(validatorId);
      if (!validatorData) {
        validatorData = new ValidatorData(validatorId);
        validatorData.account = validatorId;
        validatorData.delegations = [];
        validatorData.undelegations = [];

        let basicInfo = ValidatorBasicInfo.load(validatorId);
        if (!basicInfo) {
          basicInfo = new ValidatorBasicInfo(validatorId);

          basicInfo.totalStake = BigInt.zero();
          basicInfo.commissionReward = BigInt.zero();
          basicInfo.lastCommissionChange = BigInt.zero();

          const validatorInfo = validator.info;
          basicInfo.description = validatorInfo.description
            ? validatorInfo.description.toString()
            : '';
          basicInfo.endpoint = validatorInfo.endpoint
            ? validatorInfo.endpoint.toString()
            : '';

          basicInfo.commission = validatorInfo.commission;
          basicInfo.owner = validatorInfo.owner.toHexString();
          basicInfo.save();
        }

        validatorData.info = basicInfo.id;
        validatorData.save();
      }
    }
  }
}
