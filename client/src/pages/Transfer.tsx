import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Transfer: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipient, setRecipient] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="flex justify-center items-center h-[600px] animate-in zoom-in-50 duration-500">
                <GlassCard className="max-w-md w-full text-center p-10">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Transfer Initiated</h2>
                    <p className="text-text-muted mb-8">
                        Ownership transfer request for Parcel ID <span className="text-white font-mono">{id}</span> has been successfully submitted to the registrar for approval.
                    </p>
                    <Button fullWidth onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                    </Button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pt-10 animate-in fade-in duration-500">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all">
                ← Cancel Transfer
            </Button>

            <GlassCard>
                <div className="border-b border-white/5 pb-6 mb-8">
                    <h1 className="text-2xl font-bold">Transfer Ownership</h1>
                    <p className="text-text-muted mt-1">Provide recipient details for secure asset handover.</p>
                </div>

                <form onSubmit={handleTransfer} className="space-y-6">
                    <div className="bg-surface p-4 rounded-lg border border-white/5 mb-6">
                        <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-2">Asset Details</h4>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Residential Plot - Tech City</span>
                            <span className="font-mono text-sm bg-white/10 px-2 py-1 rounded">ID: {id}</span>
                        </div>
                    </div>

                    <Input
                        label="Recipient Wallet Address / User ID"
                        placeholder="e.g. 0x71C... or U005"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        required
                    />

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-text-muted">
                                This action is irreversible once approved by the registrar. Please verify the recipient address carefully.
                            </p>
                        </div>
                    </div>

                    <Button type="submit" fullWidth disabled={!recipient || isProcessing} size="lg">
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing Request...
                            </div>
                        ) : (
                            'Initiate Transfer'
                        )}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
};
