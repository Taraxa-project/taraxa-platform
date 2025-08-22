import { Address, BigInt, log, store, ethereum } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  Delegated,
  DPOS,
  Redelegated,
  RewardsClaimed,
  UndelegateCanceled,
  UndelegateCanceledV2,
  UndelegateConfirmed,
  UndelegateConfirmedV2,
  Undelegated,
  UndelegatedV2,
  ValidatorInfoSet,
  ValidatorRegistered,
} from '../generated/DPOS/DPOS';
import { CommissionChange, Delegation, Validator } from '../generated/schema';

const DPOS_CONTRACT_ADDRESS = Address.fromString(
  '0x00000000000000000000000000000000000000fe'
);
const MIN_DELEGATION_AMOUNT = BigInt.fromString('1000000000000000000000');
const INITIAL_VALIDATORS_FULL = [
  '0x8dcc94cc57c72eaa6609ee77cb50c84141fa39bd',
  '0x4bd4dbae73bfcd070ed01788bb8ecf18f152ef61',
  '0xe90958a7e4a95ee0c3e2b36dcf6344835755fcfd',
  '0x869b5f98b0e3aa50bc91be470a8c5d44e92b59d7',
  '0x73ec3af8f07c964f13e0d105ac77951f4d80811f',
  '0x0105deca852ae3e7e1fe17bc0db2271ad259e0d6',
  '0xe143ededbf9285dc39daf64c120037a4b9a0f095',
  '0xb743f776ddd8278325a6c64b8a7d6c409433c96e',
  '0x7ab15fdcf5c1305541900bba926ac7b38b2acc7b',
  '0xf9d0eada55b9a3e8d9fd69dc3c57163c0d42dc18',
  '0xe3a497c34a0d5dcdbeff5b88063d9a87ff51bd80',
  '0xe43d40a9bdff67ce7756bab3ff697192b466e6d6',
  '0x94306df4a952bff4cb99c48859acf1178766fe34',
  '0x5e70e5a2fda0675ea0f2453425190c02858b272a',
  '0xebb12f67806703f7dd80ec1ea4c768fbce98c48c',
];
const INITIAL_VALIDATORS_HALF = [
  '0x94ca3352cd13344bb67e2132ee6d1f0f237b6ae4',
  '0xc83e64997c6244f85ac1459fe46f2e059d855305',
  '0xfdc4fcce3beb94b201ef2623b1bcc96cb56c4b84',
  '0x746c48a57f2297ce00ea05378113667aa8d23684',
  '0x9d3fa769f395ed6e136ff76c0bcb6fe7f60d926b',
];

function populateInitialValidators(): void {
  const allValidators = INITIAL_VALIDATORS_FULL.concat(INITIAL_VALIDATORS_HALF);
  for (let i = 0; i < allValidators.length; i++) {
    let address = allValidators[i];
    let isFull = INITIAL_VALIDATORS_FULL.includes(address);

    let initialValidator = Validator.load(address);
    if (!initialValidator) {
      let initialValidator = new Validator(address);
      initialValidator.totalStake = isFull
        ? BigInt.fromString('80000000000000000000000000')
        : BigInt.fromString('500000000000000000000000');
      initialValidator.commission = isFull ? 0 : 1000;
      initialValidator.undelegationsCount = 0;
      initialValidator.owner = '0x10f4fD4D9856EFd5700F0Cb70B90Bf519A3cd238';
      initialValidator.description = `Taraxa mainnet validator ${i + 1}`;

      initialValidator.save();
    }
  }
}

function getOrInitCurrentValidator(
  validator: Address,
  owner: Address
): Validator {
  let v = Validator.load(validator.toHexString());
  if (!v) {
    v = new Validator(validator.toHexString());
    v.totalStake = MIN_DELEGATION_AMOUNT;
    v.commission = 0;
    v.undelegationsCount = 0;
    v.owner = owner.toHexString();
    v.save();
  }
  return v;
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
    delegation.timestamp = BigInt.zero();
    delegation.save();
  }
  return delegation;
}

export function handleBlock(block: ethereum.Block): void {
  populateInitialValidators();
}

export function handleValidatorRegistered(event: ValidatorRegistered): void {
  let validator = getOrInitCurrentValidator(
    event.params.validator,
    event.transaction.from
  );

  let dpos = DPOS.bind(DPOS_CONTRACT_ADDRESS);
  let contractValidator = dpos.try_getValidator(
    Address.fromString(validator.id)
  );
  if (!contractValidator.reverted) {
    let commission = contractValidator.value.commission;
    validator.commission = commission;
    validator.save();
  }
}

