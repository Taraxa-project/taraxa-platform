import { Icons, Label } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import React from 'react';
import { theme } from '../../theme-provider';
import {
  TransactionData,
  TransactionStatus,
} from '../../pages/Transactions/Transactions.effects';

export const toTableRow = (props: TransactionData) => {
  const { timestamp, block, status: state, txHash, value, token } = props;
  const txDate = moment.unix(+timestamp).format('dddd, MMMM, YYYY h:mm:ss A');
  let labelType: JSX.Element;
  if (state === TransactionStatus.SUCCESS) {
    labelType = (
      <Label
        variant='success'
        label='Success'
        icon={<Icons.GreenCircledCheck />}
      />
    );
  } else if (state === TransactionStatus.FAILURE) {
    labelType = (
      <Label
        variant='error'
        label='Failure'
        icon={<Icons.RedCircledCancel />}
      />
    );
  } else {
    labelType = (
      <Label
        variant='error'
        label='Failure'
        icon={<Icons.RedCircledCancel />}
      />
    );
  }

  const txHashContainer = (
    <p
      style={{
        color: theme.palette.secondary.main,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
      }}
    >
      {txHash}
    </p>
  );

  return {
    data: [
      {
        timestamp: txDate,
        block,
        status: labelType,
        txHash: txHashContainer,
        value: `${value} ${token}`,
      },
    ],
  };
};
