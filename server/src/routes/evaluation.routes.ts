import { Router, Request, Response } from 'express';
import { EvaluationService } from '../services/evaluation.service';

const router = Router();
const evaluationService = new EvaluationService();

/**
 * Start both evaluation scenarios
 */
router.post('/start', async (req: Request, res: Response) => {
    try {
        const result = await evaluationService.startScenarios();
        res.json(result);
    } catch (error) {
        console.error('Error starting scenarios:', error);
        res.status(500).json({
            success: false,
            message: `Error starting scenarios: ${error}`
        });
    }
});

/**
 * Get Scenario 1 (Fabric Multi-Registrar) status
 */
router.get('/scenario1/status', (req: Request, res: Response) => {
    try {
        const status = evaluationService.getScenario1Status();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting scenario 1 status:', error);
        res.status(500).json({
            success: false,
            message: `Error getting scenario 1 status: ${error}`
        });
    }
});

/**
 * Get Scenario 2 (Ethereum Anchoring) status
 */
router.get('/scenario2/status', (req: Request, res: Response) => {
    try {
        const status = evaluationService.getScenario2Status();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting scenario 2 status:', error);
        res.status(500).json({
            success: false,
            message: `Error getting scenario 2 status: ${error}`
        });
    }
});

/**
 * Reset scenarios to initial state
 */
router.post('/reset', (req: Request, res: Response) => {
    try {
        const result = evaluationService.resetScenarios();
        res.json(result);
    } catch (error) {
        console.error('Error resetting scenarios:', error);
        res.status(500).json({
            success: false,
            message: `Error resetting scenarios: ${error}`
        });
    }
});

export default router;
