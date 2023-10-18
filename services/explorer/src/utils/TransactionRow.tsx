import React from 'react';
import { CircularProgress, Icons, Label } from '@taraxa_project/taraxa-ui';
import moment from 'moment';
import { HashLink } from '../components/Links';
import {
  BlockData,
  TransactionTableData,
  TransactionStatus,
  NodesTableData,
  TransactionTableRow,
  DagTableRow,
  PbftTableRow,
} from '../models';
import { HashLinkType } from './Enums';
import { timestampToDate } from './dateFormat';

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
  if (state === TransactionStatus.NOT_YET_FINALIZED) {
    return (
      <Label
        variant='secondary'
        label='Not Yet Finalized'
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
  data: TransactionTableRow[];
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

export const toBlockTableRow = (
  props: BlockData
): {
  data: PbftTableRow[];
} => {
  const { timestamp, block, hash, transactionCount } = props;

  const ageString = timestampToDate(timestamp);
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
  data: DagTableRow[];
} => {
  const { timestamp, level, hash, transactionCount } = props;

  const ageString = timestampToDate(timestamp);
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
  address,
  pbftCount,
}: NodesTableData): {
  rank: number;
  nodeAddress: JSX.Element;
  blocksProduced: string;
} => {
  const addressLink = (
    <HashLink linkType={HashLinkType.ADDRESSES} width='auto' hash={address} />
  );
  return {
    rank,
    nodeAddress: addressLink,
    blocksProduced: pbftCount.toLocaleString('en-US'),
  };
};
