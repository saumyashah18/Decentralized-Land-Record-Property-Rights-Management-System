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
let TransferContract = class TransferContract extends fabric_contract_api_1.Contract {
    async TransferAsset(ctx, assetId, newOwnerId, docHash) {
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
        const newOwnership = {
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
};
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], TransferContract.prototype, "TransferAsset", null);
TransferContract = __decorate([
    fabric_contract_api_1.Info({ title: 'TransferContract', description: 'Smart contract for property transfers' })
], TransferContract);
exports.TransferContract = TransferContract;
//# sourceMappingURL=transferContract.js.map