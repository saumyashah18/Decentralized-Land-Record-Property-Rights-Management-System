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
let UnitContract = class UnitContract extends fabric_contract_api_1.Contract {
    async QueryUnit(ctx, unitId) {
        const unitJSON = await ctx.stub.getState(unitId);
        if (!unitJSON || unitJSON.length === 0) {
            throw new Error(`The unit ${unitId} does not exist`);
        }
        return unitJSON.toString();
    }
    async CreateUnit(ctx, unitId, parentUlpin, uds, ownerId, docHash) {
        const exists = await this.UnitExists(ctx, unitId);
        if (exists) {
            throw new Error(`The unit ${unitId} already exists`);
        }
        // Verify parent parcel exists
        const parcelJSON = await ctx.stub.getState(parentUlpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parent parcel ${parentUlpin} does not exist`);
        }
        const unit = {
            docType: 'unit',
            unitId,
            parentUlpin,
            uds,
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
        await ctx.stub.putState(unitId, Buffer.from(JSON.stringify(unit)));
    }
    async UnitExists(ctx, unitId) {
        const unitJSON = await ctx.stub.getState(unitId);
        return (unitJSON && unitJSON.length > 0);
    }
    async QueryUnitsByParcel(ctx, parentUlpin) {
        const query = {
            selector: {
                docType: 'unit',
                parentUlpin: parentUlpin
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], UnitContract.prototype, "QueryUnit", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], UnitContract.prototype, "CreateUnit", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], UnitContract.prototype, "UnitExists", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], UnitContract.prototype, "QueryUnitsByParcel", null);
UnitContract = __decorate([
    fabric_contract_api_1.Info({ title: 'UnitContract', description: 'Smart contract for managing apartments/units' })
], UnitContract);
exports.UnitContract = UnitContract;
//# sourceMappingURL=unitContract.js.map