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
  CommissionRewardsClaimedEvent,
  CommissionSetEvent,
  DelegatedEvent,
  DelegationData,
  DelegatorInfo,
  RedelegatedEvent,
  RewardsClaimedEvent,
  UndelegateCanceledEvent,
  UndelegateConfirmedEvent,
  UndelegatedEvent,
  UndelegationData,
  ValidatorBasicInfo,
  ValidatorData,
  ValidatorInfoSetEvent,
  ValidatorRegisteredEvent,
} from '../generated/schema';

// Each of the handler functions honors the following flow:
// 1. Initializes the new schema object
// 2. Enforces validator already exists from chain
// 3. Fills the Schema Object with data from the event or from chain
// 4. Saves the new object
// 5. Updates all other objects mentioning the new one
// 6. Saves the Event object

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
  reduceStake: BigInt = BigInt.zero()
): void {
  const validatorInfo = ValidatorBasicInfo.load(validatorAddress);
  if (validatorInfo) {
    if (addStake) {
      validatorInfo.totalStake = validatorInfo.totalStake.plus(addStake);
    }
    if (reduceStake) {
      validatorInfo.totalStake = validatorInfo.totalStake.minus(reduceStake);
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
): ValidatorBasicInfo {
  let basicInfo = ValidatorBasicInfo.load(validator.toHexString());
  if (!basicInfo) {
    basicInfo = new ValidatorBasicInfo(validator.toHexString());
  }

  const dpos = DPOS.bind(event.address);

  const chainData = dpos.getValidator(validator);

  basicInfo.commission = chainData.commission;
  basicInfo.commissionReward = chainData.commission_reward;
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
function enforceValidatorDataExists(
  validator: Address,
  event: ethereum.Event
): ValidatorData {
  log.info('Enforcing validator: ' + validator.toHexString(), [
    validator.toHexString(),
  ]);
  let validatorData = ValidatorData.load(validator.toHexString());
  if (!validatorData) {
    validatorData = new ValidatorData(validator.toHexString());
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
  enforceValidatorDataExists(validator, event);

  const registeredEvent = new ValidatorRegisteredEvent(validator.toHexString());
  registeredEvent.validator = validator.toHexString();
  registeredEvent.save();
}

export function handleValidatorInfoSet(event: ValidatorInfoSet): void {
  const validator = event.params.validator;
  enforceValidatorDataExists(validator, event);

  const validatorInfoSetEvent = new ValidatorInfoSetEvent(
    event.transaction.hash.toHexString()
  );
  validatorInfoSetEvent.validator = validator.toHexString();
  validatorInfoSetEvent.save();
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const validatorData = enforceValidatorDataExists(validator, event);

  let newDelegation = new DelegationData(event.transaction.hash.toHexString());
  newDelegation.account = validator.toHexString();
  newDelegation.delegator = delegator.toHexString();
  newDelegation.validator = validator.toHexString();

  log.warning('Event data: ', [
    delegator.toHexString(),
    validator.toHexString(),
    amount.toString(),
  ]);

  let delegatorInfo = DelegatorInfo.load(
    `${delegator.toHexString()}-${validator.toHexString()}`
  );
  if (!delegatorInfo) {
    delegatorInfo = new DelegatorInfo(
      `${delegator.toHexString()}-${validator.toHexString()}`
    );
    delegatorInfo.stake = amount;
  } else {
    delegatorInfo.stake = delegatorInfo.stake.plus(amount);
  }
  if (!delegatorInfo.rewards) {
    delegatorInfo.rewards = new BigInt(0);
  }

  delegatorInfo.save();

  validatorData.delegations = validatorData.delegations.concat([
    newDelegation.id,
  ]);

  validatorData.save();

  newDelegation.delegator = delegatorInfo.id;
  newDelegation.validator = validatorData.id;
  newDelegation.save();

  updateTotalStakeOfValidator(validator.toHexString(), amount);

  const delegatedEvent = new DelegatedEvent(
    event.transaction.hash.toHexString()
  );
  delegatedEvent.amount = amount;
  delegatedEvent.delegator = delegator.toHexString();
  delegatedEvent.validator = validator.toHexString();
  delegatedEvent.save();
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const validatorData = enforceValidatorDataExists(validator, event);

  let newUnDelegationData = new UndelegationData(delegator.toHexString());
  newUnDelegationData.stake = amount;
  newUnDelegationData.block = event.block.number;

  let delegatorInfo = DelegatorInfo.load(
    `${delegator.toHexString()}-${validator.toHexString()}`
  );
  if (!delegatorInfo) {
    delegatorInfo = new DelegatorInfo(
      `${delegator.toHexString()}-${validator.toHexString()}`
    );
    delegatorInfo.stake = delegatorInfo.stake.minus(amount);
  }

  delegatorInfo.save();

  validatorData.undelegations = validatorData.undelegations.concat([
    newUnDelegationData.id,
  ]);

  validatorData.save();

  newUnDelegationData.validator = validatorData.id;
  newUnDelegationData.save();

  updateTotalStakeOfValidator(validator.toHexString(), BigInt.zero(), amount);

  const undelegatedEvent = new UndelegatedEvent(
    event.transaction.hash.toHexString()
  );
  undelegatedEvent.amount = amount;
  undelegatedEvent.delegator = delegator.toHexString();
  undelegatedEvent.validator = validator.toHexString();
  undelegatedEvent.save();
}

export function handleRedelegated(event: Redelegated): void {
  const delegator = event.params.delegator;
  const from = event.params.from;
  const to = event.params.to;
  const amount = event.params.amount;

  const validatorDataFrom = enforceValidatorDataExists(from, event);
  const validatorDataTo = enforceValidatorDataExists(to, event);
  validatorDataFrom.delegations = filterString(
    validatorDataFrom.delegations,
    delegator.toHexString()
  );
  validatorDataFrom.save();
  const delegationId = findString(
    validatorDataTo.delegations,
    delegator.toHexString()
  );
  let newDelegationData = new DelegationData(delegator.toHexString());
  if (delegationId) {
    newDelegationData = DelegationData.load(delegationId)!;
  }
  newDelegationData.account = event.address.toHexString();
  newDelegationData.delegator = delegator.toHexString();
  newDelegationData.validator = validatorDataTo.id;
  newDelegationData.save();
  validatorDataTo.delegations = validatorDataTo.delegations.concat([
    newDelegationData.id,
  ]);

  updateTotalStakeOfValidator(from.toHexString(), BigInt.zero(), amount);
  updateTotalStakeOfValidator(to.toHexString(), amount, BigInt.zero());

  const redelegatedEvent = new RedelegatedEvent(
    event.transaction.hash.toHexString()
  );
  redelegatedEvent.amount = amount;
  redelegatedEvent.delegator = delegator.toHexString();
  redelegatedEvent.from = from.toHexString();
  redelegatedEvent.to = to.toHexString();
  redelegatedEvent.save();
}

export function handleUndelegateConfirmed(event: UndelegateConfirmed): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  enforceValidatorDataExists(validator, event);
  const undelegateConfirmedEvent = new UndelegateConfirmedEvent(
    event.transaction.hash.toHexString()
  );
  undelegateConfirmedEvent.amount = amount;
  undelegateConfirmedEvent.delegator = delegator.toHexString();
  undelegateConfirmedEvent.validator = validator.toHexString();
  undelegateConfirmedEvent.save();
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const validatorData = enforceValidatorDataExists(validator, event);
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

  const validatorData = enforceValidatorDataExists(validator, event);
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

  const validatorData = enforceValidatorDataExists(validator, event);
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

  enforceValidatorDataExists(validator, event);

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
