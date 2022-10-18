import { ITransaction } from './Transaction.model';
export interface IPBFT {
    hash: string;
    number: number;
    timestamp: number;
    gasLimit?: number | string;
    gasUsed?: number | string;
    parent?: string;
    nonce?: string;
    difficulty?: number;
    totalDifficulty?: number;
    miner?: string;
    transactionCount?: number;
    transactions?: ITransaction[];
}
//# sourceMappingURL=PBFT.model.d.ts.map