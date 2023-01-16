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

export const calculateDagEfficiencyForPBFT = (
  pbfts: PbftBlock[],
  dags: DagBlock[]
): number[] => {
  interface PBFTWithDags {
    pbft: PbftBlock;
    dags: DagBlock[];
    totalTransactions?: number;
  }

  const dagsForPbft = pbfts.map((pbft) => {
    const composite: PBFTWithDags = {
      pbft,
      dags: dags.filter((dag) => {
        return dag.pbftPeriod === pbft.number;
      }),
      totalTransactions: 0,
    };
    return composite;
  });
  dagsForPbft.forEach((c, i) =>
    c.dags.forEach((dag) => {
      const txEs = c.totalTransactions + dag.transactionCount;
      dagsForPbft[i].totalTransactions = txEs;
    })
  );
  const efficiency = dagsForPbft.map((pbftPeriod) =>
    pbftPeriod.totalTransactions > 0
      ? (pbftPeriod.totalTransactions /
          (pbftPeriod.pbft.transactionCount > 0
            ? pbftPeriod.pbft.transactionCount
            : 1)) *
        100
      : 0
  );
  return efficiency;
};
