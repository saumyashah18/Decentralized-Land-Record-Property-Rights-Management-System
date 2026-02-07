"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const unit_service_1 = require("../services/unit.service");
const router = (0, express_1.Router)();
const unitService = new unit_service_1.UnitService();
router.post('/', async (req, res) => {
    try {
        const { unitId, parentUlpin, uds, user } = req.body;
        const result = await unitService.createUnit({ unitId, parentUlpin, uds }, user);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:unitId', async (req, res) => {
    try {
        const { unitId } = req.params;
        const { user } = req.query;
        const result = await unitService.getUnit(unitId, user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/parcel/:ulpin', async (req, res) => {
    try {
        const { ulpin } = req.params;
        const { user } = req.query;
        const result = await unitService.getUnitsByParcel(ulpin, user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
