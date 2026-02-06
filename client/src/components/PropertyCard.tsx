import React from 'react';
import { Parcel } from '../types/parcel.types';
import { StatusBadge } from './StatusBadge';

interface PropertyCardProps {
    parcel: Parcel;
    onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ parcel, onClick }) => {
    return (
        <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <h3 className="text-lg font-semibold">{parcel.address}</h3>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-gray-600">ID: {parcel.parcelId}</span>
                <StatusBadge status={parcel.status} />
            </div>
            <div className="mt-2 text-sm text-gray-500">
                Area: {parcel.area} sq.ft
            </div>
        </div>
    );
};
