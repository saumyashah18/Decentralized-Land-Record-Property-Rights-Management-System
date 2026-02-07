import React from 'react';
import { Ownership } from '../types/ownership.types';

interface TimelineProps {
    history: Ownership[];
}

export const OwnershipTimeline: React.FC<TimelineProps> = ({ history }) => {
    return (
        <div className="space-y-0 relative pl-2">
            <div className="absolute top-2 bottom-0 left-[23px] w-px bg-white/10"></div>

            {history.map((record, index) => (
                <div key={record.id} className="relative pl-10 pb-8 last:pb-0 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="absolute top-1 left-4 w-4 h-4 rounded-full border-2 border-primary bg-background shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"></div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-lg text-slate-900">{record.currentOwner}</span>
                            <span className="text-xs font-mono text-slate-500 bg-gray-100 px-2 py-1 rounded">{record.transferDate}</span>
                        </div>

                        {record.previousOwner ? (
                            <p className="text-sm text-slate-600 mb-2">
                                Transferred from <span className="text-slate-900 font-medium">{record.previousOwner}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-green-600 mb-2 font-medium">Original Registration</p>
                        )}

                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="text-xs font-mono text-primary truncate max-w-[200px]">
                                Tx: {record.transactionHash}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
