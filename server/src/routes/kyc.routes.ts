import { Router, Request, Response } from 'express';
import { kycService } from '../services/kyc.service';

const router = Router();

// POST /api/kyc/initiate
router.post('/initiate', async (req: Request, res: Response) => {
    try {
        const { aadhaarNumber, customerIdentifier, redirectUrl } = req.body;

        if (!customerIdentifier) {
            return res.status(400).json({ error: 'Customer identifier is required' });
        }

        const kycData = await kycService.initiateKyc(aadhaarNumber, customerIdentifier, redirectUrl);
        res.status(200).json(kycData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/kyc/status/:id
router.get('/status/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const status = await kycService.getKycStatus(id);
        res.status(200).json(status);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/kyc/webhook
router.post('/webhook', (req: Request, res: Response) => {
    console.log('Received KYC Webhook:', req.body);
    // Logic to handle async updates from Digio would go here
    res.status(200).send('Webhook Received');
});

export default router;
