import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Parcel } from '../types/parcel.types';
import { useAuth } from '../contexts/AuthContext';

export const CitizenDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock Data
    const properties: Parcel[] = [
        {
            id: '1', parcelId: 'P001', ownerId: 'U001', address: '402, Titanium City Center, Satellite, Ahmedabad',
            area: 1200, coordinates: [23.0300, 72.5176], status: 'active', registrationDate: '2023-01-01'
        },
        {
            id: '3', parcelId: 'P003', ownerId: 'U001', address: '78, Shivalik Shilp, Iscon Cross Rd, Ahmedabad',
            area: 3500, coordinates: [23.0258, 72.5074], status: 'pending', registrationDate: '2023-10-15'
        }
    ];

    const filtered = properties.filter(p =>
        p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.parcelId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* KYC Banner - Should be conditional based on state in real app */}
            <GlassCard className="bg-gradient-to-r from-blue-600/20 to-primary/20 border-primary/30 flex justify-between items-center p-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Complete your e-KYC</h3>
                        <p className="text-xs text-blue-200">Verify your Aadhaar to enable property transfers.</p>
                    </div>
                </div>
                <Button size="sm" onClick={() => navigate('/kyc')}>Verify Now</Button>
            </GlassCard>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                        My Properties
                    </h1>
                    <p className="text-text-muted mt-1">Manage and view your registered land parcels</p>
                </div>
                <div className="w-full md:w-auto md:min-w-[300px]">
                    <Input
                        placeholder="ULPIN/Survey no. , Apartment ID"
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
