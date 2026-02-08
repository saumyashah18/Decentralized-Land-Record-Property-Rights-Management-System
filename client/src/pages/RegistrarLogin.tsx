import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const RegistrarLogin: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { setRegistrarSession } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    // Check for error from OIDC callback
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            setError(decodeURIComponent(errorParam));
        }
    }, [searchParams]);

    const handleLogin = () => {
        setLoading(true);
        // Redirect to backend OIDC endpoint
        window.location.href = `${API_BASE_URL}/auth/registrar/login`;
    };

    const handleDemoLogin = async () => {
        setDemoLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/registrar/demo-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.success && data.token) {
                // Decode token to get claims (simple decode for demo)
                const payload = JSON.parse(atob(data.token));

                const session = {
                    sessionToken: data.token,
                    claims: {
                        sub: payload.sub,
                        name: 'Demo Registrar',
                        designation: 'Sub-Registrar',
                        jurisdiction: 'District A'
                    }
                };

                setRegistrarSession(session);
                navigate('/registrar/dashboard');
            } else {
                setError('Demo login failed');
            }
        } catch (err) {
            setError('Failed to connect to backend');
        } finally {
            setDemoLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-lg relative z-10">
                <GlassCard className="p-8 border-white/20 shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        {/* Government Logo Placeholder */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-50/80 to-orange-100/80 rounded-full flex items-center justify-center border-4 border-white/50 shadow-lg relative">
                            <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse"></div>
                            <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">Registrar Portal</h1>
                        <p className="text-text-muted">
                            Secure Government Access Gateway
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50">
                                <svg className="w-12 h-12 text-amber-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                            </div>

                            <p className="text-amber-900 mb-1 font-semibold flex items-center gap-2">
                                <span className="bg-amber-200 p-1 rounded-full"><svg className="w-3 h-3 text-amber-700" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-9-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" /></svg></span>
                                e-Pramaan SSO
                            </p>
                            <p className="text-amber-800/70 text-sm leading-relaxed relative z-10">
                                Authenticate using your official government credentials.
                                Redirects to the secure e-Pramaan portal.
                            </p>
                        </div>

                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleLogin}
                            disabled={loading || demoLoading}
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 h-14 shadow-lg shadow-orange-500/20"
                        >
                            <span className="flex items-center justify-center gap-3 font-semibold text-lg">
                                {loading ? 'Redirecting...' : 'Login with e-Pramaan'}
                            </span>
                        </Button>

                        {/* Demo Login Option */}
                        <div className="relative pt-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Development Access</span>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            variant="secondary"
                            onClick={handleDemoLogin}
                            disabled={loading || demoLoading}
                            className="h-12 border-dashed border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                            <span className="flex items-center justify-center gap-2 text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                {demoLoading ? 'Creating Session...' : 'Bypass Login (Demo Mode)'}
                            </span>
                        </Button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-text-muted">
                            Are you a citizen?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                            >
                                Access Citizen Portal
                            </button>
                        </p>
                    </div>
                </GlassCard>

                <div className="text-center mt-6 text-xs text-gray-400">
                    <p>Secured by Blockchain & e-Pramaan Integration</p>
                    <p>v1.0.0-beta</p>
                </div>
            </div>
        </div>
    );
};
