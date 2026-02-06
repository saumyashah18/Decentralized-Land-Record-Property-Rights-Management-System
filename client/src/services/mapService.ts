export const mapService = {
    getCenter: (coordinates: [number, number][]) => {
        // Simplified center calculation
        if (coordinates.length === 0) return [0, 0];
        const lat = coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length;
        const lng = coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length;
        return [lat, lng];
    }
};
