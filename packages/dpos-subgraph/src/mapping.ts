import { Address, BigInt, ethereum, log, store } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  DPOS,
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
} from '../generated/schema';

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
    undelegation.delegator = delegator.toHexString();
    undelegation.validator = validator.toHexString();
    undelegation.stake = BigInt.zero();
    undelegation.eligibilityBlock = BigInt.zero();
    undelegation.save();
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

function updateOrAddUndelegation(
  undelegation: Undelegation,
  amount: BigInt,
  add: boolean
): void {
  if (add) {
    undelegation.stake = undelegation.stake.plus(amount);
  } else {
    undelegation.stake = undelegation.stake.minus(amount);
  }
  undelegation.save();
}

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;
  log.debug('Handling delegation' + amount.toString(), [amount.toString()]);
  const newCurrentDelegation = getOrInitCurrentDelegation(validator, delegator);

  updateOrAddDelegation(newCurrentDelegation, amount, true);
}

export function handleUndelegated(event: Undelegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;

  const undelegation = getOrInitUndelegation(validator, delegator);
  log.debug('Handling undelegation' + undelegation.id, [undelegation.id]);
  const eligibility = event.block.number.plus(BigInt.fromI32(25000));
  undelegation.eligibilityBlock = eligibility;
  updateOrAddUndelegation(undelegation, amount, true);
  undelegation.save();

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  updateOrAddDelegation(currentDelegation, amount, false);
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const undelegationId = `${validator.toHexString()}-${delegator.toHexString()}`;
  const undelegation = Undelegation.load(undelegationId);
  if (undelegation) {
    store.remove('Undelegation', undelegation.id);
    log.warning(
      `Removed undelegation ${undelegationId} from store as canceled`,
      [undelegationId]
    );
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
    store.remove('Undelegation', undelegation.id);
    log.warning(
      `Removed undelegation ${undelegationId} from store as confirmed`,
      [undelegationId]
    );
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

  // Create delegations
  const currentDelegationDataTo = getOrInitCurrentDelegation(to, delegator);
  const currentDelegationDataFrom = getOrInitCurrentDelegation(from, delegator);

  // Update delegations
  updateOrAddDelegation(currentDelegationDataFrom, amount, false);
  updateOrAddDelegation(currentDelegationDataTo, amount, true);
}

export function handleCommissionSet(event: CommissionSet): void {
  const commission = event.params.commission;
  const validator = event.params.validator;

  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validator.toHexString();
  commissionChange.registrationBlock = event.block.number.toI32();
  const appliance = event.block.number.plus(BigInt.fromI32(25000));
  commissionChange.applianceBlock = appliance.toI32();
  commissionChange.save();
}
