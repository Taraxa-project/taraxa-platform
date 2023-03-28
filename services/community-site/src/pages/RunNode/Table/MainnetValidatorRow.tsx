import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';
// import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';

import { formatValidatorName } from '../../../utils/string';
import { stripEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isActive, address, commission, delegation, availableForDelegation, commissionReward } =
    validator;

  let className = 'dot';
  if (isActive) {
    className += ' active';
  }
  return (
    <TableRow className="tableRow" key={address}>
      <TableCell className="tableCell statusCell">
        <div className="status">
          <div className={className} />
        </div>
      </TableCell>
      <TableCell className="tableCell nameCell">{formatValidatorName(address)}</TableCell>
      <TableCell className="tableCell yieldCell">20%</TableCell>
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
        {(parseFloat(`${commission || 0}`) / 100).toPrecision(2)}%
      </TableCell>
      <TableCell className="tableCell delegationCell">{stripEth(delegation)}</TableCell>
      <TableCell className="tableCell availableDelegation">
        {stripEth(availableForDelegation)}
      </TableCell>
      <TableCell className="tableCell rankingCell">{/* {row.weeklyRank} */}0</TableCell>
      <TableCell className="tableCell rewardsCell">{stripEth(commissionReward)}</TableCell>
      <TableCell className="tableCell actionsCell">
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
            disabled={actionsDisabled}
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
