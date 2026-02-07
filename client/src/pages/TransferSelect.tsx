import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Parcel } from '../types/parcel.types';

export const TransferSelect: React.FC = () => {
    const navigate = useNavigate();

    // Mock properties (same as dashboard for now)
    const properties: Parcel[] = [
        { id: '1', parcelId: 'P001', ownerId: 'U001', address: '402, Titanium City Center, Satellite, Ahmedabad', area: 1200, coordinates: [23.0300, 72.5176], status: 'active', registrationDate: '2023-01-01' },
        { id: '3', parcelId: 'P003', ownerId: 'U001', address: '78, Shivalik Shilp, Iscon Cross Rd, Ahmedabad', area: 3500, coordinates: [23.0258, 72.5074], status: 'pending', registrationDate: '2023-10-15' }
    ];

    const handleSelect = (id: string) => {
        navigate(`/transfer/${id}`);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">Initiate Property Transfer</h1>
                <p className="text-text-muted">Select a property from your portfolio to begin the ownership transfer process.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map(p => (
                    <GlassCard key={p.id} hoverEffect className={`group cursor-pointer border-l-4 ${p.status === 'active' ? 'border-l-primary' : 'border-l-yellow-500'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <Badge
                                label={p.status === 'active' ? 'Ready for Transfer' : 'Processing'}
                                variant={p.status === 'active' ? 'success' : 'warning'}
                            />
                            <span className="text-xs text-text-muted font-mono">{p.parcelId}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">{p.address}</h3>
                        <div className="text-sm text-text-muted mb-6">
                            {p.area.toLocaleString()} sq.ft • Reg: {p.registrationDate}
                        </div>

                        <Button
                            fullWidth
                            disabled={p.status !== 'active'}
                            onClick={() => handleSelect(p.id)}
                            variant={p.status === 'active' ? 'primary' : 'secondary'}
                        >
                            {p.status === 'active' ? 'Select & Continue' : 'Action Unavailable'}
                        </Button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
