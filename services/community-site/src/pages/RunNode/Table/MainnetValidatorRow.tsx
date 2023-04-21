import React from 'react';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';
// import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';
import { useHistory } from 'react-router-dom';

import { stripEth } from '../../../utils/eth';
import {
  Validator,
  ValidatorWithStats,
  getValidatorStatusTooltip,
} from '../../../interfaces/Validator';
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

  const validatorWithYield = validator as ValidatorWithStats;
  return (
    <TableRow className="tableRow" key={address}>
      <TableCell className="tableCell statusCell">
        <Tooltip title={getValidatorStatusTooltip(status)}>
          <div className="status">
            <div className={className} />
          </div>
        </Tooltip>
      </TableCell>
      <TableCell className="tableCell nameCell">
        <div className="flexCell nodeLink" onClick={() => history.push(`/staking/${address}`)}>
          <Nickname showIcon address={address} description={description} />
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">
        {validatorWithYield.yield ? validatorWithYield.yield.toFixed(2) : 0}%
      </TableCell>
      <TableCell className="tableCell commissionCell">
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
      <TableCell className="tableCell delegationCell">{stripEth(delegation)}</TableCell>
      <TableCell className="tableCell availableDelegation">
        {stripEth(availableForDelegation)}
      </TableCell>
      <TableCell className="tableCell rankingCell">{rank}</TableCell>
      <TableCell className="tableCell rewardsCell">{stripEth(commissionReward)}</TableCell>
      <TableCell className="tableCell availableDelegationActionsCell">
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
