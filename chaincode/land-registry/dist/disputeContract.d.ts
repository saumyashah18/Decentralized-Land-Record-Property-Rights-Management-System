import { Context, Contract } from 'fabric-contract-api';
export declare class DisputeContract extends Contract {
    RaiseDispute(ctx: Context, disputeId: string, assetId: string, reason: string): Promise<void>;
    ResolveDispute(ctx: Context, disputeId: string): Promise<void>;
}
