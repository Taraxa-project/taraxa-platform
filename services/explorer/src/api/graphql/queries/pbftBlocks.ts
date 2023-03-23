export const blockQuery = `
  query block_query($number: Long, $hash: Bytes32) {
    block (number: $number, hash: $hash) {
      number,
      hash,
      stateRoot,
      gasLimit,
      gasUsed,
      timestamp,
			parent {
				hash
			},
			miner {
				address
			},
			difficulty,
		  totalDifficulty,
      transactionCount
    }
  }
`;

export const blockTransactionsQuery = `
  query block_transactions_query($number: Long, $hash: Bytes32) {
    block (number: $number, hash: $hash) {
      number,
      hash,
      transactions {
				from {
					address
				},
				to {
					address
				},
        gasUsed,
        gasPrice
        inputData,
        createdContract {
          address
        }
        status, hash, value, block {
          timestamp,
          number
        }
      }
    }
  }
`;

export const blocksQuery = `
  query blocks_query($from: Long!, $to: Long) {
    blocks (from: $from, to: $to) {
      number,
      hash,
      stateRoot,
      gasLimit,
      gasUsed,
      timestamp,
      transactionCount
    }
  }
`;

export const blocksQueryWithTransactions = `
  query blocks_query($from: Long!, $to: Long) {
    blocks (from: $from, to: $to) {
      number,
      hash,
      stateRoot,
      gasLimit,
      gasUsed,
      timestamp,
			parent {
				hash
			},
			miner {
				address
			},
			difficulty,
		  totalDifficulty,
      transactionCount,
      transactions {
				from {
					address
				},
				to {
					address
				},
        gasUsed,
        gasPrice
        status, hash, value, block {
          timestamp,
          number
        }
      },
    }
  }
`;
