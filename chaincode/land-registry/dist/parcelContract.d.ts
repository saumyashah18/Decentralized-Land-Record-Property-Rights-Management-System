import { Context, Contract } from 'fabric-contract-api';
export declare class ParcelContract extends Contract {
    QueryParcel(ctx: Context, ulpin: string): Promise<string>;
    CreateParcel(ctx: Context, ulpin: string, area: number, location: string, ownerId: string, docHash: string): Promise<void>;
    ParcelExists(ctx: Context, ulpin: string): Promise<boolean>;
    InitiateTransfer(ctx: Context, requestId: string, assetId: string, newOwnersJSON: string, supportingDocsJSON: string): Promise<void>;
    SubmitInheritanceRequest(ctx: Context, requestId: string, assetId: string, heirsJSON: string, deathCertificateHash: string): Promise<void>;
    ApproveTransfer(ctx: Context, requestId: string): Promise<void>;
    FlagDispute(ctx: Context, disputeId: string, assetId: string, reason: string): Promise<void>;
    ResolveDispute(ctx: Context, disputeId: string, courtOrderHash: string): Promise<void>;
    AddEncumbrance(ctx: Context, encId: string, assetId: string, type: string, docHash: string): Promise<void>;
    RegisterUnit(ctx: Context, unitId: string, parentUlpin: string, uds: number, ownersJSON: string, docHash: string): Promise<void>;
    PartitionLand(ctx: Context, parentUlpin: string, childUlpinsJSON: string, childrenDataJSON: string): Promise<void>;
    UpdateStatus(ctx: Context, ulpin: string, newStatus: string): Promise<void>;
}
