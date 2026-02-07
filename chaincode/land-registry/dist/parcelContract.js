"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fabric_contract_api_1 = require("fabric-contract-api");
let ParcelContract = class ParcelContract extends fabric_contract_api_1.Contract {
    async QueryParcel(ctx, ulpin) {
        const parcelJSON = await ctx.stub.getState(ulpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parcel ${ulpin} does not exist`);
        }
        return parcelJSON.toString();
    }
    async CreateParcel(ctx, ulpin, area, location, ownerId, docHash) {
        const exists = await this.ParcelExists(ctx, ulpin);
        if (exists) {
            throw new Error(`The parcel ${ulpin} already exists`);
        }
        const parcel = {
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
    async ParcelExists(ctx, ulpin) {
        const parcelJSON = await ctx.stub.getState(ulpin);
        return (parcelJSON && parcelJSON.length > 0);
    }
    // --- Citizen Functions ---
    async InitiateTransfer(ctx, requestId, assetId, newOwnersJSON, supportingDocsJSON) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }
        const newOwners = JSON.parse(newOwnersJSON);
        const supportingDocs = JSON.parse(supportingDocsJSON);
        const request = {
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
    async SubmitInheritanceRequest(ctx, requestId, assetId, heirsJSON, deathCertificateHash) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }
        const heirs = JSON.parse(heirsJSON);
        const request = {
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
    async ApproveTransfer(ctx, requestId) {
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error('Only the Registrar can approve transfers');
        }
        const requestJSON = await ctx.stub.getState(requestId);
        if (!requestJSON || requestJSON.length === 0) {
            throw new Error(`Request ${requestId} does not exist`);
        }
        const request = JSON.parse(requestJSON.toString());
        if (request.status !== 'PENDING') {
            throw new Error(`Request ${requestId} is not in PENDING status`);
        }
        const assetJSON = await ctx.stub.getState(request.assetId);
        const asset = JSON.parse(assetJSON.toString());
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
    async FlagDispute(ctx, disputeId, assetId, reason) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }
        const asset = JSON.parse(assetJSON.toString());
        asset.status = 'FROZEN';
        asset.disputes.push(disputeId);
        const dispute = {
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
    async ResolveDispute(ctx, disputeId, courtOrderHash) {
        const disputeJSON = await ctx.stub.getState(disputeId);
        if (!disputeJSON || disputeJSON.length === 0) {
            throw new Error(`Dispute ${disputeId} does not exist`);
        }
        const dispute = JSON.parse(disputeJSON.toString());
        dispute.status = 'RESOLVED';
        dispute.resolvedAt = Math.floor(Date.now() / 1000);
        dispute.courtOrderHash = courtOrderHash;
        const assetJSON = await ctx.stub.getState(dispute.assetId);
        const asset = JSON.parse(assetJSON.toString());
        // Remove dispute from list
        asset.disputes = asset.disputes.filter((id) => id !== disputeId);
        // If no more disputes and no encumbrances, unfreeze
        if (asset.disputes.length === 0 && asset.encumbrances.length === 0) {
            asset.status = 'ACTIVE';
        }
        await ctx.stub.putState(dispute.assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));
    }
    async AddEncumbrance(ctx, encId, assetId, type, docHash) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`Asset ${assetId} does not exist`);
        }
        const asset = JSON.parse(assetJSON.toString());
        asset.encumbrances.push(encId);
        // Any encumbrance blocks transfers
        asset.status = 'FROZEN';
        const enc = {
            docType: 'encumbrance',
            encumbranceId: encId,
            assetId,
            type: type,
            status: 'ACTIVE',
            docHash,
            createdAt: Math.floor(Date.now() / 1000)
        };
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        await ctx.stub.putState(encId, Buffer.from(JSON.stringify(enc)));
    }
    async RegisterUnit(ctx, unitId, parentUlpin, uds, ownersJSON, docHash) {
        const parentJSON = await ctx.stub.getState(parentUlpin);
        if (!parentJSON || parentJSON.length === 0) {
            throw new Error(`Parent Parcel ${parentUlpin} does not exist`);
        }
        const owners = JSON.parse(ownersJSON);
        const unit = {
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
    async PartitionLand(ctx, parentUlpin, childUlpinsJSON, childrenDataJSON) {
        const parentJSON = await ctx.stub.getState(parentUlpin);
        if (!parentJSON || parentJSON.length === 0) {
            throw new Error(`Parent Parcel ${parentUlpin} does not exist`);
        }
        const parent = JSON.parse(parentJSON.toString());
        if (parent.status !== 'ACTIVE') {
            throw new Error(`Parent parcel must be ACTIVE to partition`);
        }
        const childUlpins = JSON.parse(childUlpinsJSON);
        const childrenData = JSON.parse(childrenDataJSON);
        parent.status = 'PARTITIONED';
        parent.childUlpins = childUlpins;
        for (let i = 0; i < childUlpins.length; i++) {
            const child = {
                docType: 'parcel',
                ulpin: childUlpins[i],
                area: childrenData[i].area,
                location: childrenData[i].location,
                owners: parent.owners,
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
    async UpdateStatus(ctx, ulpin, newStatus) {
        const parcelJSON = await ctx.stub.getState(ulpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parcel ${ulpin} does not exist`);
        }
        const parcel = JSON.parse(parcelJSON.toString());
        parcel.status = newStatus;
        parcel.lastUpdated = Math.floor(Date.now() / 1000);
        await ctx.stub.putState(ulpin, Buffer.from(JSON.stringify(parcel)));
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "QueryParcel", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "CreateParcel", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "ParcelExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "InitiateTransfer", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "SubmitInheritanceRequest", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "ApproveTransfer", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "FlagDispute", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "ResolveDispute", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "AddEncumbrance", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "RegisterUnit", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "PartitionLand", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], ParcelContract.prototype, "UpdateStatus", null);
ParcelContract = __decorate([
    fabric_contract_api_1.Info({ title: 'ParcelContract', description: 'Smart contract for managing land parcels' })
], ParcelContract);
exports.ParcelContract = ParcelContract;
//# sourceMappingURL=parcelContract.js.map