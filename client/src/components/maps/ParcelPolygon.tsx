import React from 'react';
import { Polygon } from 'react-leaflet';

interface ParcelPolygonProps {
    positions: [number, number][];
    color?: string;
}

export const ParcelPolygon: React.FC<ParcelPolygonProps> = ({ positions, color = 'blue' }) => {
    return <Polygon pathOptions={{ color }} positions={positions} />;
};
