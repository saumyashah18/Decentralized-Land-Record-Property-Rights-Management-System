import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Transfer: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ulpin, setUlpin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadedFiles(Array.from(e.target.files).map(f => f.name));
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/transfers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: id || 'UNKNOWN_ASSET',
                    newOwnerId: 'BUYER_ID_PLACEHOLDER', // TODO: Get from form or context
                    user: 'SELLER_ID_PLACEHOLDER', // TODO: Get from auth context
                    documents: uploadedFiles
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Transfer initiated:', data);
                setIsSuccess(true);
            } else {
                console.error('Transfer failed');
                alert('Failed to initiate transfer');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to server');
        } finally {
            setIsProcessing(false);
        }
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
                    <h2 className="text-2xl font-bold mb-2">Request Submitted</h2>
                    <p className="text-text-muted mb-8">
                        Your ownership transfer request for Parcel ID <span className="text-white font-mono">{id}</span> has been sent to the Registrar. You will be notified once the verification is complete.
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
                ← Cancel Request
            </Button>

            <GlassCard>
                <div className="border-b border-white/5 pb-6 mb-8">
                    <h1 className="text-2xl font-bold">Request Transfer</h1>
                    <p className="text-text-muted mt-1">Submit documents to the Registrar for ownership transfer approval.</p>
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
                        label="Verify ULPIN"
                        placeholder="Enter property ULPIN for verification (e.g. 1234...)"
                        value={ulpin}
                        onChange={(e) => setUlpin(e.target.value)}
                        required
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-muted">Upload Supporting Documents</label>
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-surface/30 relative">
                            <input
                                type="file"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            {uploadedFiles.length > 0 ? (
                                <div className="space-y-2">
                                    <svg className="w-10 h-10 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-white font-medium">{uploadedFiles.length} file(s) selected</p>
                                    <p className="text-xs text-text-muted">{uploadedFiles.join(', ')}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <svg className="w-10 h-10 text-text-muted mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-text-muted">Click or drag to upload Sale Deed / Identity Proof</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg">
                        <div className="flex gap-3">
                            <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-text-muted">
                                This request will be forwarded to the Registrar for manual verification. Ensure all uploaded documents are valid.
                            </p>
                        </div>
                    </div>

                    <Button type="submit" fullWidth disabled={!ulpin || uploadedFiles.length === 0 || isProcessing} size="lg">
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Sending Request...
                            </div>
                        ) : (
                            'Submit to Registrar'
                        )}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
};
