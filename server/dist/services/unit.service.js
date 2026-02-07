"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitService = void 0;
const gateway_1 = require("../fabric/gateway");
const anchorService_1 = require("../ethereum/anchorService");
const crypto = __importStar(require("crypto"));
class UnitService {
    constructor() {
        this.anchorService = new anchorService_1.AnchorService();
    }
    async createUnit(data, user) {
        const hash = crypto.createHash('sha256').update(JSON.stringify(data) + Date.now()).digest('hex');
        const { gateway, contract } = await (0, gateway_1.getFabricContract)('mychannel', 'UnitContract', user);
        try {
            await contract.submitTransaction('CreateUnit', data.unitId, data.parentUlpin, data.uds.toString(), user, hash);
            await this.anchorService.anchorFabricEvent(data.unitId, 'UNIT_CREATE', '0x' + hash);
            return { success: true, unitId: data.unitId, hash };
        }
        finally {
            gateway.disconnect();
        }
    }
    async getUnit(unitId, user) {
        const { gateway, contract } = await (0, gateway_1.getFabricContract)('mychannel', 'UnitContract', user);
        try {
            const result = await contract.evaluateTransaction('QueryUnit', unitId);
            return JSON.parse(result.toString());
        }
        finally {
            gateway.disconnect();
        }
    }
    async getUnitsByParcel(parentUlpin, user) {
        const { gateway, contract } = await (0, gateway_1.getFabricContract)('mychannel', 'UnitContract', user);
        try {
            const result = await contract.evaluateTransaction('QueryUnitsByParcel', parentUlpin);
            return JSON.parse(result.toString());
        }
        finally {
            gateway.disconnect();
        }
    }
}
exports.UnitService = UnitService;
