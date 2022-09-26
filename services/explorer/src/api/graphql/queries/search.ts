export const searchTransactionQuery = `
  query transaction_query($hash: Bytes32!) {
    transaction (hash: $hash) {
      hash,
    }
  }
`;

export const searchBlockQuery = `
  query block_query($number: Long, $hash: Bytes32) {
    block (number: $number, hash: $hash) {
      number,
      hash,
    }
  }
`;

export const searchDagBlockQuery = `
  query dag_block_query($hash: Bytes32) {
    dagBlock (hash: $hash) {
      hash,
    }
  }
`;
