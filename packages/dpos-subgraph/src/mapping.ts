import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import {
  CommissionSet,
  Delegated,
  Redelegated,
  UndelegateCanceled,
  Undelegated,
} from '../generated/DPOS/DPOS';
import { CommissionChange, Delegation } from '../generated/schema';

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

export function handleDelegated(event: Delegated): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;
  const amount = event.params.amount;
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
  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.minus(amount);
  currentDelegation.save();
}

export function handleUndelegateCanceled(event: UndelegateCanceled): void {
  const delegator = event.params.delegator;
  const validator = event.params.validator;

  const currentDelegation = getOrInitCurrentDelegation(validator, delegator);
  currentDelegation.amount = currentDelegation.amount.plus(event.params.amount);
  currentDelegation.timestamp = event.block.timestamp;
  currentDelegation.save();
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

  const commissionChange = new CommissionChange(event.block.hash.toHexString());
  commissionChange.commission = commission;
  commissionChange.validator = validator.toHexString();
  commissionChange.registrationBlock = event.block.number.toI32();
  const appliesAt = event.block.number.plus(BigInt.fromI32(25000));
  commissionChange.applyAtBlock = appliesAt.toI32();
  commissionChange.timestamp = event.block.timestamp;
  commissionChange.save();
}
