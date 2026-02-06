import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ParcelMap } from '../components/maps/ParcelMap';
import { OwnershipTimeline } from '../components/OwnershipTimeline';
import { Parcel } from '../types/parcel.types';
import { Ownership } from '../types/ownership.types';

export const PropertyView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    // Mock Data
    const parcel: Parcel = {
        id: id || '1', parcelId: 'P001', ownerId: 'U001', address: '123 Main St, Tech City',
        area: 1200, coordinates: [23.0225, 72.5714], status: 'active', registrationDate: '2023-01-01'
    };

    const history: Ownership[] = [
        { id: 'h1', currentOwner: 'Jane Doe', previousOwner: 'John Smith', transferDate: '2023-05-15', transactionHash: '0x123...' },
        { id: 'h2', currentOwner: 'John Smith', transferDate: '2023-01-01', transactionHash: '0x456...' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:pl-2 transition-all">
                ← Back to Dashboard
            </Button>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Details & Actions */}
                <div className="w-full md:w-1/3 space-y-6">
                    <GlassCard>
                        <div className="mb-4">
                            <Badge
                                label={parcel.status.toUpperCase()}
                                variant={parcel.status === 'active' ? 'success' : 'warning'}
                                className="mb-2"
                            />
                            <h1 className="text-2xl font-bold">{parcel.address}</h1>
                            <p className="text-text-muted text-sm mt-1 font-mono">ID: {parcel.parcelId}</p>
                        </div>

                        <div className="space-y-4 py-4 border-t border-white/5 border-b mb-6">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Total Area</span>
                                <span className="font-semibold">{parcel.area.toLocaleString()} sq.ft</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Registration</span>
                                <span className="font-semibold">{parcel.registrationDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Zone</span>
                                <span className="font-semibold">Residential-A</span>
                            </div>
                        </div>

                        <Button fullWidth onClick={() => navigate(`/transfer/${id}`)}>
                            Initiate Transfer
                        </Button>
                    </GlassCard>

                    {/* Map Preview (Small) */}
                    <GlassCard className="p-0 overflow-hidden h-[300px] relative">
                        <div className="absolute inset-0 z-0">
                            <ParcelMap center={parcel.coordinates} zoom={15} />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                            <p className="text-xs text-white/70">Geospatial Boundary Verified</p>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: Detailed View */}
                <div className="w-full md:w-2/3">
                    <GlassCard className="h-full">
                        <div className="flex space-x-6 border-b border-white/5 pb-4 mb-6">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`pb-1 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}
                            >
                                Property Details
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-1 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-white'}`}
                            >
                                Ownership History
                            </button>
                        </div>

                        {activeTab === 'details' ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-text-muted leading-relaxed">
                                        Prime residential plot located in the heart of Tech City.
                                        Suitable for multi-story construction.
                                        Fully verified title with no encumbrances.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-surface p-4 rounded-lg">
                                        <p className="text-xs text-text-muted uppercase">Market Value</p>
                                        <p className="text-xl font-bold mt-1">₹ 1.2 Cr</p>
                                    </div>
                                    <div className="bg-surface p-4 rounded-lg">
                                        <p className="text-xs text-text-muted uppercase">Last Tax Paid</p>
                                        <p className="text-xl font-bold mt-1">2023-24</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <OwnershipTimeline history={history} />
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
