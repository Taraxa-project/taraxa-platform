import { Icons, Label } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import React from 'react';
import { TransactionLink } from '../components/Links';
import {
  BlockData,
  TransactionTableData,
  TransactionStatus,
} from '../models/TableData';

export const statusToLabel = (state: TransactionStatus): JSX.Element => {
  if (state === TransactionStatus.SUCCESS) {
    return (
      <Label
        variant='success'
        label='Success'
        gap
        icon={<Icons.GreenCircledCheck />}
      />
    );
  }
  if (state === TransactionStatus.FAILURE) {
    return (
      <Label
        variant='error'
        label='Failure'
        gap
        icon={<Icons.RedCircledCancel />}
      />
    );
  }
  return (
    <Label
      variant='error'
      label='Failure'
      gap
      icon={<Icons.RedCircledCancel />}
    />
  );
};

export const toTransactionTableRow = (props: TransactionTableData) => {
  const { timestamp, block, status: state, txHash, value, token } = props;
  const txDate = moment.unix(+timestamp).format('dddd, MMMM, YYYY h:mm:ss A');
  const labelType = statusToLabel(state);

  const txHashContainer = <TransactionLink txHash={txHash} />;

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

export const timestampToAge = (timestamp: string) => {
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
  return ageString;
};

export const toBlockTableRow = (props: BlockData) => {
  const { timestamp, block, hash, transactionCount } = props;

  const ageString = timestampToAge(timestamp);
  const txHashContainer = <TransactionLink txHash={hash} />;

  return {
    data: [
      {
        timestamp: ageString,
        block,
        hash: txHashContainer,
        transactionCount,
      },
    ],
  };
};
