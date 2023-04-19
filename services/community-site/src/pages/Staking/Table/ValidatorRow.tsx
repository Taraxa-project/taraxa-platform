import React from 'react';
import clsx from 'clsx';
import { BigNumber, ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { TableCell, TableRow, Tooltip } from '@mui/material';

import { Button } from '@taraxa_project/taraxa-ui';

import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import { stripEth, weiToEth } from '../../../utils/eth';

import { COMMISSION_CHANGE_THRESHOLD } from '../../../interfaces/Delegation';
import {
  Validator,
  getValidatorStatusTooltip,
  ValidatorWithStats,
} from '../../../interfaces/Validator';
import Nickname from '../../../components/Nickname/Nickname';

type ValidatorRowProps = {
  validator: Validator;
  stakingRewards: ethers.BigNumber;
  actionsDisabled: boolean;
  ownDelegation: boolean;
  setDelegateToValidator: (node: Validator) => void;
  setClaimFromValidator: (amount: BigNumber, node: Validator) => void;
  // setReDelegateFromValidator: (node: Validator) => void;
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
  // setReDelegateFromValidator,
  setUndelegateFromValidator,
  currentBlockNumber,
  undelegateDisabled = false,
}: ValidatorRowProps) => {
  const history = useHistory();
  const validatorWithYield = validator as ValidatorWithStats;
  return (
    <TableRow className={clsx('tableRow')}>
      <TableCell className="tableCell statusCell">
        <Tooltip title={getValidatorStatusTooltip(validator.status)}>
          <div className="status">
            <div className={clsx('dot', validator.status)} />
          </div>
        </Tooltip>
      </TableCell>
      <TableCell className="tableCell nameCell">
        <div
          className="flexCell nodeLink"
          onClick={() => history.push(`/staking/${validator.address}`)}
        >
          <Nickname address={validator.address} description={validator.description} />
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">
        {validatorWithYield.yield ? validatorWithYield.yield.toFixed(2) : 0}%
      </TableCell>
      <TableCell className="tableCell commissionCell">
        {currentBlockNumber &&
        currentBlockNumber - validator.lastCommissionChange <= COMMISSION_CHANGE_THRESHOLD ? (
          <div className="commissionDisplayPendingChangeWrapper">
            <NodeCommissionChangeIcon />{' '}
            <span className="commissionDisplayPendingChange">{`${validator.commission}%`}</span>
          </div>
        ) : (
          `${validator.commission}%`
        )}
      </TableCell>
      <TableCell className="tableCell delegationCell">
        <strong>{ethers.utils.commify(Number(weiToEth(validator.delegation)).toFixed(2))}</strong>
      </TableCell>
      <TableCell className="tableCell delegationCell">
        <div className="availableDelegation">
          {validator.isFullyDelegated
            ? '0 (Fully delegated)'
            : ethers.utils.commify(Number(weiToEth(validator.availableForDelegation)).toFixed(2))}
        </div>
      </TableCell>
      <TableCell className="tableCell stackingCell">{stripEth(stakingRewards)}</TableCell>
      <TableCell className="tableCell availableDelegationActionsCell">
        <div className="validatorActions">
          {/* <Button
            // hidden
            size="small"
            color="secondary"
            variant="contained"
            label="Re-Delegate"
            disabled={actionsDisabled || !ownDelegation}
            className="smallBtn"
            onClick={() => setReDelegateFromValidator(validator)}
          /> */}
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
          {ownDelegation && (
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
          {ownDelegation && (
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
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ValidatorRow;
