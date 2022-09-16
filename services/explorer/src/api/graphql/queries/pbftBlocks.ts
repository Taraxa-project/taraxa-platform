export const blockQuery = `
  query block_query($number: Long, $hash: Bytes32) {
    block (number: $number, hash: $hash) {
      number,
      hash,
      stateRoot,
      gasLimit,
      gasUsed,
      timestamp,
      transactionCount,
      transactions {
        status, hash, value, block {
          timestamp,
          number
        }
      },
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
