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
  const { isActive, address, commission, delegation, availableForDelegation, commissionReward } =
    validator;

  let className = 'dot';
  if (isActive) {
    className += ' active';
  }
  return (
    <TableRow className="tableRow" key={address}>
      <TableCell className="tableCell">
        <div className="status">
          <div className={className} />
        </div>
      </TableCell>
      <TableCell className="tableCell">{formatValidatorName(address)}</TableCell>
      <TableCell className="tableCell">20%</TableCell>
      <TableCell className="tableCell">
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
      <TableCell className="tableCell">{stripEth(delegation)}</TableCell>
      <TableCell className="tableCell">{stripEth(availableForDelegation)}</TableCell>
      <TableCell className="tableCell">{/* {row.weeklyRank} */}0</TableCell>
      <TableCell className="tableCell">{stripEth(commissionReward)}</TableCell>
      <TableCell className="tableCell">
        <Button
          size="small"
          variant="contained"
          color="secondary"
          label="Edit"
          className="smallBtn"
          disabled={actionsDisabled}
          onClick={() => {
            setCommissionClaim(validator);
          }}
        />
      </TableCell>
      <TableCell className="tableCell">
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
      </TableCell>
    </TableRow>
  );
};

export default MainnetValidatorRow;
