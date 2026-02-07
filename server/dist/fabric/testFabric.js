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
const fabric_network_1 = require("fabric-network");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.resolve(__dirname, '..', 'wallet');
        const wallet = await fabric_network_1.Wallets.newFileSystemWallet(walletPath);
        const gateway = new fabric_network_1.Gateway();
        console.log('Connecting to gateway...');
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });
        console.log('✅ Connected to gateway');
        const network = await gateway.getNetwork('mychannel');
        console.log('✅ Got network');
        const contract = network.getContract('landregistry');
        console.log('✅ Got contract');
        console.log('Evaluating transaction...');
        // Correct method name from ParcelContract
        const result = await contract.evaluateTransaction('ParcelExists', 'P001');
        console.log(`✅ Success! Result: ${result.toString()}`);
        await gateway.disconnect();
    }
    catch (error) {
        console.error(`❌ Failed to test Fabric: ${error}`);
        process.exit(1);
    }
}
main();
