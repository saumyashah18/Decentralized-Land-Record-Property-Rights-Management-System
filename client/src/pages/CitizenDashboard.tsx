import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Parcel } from '../types/parcel.types';

export const CitizenDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const properties: Parcel[] = [
        {
            id: '1', parcelId: 'P001', ownerId: 'U001', address: '123 Main St, Tech City',
            area: 1200, coordinates: [23.123, 72.123], status: 'active', registrationDate: '2023-01-01'
        },
        {
            id: '3', parcelId: 'P003', ownerId: 'U001', address: '789 Pine Ave, Green Valley',
            area: 3500, coordinates: [23.130, 72.130], status: 'pending', registrationDate: '2023-10-15'
        }
    ];

    const filtered = properties.filter(p =>
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.parcelId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        My Properties
                    </h1>
                    <p className="text-text-muted mt-1">Manage and view your registered land parcels</p>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                    <Input
                        placeholder="Search by Address or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                    <GlassCard key={p.id} hoverEffect className="group cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                        <div className="flex justify-between items-start mb-4">
                            <Badge
                                label={p.status.toUpperCase()}
                                variant={p.status === 'active' ? 'success' : 'warning'}
                            />
                            <span className="text-xs text-text-muted font-mono bg-white/5 px-2 py-1 rounded">
                                {p.parcelId}
                            </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {p.address}
                        </h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Area</span>
                                <span className="font-medium">{p.area.toLocaleString()} sq.ft</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Registered</span>
                                <span className="font-medium">{p.registrationDate}</span>
                            </div>
                        </div>

                        <Button variant="outline" fullWidth size="sm">
                            View Details
                        </Button>
                    </GlassCard>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p className="text-text-muted">No properties found matching your search.</p>
                </div>
            )}
        </div>
    );
};
