"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parcel_service_1 = require("../services/parcel.service");
const router = (0, express_1.Router)();
const parcelService = new parcel_service_1.ParcelService();
router.post('/', async (req, res) => {
    try {
        const { ulpin, area, location, user } = req.body;
        const result = await parcelService.createParcel({ ulpin, area, location }, user);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/:ulpin', async (req, res) => {
    try {
        const { ulpin } = req.params;
        const { user } = req.query;
        const result = await parcelService.getParcel(ulpin, user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
