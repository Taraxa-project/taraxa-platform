export enum ResponseTypes {
  NewDagBlockFinalizedResponse = 'NewDagBlockFinalizedResponse',
  NewPbftBlockResponse = 'NewPbftBlockResponse',
  NewDagBlockResponse = 'NewDagBlockResponse',
  NewHeadsReponse = 'NewHeadsReponse',
  NewPendingTransactions = 'NewPendingTransactions',
}

export enum Topics {
  NEW_DAG_BLOCKS = 'newDagBlocks', // @note fired when a DAG block is accepted by the consensus
  NEW_DAG_BLOCKS_FINALIZED = 'newDagBlocksFinalized', // @note fired when a DAG block is inserted into a PBFT block
  NEW_PBFT_BLOCKS = 'newPbftBlocks', // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = 'newHeads', // @note fired when a PBFT ns "mined": all transactions inside it were executed
  NEW_PENDING_TRANSACTIONS = 'newPendingTransactions', // @note fired when a tx is registered to the mempool
  ERRORS = 'error', // @note error message
}

export enum Subscriptions {
  // NEW_DAG_BLOCKS = '0x1', // @note fired when a DAG block is accepted by the consensus
  // NEW_DAG_BLOCKS_FINALIZED = '0x2', // @note fired when a DAG block is inserted into a PBFT block
  // NEW_PBFT_BLOCKS = '0x3', // @note fired when a PBFT block is accepted by the consensus
  NEW_HEADS = '0x1', // @note fired when a PBFT ns "mined": all transactions inside it were executed
  // NEW_PENDING_TRANSACTIONS = '0x5', // @note fired when a tx is registered to the mempool
}
