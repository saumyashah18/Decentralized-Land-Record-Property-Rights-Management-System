"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transfer_service_1 = require("../services/transfer.service");
const router = (0, express_1.Router)();
const transferService = new transfer_service_1.TransferService();
router.post('/', async (req, res) => {
    try {
        const { assetId, newOwnerId, user } = req.body;
        const result = await transferService.transferAsset(assetId, newOwnerId, user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
