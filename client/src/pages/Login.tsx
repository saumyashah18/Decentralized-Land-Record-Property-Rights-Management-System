import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';

export const Login: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const navigate = useNavigate();
    const { signInWithPhone, verifyOtp, loginAsDemoCitizen } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPhone(phoneNumber, 'recaptcha-container');
            setConfirmationResult(result);
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please check the number.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOtp(confirmationResult, otp);
            navigate('/dashboard');
        } catch (err: any) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-0">
            <div id="recaptcha-container"></div>
            {/* Main Container */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Auth & Value Prop */}
                <div className="order-2 lg:order-1 px-6 lg:pl-12 animate-in slide-in-from-left-10 duration-700">
                    <div className="mb-8">
                        <div className="inline-block px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-xs font-semibold mb-6 tracking-wide uppercase">
                            Blockchain Powered Security
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
                            Powering the Future of <br />
                            <span className="text-orange-600">Land Records</span>
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                            The all-in-one decentralized platform that brings together citizens, registrars, and transparent property rights. Secure, immutable, and efficient.
                        </p>
                    </div>

                    <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/10 shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    Start as
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div
                                        className="cursor-default rounded-xl p-4 border bg-orange-600 border-orange-600 text-white shadow-lg relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                                        <div className="text-center font-medium relative z-10 flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Citizen Login
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">{error}</p>}

                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button fullWidth size="lg" className="h-14 group relative overflow-hidden" type="submit" disabled={loading}>
                                        <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-700 opacity-80 group-hover:opacity-100 transition-opacity"></span>
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-medium text-white">
                                            {loading ? 'Sending...' : 'Send OTP'}
                                        </span>
                                    </Button>

                                    <div className="relative flex items-center py-2">
                                        <div className="flex-grow border-t border-gray-200"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR</span>
                                        <div className="flex-grow border-t border-gray-200"></div>
                                    </div>

                                    {/* Demo Login Button */}
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="secondary"
                                        className="h-12 border-dashed border-2 border-orange-500/30 text-orange-600 hover:bg-orange-50 transition-all font-semibold"
                                        onClick={async () => {
                                            setLoading(true);
                                            await loginAsDemoCitizen();
                                            navigate('/dashboard');
                                            setLoading(false);
                                        }}
                                    >
                                        Use Demo Account (Skip OTP)
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-text-muted">Enter OTP</label>
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-center tracking-[0.5em] text-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button fullWidth size="lg" className="h-14 group relative overflow-hidden" type="submit" disabled={loading}>
                                        <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-medium text-white">
                                            {loading ? 'Verifying...' : 'Verify & Login'}
                                        </span>
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="text-xs text-text-muted hover:text-gray-900 w-full text-center mt-2 focus:outline-none"
                                    >
                                        Change Phone Number
                                    </button>
                                </form>
                            )}

                            <div className="text-center">
                                <p className="text-xs text-text-muted">
                                    By connecting, you agree to our <span className="text-gray-900 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-gray-900 cursor-pointer hover:underline">Privacy Policy</span>.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/10 text-center">
                                <p className="text-sm text-text-muted">
                                    Government Official?{' '}
                                    <button
                                        onClick={() => navigate('/registrar/login')}
                                        className="text-orange-600 hover:text-orange-700 hover:underline font-bold"
                                    >
                                        Login via e-Pramaan
                                    </button>
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Side: Hero Visualization */}
                <div className="order-1 lg:order-2 relative hidden lg:block h-[800px] perspective-[2000px] isolate">
                    {/* Decorative Gradients */}
                    <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-300/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

                    {/* Tilted Card Container */}
                    <div
                        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[120%] transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-all duration-700 ease-out"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <GlassCard className="p-6 border-orange-200 shadow-[0_20px_50px_rgba(249,115,22,0.15)] backdrop-blur-xl bg-white/90">
                            {/* Mock Application UI Header */}
                            <div className="flex justify-between items-center mb-8 border-b border-orange-200/50 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                    <div className="text-sm font-mono text-gray-600">bhoomisetu.eth/dashboard</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Mock Grid Content */}
                            <div className="grid grid-cols-3 gap-6">
                                {/* Stats Cards */}
                                <div className="col-span-1 bg-gradient-to-br from-white to-orange-50 backdrop-blur-md rounded-lg p-4 border border-orange-200/50 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">Total Volume</p>
                                    <p className="text-2xl font-bold mt-1 text-gray-800">₹ 4.2B</p>
                                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-green-500"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 bg-gradient-to-br from-white to-orange-50 backdrop-blur-md rounded-lg p-4 border border-orange-200/50 shadow-sm">
                                    <p className="text-xs text-gray-500 uppercase">New Registrations</p>
                                    <p className="text-2xl font-bold mt-1 text-gray-800">+1,204</p>
                                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-orange-500"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 bg-gradient-to-br from-white to-orange-50 backdrop-blur-md rounded-lg p-4 border border-orange-200/50 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-2 right-2">
                                        <Badge label="LIVE" variant="success" className="bg-green-100 text-green-600" />
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase">Network Status</p>
                                    <p className="text-lg font-medium mt-1 text-gray-800">Operational</p>
                                </div>

                                {/* Map / Main Visual */}
                                <div className="col-span-2 row-span-2 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-200/50 p-4 relative min-h-[300px] overflow-hidden group shadow-sm">
                                    {/* Abstract Map UI */}
                                    <div className="absolute inset-0 opacity-30">
                                        {/* CSS Grid Pattern */}
                                        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(249,115,22,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    </div>

                                    {/* Floating Polygons */}
                                    <div className="absolute top-1/3 left-1/4 w-32 h-24 bg-orange-500/30 border border-orange-400/50 transform rotate-12 group-hover:scale-105 transition-transform duration-500"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-40 h-32 bg-orange-400/20 border border-orange-300/50 transform -rotate-6 group-hover:scale-110 transition-transform duration-700"></div>

                                    {/* Floating Tooltip */}
                                    <div className="absolute top-1/2 left-1/3 bg-white/95 backdrop-blur-md px-3 py-2 rounded border border-orange-200 shadow-xl transform translate-y-[-50%] animate-bounce">
                                        <div className="text-xs text-gray-500">Last Sale</div>
                                        <div className="font-bold text-sm text-gray-800">₹ 1.2 Cr</div>
                                    </div>
                                </div>

                                {/* Sidebar / Feed */}
                                <div className="col-span-1 row-span-2 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white backdrop-blur-sm p-3 rounded border border-orange-200/50 flex items-center gap-3 shadow-sm">
                                            <div className="w-8 h-8 rounded bg-orange-100 flex-shrink-0 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-sm bg-orange-300"></div>
                                            </div>
                                            <div className="space-y-1 w-full">
                                                <div className="h-2 w-2/3 bg-gray-200 rounded"></div>
                                                <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-orange-100 p-3 rounded border border-orange-300 text-center text-orange-600 text-sm font-medium mt-4">
                                        Audit Complete
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
};
