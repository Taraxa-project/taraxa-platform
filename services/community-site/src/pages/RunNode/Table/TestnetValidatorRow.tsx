import React from 'react';
import { TableCell, TableRow } from '@mui/material';

import { formatValidatorName } from '../../../utils/string';
import OwnNode from '../../../interfaces/OwnNode';

const TestnetValidatorRow = (validator: OwnNode) => {
  const { isActive, address, name, yield: y, weeklyBlocksProduced, weeklyRank } = validator;

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
      <TableCell className="tableCell">
        {formatValidatorName(!name || name === '' ? address : name)}
      </TableCell>
      <TableCell className="tableCell">{y}%</TableCell>
      <TableCell className="tableCell">{weeklyBlocksProduced}</TableCell>
      <TableCell className="tableCell">{weeklyRank}</TableCell>
      <TableCell className="tableCell" align="right">
        {/* {row.actions} */}
      </TableCell>
    </TableRow>
  );
};

export default TestnetValidatorRow;
