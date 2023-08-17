import React from 'react';
import { MuiTooltip, Button, TableCell, TableRow } from '@taraxa_project/taraxa-ui';

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
        <div className="flexCell nodeLink">
          <Nickname showIcon address={address} description={description} />
        </div>
      </TableCell>
      <TableCell className="yieldCell">{y}%</TableCell>
      <TableCell className="pbftsCell">{pbftsProduced}</TableCell>
      <TableCell className="rankingCell">{rank || 0}</TableCell>
      <TableCell className="availableDelegationActionsCell">
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
      </TableCell>
    </TableRow>
  );
};

export default TestnetValidatorRow;
