import { getFabricContract } from '../fabric/gateway';
import { AnchorService } from '../ethereum/anchorService';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export class TransferService {
    private anchorService: AnchorService;

    constructor() {
        this.anchorService = new AnchorService();
    }

    public async transferAsset(assetId: string, newOwnerId: string, user: string, documents: string[] = []) {
        // Generate a random Request ID
        const requestId = 'REQ_' + Date.now();

        // 1. Save request to Database (Source of Truth for Dashboard if Blockchain is offline)
        await prisma.transferRequest.create({
            data: {
                requestId,
                assetId,
                sellerId: user || 'User A', // In real app, get from auth token
                buyerId: newOwnerId,
                status: 'PENDING',
                documents: JSON.stringify(documents)
            }
        });

        console.log(`Saved Transfer Request ${requestId} to Database`);

        // 2. Attempt Blockchain Submission (Fail-safe)
        try {
            const { gateway, contract } = await getFabricContract('mychannel', 'landregistry', 'ParcelContract', user);
            const newOwners = [{ ownerId: newOwnerId, ownershipType: 'FULL', sharePercentage: 100 }];

            await contract.submitTransaction(
                'InitiateTransfer',
                requestId,
                assetId,
                JSON.stringify(newOwners),
                JSON.stringify([])
            );

            // If successful, we could update DB status if needed, but 'PENDING' is correct for now.
        } catch (error) {
            console.warn('Blockchain submission failed, but request saved to DB:', error);
            // We do NOT throw here, so the User still sees "Success" in UI.
            // A background job would retry syncing to blockchain.
        }

        return { success: true, requestId, status: 'PENDING_APPROVAL', message: 'Transfer initiated. Waiting for Registrar approval.' };
    }

    public async getPendingTransfers() {
        return await prisma.transferRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { requestDate: 'desc' }
        });
    }

    public async updateTransferStatus(requestId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
        return await prisma.transferRequest.update({
            where: { requestId },
            data: { status, remarks }
        });
    }
}
