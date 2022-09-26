import { DagBlock, PbftBlock } from '../models';

export const calculateTransactionsPerSecond = (
  last6PbftBlocks: PbftBlock[]
) => {
  if (!last6PbftBlocks || last6PbftBlocks.length === 0) return [];
  //   console.log(last6PbftBlocks);
  const data = last6PbftBlocks.filter(Boolean).map((block) => {
    //   console.log(block);
    const timeOfBlockBefore = Number(
      last6PbftBlocks.find((b) => b.number === block.number - 1)?.timestamp || 0
    );
    const timeBetween = Number(block.timestamp) - timeOfBlockBefore;
    //   console.log(
    //     `time between previous block and ${block.number} is: ${timeBetween}`
    //   );
    const tps = block.transactionCount / timeBetween;
    //   console.log(`TPS for block ${block.number} is: ${tps}`);
    return tps;
  });
  return data.slice(0, data.length - 1);
};

export const calculatePBFTBlockTime = (last6PbftBlocks: PbftBlock[]) => {
  if (!last6PbftBlocks || last6PbftBlocks.length === 0) return [];
  const data = last6PbftBlocks.map((block) => {
    const timeOfBlockBefore = Number(
      last6PbftBlocks.find((b) => b.number === block.number - 1)?.timestamp || 0
    );
    const timeBetween = Number(block.timestamp) - timeOfBlockBefore;
    return timeBetween;
  });
  return data.slice(0, data.length - 1);
};

export const getLatestNTimestamps = (dags: DagBlock[], amount: number) => {
  return dags
    .flatMap((d) => d.timestamp)
    .sort((a, b) => a - b)
    .slice(0, amount);
};

export const getLatestNDagBlocks = (dags: DagBlock[], amount: number) => {
  console.log('blocks: ', dags);
  const onlyNLatestTimestamps = getLatestNTimestamps(dags, amount);
  console.log('times:', getLatestNTimestamps(dags, amount));
  const last6Timestamps = dags
    .filter((b) => onlyNLatestTimestamps.includes(b.timestamp))
    .sort((a, b) => a.timestamp + b.timestamp);
  console.log('the last 6 timestamps are: ', last6Timestamps);
  return last6Timestamps.sort((a, b) => a.timestamp + b.timestamp);
};

export const calculateDagBlocksPerSecond = (
  last6DagBlocks: DagBlock[],
  last5Timestamps: number[]
) => {
  return last5Timestamps.map((time) => {
    return last6DagBlocks.filter((dag) => dag.timestamp === time).length;
  });
};
