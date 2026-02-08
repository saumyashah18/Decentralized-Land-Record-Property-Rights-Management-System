import { Router } from 'express';
import { TransferService } from '../services/transfer.service';

const router = Router();
const transferService = new TransferService();

router.post('/', async (req, res) => {
    try {
        const { assetId, newOwnerId, user, documents } = req.body;
        const result = await transferService.transferAsset(assetId, newOwnerId, user, documents);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/pending', async (req, res) => {
    try {
        const transfers = await transferService.getPendingTransfers();
        res.status(200).json(transfers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, remarks } = req.body;
        const result = await transferService.updateTransferStatus(requestId, status, remarks);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
