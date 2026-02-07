"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geojsonService_1 = require("../gis/geojsonService");
const parcel_service_1 = require("../services/parcel.service");
const router = (0, express_1.Router)();
const geojsonService = new geojsonService_1.GeoJSONService();
const parcelService = new parcel_service_1.ParcelService();
router.get('/parcel/:ulpin', async (req, res) => {
    try {
        const { ulpin } = req.params;
        const { user } = req.query;
        const parcel = await parcelService.getParcel(ulpin, user);
        // Mock coordinates for demonstration
        const mockCoords = [[[77.59, 12.97], [77.60, 12.97], [77.60, 12.98], [77.59, 12.98], [77.59, 12.97]]];
        const feature = geojsonService.formatParcelToGeoJSON(ulpin, mockCoords);
        res.status(200).json(feature);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
