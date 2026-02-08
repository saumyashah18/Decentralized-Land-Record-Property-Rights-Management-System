import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { aadhaarService } from '../services/mockAadhaarService';
import { digiLockerService } from '../services/mockDigiLockerService';
import { kycService } from '../services/kycService';
import { useAuth } from '../contexts/AuthContext';

export const KYCVerification: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [aadhaar, setAadhaar] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [requestId, setRequestId] = useState('');

    const handleSendOtp = async () => {
        const cleanAadhaar = aadhaar.replace(/\s/g, '');
        if (cleanAadhaar.length !== 12) {
            setError("Please enter a valid 12-digit Aadhaar number");
            return;
        }
        setLoading(true);
        try {
            const response = await kycService.initiate(cleanAadhaar, user?.uid || 'anonymous');
            setRequestId(response.id);
            // Simulate the OTP step to show the integrated flow.
            setStep(2);
        } catch (err: any) {
            setError(err.message || 'Failed to initiate verification');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        // Simulate OTP verification and then checking status from our backend
        try {
            const status = await kycService.getStatus(requestId);
            if (status.status === 'completed') {
                setStep(3);
            } else {
                setError("Verification pending or failed. Try '123456'");
            }
        } catch (err: any) {
            setError('Error verifying identity');
        } finally {
            setLoading(false);
        }
    };

    const handleDigiLocker = async () => {
        setLoading(true);
        // Simulate linking DigiLocker
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setStep(4);
    };

    const handleComplete = () => {
        // In a real app, we'd update context/backend here
        navigate('/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
                <p className="text-text-muted">Complete e-KYC to securely transact on BhoomiSetu</p>
            </div>

            <div className="flex justify-between items-center mb-8 px-10">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= i ? 'bg-primary text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-white/10 text-text-muted'}`}>
                        {step > i ? '✓' : i}
                    </div>
                ))}
            </div>

            <GlassCard className="p-8">
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <img src="https://uidai.gov.in/images/lang/en/aadhaar_logo.png" alt="Aadhaar" className="h-[20px] mx-auto mb-4 opacity-80 filter brightness-[100] invert-0" /> {/* Mocking light logo */}
                            <h2 className="text-xl font-semibold mb-2">Aadhaar Authentication</h2>
                            <p className="text-sm text-text-muted">Enter your 12-digit Aadhaar number to proceed.</p>
                        </div>
                        <Input
                            placeholder="XXXX XXXX XXXX"
                            className="text-center text-xl tracking-widest"
                            maxLength={14}
                            value={aadhaar}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                if (val.length <= 12) {
                                    setAadhaar(formatted);
                                    setError('');
                                }
                            }}
                        />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <div className="bg-blue-500/10 p-4 rounded-lg text-xs text-blue-200/80">
                            <p className="mb-2 font-semibold">Consent Declaration:</p>
                            <p>I hereby authorize BhoomiSetu to fetch my identity details from UIDAI for the purpose of Land Registry e-KYC.</p>
                        </div>
                        <Button fullWidth onClick={handleSendOtp} disabled={loading || aadhaar.replace(/\s/g, '').length !== 12}>
                            {loading ? 'Sending OTP...' : 'Get OTP'}
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-center">Verify OTP</h2>
                        <p className="text-sm text-text-muted text-center">Enter the OTP sent to your Aadhaar-linked mobile.</p>
                        <Input
                            placeholder="123456"
                            className="text-center text-xl tracking-widest"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <Button fullWidth onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}>
                            {loading ? 'Verifying...' : 'Verify Identity'}
                        </Button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-400">Aadhaar Verified!</h2>

                        <div className="border-t border-white/10 pt-6 mt-6">
                            <h3 className="text-lg font-medium mb-4">Link DigiLocker</h3>
                            <p className="text-text-muted text-sm mb-6">Connect DigiLocker to securely fetch your PAN and other certificates.</p>
                            <Button fullWidth variant="outline" onClick={handleDigiLocker} disabled={loading}>
                                {loading ? 'Connecting...' : 'Connect DigiLocker'}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto animate-bounce-gentle">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">e-KYC Completed</h2>
                        <p className="text-text-muted mb-6">Your identity has been verified and wallet is now authorized for transactions.</p>

                        <div className="bg-surface/50 p-4 rounded-lg text-left space-y-2 mb-6 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Aadhaar Verification</span>
                                <span className="text-green-400 font-medium">Verified</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">DigiLocker</span>
                                <span className="text-green-400 font-medium">Linked</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Soulbound Token</span>
                                <span className="text-blue-400 font-medium">Minted to Wallet</span>
                            </div>
                        </div>

                        <Button fullWidth size="lg" onClick={handleComplete}>
                            Go to Dashboard
                        </Button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
