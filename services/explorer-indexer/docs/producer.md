# Producer documentation

To successfully run the producer you need to make sure the following env vars are set besides the default config:

- `ENABLE_PRODUCER_MODULE=true`
- `ENABLE_TRANSACTION_CONSUMER=false`

## Switching nets

To Switch the indexer's target network you need to change:

- `APP_PREFIX=<you-preferred-prefix>(ex. testnet)`
- `NODE_WS_ENDPOINT=<you-preferred-rpc-endpoint>(ex. wss://ws.testnet.taraxa.io)`
- `NODE_GRAPHQL_ENDPOINT=<your-preferred-graphql-endpoint>(ex. https://graphql.testnet.taraxa.io/)`

### Processes

On all levels, the producer needs 3 connections to work:

- A Node WS endpoint that exposes a subscription method to the network's `NEW_HEADS` event.
- A GraphQL endpoint that supports the `[Ethereum GraphQL interface](https://eips.ethereum.org/EIPS/eip-1767)`.
- A working Redis or other queueing solution connection(called Redis afterwards).

```mermaid
graph LR;
    P[Producer]-- subscribes -->WS[Node WS]
    WS[Node WS]-- feeds events -->P[Producer]
    P[Producer]-- queries -->G[GraphQL]
    G[GraphQL]-- feeds block data -->P[Producer]
    P[Producer]-- populates -->R[Redis]
```

On a modular level the producer consists of two main actors: the `LiveSyncer` and the `HistoricalSyncer` modules. As their name states, both are tasked to keep the block queues populated with PBFT periods.

#### Data Ingestion

To ingest a network's progress a direct connection to a Taraxa node's WS endpoint is estabished. This, in turn, creates an automatically renewing subscription to the Taraxa network's `NEW_HEADS` event containing `the newest included and mined PBFT block`. However, this guarantees us access only to future blocks. We also need to take care of indexing the past state of the network.

#### Sequence diagram

```mermaid
sequenceDiagram
    Note right of HistoricalSyncerService: On Startup
    LiveSyncerService->>Node WS: Establish connection!
    Node WS->>LiveSyncerService: Return open event!
    LiveSyncerService->>Node WS: On open subscribe to NEW_HEADS;
    HistoricalSyncerService->>Node GraphQL: Query Current Chain State
    HistoricalSyncerService->>Postgres: Query Current Database State
    HistoricalSyncerService->>HistoricalSyncerService: Compare internal sync state with on-chain one
    opt In case of diverging histories
        HistoricalSyncerService->>HistoricalSyncerService: Mark internal state as isRunning
        HistoricalSyncerService->>Redis: Globally Pause queues and consumers
        HistoricalSyncerService->>Redis: Purge currently queued jobs
        HistoricalSyncerService->>Postgres: Purge database state
        HistoricalSyncerService->>Redis: Globally Resume queues and consumers
    end

    HistoricalSyncerService->>Node GraphQL: Re-Query Current Chain State

    loop Check For missing PBFT periods in Postgres:
        HistoricalSyncerService->>Postgres: List and cache missing PBFT periods up until the last indexed in the database
        HistoricalSyncerService->>HistoricalSyncerService: Complete cache with PBFT periods from the last indexed to the current chain state
        HistoricalSyncerService->>Redis: Populate queue with cached PBFT periods
    end
    alt CRON every 30 minutes -> Check For missing PBFT periods in Postgres:
        HistoricalSyncerService->>Postgres: List and cache missing PBFT periods up until the last indexed in the database
        HistoricalSyncerService->>HistoricalSyncerService: Complete cache with PBFT periods from the last indexed to the current chain state
        HistoricalSyncerService->>Redis: Populate queue with cached PBFT periods
    end
    loop On receiving PBFT periods via WS:
        Node WS->>LiveSyncerService: Send PBFT
        LiveSyncerService->>LiveSyncerService: Check if period is <= current sync state - preconfigured reorganization Threshold
        opt In case of a reogranization:
            loop Remove faulty periods:
                LiveSyncerService->>Redis: Globally Pause queues and consumers
                LiveSyncerService->>Redis: Delete jobs for periods <= faulty period
                LiveSyncerService->>Postgres: Delete PBFTs, DAGs and Transactions for periods <= faulty period
                LiveSyncerService->>Redis: Globally Resume queues and consumers
            end
        end
        LiveSyncerService->>Redis: Push PBFT period into PBFT queue
    end
```
