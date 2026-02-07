import { Context, Contract } from 'fabric-contract-api';
export declare class TransferContract extends Contract {
    TransferAsset(ctx: Context, assetId: string, newOwnerId: string, docHash: string): Promise<void>;
}
