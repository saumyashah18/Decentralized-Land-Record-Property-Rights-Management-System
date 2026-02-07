import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ParcelMap } from '../components/maps/ParcelMap';
import { OwnershipTimeline } from '../components/OwnershipTimeline';
import { Parcel } from '../types/parcel.types';
import { Ownership } from '../types/ownership.types';

type TabType = 'overview' | 'timeline' | 'documents' | 'transfer' | 'legal';

export const PropertyView: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Mock Data
    const parcel: Parcel = {
        id: id || '1', parcelId: 'P001', ownerId: 'U001', address: '123 Main St, Tech City',
        area: 1200, coordinates: [23.123, 72.123], status: 'active', registrationDate: '2023-01-01'
    };

    const history: Ownership[] = [
        { id: 'h1', currentOwner: 'Jane Doe', previousOwner: 'John Smith', transferDate: '2023-05-15', transactionHash: '0x123...abc' },
        { id: 'h2', currentOwner: 'John Smith', transferDate: '2023-01-01', transactionHash: '0x456...def' }
    ];

    const documents = [
        { id: 1, name: 'Sales Deed', date: '2023-01-01', status: 'Verified' },
        { id: 2, name: 'Encumbrance Certificate (EC)', date: '2023-02-15', status: 'Verified' },
        { id: 3, name: 'Tax Receipt 2023-24', date: '2023-04-10', status: 'Pending' }
    ];

    const jurisdictionIssues = [
        { id: 1, type: 'Boundary Mismatch', status: 'Resolved', description: 'Minor variance in North-East corner aligned with survey 2022.' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0 hover:pl-2 transition-all text-text-muted hover:text-white">
                ← Back to Dashboard
            </Button>

            {/* Hero Section */}
            <GlassCard className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white">{parcel.address}</h1>
                            <Badge
                                label={parcel.status.toUpperCase()}
                                variant={parcel.status === 'active' ? 'success' : 'warning'}
                            />
                        </div>
                        <p className="text-text-muted font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            Parcel ID: {parcel.parcelId}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-text-muted uppercase">Market Value</p>
                            <p className="text-xl font-bold">₹ 1.2 Cr</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Tabs Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area (Spans 3 cols) */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Custom Tab Navigation */}
                    <div className="flex overflow-x-auto pb-2 border-b border-white/10 gap-6 sticky top-[80px] z-30 bg-[#0F172A]/80 backdrop-blur-sm lg:static lg:bg-transparent">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'timeline', label: 'Ownership Timeline' },
                            { id: 'documents', label: 'Documents' },
                            { id: 'transfer', label: 'Initiate Transfer' },
                            { id: 'legal', label: 'Legal Status' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`whitespace-nowrap pb-3 px-1 text-sm font-medium transition-all duration-300 relative ${activeTab === tab.id
                                        ? 'text-primary'
                                        : 'text-text-muted hover:text-white'
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(56,189,248,0.5)]"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                                <GlassCard className="p-0 overflow-hidden h-[400px] relative border border-white/10">
                                    <div className="absolute inset-0 z-0">
                                        <ParcelMap center={parcel.coordinates} zoom={16} />
                                    </div>
                                    <div className="absolute bottom-4 left-4 inline-block px-3 py-1 bg-black/70 backdrop-blur-md rounded border border-white/10 text-xs text-white/90">
                                        Satellite Verified Imagery
                                    </div>
                                </GlassCard>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlassCard>
                                        <h3 className="text-lg font-semibold mb-4 text-white">Property Details</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-text-muted">Total Area</span>
                                                <span>{parcel.area.toLocaleString()} sq.ft</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-text-muted">Zone Type</span>
                                                <span>Residential Zone A</span>
                                            </div>
                                            <div className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-text-muted">Registration Date</span>
                                                <span>{parcel.registrationDate}</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                    <GlassCard>
                                        <h3 className="text-lg font-semibold mb-4 text-white">Owner Information</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-semibold">{history[0]?.currentOwner || 'Current Owner'}</p>
                                                <p className="text-xs text-text-muted">UID: {parcel.ownerId}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-surface/50 rounded text-sm text-text-muted">
                                            Owner verified via Aadhaar integration.
                                        </div>
                                    </GlassCard>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <GlassCard className="animate-in slide-in-from-bottom-5 duration-500">
                                <h3 className="text-xl font-semibold mb-6">Chain of Custody</h3>
                                <OwnershipTimeline history={history} />
                            </GlassCard>
                        )}

                        {activeTab === 'documents' && (
                            <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500">
                                {documents.map((doc) => (
                                    <GlassCard key={doc.id} hoverEffect className="flex justify-between items-center group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white group-hover:text-primary transition-colors">{doc.name}</h4>
                                                <p className="text-xs text-text-muted">Issued: {doc.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                label={doc.status}
                                                variant={doc.status === 'Verified' ? 'success' : 'warning'}
                                            />
                                            <Button variant="ghost" size="sm">Download</Button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}

                        {activeTab === 'transfer' && (
                            <GlassCard className="text-center py-12 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold mb-2">Initiate Ownership Transfer</h2>
                                <p className="text-text-muted max-w-md mx-auto mb-8">
                                    Specify the recipient to begin the secure transfer process. This action will require registrar approval.
                                </p>
                                <Button size="lg" onClick={() => navigate(`/transfer/${id}`)}>
                                    Start Transfer Process
                                </Button>
                            </GlassCard>
                        )}

                        {activeTab === 'legal' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                                <GlassCard className="border-l-4 border-l-green-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-400 mb-1">Jurisdiction Clear</h3>
                                            <p className="text-text-muted text-sm">No active legal disputes or court stays found on this property.</p>
                                        </div>
                                        <div className="p-2 bg-green-500/10 rounded-full">
                                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </GlassCard>

                                <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider mt-6 mb-3">Recorded Discrepancies</h4>
                                {jurisdictionIssues.map(issue => (
                                    <div key={issue.id} className="bg-surface/30 border border-white/5 rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-white">{issue.type}</p>
                                            <p className="text-sm text-text-muted mt-1">{issue.description}</p>
                                        </div>
                                        <Badge label={issue.status} variant="neutral" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Quick Actions) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="sticky top-[150px] space-y-4">
                        <GlassCard className="bg-gradient-to-br from-surface to-surfaceHighlight border-primary/20">
                            <h4 className="text-sm font-bold uppercase text-text-muted mb-4">Quick Actions</h4>
                            <div className="space-y-3">
                                <Button variant="outline" fullWidth size="sm" onClick={() => setActiveTab('documents')}>
                                    View Deeds
                                </Button>
                                <Button variant="outline" fullWidth size="sm" onClick={() => setActiveTab('legal')}>
                                    Check Discrepancies
                                </Button>
                                <Button variant="primary" fullWidth size="sm" onClick={() => navigate(`/transfer/${id}`)}>
                                    Transfer Ownership
                                </Button>
                            </div>
                        </GlassCard>

                        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-200/70 leading-relaxed">
                            <p>
                                <strong>Note:</strong> All document requests and transfers are recorded on the ledger for transparency.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
