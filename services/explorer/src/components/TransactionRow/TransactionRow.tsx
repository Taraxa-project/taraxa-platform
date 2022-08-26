import { Icons, Label } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import React from 'react';
import { BlockData } from '../../pages/Blocks/Blocks.effects';
import { theme } from '../../theme-provider';
import {
  TransactionData,
  TransactionStatus,
} from '../../pages/Transactions/Transactions.effects';

export const toTransactionTableRow = (props: TransactionData) => {
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

export const toBlockTableRow = (props: BlockData) => {
  const { timestamp, block, txHash, transactionCount } = props;
  let age = Math.floor(+new Date() / 1000 - +timestamp);
  const days = Math.floor(age / 86400);
  age -= Math.floor(86400 * days);
  const hours = Math.floor(age / 3600);
  age -= Math.floor(3600 * hours);
  const minutes = Math.floor(age / 60);
  age -= Math.floor(60 * minutes);

  const ageString = `${days > 0 ? `${days} day(s), ` : ''}${
    hours > 0 ? `${hours} hour(s), ` : ''
  } ${minutes ? `${minutes} minute(s), ` : ''} ${age ? `${age}s ago` : 'ago'}`;
  const txHashContainer = (
    <p
      style={{
        color: theme.palette.secondary.main,
        // whiteSpace: 'nowrap',
        // textOverflow: 'ellipsis',
        // overflow: 'hidden',
      }}
    >
      {txHash}
    </p>
  );

  return {
    data: [
      {
        timestamp: ageString,
        block,
        txHash: txHashContainer,
        transactionCount,
      },
    ],
  };
};
