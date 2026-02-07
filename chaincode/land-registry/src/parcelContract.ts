import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Parcel, TransferRequest, OwnershipRecord, Unit, Dispute, Encumbrance } from './models/types';

@Info({ title: 'ParcelContract', description: 'Smart contract for managing land parcels' })
export class ParcelContract extends Contract {

    @Transaction(false)
    public async QueryParcel(ctx: Context, ulpin: string): Promise<string> {
        const parcelJSON = await ctx.stub.getState(ulpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parcel ${ulpin} does not exist`);
        }
        return parcelJSON.toString();
    }

    @Transaction()
    public async CreateParcel(
        ctx: Context,
        ulpin: string,
        area: number,
        location: string,
        ownerId: string,
        docHash: string
    ): Promise<void> {
        const exists = await this.ParcelExists(ctx, ulpin);
        if (exists) {
            throw new Error(`The parcel ${ulpin} already exists`);
        }

        const parcel: Parcel = {
            docType: 'parcel',
            ulpin,
            area,
            location,
            owners: [{
                ownerId,
                ownershipType: 'FULL',
                sharePercentage: 100
            }],
            status: 'ACTIVE',
            encumbrances: [],
            disputes: [],
            lastUpdated: Math.floor(Date.now() / 1000),
            docHash
        };

        await ctx.stub.putState(ulpin, Buffer.from(JSON.stringify(parcel)));
    }

    @Transaction(false)
    @Returns('boolean')
    public async ParcelExists(ctx: Context, ulpin: string): Promise<boolean> {
        const parcelJSON = await ctx.stub.getState(ulpin);
        return (parcelJSON && parcelJSON.length > 0);
    }

    // --- Citizen Functions ---

    @Transaction()
    public async InitiateTransfer(
        ctx: Context,
        requestId: string,
        assetId: string,
        newOwnersJSON: string,
        supportingDocsJSON: string
    ): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const newOwners: OwnershipRecord[] = JSON.parse(newOwnersJSON);
        const supportingDocs: string[] = JSON.parse(supportingDocsJSON);

        const request: TransferRequest = {
            docType: 'transferRequest',
            requestId,
            assetId,
            requesterId: ctx.clientIdentity.getID(),
            newOwners,
            type: 'TRANSFER',
            status: 'PENDING',
            supportingDocs,
            createdAt: Math.floor(Date.now() / 1000)
        };

        await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
    }

    @Transaction()
    public async SubmitInheritanceRequest(
        ctx: Context,
        requestId: string,
        assetId: string,
        heirsJSON: string,
        deathCertificateHash: string
    ): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const heirs: OwnershipRecord[] = JSON.parse(heirsJSON);

        const request: TransferRequest = {
            docType: 'transferRequest',
            requestId,
            assetId,
            requesterId: ctx.clientIdentity.getID(),
            newOwners: heirs,
            type: 'INHERITANCE',
            status: 'PENDING',
            supportingDocs: [deathCertificateHash],
            createdAt: Math.floor(Date.now() / 1000)
        };

        await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
    }

    // --- Registrar Functions ---

    @Transaction()
    public async ApproveTransfer(ctx: Context, requestId: string): Promise<void> {
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('Only the Registrar can approve transfers');
        }

        const requestJSON = await ctx.stub.getState(requestId);
        if (!requestJSON || requestJSON.length === 0) {
            throw new Error(`Request ${requestId} does not exist`);
        }

        const request: TransferRequest = JSON.parse(requestJSON.toString());
        if (request.status !== 'PENDING') {
            throw new Error(`Request ${requestId} is not in PENDING status`);
        }

        const assetJSON = await ctx.stub.getState(request.assetId);
        const asset: any = JSON.parse(assetJSON.toString());

        if (asset.status !== 'ACTIVE') {
            throw new Error(`Asset ${request.assetId} is currently ${asset.status} and cannot be transferred`);
        }

        // Update ownership
        asset.owners = request.newOwners;
        asset.lastUpdated = Math.floor(Date.now() / 1000);

        // Update request status
        request.status = 'APPROVED';

        await ctx.stub.putState(request.assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(request)));
    }

    @Transaction()
    public async FlagDispute(ctx: Context, disputeId: string, assetId: string, reason: string): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset: any = JSON.parse(assetJSON.toString());
        asset.status = 'FROZEN';
        asset.disputes.push(disputeId);

        const dispute: Dispute = {
            docType: 'dispute',
            disputeId,
            assetId,
            reason,
            status: 'OPEN',
            createdAt: Math.floor(Date.now() / 1000)
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));
    }

    @Transaction()
    public async ResolveDispute(ctx: Context, disputeId: string, courtOrderHash: string): Promise<void> {
        const disputeJSON = await ctx.stub.getState(disputeId);
        if (!disputeJSON || disputeJSON.length === 0) {
            throw new Error(`Dispute ${disputeId} does not exist`);
        }

        const dispute: Dispute = JSON.parse(disputeJSON.toString());
        dispute.status = 'RESOLVED';
        dispute.resolvedAt = Math.floor(Date.now() / 1000);
        dispute.courtOrderHash = courtOrderHash;

        const assetJSON = await ctx.stub.getState(dispute.assetId);
        const asset: any = JSON.parse(assetJSON.toString());

        // Remove dispute from list
        asset.disputes = asset.disputes.filter((id: string) => id !== disputeId);

        // If no more disputes and no encumbrances, unfreeze
        if (asset.disputes.length === 0 && asset.encumbrances.length === 0) {
            asset.status = 'ACTIVE';
        }

        await ctx.stub.putState(dispute.assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));
    }

    @Transaction()
    public async AddEncumbrance(ctx: Context, encId: string, assetId: string, type: string, docHash: string): Promise<void> {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }

        const asset: any = JSON.parse(assetJSON.toString());
        asset.encumbrances.push(encId);

        // Any encumbrance blocks transfers
        asset.status = 'FROZEN';

        const enc: Encumbrance = {
            docType: 'encumbrance',
            encumbranceId: encId,
            assetId,
            type: type as any,
            status: 'ACTIVE',
            docHash,
            createdAt: Math.floor(Date.now() / 1000)
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(encId, Buffer.from(JSON.stringify(enc)));
    }

    @Transaction()
    public async RegisterUnit(
        ctx: Context,
        unitId: string,
        parentUlpin: string,
        uds: number,
        ownersJSON: string,
        docHash: string
    ): Promise<void> {
        const parentJSON = await ctx.stub.getState(parentUlpin);
        if (!parentJSON || parentJSON.length === 0) {
            throw new Error(`Parent Parcel ${parentUlpin} does not exist`);
        }

        const owners: OwnershipRecord[] = JSON.parse(ownersJSON);

        const unit: Unit = {
            docType: 'unit',
            unitId,
            parentUlpin,
            uds,
            owners,
            status: 'ACTIVE',
            encumbrances: [],
            disputes: [],
            lastUpdated: Math.floor(Date.now() / 1000),
            docHash
        };

        await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(unit)));
    }

    @Transaction()
    public async PartitionLand(
        ctx: Context,
        parentUlpin: string,
        childUlpinsJSON: string,
        childrenDataJSON: string
    ): Promise<void> {
        const parentJSON = await ctx.stub.getState(parentUlpin);
        if (!parentJSON || parentJSON.length === 0) {
            throw new Error(`Parent Parcel ${parentUlpin} does not exist`);
        }

        const parent: Parcel = JSON.parse(parentJSON.toString());
        if (parent.status !== 'ACTIVE') {
            throw new Error(`Parent parcel must be ACTIVE to partition`);
        }

        const childUlpins: string[] = JSON.parse(childUlpinsJSON);
        const childrenData: any[] = JSON.parse(childrenDataJSON);

        parent.status = 'PARTITIONED';
        parent.childUlpins = childUlpins;

        for (let i = 0; i < childUlpins.length; i++) {
            const child: Parcel = {
                docType: 'parcel',
                ulpin: childUlpins[i],
                area: childrenData[i].area,
                location: childrenData[i].location,
                owners: parent.owners, // Heirs or split owners will be handled in subsequent transfers if needed
                status: 'ACTIVE',
                encumbrances: [],
                disputes: [],
                parentUlpins: [parentUlpin],
                lastUpdated: Math.floor(Date.now() / 1000),
                docHash: parent.docHash // Initially link to parent doc or new doc
            };
            await ctx.stub.putState(childUlpins[i], Buffer.from(JSON.stringify(child)));
        }

        await ctx.stub.putState(parentUlpin, Buffer.from(JSON.stringify(parent)));
    }

    @Transaction()
    public async UpdateStatus(ctx: Context, ulpin: string, newStatus: string): Promise<void> {
        const parcelJSON = await ctx.stub.getState(ulpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parcel ${ulpin} does not exist`);
        }

        const parcel: Parcel = JSON.parse(parcelJSON.toString());
        parcel.status = newStatus as any;
        parcel.lastUpdated = Math.floor(Date.now() / 1000);

        await ctx.stub.putState(ulpin, Buffer.from(JSON.stringify(parcel)));
    }
}

