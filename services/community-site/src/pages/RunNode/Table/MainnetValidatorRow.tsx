import React from 'react';
import { Tooltip } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';
// import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import { useHistory } from 'react-router-dom';
import { TableCell, TableRow } from '../../../components/Table/Table';
import { stripEth } from '../../../utils/eth';
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
  } = validator;
  const history = useHistory();

  let className = 'dot';
  className += ` ${status}`;

  const validatorWithYield = validator as Validator;
  return (
    <TableRow key={address}>
      <TableCell className="statusCell">
        <Tooltip title={getValidatorStatusTooltip(status)}>
          <div className="status">
            <div className={className} />
          </div>
        </Tooltip>
      </TableCell>
      <TableCell className="nameCell">
        <div className="flexCell nodeLink" onClick={() => history.push(`/staking/${address}`)}>
          <Nickname showIcon address={address} description={description} />
        </div>
      </TableCell>
      <TableCell className="yieldCell">
        {validatorWithYield.yield ? validatorWithYield.yield.toFixed(2) : 0}%
      </TableCell>
      <TableCell className="commissionCell">
        {/* {row.hasPendingCommissionChange ? (
          <>
            <NodeCommissionChangeIcon />{' '}
            <span className="commissionDisplayPendingChange">
              {row.currentCommission} ➞ {row.pendingCommission}
            </span>
          </>
        ) : (
          row.currentCommission
        )} */}
        {commission}%
      </TableCell>
      <TableCell className="delegationCell">{stripEth(delegation)}</TableCell>
      <TableCell className="availableDelegation">{stripEth(availableForDelegation)}</TableCell>
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
