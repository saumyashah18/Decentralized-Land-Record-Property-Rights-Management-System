import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { Dispute, Parcel, Unit } from './models/types';

@Info({ title: 'DisputeContract', description: 'Smart contract for managing disputes' })
export class DisputeContract extends Contract {

    @Transaction()
    public async RaiseDispute(
        ctx: Context,
        disputeId: string,
        assetId: string,
        reason: string
    ): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${assetId} does not exist`);
        }

        const asset = JSON.parse(assetJSON.toString());

        const dispute: Dispute = {
            docType: 'dispute',
            disputeId,
            assetId,
            reason,
            status: 'OPEN',
            createdAt: Math.floor(Date.now() / 1000)
        };

        // Update asset reference and status
        asset.disputes = asset.disputes || [];
        asset.disputes.push(disputeId);
        asset.status = 'FROZEN';

        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));

        ctx.stub.setEvent('DisputeRaised', Buffer.from(JSON.stringify({ assetId, disputeId, reason })));
    }

    @Transaction()
    public async ResolveDispute(ctx: Context, disputeId: string): Promise<void> {
        const disputeJSON = await ctx.stub.getState(disputeId);
        if (!disputeJSON || disputeJSON.length === 0) {
            throw new Error(`The dispute ${disputeId} does not exist`);
        }

        const dispute: Dispute = JSON.parse(disputeJSON.toString());
        if (dispute.status === 'RESOLVED') {
            throw new Error(`The dispute ${disputeId} is already resolved`);
        }

        dispute.status = 'RESOLVED';
        dispute.resolvedAt = Math.floor(Date.now() / 1000);

        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));

        // Check if all disputes for the asset are resolved to unfreeze it
        const assetJSON = await ctx.stub.getState(dispute.assetId);
        const asset = JSON.parse(assetJSON.toString());

        asset.disputes = asset.disputes.filter((id: string) => id !== disputeId);

        if (asset.disputes.length === 0) {
            asset.status = 'ACTIVE';
        }

        await ctx.stub.putState(dispute.assetId, Buffer.from(JSON.stringify(asset)));

        ctx.stub.setEvent('DisputeResolved', Buffer.from(JSON.stringify({ assetId: dispute.assetId, disputeId })));
    }
}
