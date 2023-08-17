# Graph Protocol Indexer for Taraxa DPOS

The indexer is used to gather all relevant onchain economics data for Taraxa.

## Entities

Indexed entities are defined in the [GraphQL schema document](./schema.graphql).

Events handled are listed under the _eventHandlers_ in the [subgraph manifest](./subgraph.yaml).

### Potential problems

- Inside the DPOS contract if a validator remains without delegation it gets deleted, however its undelegations are still kept alive. This mixed state is not possible in the subgraph. Thus, all delegations, undelegations and commissions set for validators that got deleted from the contract will be kept in the indexer's database and the deleted validator gets marked as deleted.
- Initial validators that get created as part of genesis are not included in the subgraph. These nodes are deployed as having MAX_STAKE and cannot be interacted with.
