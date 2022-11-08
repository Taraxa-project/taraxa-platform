import React from 'react';
import { ethers } from 'ethers';
import { TableCell, TableRow } from '@mui/material';

// import NodeCommissionChangeIcon from '../../../assets/icons/nodeCommissionChange';

import { formatValidatorName } from '../../../utils/string';
import { weiToEth } from '../../../utils/eth';
import { Validator } from '../../../interfaces/Validator';

const MainnetValidatorRow = (validator: Validator) => {
  const { isActive, address, commission, delegation, availableForDelegation } = validator;

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
      <TableCell className="tableCell">{ethers.utils.commify(weiToEth(delegation))}</TableCell>
      <TableCell className="tableCell">
        {ethers.utils.commify(weiToEth(availableForDelegation))}
      </TableCell>
      <TableCell className="tableCell">{/* {row.weeklyRank} */}0</TableCell>
      <TableCell className="tableCell" align="right">
        {/* {row.actions} */}
      </TableCell>
    </TableRow>
  );
};

export default MainnetValidatorRow;
