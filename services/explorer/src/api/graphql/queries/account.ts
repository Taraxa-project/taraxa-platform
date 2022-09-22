export const accountQuery = `
query get_address_data($account: Address!, $hash:  Bytes32!, $slot: Bytes32!){
	block(hash: $hash) {
		hash
		number
		account(address: $account){
			address
			balance
			transactionCount
			code
			storage(slot: $slot)
		}
	}
}
`;
