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
let DisputeContract = class DisputeContract extends fabric_contract_api_1.Contract {
    async RaiseDispute(ctx, disputeId, assetId, reason) {
        const assetJSON = await ctx.stub.getState(assetId);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${assetId} does not exist`);
        }
        const asset = JSON.parse(assetJSON.toString());
        const dispute = {
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
    async ResolveDispute(ctx, disputeId) {
        const disputeJSON = await ctx.stub.getState(disputeId);
        if (!disputeJSON || disputeJSON.length === 0) {
            throw new Error(`The dispute ${disputeId} does not exist`);
        }
        const dispute = JSON.parse(disputeJSON.toString());
        if (dispute.status === 'RESOLVED') {
            throw new Error(`The dispute ${disputeId} is already resolved`);
        }
        dispute.status = 'RESOLVED';
        dispute.resolvedAt = Math.floor(Date.now() / 1000);
        await ctx.stub.putState(disputeId, Buffer.from(JSON.stringify(dispute)));
        // Check if all disputes for the asset are resolved to unfreeze it
        const assetJSON = await ctx.stub.getState(dispute.assetId);
        const asset = JSON.parse(assetJSON.toString());
        asset.disputes = asset.disputes.filter((id) => id !== disputeId);
        if (asset.disputes.length === 0) {
            asset.status = 'ACTIVE';
        }
        await ctx.stub.putState(dispute.assetId, Buffer.from(JSON.stringify(asset)));
        ctx.stub.setEvent('DisputeResolved', Buffer.from(JSON.stringify({ assetId: dispute.assetId, disputeId })));
    }
};
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], DisputeContract.prototype, "RaiseDispute", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], DisputeContract.prototype, "ResolveDispute", null);
DisputeContract = __decorate([
    fabric_contract_api_1.Info({ title: 'DisputeContract', description: 'Smart contract for managing disputes' })
], DisputeContract);
exports.DisputeContract = DisputeContract;
//# sourceMappingURL=disputeContract.js.map