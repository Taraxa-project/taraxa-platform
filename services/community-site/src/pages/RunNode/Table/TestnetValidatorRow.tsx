import React from 'react';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { Button } from '@taraxa_project/taraxa-ui';
import { useHistory } from 'react-router-dom';

import OwnNode from '../../../interfaces/OwnNode';
import { getValidatorStatusTooltip } from '../../../utils/getValidatorStatusTooltip';
import NickName from '../../../components/Nickname/Nickname';

const TestnetValidatorRow = ({
  validator,
  onEdit,
  onDelete,
}: {
  validator: OwnNode;
  onEdit: (validator: OwnNode) => void;
  onDelete: (validator: OwnNode) => void;
}) => {
  const { status, address, description, yield: y, weeklyBlocksProduced, weeklyRank } = validator;
  const history = useHistory();

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
        <div className="flexCell nodeLink" onClick={() => history.push(`/staking/${address}`)}>
          <NickName address={address} description={description} />
        </div>
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
