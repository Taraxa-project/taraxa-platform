export const transactionQuery = `
  query transaction_query($hash: Bytes32!) {
    transaction (hash: $hash) {
      status,
      index,
      nonce,
      hash,
      gas,
      inputData,
      createdContract {
        address
      }
      from {
				address
			},
      to {
				address
			},
      value,
      gasPrice,
      gas,
      block {
				number,
				hash,
        timestamp,
			},
      gasUsed,
      cumulativeGasUsed,
      logs {
        index,
        topics,
        data,
      }
    }
  }
`;
