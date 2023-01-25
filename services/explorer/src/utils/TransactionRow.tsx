import React from 'react';
import { CircularProgress } from '@mui/material';
import { Icons, Label } from '@taraxa_project/taraxa-ui';
import { DateTime } from 'luxon';
import moment from 'moment';
import { HashLink } from '../components/Links';
import {
  BlockData,
  TransactionTableData,
  TransactionStatus,
  NodesTableData,
} from '../models';
import { HashLinkType } from './Enums';

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
  if (state === TransactionStatus.NOT_YET_MINED) {
    return (
      <Label
        variant='secondary'
        label='Not Yet Mined'
        gap
        icon={<Icons.NotFound />}
      />
    );
  }
  return (
    <Label
      variant='loading'
      label='Loading'
      gap
      icon={<CircularProgress size={25} color='inherit' />}
    />
  );
};

export const toTransactionTableRow = (
  props: TransactionTableData
): {
  data: {
    timestamp: string;
    block: JSX.Element;
    status: JSX.Element;
    txHash: JSX.Element;
    value: string;
  }[];
} => {
  const { timestamp, block, status: state, txHash, value, token } = props;
  const txDate = moment.unix(+timestamp).format('dddd, MMMM, YYYY h:mm:ss A');
  const labelType = statusToLabel(state);

  const txHashContainer = (
    <HashLink linkType={HashLinkType.TRANSACTIONS} hash={txHash} />
  );

  const blockNumberContainer = (
    <HashLink linkType={HashLinkType.PBFT} blockNumber={+block} />
  );

  return {
    data: [
      {
        timestamp: txDate,
        block: blockNumberContainer,
        status: labelType,
        txHash: txHashContainer,
        value: `${value} ${token}`,
      },
    ],
  };
};

export const timestampToAge = (timestamp: string | number): string => {
  if (!timestamp) return 'NA';
  const date = DateTime.fromMillis(+timestamp * 1000, { zone: 'UTC' });
  const currentDate = DateTime.local();
  if (date > currentDate) {
    return '0 second(s) ago';
  }
  const diff = currentDate.diff(date, [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
  ]);

  let age = '';
  if (diff.years) age += `${Math.round(diff.years)} year(s) `;
  else if (diff.months) age += `${Math.round(diff.months)} month(s) `;
  else if (diff.weeks) age += `${Math.round(diff.weeks)} week(s) `;
  else if (diff.days) age += `${Math.round(diff.days)} day(s) `;
  else if (diff.hours) age += `${Math.round(diff.hours)} hour(s) `;
  else if (diff.minutes) age += `${Math.round(diff.minutes)} minute(s) `;
  else if (diff.seconds) age += `${Math.round(diff.seconds)} second(s) `;

  return `${age}ago`;
};

export const toBlockTableRow = (
  props: BlockData
): {
  data: {
    timestamp: string;
    block: JSX.Element;
    hash: JSX.Element;
    transactionCount: number;
  }[];
} => {
  const { timestamp, block, hash, transactionCount } = props;

  const ageString = timestampToAge(timestamp);
  const txHashContainer = <HashLink linkType={HashLinkType.PBFT} hash={hash} />;
  const blockNumberContainer = (
    <HashLink linkType={HashLinkType.PBFT} blockNumber={block} />
  );

  return {
    data: [
      {
        timestamp: ageString,
        block: blockNumberContainer,
        hash: txHashContainer,
        transactionCount,
      },
    ],
  };
};

export const toDagBlockTableRow = (
  props: BlockData
): {
  data: {
    timestamp: string;
    level: number;
    hash: JSX.Element;
    transactionCount: number;
  }[];
} => {
  const { timestamp, level, hash, transactionCount } = props;

  const ageString = timestampToAge(timestamp);
  const txHashContainer = (
    <HashLink linkType={HashLinkType.BLOCKS} hash={hash} />
  );

  return {
    data: [
      {
        timestamp: ageString,
        level,
        hash: txHashContainer,
        transactionCount,
      },
    ],
  };
};

export const toNodeTableRow = ({
  rank,
  nodeAddress,
  blocksProduced,
}: NodesTableData): {
  data: {
    rank: number;
    nodeAddress: JSX.Element;
    blocksProduced: string;
  }[];
} => {
  const address = (
    <HashLink
      linkType={HashLinkType.ADDRESSES}
      width='auto'
      hash={nodeAddress}
    />
  );
  return {
    data: [
      {
        rank,
        nodeAddress: address,
        blocksProduced: blocksProduced.toLocaleString('en-US'),
      },
    ],
  };
};
