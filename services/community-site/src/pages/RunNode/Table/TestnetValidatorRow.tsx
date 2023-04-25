import React from 'react';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';

import Nickname from '../../../components/Nickname/Nickname';
import { Validator, getValidatorStatusTooltip } from '../../../interfaces/Validator';

const TestnetValidatorRow = ({
  validator,
  onEdit,
  onDelete,
}: {
  validator: Validator;
  onEdit: (validator: Validator) => void;
  onDelete: (validator: Validator) => void;
}) => {
  const { status, address, description, yield: y, pbftsProduced, rank } = validator;

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
        // disabled={!validator.canDelete}
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
  className += ` ${status}`;

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
        <div className="flexCell nodeLink">
          <Nickname showIcon address={address} description={description} />
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">{y}%</TableCell>
      <TableCell className="tableCell pbftsCell">{pbftsProduced}</TableCell>
      <TableCell className="tableCell rankingCell">{rank || 0}</TableCell>
      <TableCell className="tableCell availableDelegationActionsCell" align="right">
        <div className="validatorActions">{actions}</div>
      </TableCell>
    </TableRow>
  );
};

export default TestnetValidatorRow;
