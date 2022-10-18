import { IPBFT } from './PBFT.model';
export interface ITransaction {
    hash: string;
    nonce?: number;
    index?: number;
    value?: number;
    gasPrice?: string;
    gas?: string;
    inputData?: string;
    block?: IPBFT;
    status?: number;
    gasUsed?: string;
    cumulativeGasUsed?: number;
    from?: string;
    to?: string;
    hasId?: () => boolean;
    save?: () => ITransaction;
    remove?: () => ITransaction;
}
//# sourceMappingURL=Transaction.model.d.ts.map