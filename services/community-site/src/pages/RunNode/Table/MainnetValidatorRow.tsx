import React from 'react';
import { ethers } from 'ethers';
import { Button, MuiTooltip, TableCell, TableRow } from '@taraxa_project/taraxa-ui';
import { useHistory } from 'react-router-dom';
import { stripEth, weiToEth } from '../../../utils/eth';
import { Validator, getValidatorStatusTooltip } from '../../../interfaces/Validator';
import Nickname from '../../../components/Nickname/Nickname';

type ValidatorRowProps = {
  validator: Validator;
  actionsDisabled: boolean;
  setValidatorInfo: (node: Validator) => void;
  setCommissionClaim: (node: Validator) => void;
};

const MainnetValidatorRow = ({
  validator,
  actionsDisabled,
  setValidatorInfo,
  setCommissionClaim,
}: ValidatorRowProps) => {
  const {
    status,
    description,
    address,
    commission,
    delegation,
    availableForDelegation,
    commissionReward,
    rank,
    isFullyDelegated,
  } = validator;
  const history = useHistory();

  let className = 'dot';
  className += ` ${status}`;

  return (
    <TableRow key={address}>
      <TableCell className="statusCell">
        <MuiTooltip title={getValidatorStatusTooltip(status)}>
          <div className="status">
            <div className={className} />
          </div>
        </MuiTooltip>
      </TableCell>
      <TableCell className="nameCell">
        <div className="flexCell nodeLink" onClick={() => history.push(`/staking/${address}`)}>
          <Nickname showIcon address={address} description={description} />
        </div>
      </TableCell>
      <TableCell className="yieldCell">{validator.yield || 0}</TableCell>
      <TableCell className="commissionCell">{commission}%</TableCell>
      <TableCell className="delegationCell">
        <strong>{ethers.utils.commify(Number(weiToEth(delegation)).toFixed(2))}</strong>
      </TableCell>
      <TableCell className="availableDelegation">
        <div className="availableDelegation">
          {isFullyDelegated
            ? '0 (Fully delegated)'
            : ethers.utils.commify(Number(weiToEth(availableForDelegation)).toFixed(2))}
        </div>
      </TableCell>
      <TableCell className="rankingCell">{rank}</TableCell>
      <TableCell className="rewardsCell">{stripEth(commissionReward)}</TableCell>
      <TableCell className="availableDelegationActionsCell">
        <div className="validatorActions">
          <Button
            size="small"
            variant="contained"
            color="secondary"
            label="Edit"
            className="smallBtn"
            disabled={actionsDisabled}
            onClick={() => {
              setValidatorInfo(validator);
            }}
          />
          <Button
            size="small"
            variant="contained"
            color="secondary"
            label="Claim"
            className="smallBtn"
            disabled={actionsDisabled || commissionReward.isZero()}
            onClick={() => {
              setCommissionClaim(validator);
            }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default MainnetValidatorRow;
