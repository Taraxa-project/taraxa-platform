export const dagBlockQuery = `
query dag_block_query($hash: Bytes32) {
  dagBlock (hash: "0c9d36dd14c50e0c319e095f06698a05bb80def51c7927d783514b051c619454") {
    hash,
    pivot,
    tips,
    level,
    pbftPeriod,
    timestamp,
    transactionCount,
    transactions {
      hash
    }
  }
}
`;

export const dagDetailsQuery = `
query dag_details_query($hash: Bytes32) {
  dagBlock(hash: $hash) {
    hash
    pivot
    tips
    level
    pbftPeriod
    timestamp
    author {
			address
		}
    transactionCount
    vdf
    signature
    transactions{
      hash
      block {
        number
        timestamp
      }
      value
      status
      from{
        address
      }
      to{
        address
      }
      gasUsed
      gasPrice
    }
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
