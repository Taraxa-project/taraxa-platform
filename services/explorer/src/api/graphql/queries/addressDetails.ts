export const addressDetailsQuery = `
query get_address_data($account: Address!) {
  block {
    hash
		number
		account(address: $account) {
			address
			balance
			transactionCount
			code
		}
  }
}
`;
