import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Parcel } from '../types/parcel.types';

export const RegistrarDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const pendingProperties: Parcel[] = [
        {
            id: '2', parcelId: 'P002', ownerId: 'U002', address: '456 Oak Ave, Industrial Zone',
            area: 2400, coordinates: [23.124, 72.124], status: 'pending', registrationDate: '2023-02-01'
        },
        {
            id: '4', parcelId: 'P004', ownerId: 'U005', address: '101 Lake View, North District',
            area: 5000, coordinates: [23.140, 72.140], status: 'pending', registrationDate: '2023-11-20'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Registrar Overview
                    </h1>
                    <p className="text-text-muted mt-1">Review pending registrations and ownership transfers</p>
                </div>
                <Button onClick={() => navigate('/audit')}>
                    View Audit Log
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProperties.map(p => (
                    <GlassCard key={p.id} hoverEffect className="border-l-4 border-l-yellow-500">
                        <div className="flex justify-between items-start mb-4">
                            <Badge label="PENDING APPROVAL" variant="warning" />
                            <span className="text-xs text-text-muted font-mono bg-white/5 px-2 py-1 rounded">
                                {p.parcelId}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2">
                            {p.address}
                        </h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Applicant ID</span>
                                <span className="font-mono text-xs bg-white/5 px-1 rounded">{p.ownerId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Area</span>
                                <span className="font-medium">{p.area.toLocaleString()} sq.ft</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Submitted</span>
                                <span className="font-medium">{p.registrationDate}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="primary" size="sm">
                                Approve
                            </Button>
                            <Button variant="secondary" size="sm">
                                Reject
                            </Button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
