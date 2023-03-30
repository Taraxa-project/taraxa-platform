import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';

import { formatValidatorName } from '../../../utils/string';
import OwnNode from '../../../interfaces/OwnNode';

const TestnetValidatorRow = ({
  validator,
  onEdit,
  onDelete,
}: {
  validator: OwnNode;
  onEdit: (validator: OwnNode) => void;
  onDelete: (validator: OwnNode) => void;
}) => {
  const { isActive, address, name, yield: y, weeklyBlocksProduced, weeklyRank } = validator;

  const actions = (
    <div className="validatorActions">
      <Button
        size="small"
        variant="contained"
        color="secondary"
        className="smallBtn"
        label="Edit"
        onClick={() => {
          onEdit(validator);
        }}
      />
      <Button
        size="small"
        variant="contained"
        color="secondary"
        className="smallBtn"
        label="Delete"
        disabled={!validator.canDelete}
        onClick={() => {
          const confirmation = window.confirm();
          if (confirmation) {
            onDelete(validator);
          }
        }}
      />
    </div>
  );

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
      <TableCell className="tableCell nodeCell">
        {formatValidatorName(!name || name === '' ? address : name)}
      </TableCell>
      <TableCell className="tableCell nodeCell">{y}%</TableCell>
      <TableCell className="tableCell nodeCell">{weeklyBlocksProduced}</TableCell>
      <TableCell className="tableCell nodeCell">{weeklyRank || 0}</TableCell>
      <TableCell className="tableCell nodeActionsCell" align="right">
        {actions}
      </TableCell>
    </TableRow>
  );
};

export default TestnetValidatorRow;
