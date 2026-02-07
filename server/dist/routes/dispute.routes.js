"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dispute_service_1 = require("../services/dispute.service");
const router = (0, express_1.Router)();
const disputeService = new dispute_service_1.DisputeService();
router.post('/raise', async (req, res) => {
    try {
        const { assetId, reason, user } = req.body;
        const result = await disputeService.raiseDispute(assetId, reason, user);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/resolve', async (req, res) => {
    try {
        const { disputeId, user } = req.body;
        const result = await disputeService.resolveDispute(disputeId, user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
