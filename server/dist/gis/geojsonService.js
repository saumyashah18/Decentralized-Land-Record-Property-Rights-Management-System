"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoJSONService = void 0;
class GeoJSONService {
    /**
     * Validates and processes land parcel boundary data.
     * @param geojson GeoJSON string or object
     */
    validateBoundary(geojson) {
        // Basic check for GeoJSON structure
        if (!geojson || !geojson.type)
            return false;
        if (geojson.type !== 'Feature' && geojson.type !== 'Polygon')
            return false;
        return true;
    }
    /**
     * Formats land parcel data into a standardized GeoJSON Feature.
     */
    formatParcelToGeoJSON(ulpin, coordinates) {
        return {
            type: "Feature",
            id: ulpin,
            geometry: {
                type: "Polygon",
                coordinates: coordinates
            },
            properties: {
                ulpin: ulpin
            }
        };
    }
}
exports.GeoJSONService = GeoJSONService;
