import { Context, Contract } from 'fabric-contract-api';
export declare class UnitContract extends Contract {
    QueryUnit(ctx: Context, unitId: string): Promise<string>;
    CreateUnit(ctx: Context, unitId: string, parentUlpin: string, uds: number, ownerId: string, docHash: string): Promise<void>;
    UnitExists(ctx: Context, unitId: string): Promise<boolean>;
    QueryUnitsByParcel(ctx: Context, parentUlpin: string): Promise<string>;
}
