export const transactionQuery = `
  query transaction_query(hash: Bytes32) {
    transaction (hash: $hash) {
      status,
      index,
      hash,
      gas,
      from,
      to,
      value,
      gasPrice,
      gas,
      block,
      gasUsed,
      createdContract,
    }
  }
`;
