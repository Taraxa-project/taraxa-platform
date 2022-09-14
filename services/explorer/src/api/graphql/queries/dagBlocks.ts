export const dagBlockQuery = `
  query dag_block_query($hash: Bytes32) {
    blocks (hash: $hash) {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod,
      timestamp,
      author,
      transactions {
        status, hash, gas
      },
    }
  }
`;

export const dagBlocksQuery = `
  query dag_blocks_query($dagLevel: Long, $count: Int, $reverse: Boolean) {
    blocks (dagLevel: $dagLevel, count: $count, reverse: $reverse) {
      hash,
      pivot,
      tips,
      level,
      pbftPeriod,
      timestamp,
      author,
    }
  }
`;
