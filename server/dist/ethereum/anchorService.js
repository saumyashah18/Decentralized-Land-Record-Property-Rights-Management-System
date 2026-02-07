"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnchorService = void 0;
const web3Client_1 = require("./web3Client");
class AnchorService {
    async anchorFabricEvent(assetId, eventType, eventHash) {
        const contract = (0, web3Client_1.getAnchorContract)();
        if (!contract) {
            console.log(`[MOCK] Anchoring hash for ${assetId}: ${eventHash}`);
            return;
        }
        const web3 = (0, web3Client_1.getWeb3Client)();
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];
        // Anchor hash on Ethereum
        const tx = await contract.methods.anchorHash(assetId, eventType, eventHash).send({ from });
        console.log(`Anchored hash on Ethereum: ${tx.transactionHash}`);
    }
    async anchorFabricTransaction(txId, hash) {
        await this.anchorFabricEvent(txId, 'FABRIC_TX', hash);
    }
    async anchorKycVerification(userId, hash) {
        await this.anchorFabricEvent(userId, 'KYC_VERIFICATION', hash);
    }
    async anchorIpfsDocument(docId, cidHash) {
        await this.anchorFabricEvent(docId, 'IPFS_DOC_CID', cidHash);
    }
    async anchorOwnershipUpdate(ulpin, hash) {
        await this.anchorFabricEvent(ulpin, 'OWNERSHIP_UPDATE', hash);
    }
}
exports.AnchorService = AnchorService;
