import { DagBlock, PbftBlock } from '../models';

export const calculateTransactionsPerSecond = (
  last6PbftBlocks: PbftBlock[]
): number[] => {
  if (!last6PbftBlocks || last6PbftBlocks.length === 0) return [];
  const data = last6PbftBlocks.filter(Boolean).map((block) => {
    const timeOfBlockBefore = Number(
      last6PbftBlocks.find((b) => b.number === block.number - 1)?.timestamp || 0
    );
    const timeBetween = Number(block.timestamp) - timeOfBlockBefore;
    const tps = block.transactionCount / timeBetween;
    return tps;
  });
  return data?.slice(0, data.length - 1);
};

export const calculatePBFTBlockTime = (
  last6PbftBlocks: PbftBlock[]
): number[] => {
  if (!last6PbftBlocks || last6PbftBlocks.length === 0) return [];
  const data = last6PbftBlocks.map((block) => {
    const timeOfBlockBefore = Number(
      last6PbftBlocks.find((b) => b.number === block.number - 1)?.timestamp || 0
    );
    const timeBetween = Number(block.timestamp) - timeOfBlockBefore;
    return timeBetween;
  });
  return data?.slice(0, data.length - 1);
};

export const getLastNTimestamps = (
  dags: DagBlock[],
  amount: number
): number[] => {
  return dags
    ?.flatMap((d) => d.timestamp)
    ?.sort((a, b) => a + b)
    ?.slice(0, amount);
};

export const getLastNDagBlocks = (
  dags: DagBlock[],
  amount: number
): DagBlock[] => {
  const onlyNLatestTimestamps = getLastNTimestamps(dags, amount);
  const last6Timestamps = dags
    ?.filter((b) => onlyNLatestTimestamps.includes(b.timestamp))
    ?.sort((a, b) => a.timestamp + b.timestamp);
  return last6Timestamps;
};

export const calculateDagBlocksPerSecond = (
  last6DagBlocks: DagBlock[],
  last5Timestamps: number[]
): number[] => {
  return last5Timestamps.map((time) => {
    return last6DagBlocks.filter((dag) => dag.timestamp === time).length;
  });
};

export const calculateDagsPerSecond = (
  pbfts: PbftBlock[],
  dags: DagBlock[]
): number[] => {
  interface DagsPerSecond {
    pbftPeriod: number;
    dags: DagBlock[];
    seconds: number;
  }
  const dagsPerSecond = pbfts.map((pbft) => {
    const composite: DagsPerSecond = {
      pbftPeriod: pbft.number,
      dags: filterDagsPerBlockPeriod(dags, pbft.number),
      seconds: getDagsPerSecond(filterDagsPerBlockPeriod(dags, pbft.number)),
    };
    return composite;
  });
  return dagsPerSecond?.map((dps: DagsPerSecond) => dps.seconds);
};

const filterDagsPerBlockPeriod = (
  dags: DagBlock[],
  period: number
): DagBlock[] => {
  return dags
    .filter((dag) => {
      return dag.pbftPeriod === period;
    })
    .sort((a, b) => a.timestamp + b.timestamp);
};

const getDagsPerSecond = (dags: DagBlock[]) => {
  if (!dags || dags.length === 0) return 0;
  const dagsLength = dags.length;
  const first = dags[0].timestamp;
  const last = dags[dagsLength - 1].timestamp;
  return Math.floor(dagsLength / (last - first));
};

export const calculateDagEfficiency = (
  pbfts: PbftBlock[],
  dags: DagBlock[]
): number[] => {
  return pbfts.map((pbft) => {
    const filteredDags = dags.filter((dag) => dag.pbftPeriod === pbft.number);
    const transactions = [].concat(
      ...filteredDags.map((dag) => dag.transactions)
    );
    const uniqueTransactionHashes = new Set(
      transactions.map((transaction) => transaction.hash)
    );
    const efficiency =
      (uniqueTransactionHashes.size / transactions.length) * 100;
    return efficiency;
  });
};
