import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Parcel, Unit, OwnershipRecord } from './models/types';

@Info({ title: 'TransferContract', description: 'Smart contract for property transfers' })
export class TransferContract extends Contract {

    @Transaction()
    public async TransferAsset(
        ctx: Context,
        assetId: string,
        newOwnerId: string,
        docHash: string
    ): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetJSON.toString());

        // Check if asset is frozen
        if (asset.status === 'FROZEN') {
            throw new Error(`The asset ${assetId} is frozen due to a dispute`);
        }

        if (asset.status === 'RESTRICTED' || asset.status === 'GOVERNMENT') {
            throw new Error(`The asset ${assetId} is not transferable`);
        }

        // Check for active disputes or restrictive encumbrances
        if (asset.disputes && asset.disputes.length > 0) {
            throw new Error(`The asset ${assetId} has active disputes and cannot be transferred`);
        }

        // Logic for simple full transfer
        const newOwnership: OwnershipRecord = {
            ownerId: newOwnerId,
            ownershipType: 'FULL',
            sharePercentage: 100
        };

        asset.owners = [newOwnership];
        asset.docHash = docHash;
        asset.lastUpdated = Math.floor(Date.now() / 1000);

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));

        // Emit event for Ethereum anchoring
        const eventPayload = {
            assetId,
            newOwnerId,
            timestamp: asset.lastUpdated,
            docHash
        };
        ctx.stub.setEvent('AssetTransferred', Buffer.from(JSON.stringify(eventPayload)));
    }
}
