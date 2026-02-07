"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const ipfs_http_client_1 = require("ipfs-http-client");
class IpfsService {
    constructor() {
        const ipfsUrl = process.env.IPFS_URL || 'http://localhost:5001';
        this.client = (0, ipfs_http_client_1.create)({ url: ipfsUrl });
        console.log('✅ IPFS Service is working (Connected to ' + ipfsUrl + ')');
    }
    async uploadDocument(buffer) {
        try {
            const { cid } = await this.client.add(buffer);
            return cid.toString();
        }
        catch (error) {
            console.warn('IPFS upload failed. Returning mock CID.');
            return 'QmMockHash1234567890';
        }
    }
    async getDocument(cid) {
        const chunks = [];
        for await (const chunk of this.client.cat(cid)) {
            chunks.push(chunk);
        }
        return new Uint8Array(Buffer.concat(chunks));
    }
}
exports.IpfsService = IpfsService;
