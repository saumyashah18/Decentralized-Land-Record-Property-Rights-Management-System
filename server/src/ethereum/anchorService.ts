import { getAnchorContract, getWeb3Client } from './web3Client';
import { getFabricContract } from '../fabric/gateway';

export class AnchorService {
    public async anchorFabricEvent(assetId: string, eventType: string, eventHash: string) {
        const contract = getAnchorContract();
        if (!contract) {
            console.log(`[MOCK] Anchoring hash for ${assetId}: ${eventHash}`);
            return;
        }

        const web3 = getWeb3Client();
        const accounts = await web3.eth.getAccounts();
        const from = accounts[0];

        // Anchor hash on Ethereum
        const tx = await (contract.methods as any).anchorHash(assetId, eventType, eventHash).send({ from });
        console.log(`Anchored hash on Ethereum: ${tx.transactionHash}`);
    }

    public async anchorFabricTransaction(txId: string, hash: string) {
        await this.anchorFabricEvent(txId, 'FABRIC_TX', hash);
    }

    public async anchorKycVerification(userId: string, hash: string) {
        await this.anchorFabricEvent(userId, 'KYC_VERIFICATION', hash);
    }

    public async anchorIpfsDocument(docId: string, cidHash: string) {
        await this.anchorFabricEvent(docId, 'IPFS_DOC_CID', cidHash);
    }

    public async anchorOwnershipUpdate(ulpin: string, hash: string) {
        await this.anchorFabricEvent(ulpin, 'OWNERSHIP_UPDATE', hash);
    }
}