export function handleValidatorInfoSet(event: ValidatorInfoSet): void {
  let validator = getOrInitCurrentValidator(
    event.params.validator,
    event.transaction.from
  );

  let dpos = DPOS.bind(DPOS_CONTRACT_ADDRESS);
  let contractValidator = dpos.try_getValidator(
    Address.fromString(validator.id)
  );
  if (!contractValidator.reverted) {
    let description = contractValidator.value.description;
    let endpoint = contractValidator.value.endpoint;
    validator.description = description;
    validator.endpoint = endpoint;
    validator.save();
  }
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.totalStake = v.totalStake.plus(amount);
    v.save();
  }

  log.debug('Handling delegation' + amount.toString(), [amount.toString()]);
  const newCurrentDelegation = getOrInitCurrentDelegation(validator, delegator);
  newCurrentDelegation.amount = newCurrentDelegation.amount.plus(amount);
  newCurrentDelegation.timestamp = event.block.timestamp;
  newCurrentDelegation.save();
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.undelegationsCount = v.undelegationsCount++;
    v.save();
  }

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.minus(amount);
  currentDelegation.save();
}

export function handleUndelegatedV2(event: UndelegatedV2): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.undelegationsCount = v.undelegationsCount++;
    v.save();
  }

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.minus(amount);
  currentDelegation.save();
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.undelegationsCount = v.undelegationsCount--;
    v.save();
  }

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.plus(event.params.amount);
  currentDelegation.timestamp = event.block.timestamp;
  currentDelegation.save();
}

export function handleUndelegateConfirmed(event: UndelegateConfirmed): void {
  const validator = event.params.validator;
  const amount = event.params.amount;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.totalStake = v.totalStake.minus(amount);
    v.undelegationsCount = v.undelegationsCount--;
    v.save();

    if (v.totalStake.equals(BigInt.zero()) && v.undelegationsCount === 0) {
      store.remove('Validator', v.id);
    }
  }
}

export function handleUndelegateCanceledV2(event: UndelegateCanceledV2): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.undelegationsCount = v.undelegationsCount--;
    v.save();
  }

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.plus(event.params.amount);
  currentDelegation.timestamp = event.block.timestamp;
  currentDelegation.save();
}

export function handleUndelegateConfirmedV2(
  event: UndelegateConfirmedV2
): void {
  const validator = event.params.validator;
  const amount = event.params.amount;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.totalStake = v.totalStake.minus(amount);
    v.undelegationsCount = v.undelegationsCount--;
    v.save();

    if (v.totalStake.equals(BigInt.zero()) && v.undelegationsCount === 0) {
      store.remove('Validator', v.id);
    }
  }
}

export function handleRedelegated(event: Redelegated): void {
  const delegator = event.params.delegator;
  const from = event.params.from;
  const to = event.params.to;
  const amount = event.params.amount;

  let vFrom = Validator.load(from.toHexString());
  if (vFrom) {
    vFrom.totalStake = vFrom.totalStake.minus(amount);
    vFrom.save();

    if (
      vFrom.totalStake.equals(BigInt.zero()) &&
      vFrom.undelegationsCount === 0
    ) {
      store.remove('Validator', vFrom.id);
    }
  }

  let vTo = Validator.load(to.toHexString());
  if (vTo) {
    vTo.totalStake = vTo.totalStake.plus(amount);
    vTo.save();
  }

  // Create delegations
  const currentDelegationDataTo = getOrInitCurrentDelegation(to, delegator);
  const currentDelegationDataFrom = getOrInitCurrentDelegation(from, delegator);

  // Update delegations
  currentDelegationDataFrom.amount =
    currentDelegationDataFrom.amount.minus(amount);
  currentDelegationDataFrom.save();

  currentDelegationDataTo.amount = currentDelegationDataTo.amount.plus(amount);
  currentDelegationDataTo.timestamp = event.block.timestamp;
  currentDelegationDataTo.save();
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  let v = Validator.load(validator.toHexString());
  if (v) {
    v.commission = commission;
    v.save();
  }

  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validator.toHexString();
  commissionChange.registrationBlock = event.block.number.toI32();
  const appliesAt = event.block.number.plus(BigInt.fromI32(25000));
  commissionChange.applyAtBlock = appliesAt.toI32();
  commissionChange.timestamp = event.block.timestamp;
  commissionChange.save();
}

export function handleRewardsClaimed(event: RewardsClaimed): void {
  const validator = event.params.validator;

  let v = Validator.load(validator.toHexString());
  if (v) {
    if (v.totalStake.equals(BigInt.zero()) && v.undelegationsCount === 0) {
      store.remove('Validator', v.id);
    }
  }
}
