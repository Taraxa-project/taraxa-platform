export const dagBlockQuery = `
  query dag_block_query($hash: Bytes32) {
    dagBlock (hash: $hash) {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod,
      timestamp,
      transactionCount,
    }
  }
`;

export const dagBlocksQuery = `
  query dag_blocks_query($dagLevel: Long, $count: Int, $reverse: Boolean) {
    dagBlocks (dagLevel: $dagLevel, count: $count, reverse: $reverse) {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod,
      timestamp,
      transactionCount
    }
  }
`;
