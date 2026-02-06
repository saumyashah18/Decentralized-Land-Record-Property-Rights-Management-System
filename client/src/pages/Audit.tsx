import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { AuditLog } from '../types/audit.types';
import { Badge } from '../components/ui/Badge';

export const Audit: React.FC = () => {
    const logs: AuditLog[] = [
        { id: '1', action: 'Transfer Request', performedBy: '0x71C...976F', timestamp: '2023-06-01 10:00:00', details: 'Transferred P001 to Jane Doe' },
        { id: '2', action: 'Registration', performedBy: 'Registrar_Admin', timestamp: '2023-01-01 09:00:00', details: 'New Parcel P001 Registered' },
        { id: '3', action: 'Dispute Flagged', performedBy: '0x88A...B21C', timestamp: '2023-02-15 14:30:00', details: 'Boundary dispute on P003' }
    ];

    const getActionVariant = (action: string) => {
        if (action.includes('Transfer')) return 'info';
        if (action.includes('Registration')) return 'success';
        if (action.includes('Dispute')) return 'error';
        return 'neutral';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold mb-2">Audit Log</h1>
                <p className="text-text-muted">Immutable record of all system activities</p>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="p-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Action</th>
                                <th className="p-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Performed By</th>
                                <th className="p-4 font-semibold text-text-muted text-sm uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-mono text-sm text-text-muted">{log.timestamp}</td>
                                    <td className="p-4">
                                        <Badge label={log.action} variant={getActionVariant(log.action)} />
                                    </td>
                                    <td className="p-4 font-mono text-sm truncate max-w-[150px]" title={log.performedBy}>
                                        {log.performedBy}
                                    </td>
                                    <td className="p-4 text-sm">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
