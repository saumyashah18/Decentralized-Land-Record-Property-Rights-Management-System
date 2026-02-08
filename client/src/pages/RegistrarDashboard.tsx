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
                <GlassCard className="lg:w-64 flex-shrink-0 p-0 overflow-hidden flex flex-col h-full bg-[#0F172A]/80 backdrop-blur-xl border border-white/5">
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                        <h2 className="font-bold text-lg text-white">Registrar Console</h2>
                        <p className="text-xs text-text-muted">Admin Operations</p>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 border-l-2 ${activeTab === item.id
                                    ? 'bg-white/5 border-primary text-white'
                                    : 'border-transparent text-text-muted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {/* Placeholder Icons - Replace with Lucide later if needed */}
                                <span className={`w-2 h-2 rounded-full ${activeTab === item.id ? 'bg-primary' : 'bg-white/20'}`}></span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </GlassCard>

                {/* Main Content Area */}
                <div className="flex-1 h-full overflow-hidden flex flex-col">
                    <GlassCard className="h-full overflow-y-auto p-6 lg:p-8 bg-[#0F172A]/50 backdrop-blur-md">
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
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">New Land Registration</h2>
            <p className="text-text-muted">Create a new base land parcel record on the ledger.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Survey Number" placeholder="e.g. 124/A" />
            <Input label="Total Area (sq.ft)" type="number" placeholder="e.g. 2400" />
            <Input label="Owner Name" placeholder="Full Legal Name" />
            <Input
                label="Owner Aadhaar/UID"
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                    if (val.length <= 12) e.target.value = formatted;
                }}
            />
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-2">Property Address</label>
                <textarea className="w-full bg-surface border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]" placeholder="Full physical address..."></textarea>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-muted mb-2">Geo-Coordinates (Polygon)</label>
                <div className="bg-black/30 border border-white/10 rounded-lg p-8 text-center border-dashed">
                    <p className="text-text-muted mb-2">Map Interface Placeholder</p>
                    <Button size="sm" variant="outline">Draw on Map</Button>
                </div>
            </div>
        </div>
        <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost">Cancel</Button>
            <Button>Register Land Parcel</Button>
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
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="border-b border-white/10 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Pending Approvals</h2>
                    <p className="text-text-muted">Review and approve ownership transfer requests.</p>
                </div>
                <Badge label={`${transfers.length} Pending`} variant="warning" />
            </div>

            {/* List of Pending Transfers */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-white">Loading requests...</p>
                ) : transfers.length === 0 ? (
                    <p className="text-text-muted">No pending transfer requests.</p>
                ) : (
                    transfers.map((t: any) => (
                        <div key={t.requestId} className="bg-surface/30 border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center hover:bg-surface/50 transition-colors">
                            <div>
                                <p className="font-semibold text-white">Transfer Request #{t.requestId}</p>
                                <p className="text-sm text-text-muted mt-1">Parcel: <span className="text-primary font-mono">{t.assetId}</span> • From: <span className="text-white">{t.sellerId}</span> → To: <span className="text-white">{t.buyerId}</span></p>
                                <p className="text-xs text-text-muted mt-1">Docs: {JSON.parse(t.documents || '[]').join(', ')}</p>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button size="sm" variant="outline" fullWidth className="md:w-auto" onClick={() => handleAction(t.requestId, 'SUSPICIOUS')}>Flag</Button>
                                <Button size="sm" variant="secondary" fullWidth className="md:w-auto text-red-300 hover:text-red-200 hover:bg-red-500/20" onClick={() => handleAction(t.requestId, 'REJECTED')}>Reject</Button>
                                <Button size="sm" fullWidth className="md:w-auto bg-green-600 hover:bg-green-500 text-white" onClick={() => handleAction(t.requestId, 'APPROVED')}>Approve</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const EncumbranceManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Manage Encumbrances</h2>
            <p className="text-text-muted">Add or release liens, mortgages, and claims.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <GlassCard className="p-4 border border-dashed border-white/20 bg-transparent hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center h-[150px]">
                <span className="text-2xl mb-2 text-primary">+</span>
                <span className="font-medium">Add New Encumbrance</span>
            </GlassCard>
            <GlassCard className="p-4 border border-dashed border-white/20 bg-transparent hover:bg-white/5 cursor-pointer flex flex-col items-center justify-center h-[150px]">
                <span className="text-2xl mb-2 text-green-400">✓</span>
                <span className="font-medium">Release Existing</span>
            </GlassCard>
        </div>
    </div>
);

const DisputeManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-red-400">Dispute & Litigation</h2>
            <p className="text-text-muted">Flag properties with active legal disputes.</p>
        </div>
        <Input placeholder="Search Property ID to Flag..." className="mb-6" />
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <h4 className="font-bold text-red-300 mb-2">Active Dispute: P-003</h4>
            <p className="text-sm text-text-muted mb-3">Boundary conflict reported by neighbor (Survey #125).</p>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-500/10">View Court Order</Button>
                <Button size="sm" variant="secondary">Resolve</Button>
            </div>
        </div>
    </div>
);

const LegalUploader = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Legal Depository</h2>
            <p className="text-text-muted">Upload and attach court orders to property records.</p>
        </div>
        <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer">
            <p className="text-text-muted mb-2">Drag and drop PDF court orders here</p>
            <Button size="sm" variant="outline">Browse Files</Button>
        </div>
    </div>
);

const MutationManager = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">Mutations</h2>
            <p className="text-text-muted">Handle complex state changes: Inheritance, Partition, Merge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Inheritance', 'Partition', 'Merge'].map(type => (
                <GlassCard key={type} className="text-center p-6 hover:border-primary/50 cursor-pointer group">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{type}</h3>
                    <p className="text-xs text-text-muted mt-1">Start Process →</p>
                </GlassCard>
            ))}
        </div>
    </div>
);

const AuditView = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
        <div className="border-b border-white/10 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-white">System Audit Log</h2>
            <p className="text-text-muted">Immutable record of registrar actions.</p>
        </div>
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded border border-white/5">
                    <div>
                        <span className="text-sm font-mono text-primary mr-3">2024-02-0{i} 10:00</span>
                        <span className="text-sm text-white">Action #{i} performed</span>
                    </div>
                    <span className="text-xs text-text-muted">Hash: 0x...{i}a{i}b</span>
                </div>
            ))}
        </div>
    </div>
);
