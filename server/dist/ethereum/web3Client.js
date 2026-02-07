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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeb3Client = getWeb3Client;
exports.getAnchorContract = getAnchorContract;
const web3_1 = __importDefault(require("web3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let web3;
function getWeb3Client() {
    if (!web3) {
        const providerUrl = process.env.ETH_PROVIDER_URL || 'http://localhost:8545';
        web3 = new web3_1.default(providerUrl);
        console.log('✅ Web3.js is working (Connected to ' + providerUrl + ')');
    }
    return web3;
}
function getAnchorContract() {
    const web3 = getWeb3Client();
    const contractPath = path.resolve(__dirname, '..', '..', '..', 'ethereum-contracts', 'AnchorRegistry.json');
    // In a real scenario, we would have the ABI and address
    // For now, we'll assume they are loaded from a JSON artifact after compilation
    if (!fs.existsSync(contractPath)) {
        console.warn('AnchorRegistry.json not found. Returning mock contract.');
        return null;
    }
    const contractData = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    const contract = new web3.eth.Contract(contractData.abi, process.env.ANCHOR_CONTRACT_ADDRESS);
    return contract;
}
