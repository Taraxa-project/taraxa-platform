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
    transactions {
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
      gas
      inputData,
      createdContract {
        address
      }
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

export const dagBlocksForPeriodQuery = `
query period_Dag_Blocks($period: Long!){
	periodDagBlocks(period: $period){
		hash
		pivot
		tips
		level
		pbftPeriod
		author{
			address
			balance
		}
		timestamp
		transactions{
			hash
			nonce
			index
			inputData
			value
		}
    transactionCount
	}
}
`;
