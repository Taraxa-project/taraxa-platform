import React from 'react';
import clsx from 'clsx';
import { BigNumber, ethers } from 'ethers';
import { MuiTooltip, Button, TableCell, TableRow } from '@taraxa_project/taraxa-ui';
import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import { stripEth, weiToEth } from '../../../utils/eth';

import { COMMISSION_CHANGE_THRESHOLD } from '../../../interfaces/Delegation';
import { Validator, getValidatorStatusTooltip } from '../../../interfaces/Validator';
import Nickname from '../../../components/Nickname/Nickname';
import { useRedelegation } from '../../../services/useRedelegation';

type ValidatorRowProps = {
  validator: Validator;
  stakingRewards: ethers.BigNumber;
  actionsDisabled: boolean;
  ownDelegation: boolean;
  setDelegateToValidator: (node: Validator) => void;
  setClaimFromValidator: (amount: BigNumber, node: Validator) => void;
  setUndelegateFromValidator: (node: Validator) => void;
  currentBlockNumber?: number;
  undelegateDisabled?: boolean;
};

const ValidatorRow = ({
  validator,
  stakingRewards,
  actionsDisabled,
  ownDelegation,
  setDelegateToValidator,
  setClaimFromValidator,
  setUndelegateFromValidator,
  currentBlockNumber,
  undelegateDisabled = false,
}: ValidatorRowProps) => {
  const { validatorFrom, setValidatorFrom, setValidatorTo } = useRedelegation();

  return (
    <TableRow>
      <TableCell className="statusCell">
        <MuiTooltip title={getValidatorStatusTooltip(validator.status)}>
          <div className="status">
            <div className={clsx('dot', validator.status)} />
          </div>
        </MuiTooltip>
      </TableCell>
      <TableCell className="nameCell">
        <div className="flexCell">
          <Nickname showIcon address={validator.address} description={validator.description} />
        </div>
      </TableCell>
      <TableCell className="yieldCell">{validator.yield || 0}%</TableCell>
      <TableCell className="commissionCell">
        {currentBlockNumber &&
        validator.lastCommissionChange &&
        validator.registrationBlock &&
        currentBlockNumber - validator.lastCommissionChange <= COMMISSION_CHANGE_THRESHOLD &&
        validator.lastCommissionChange !== validator.registrationBlock ? (
          <div className="commissionDisplayPendingChangeWrapper">
            <NodeCommissionChangeIcon />{' '}
            <span className="commissionDisplayPendingChange">{`${validator.commission}%`}</span>
          </div>
        ) : (
          `${validator.commission}%`
        )}
      </TableCell>
      <TableCell className="delegationCell">
        {ethers.utils.commify(weiToEth(validator.delegation))}
      </TableCell>
      <TableCell className="availableDelegation">
        {validator.isFullyDelegated
          ? '0 (Fully delegated)'
          : ethers.utils.commify(weiToEth(validator.availableForDelegation))}
      </TableCell>
      <TableCell className="rewardsCell">{stripEth(stakingRewards)}</TableCell>
      <TableCell className="availableDelegationActionsCell">
        <div className="validatorActions">
          {!validatorFrom && (
            <Button
              size="small"
              color="secondary"
              variant="contained"
              label={ownDelegation ? 'Delegate More' : 'Delegate'}
              disabled={
                actionsDisabled ||
                validator.isFullyDelegated ||
                validator.availableForDelegation.lte(0)
              }
              className="smallBtn"
              onClick={() => setDelegateToValidator(validator)}
            />
          )}
          {!validatorFrom && ownDelegation && (
            <Button
              size="small"
              color="secondary"
              variant="contained"
              label="Claim"
              disabled={actionsDisabled || stakingRewards.lte(BigNumber.from('0'))}
              className="smallBtn"
              onClick={() => setClaimFromValidator(stakingRewards, validator)}
            />
          )}
          {!validatorFrom && ownDelegation && (
            <Button
              size="small"
              color="warning"
              variant="contained"
              label="Shift delegation OUT"
              disabled={actionsDisabled || !ownDelegation}
              className="smallBtn"
              onClick={() => setValidatorFrom(validator)}
            />
          )}
          {validatorFrom && validatorFrom.address !== validator.address && (
            <Button
              size="small"
              color="warning"
              variant="contained"
              label="Shift delegation IN"
              disabled={actionsDisabled}
              className="smallBtn"
              onClick={() => setValidatorTo(validator)}
            />
          )}
          {!validatorFrom && ownDelegation && (
            <Button
              size="small"
              color="error"
              label="Un-delegate"
              variant="contained"
              disabled={actionsDisabled || undelegateDisabled}
              className="smallBtn"
              onClick={() => setUndelegateFromValidator(validator)}
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ValidatorRow;
