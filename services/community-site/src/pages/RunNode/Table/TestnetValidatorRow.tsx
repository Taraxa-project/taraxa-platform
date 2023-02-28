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
    <>
      <Button
        size="small"
        label="Edit"
        className="edit"
        onClick={() => {
          onEdit(validator);
        }}
      />
      <Button
        size="small"
        label="Delete"
        className="delete"
        disabled={!validator.canDelete}
        onClick={() => {
          const confirmation = window.confirm(
            "Are you sure you want to delete this node? You won't be able to add a node with the same wallet address.",
          );
          if (confirmation) {
            onDelete(validator);
          }
        }}
      />
    </>
  );

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
        {actions}
      </TableCell>
    </TableRow>
  );
};

export default TestnetValidatorRow;
