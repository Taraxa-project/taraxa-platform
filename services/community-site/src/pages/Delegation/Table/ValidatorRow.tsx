import React from 'react';
import clsx from 'clsx';
import { BigNumber, ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { TableCell, TableRow } from '@mui/material';

import { Button } from '@taraxa_project/taraxa-ui';

import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import { formatValidatorName } from '../../../utils/string';
import { stripEth, weiToEth } from '../../../utils/eth';

import { COMMISSION_CHANGE_THRESHOLD } from '../../../interfaces/Delegation';
import { Validator } from '../../../interfaces/Validator';

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
  return (
    <TableRow className={clsx('tableRow')}>
      <TableCell className="tableCell statusCell">
        <div className="status">
          <div className={clsx('dot', validator.isActive && 'active')} />
        </div>
      </TableCell>
      <TableCell className="tableCell nameCell">
        <div
          className="flexCell nodeLink"
          onClick={() => history.push(`/delegation/${validator.address}`)}
        >
          <div>{formatValidatorName(validator.address)}</div>
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">20%</TableCell>
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
        <strong>{ethers.utils.commify(weiToEth(validator.delegation))}</strong>
      </TableCell>
      <TableCell className="tableCell delegationCell">
        <div className="availableDelegation">
          {validator.isFullyDelegated
            ? '0 (Fully delegated)'
            : ethers.utils.commify(weiToEth(validator.availableForDelegation))}
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
            label="Delegate"
            disabled={
              actionsDisabled ||
              validator.isFullyDelegated ||
              validator.availableForDelegation.lte(0)
            }
            className="smallBtn"
            onClick={() => setDelegateToValidator(validator)}
          />
          <Button
            size="small"
            color="error"
            label="Un-delegate"
            variant="contained"
            disabled={actionsDisabled || !ownDelegation || undelegateDisabled}
            className="smallBtn"
            onClick={() => setUndelegateFromValidator(validator)}
          />
          <Button
            size="small"
            color="secondary"
            variant="contained"
            label="Claim"
            disabled={actionsDisabled || stakingRewards.lte(BigNumber.from('0'))}
            className="smallBtn"
            onClick={() => setClaimFromValidator(stakingRewards, validator)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ValidatorRow;
