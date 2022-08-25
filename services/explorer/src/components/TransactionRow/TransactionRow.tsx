import { Icons, Label } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import React from 'react';
import {
  TransactionData,
  TransactionStatus,
} from '../../pages/Transactions/Transactions.effect';

export const toTableRow = (props: TransactionData) => {
  const { timestamp, block, status: state, txHash, value, token } = props;
  const txDate = moment(timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A');
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
        color: '#15AC5B',
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
        txDate,
        block,
        status: labelType,
        txHash: txHashContainer,
        value: `${value} ${token}`,
      },
    ],
  };
};
