import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Documents: React.FC = () => {
    // Mock aggregated documents from all properties
    const allDocuments = [
        { id: 1, type: 'Sales Deed', property: '123 Main St', parcelId: 'P001', date: '2023-01-01', status: 'Verified' },
        { id: 2, type: 'Encumbrance Certificate', property: '123 Main St', parcelId: 'P001', date: '2023-02-15', status: 'Verified' },
        { id: 3, type: 'Property Tax', property: '789 Pine Ave', parcelId: 'P003', date: '2023-04-10', status: 'Pending' },
        { id: 4, type: 'Mutation Register', property: '789 Pine Ave', parcelId: 'P003', date: '2023-11-01', status: 'Verified' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Documents</h1>
                    <p className="text-text-muted mt-1">Central repository of all your property-related legal documents.</p>
                </div>
                <Button variant="outline">
                    Request Certified Copy
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {allDocuments.map(doc => (
                    <GlassCard key={doc.id} hoverEffect className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-lg">{doc.type}</h3>
                                <p className="text-sm text-text-muted">
                                    Property: <span className="text-white">{doc.property}</span> <span className="font-mono text-xs ml-1 bg-white/5 px-1 rounded">{doc.parcelId}</span>
                                </p>
                                <div className="flex items-center gap-2 mt-1 md:hidden">
                                    <span className="text-xs text-text-muted">{doc.date}</span>
                                    <Badge label={doc.status} variant={doc.status === 'Verified' ? 'success' : 'warning'} size="sm" />
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-text-muted">Issued Date</p>
                                <p className="text-sm font-medium">{doc.date}</p>
                            </div>
                            <Badge label={doc.status} variant={doc.status === 'Verified' ? 'success' : 'warning'} />
                        </div>

                        <div className="w-full md:w-auto flex gap-2">
                            <Button size="sm" variant="ghost" fullWidth>View</Button>
                            <Button size="sm" variant="outline" fullWidth>Download</Button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};
