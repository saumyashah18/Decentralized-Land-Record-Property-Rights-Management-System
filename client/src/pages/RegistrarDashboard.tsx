import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { dscService } from '../services/mockDSCService';

// Sub-components for each section can be extracted later. 
// For now, implementing them inline or within this file for the prototype.

type RegistrarTab = 'register-land' | 'register-unit' | 'approvals' | 'encumbrance' | 'disputes' | 'legal' | 'mutations' | 'audit';

export const RegistrarDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<RegistrarTab>('approvals');

    const menuItems: { id: RegistrarTab; label: string; icon: string }[] = [
        { id: 'approvals', label: 'Transfer Approvals', icon: 'check-circle' },
        { id: 'register-land', label: 'Register Land Parcel', icon: 'map' },
        { id: 'register-unit', label: 'Register Unit/Apt', icon: 'home' },
        { id: 'encumbrance', label: 'Encumbrances', icon: 'lock' },
        { id: 'disputes', label: 'Dispute Resolution', icon: 'alert-triangle' },
        { id: 'legal', label: 'Court Orders & Docs', icon: 'file-text' },
        { id: 'mutations', label: 'Mutations (Inher/Part)', icon: 'git-branch' },
        { id: 'audit', label: 'Audit Log', icon: 'activity' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'register-land':
                return <LandRegistrationForm />;
            case 'register-unit':
                return <UnitRegistrationForm />;
            case 'approvals':
                return <TransferApprovals />;
            case 'encumbrance':
                return <EncumbranceManager />;
            case 'disputes':
                return <DisputeManager />;
            case 'legal':
                return <LegalUploader />;
            case 'mutations':
                return <MutationManager />;
            case 'audit':
                return <AuditView />;
            default:
                return <div>Select an option</div>;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 min-h-[calc(100vh-140px)]">


            <div className="flex flex-col lg:flex-row gap-6 h-full">

                {/* Sidebar Navigation */}
                <GlassCard className="lg:w-72 flex-shrink-0 p-0 overflow-hidden flex flex-col h-full bg-white/70 backdrop-blur-xl border-orange-200/50 shadow-xl shadow-orange-900/5">
                    <div className="p-6 border-b border-orange-100 bg-gradient-to-br from-orange-50 to-white">
                        <h2 className="font-bold text-xl text-orange-950">Registrar Console</h2>
                        <p className="text-xs text-orange-800/60 font-medium">Administrative Control Panel</p>
                    </div>
                    <div className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 group ${activeTab === item.id
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTab === item.id ? 'bg-white scale-125' : 'bg-orange-300 group-hover:bg-orange-500'}`}></span>
                                <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Main Content Area */}
                <div className="flex-1 h-full overflow-hidden flex flex-col">
                    <GlassCard className="h-full overflow-y-auto p-6 lg:p-10 bg-white/40 backdrop-blur-md border-white/40 shadow-inner">
                        <div className="max-w-4xl mx-auto">
                            {renderContent()}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

// --- Sub-Components (Mock Implementations) ---

const LandRegistrationForm = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8">
            <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">New Land Registration</h2>
            <p className="text-orange-800/60 mt-1 font-medium">Officially record a new sovereign land parcel on the blockchain ledger.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Survey Number" placeholder="e.g. 124/A" className="bg-white/50" />
            <Input label="Total Area (sq.ft)" type="number" placeholder="e.g. 2400" className="bg-white/50" />
            <Input label="Owner Name" placeholder="Full Legal Name" className="bg-white/50" />
            <Input
                label="Owner Aadhaar/UID"
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                className="bg-white/50"
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                    if (val.length <= 12) e.target.value = formatted;
                }}
            />
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-orange-900 mb-2">Property Address</label>
                <textarea className="w-full bg-white/50 border border-orange-200 rounded-xl p-4 text-slate-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none min-h-[120px] transition-all" placeholder="Full physical address..."></textarea>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-orange-900 mb-2">Geo-Coordinates (GIS Polygon)</label>
                <div className="bg-orange-50/50 border-2 border-orange-100 rounded-2xl p-12 text-center border-dashed group hover:border-orange-300 transition-colors">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <p className="text-orange-800/70 mb-4 font-medium">Interactive GIS Map Interface</p>
                    <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-100">Draw Parcel Boundaries</Button>
                </div>
            </div>
        </div>
        <div className="pt-8 flex justify-end gap-4 border-t border-orange-100">
            <Button variant="ghost" className="text-orange-700 hover:bg-orange-50 font-semibold px-6">Save Draft</Button>
            <Button className="bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/20 px-8 py-3 text-lg font-bold">Commit Registration</Button>
        </div>
    </div>
);

const UnitRegistrationForm = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Register Unit / Apartment</h2>
            <p className="text-text-muted">Create a child unit record derived from a parent land parcel.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <Input label="Parent Land Parcel ID" placeholder="Search Parent Parcel..." />
            </div>
            <Input label="Apartment/Project Name" placeholder="e.g. Galaxy Heights" />
            <Input label="Unit Number" placeholder="e.g. B-402" />
            <Input label="Floor Area (sq.ft)" type="number" placeholder="e.g. 1200" />
            <Input label="Floor Number" type="number" placeholder="e.g. 4" />
            <div className="md:col-span-2">
                <Input label="UDS (Undivided Share of Land)" placeholder="Percentage or Area" />
            </div>
        </div>
        <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost">Cancel</Button>
            <Button>Create Unit Record</Button>
        </div>
    </div>
);

const TransferApprovals = () => {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransfers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transfers/pending`);
            const data = await response.json();
            setTransfers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch transfers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    const handleAction = async (requestId: string, action: 'APPROVED' | 'REJECTED' | 'SUSPICIOUS') => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transfers/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action, remarks: `Marked as ${action} by Registrar` })
            });

            if (response.ok) {
                // Refresh list
                fetchTransfers();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="border-b border-orange-100 pb-5 mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">Pending Approvals</h2>
                    <p className="text-orange-800/60 mt-1 font-medium">Verify and authenticate ownership transfer requests on the blockchain.</p>
                </div>
                <div className="mb-1">
                    <Badge label={`${transfers.length} Active Requests`} variant="warning" className="bg-orange-100 text-orange-700 border-orange-200" />
                </div>
            </div>

            {/* List of Pending Transfers */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-16 text-orange-800/40">
                        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-medium">Fetching secure records...</p>
                    </div>
                ) : transfers.length === 0 ? (
                    <GlassCard className="p-16 text-center border-dashed border-orange-200 bg-orange-50/20">
                        <div className="w-20 h-20 bg-orange-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-orange-950 font-bold text-xl mb-1">Queue Empty</p>
                        <p className="text-orange-800/60">All transfer requests have been processed.</p>
                    </GlassCard>
                ) : (
                    transfers.map((t: any) => (
                        <div key={t.requestId} className="bg-white/90 border border-orange-100 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-500 group">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900 text-xl tracking-tight">Request #{t.requestId.split('_')[1]}</p>
                                            <p className="text-xs text-orange-800/60 font-semibold uppercase tracking-wider">{new Date(t.requestDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                    </div>
                                    <Badge label="Verification Required" variant="warning" className="bg-orange-50 text-orange-600 border-orange-100 font-bold px-3 py-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-orange-50/50 rounded-2xl mb-6 border border-orange-100/50">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-orange-800/60 mb-2 font-bold">Current Owner (Seller)</p>
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></span>
                                                <p className="text-slate-900 font-bold">{t.sellerId}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-orange-800/60 mb-2 font-bold">Asset ID (Bhu-Aadhar)</p>
                                            <p className="text-orange-600 font-mono font-bold bg-orange-100/50 px-3 py-1 rounded inline-block border border-orange-200">{t.assetId}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-orange-800/60 mb-2 font-bold">New Owner (Buyer)</p>
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                                <p className="text-slate-900 font-bold">{t.buyerId}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-orange-800/60 mb-1 font-bold">Ledger Integrity</p>
                                            <div className="flex items-center gap-2 text-green-600 font-bold italic">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                Hash Validated
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="text-[10px] uppercase tracking-widest text-orange-800/60 mb-3 font-bold">Blockchain Anchored Documents</p>
                                    <div className="flex flex-wrap gap-3">
                                        {JSON.parse(t.documents || '[]').map((doc: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2.5 px-4 py-2 bg-white border border-orange-100 rounded-xl text-xs text-orange-950 font-bold hover:bg-orange-600 hover:text-white hover:border-orange-600 cursor-pointer transition-all shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                {doc}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-orange-100">
                                    <Button size="sm" variant="outline" className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 font-bold" onClick={() => handleAction(t.requestId, 'SUSPICIOUS')}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Flag for Audit
                                    </Button>
                                    <Button size="sm" variant="secondary" className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100 transition-all font-bold" onClick={() => handleAction(t.requestId, 'REJECTED')}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        Reject Request
                                    </Button>
                                    <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-xl shadow-orange-600/30 transition-all font-bold tracking-wide" onClick={() => handleAction(t.requestId, 'APPROVED')}>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        Approve & Sign Ledger
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const EncumbranceManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8">
            <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">Manage Encumbrances</h2>
            <p className="text-orange-800/60 mt-1 font-medium">Register or release liens, mortgages, and legal claims against property titles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <GlassCard className="p-8 border-2 border-dashed border-orange-200 bg-white/40 hover:bg-orange-50 hover:border-orange-400 cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all group">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-4xl text-orange-600 font-bold">+</span>
                </div>
                <span className="font-bold text-lg text-orange-950">Add New Encumbrance</span>
                <p className="text-xs text-orange-800/50 mt-2">Lock property for mortgage or lean</p>
            </GlassCard>
            <GlassCard className="p-8 border-2 border-dashed border-orange-200 bg-white/40 hover:bg-orange-50 hover:border-orange-400 cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all group">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-4xl text-green-600 font-bold">✓</span>
                </div>
                <span className="font-bold text-lg text-orange-950">Release Existing</span>
                <p className="text-xs text-orange-800/50 mt-2">Unlock property from prior claims</p>
            </GlassCard>
        </div>
    </div>
);

const DisputeManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8">
            <h2 className="text-3xl font-extrabold text-red-700 tracking-tight">Dispute & Litigation</h2>
            <p className="text-orange-800/60 mt-1 font-medium">Flag assets with active legal disputes or court-ordered holds.</p>
        </div>
        <div className="relative mb-8">
            <Input placeholder="Search Property ID to Flag..." className="bg-white/50 pl-11" />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm shadow-red-950/5">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-extrabold text-red-700 truncate">Active Dispute: P-003-GNR</h4>
                    <p className="text-sm text-red-900/60 font-medium italic mt-1">Boundary conflict reported by neighbor (Survey #125).</p>
                </div>
                <Badge label="HIGH ALERT" variant="error" className="bg-red-600 text-white border-transparent" />
            </div>
            <div className="flex gap-3 mt-6">
                <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 font-bold px-4">Review Court Order</Button>
                <Button size="sm" variant="secondary" className="bg-white border-red-100 text-slate-800 hover:bg-white font-bold px-4">Mark Resolved</Button>
            </div>
        </div>
    </div>
);

const LegalUploader = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8">
            <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">Legal Depository</h2>
            <p className="text-orange-800/60 mt-1 font-medium">Upload and link authoritative court orders directly to immutable property records.</p>
        </div>
        <div className="border-4 border-dashed border-orange-200/50 rounded-3xl p-16 text-center hover:bg-orange-50/50 hover:border-orange-400 transition-all cursor-pointer group">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-900/5">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </div>
            <p className="text-orange-950 font-bold text-xl mb-2">Upload Certified Orders</p>
            <p className="text-orange-800/50 mb-6 font-medium">Drag and drop PDF/TIFF files or click to browse</p>
            <Button size="sm" variant="outline" className="border-orange-200 text-orange-800 font-bold px-8 py-2">Select Files</Button>
        </div>
    </div>
);

const MutationManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8">
            <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">Advanced Mutations</h2>
            <p className="text-orange-800/60 mt-1 font-medium">Coordinate complex state changes like property Inheritance, Partitioning, or Amalgamation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Inheritance', 'Partition', 'Merge'].map(type => (
                <GlassCard key={type} className="text-center p-8 bg-white/60 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-900/5 cursor-pointer group transition-all rounded-3xl border border-orange-100">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <h3 className="font-extrabold text-xl text-orange-950 transition-colors">{type}</h3>
                    <p className="text-xs text-orange-800/60 mt-2 font-bold tracking-widest uppercase">Start Workflow →</p>
                </GlassCard>
            ))}
        </div>
    </div>
);

const AuditView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="border-b border-orange-100 pb-5 mb-8 flex justify-between items-end">
            <div>
                <h2 className="text-3xl font-extrabold text-orange-950 tracking-tight">System Audit Log</h2>
                <p className="text-orange-800/60 mt-1 font-medium">Immutable, blockchain-verified record of all registrar activities.</p>
            </div>
            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700 font-bold mb-1">Export CSV</Button>
        </div>
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex justify-between items-center bg-white/80 p-5 rounded-2xl border border-orange-100 shadow-sm hover:border-orange-300 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-10 bg-orange-200 rounded-full group-hover:bg-orange-500 transition-colors"></div>
                        <div>
                            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-1">2024-02-0{i} 10:00 AM</span>
                            <span className="text-base text-slate-900 font-bold">Ledger Mutation Action #{i} verified</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-mono text-orange-800/50 block font-bold">HASH INTEGRITY SIGNATURE</span>
                        <span className="text-xs font-mono text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 font-bold">0x...{i}a{i}b{i}c</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
