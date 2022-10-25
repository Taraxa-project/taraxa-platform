import React from 'react';
import { CircularProgress } from '@mui/material';
import { Icons, Label } from '@taraxa_project/taraxa-ui';
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

export const toTransactionTableRow = (props: TransactionTableData) => {
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

export const timestampToAge = (timestamp: string | number) => {
  if (!timestamp) return '0';
  let age = Math.floor(+new Date() / 1000 - +timestamp);
  const days = Math.floor(age / 86400);
  age -= Math.floor(86400 * days);
  const hours = Math.floor(age / 3600);
  age -= Math.floor(3600 * hours);
  const minutes = Math.floor(age / 60);
  age -= Math.floor(60 * minutes);

  const ageString = `${days > 0 ? `${days} day(s), ` : ''}${
    hours > 0 ? `${hours} hour(s), ` : ''
  } ${minutes ? `${minutes} minute(s), ` : ''} ${age ? `${age}s` : 'ago'}`;
  return ageString;
};

export const toBlockTableRow = (props: BlockData) => {
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

export const toDagBlockTableRow = (props: BlockData) => {
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
}: NodesTableData) => {
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
