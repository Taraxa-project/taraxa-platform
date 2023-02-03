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

export const calculateDagBlocksPerSecondRight = (
  last5DagPeriods: DagBlock[]
): { pbftPeriod: number; dbp: number }[] => {
  if (!last5DagPeriods || last5DagPeriods.length === 0) return;
  const dagsGroupedByPeriods = last5DagPeriods.reduce(function (r, a) {
    r[a.pbftPeriod] = r[a.pbftPeriod] || [];
    r[a.pbftPeriod].push(a);
    return r;
  }, Object.create(null));
  const dbp: { pbftPeriod: number; dbp: number }[] = [];
  for (const pbftPeriod of Object.entries(dagsGroupedByPeriods)) {
    if (pbftPeriod) {
      const orderedDags = (pbftPeriod[1] as any)?.sort(
        (a: any, b: any) => a.timestamp - b.timestamp
      );
      if (!orderedDags || orderedDags.length === 0) return;

      const timeDiff =
        orderedDags[orderedDags.length - 1]?.timestamp -
        orderedDags[0]?.timestamp;
      // console.log(timeDiff);
      const _dpb =
        parseFloat(orderedDags.length) /
        (orderedDags[0]?.timestamp -
          orderedDags[orderedDags.length - 1]?.timestamp);
      // console.log(_dpb);
      dbp.push({
        pbftPeriod: orderedDags[0].pbftPeriod,
        dbp: parseFloat(orderedDags.length) / (timeDiff || 1),
      });
    }
  }
  console.log('final', dbp);
  return dbp?.sort((a, b) => a.pbftPeriod - b.pbftPeriod).slice(0, 6);
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
  const efficiencyCoefficients = dagsForPbft.map((pbftPeriod) =>
    pbftPeriod.totalTransactions > 0
      ? (parseFloat(pbftPeriod.totalTransactions.toString()) /
          (pbftPeriod.pbft.transactionCount > 0
            ? parseFloat(pbftPeriod.pbft.transactionCount.toString())
            : 1)) *
        100
      : 0
  );
  return efficiencyCoefficients.map((c) => {
    return c > 0 ? (100 / c) * 100 : 100;
  });
};
