import React from 'react';
import clsx from 'clsx';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { TableCell, TableRow } from '@mui/material';

import { Button } from '@taraxa_project/taraxa-ui';

import { formatValidatorName } from '../../../utils/string';
import { weiToEth } from '../../../utils/eth';

import { Validator } from '../../../interfaces/Validator';

type ValidatorRowProps = {
  validator: Validator;
  actionsDisabled: boolean;
  ownDelegation: boolean;
  setDelegateToValidator: (node: Validator) => void;
  setReDelegateFromValidator: (node: Validator) => void;
  setUndelegateFromValidator: (node: Validator) => void;
};

const ValidatorRow = ({
  validator,
  actionsDisabled,
  ownDelegation,
  setDelegateToValidator,
  setReDelegateFromValidator,
  setUndelegateFromValidator,
}: ValidatorRowProps) => {
  const history = useHistory();
  return (
    <TableRow className={clsx('tableRow')}>
      <TableCell className="tableCell statusCell">
        <div className="status">
          <div className={clsx('dot', validator.isActive && 'active')} />
        </div>
      </TableCell>
      <TableCell className="tableCell nameCell">
        <div
          className="flexCell nodeLink"
          onClick={() => history.push(`/delegation/${validator.address}`)}
        >
          <div>{formatValidatorName(validator.address)}</div>
        </div>
      </TableCell>
      <TableCell className="tableCell yieldCell">20%</TableCell>
      <TableCell className="tableCell commissionCell">{validator.commission}%</TableCell>
      <TableCell className="tableCell delegationCell">
        <strong>{ethers.utils.commify(weiToEth(validator.delegation))}</strong>
      </TableCell>
      <TableCell className="tableCell availableDelegationActionsCell">
        <div className="availableDelegation">
          {validator.isFullyDelegated
            ? '0 (Fully delegated)'
            : ethers.utils.commify(weiToEth(validator.availableForDelegation))}
        </div>
        <div className="validatorActions">
          <Button
            size="small"
            color="secondary"
            variant="contained"
            label="Re-Delegate"
            disabled={actionsDisabled || !ownDelegation}
            className="smallBtn"
            onClick={() => setReDelegateFromValidator(validator)}
          />
          <Button
            size="small"
            color="secondary"
            variant="contained"
            label="Delegate"
            disabled={
              actionsDisabled ||
              validator.isFullyDelegated ||
              validator.availableForDelegation.lte(0)
            }
            className="smallBtn"
            onClick={() => setDelegateToValidator(validator)}
          />
          <Button
            size="small"
            color="error"
            label="Un-delegate"
            variant="contained"
            disabled={actionsDisabled || !ownDelegation}
            className="smallBtn"
            onClick={() => setUndelegateFromValidator(validator)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ValidatorRow;
