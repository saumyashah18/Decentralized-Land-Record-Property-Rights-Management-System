import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { Unit } from './models/types';

@Info({ title: 'UnitContract', description: 'Smart contract for managing apartments/units' })
export class UnitContract extends Contract {

    @Transaction(false)
    public async QueryUnit(ctx: Context, unitId: string): Promise<string> {
        const unitJSON = await ctx.stub.getState(unitId);
        if (!unitJSON || unitJSON.length === 0) {
            throw new Error(`The unit ${unitId} does not exist`);
        }
        return unitJSON.toString();
    }

    @Transaction()
    public async CreateUnit(
        ctx: Context,
        unitId: string,
        parentUlpin: string,
        uds: number,
        ownerId: string,
        docHash: string
    ): Promise<void> {
        const exists = await this.UnitExists(ctx, unitId);
        if (exists) {
            throw new Error(`The unit ${unitId} already exists`);
        }

        // Verify parent parcel exists
        const parcelJSON = await ctx.stub.getState(parentUlpin);
        if (!parcelJSON || parcelJSON.length === 0) {
            throw new Error(`The parent parcel ${parentUlpin} does not exist`);
        }

        const unit: Unit = {
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

    @Transaction(false)
    @Returns('boolean')
    public async UnitExists(ctx: Context, unitId: string): Promise<boolean> {
        const unitJSON = await ctx.stub.getState(unitId);
        return (unitJSON && unitJSON.length > 0);
    }

    @Transaction(false)
    public async QueryUnitsByParcel(ctx: Context, parentUlpin: string): Promise<string> {
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
}
