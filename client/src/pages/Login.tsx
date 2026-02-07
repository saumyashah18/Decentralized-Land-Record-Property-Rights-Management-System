import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';

export const Login: React.FC = () => {
    const [role, setRole] = useState<'citizen' | 'registrar'>('citizen');
    const navigate = useNavigate();
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithGoogle(role);
            if (role === 'registrar') {
                navigate('/registrar');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Failed to sign in. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-0">
            {/* Main Container */}
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Side: Auth & Value Prop */}
                <div className="order-2 lg:order-1 px-6 lg:pl-12 animate-in slide-in-from-left-10 duration-700">
                    <div className="mb-8">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
                            Blockchain Powered Security
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-white/70 bg-clip-text text-transparent mb-6 leading-tight">
                            Powering the Future of <br />
                            <span className="text-primary">Land Records</span>
                        </h1>
                        <p className="text-lg text-text-muted leading-relaxed max-w-xl">
                            The all-in-one decentralized platform that brings together citizens, registrars, and transparent property rights. Secure, immutable, and efficient.
                        </p>
                    </div>

                    <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/10 shadow-2xl">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                                    Start as
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => setRole('citizen')}
                                        className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 relative overflow-hidden group ${role === 'citizen'
                                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                                : 'bg-surface border-white/5 text-text-muted hover:bg-surfaceHighlight hover:border-white/10'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-center font-medium relative z-10">Citizen</div>
                                    </div>

                                    <div
                                        onClick={() => setRole('registrar')}
                                        className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 relative overflow-hidden group ${role === 'registrar'
                                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                                : 'bg-surface border-white/5 text-text-muted hover:bg-surfaceHighlight hover:border-white/10'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="text-center font-medium relative z-10">Registrar</div>
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">{error}</p>}

                            <Button fullWidth size="lg" className="mt-8 group relative overflow-hidden h-14" type="submit">
                                <span className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity"></span>
                                <span className="relative z-10 flex items-center justify-center gap-3 text-lg font-medium">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                                        />
                                    </svg>
                                    Sign in with Google
                                </span>
                            </Button>

                            <div className="text-center">
                                <p className="text-xs text-text-muted">
                                    By connecting, you agree to our <span className="text-white cursor-pointer hover:underline">Terms of Service</span> and <span className="text-white cursor-pointer hover:underline">Privacy Policy</span>.
                                </p>
                            </div>
                        </form>
                    </GlassCard>
                </div>

                {/* Right Side: Hero Visualization */}
                <div className="order-1 lg:order-2 relative hidden lg:block h-[800px] perspective-[2000px] isolate">
                    {/* Decorative Gradients */}
                    <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>

                    {/* Tilted Card Container */}
                    <div
                        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[120%] transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-all duration-700 ease-out"
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        <GlassCard className="p-6 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-black/40">
                            {/* Mock Application UI Header */}
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                                    <div className="text-sm font-mono text-text-muted">bhoomisetu.eth/dashboard</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                                </div>
                            </div>

                            {/* Mock Grid Content */}
                            <div className="grid grid-cols-3 gap-6">
                                {/* Stats Cards */}
                                <div className="col-span-1 bg-surface/50 rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-text-muted uppercase">Total Volume</p>
                                    <p className="text-2xl font-bold mt-1">₹ 4.2B</p>
                                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-green-500"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 bg-surface/50 rounded-lg p-4 border border-white/5">
                                    <p className="text-xs text-text-muted uppercase">New Registrations</p>
                                    <p className="text-2xl font-bold mt-1">+1,204</p>
                                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-1/2 bg-primary"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 bg-surface/50 rounded-lg p-4 border border-white/5 relative overflow-hidden">
                                    <div className="absolute top-2 right-2">
                                        <Badge label="LIVE" variant="success" />
                                    </div>
                                    <p className="text-xs text-text-muted uppercase">Network Status</p>
                                    <p className="text-lg font-medium mt-1">Operational</p>
                                </div>

                                {/* Map / Main Visual */}
                                <div className="col-span-2 row-span-2 bg-black/30 rounded-xl border border-white/10 p-4 relative min-h-[300px] overflow-hidden group">
                                    {/* Abstract Map UI */}
                                    <div className="absolute inset-0 opacity-50">
                                        {/* CSS Grid Pattern */}
                                        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    </div>

                                    {/* Floating Polygons */}
                                    <div className="absolute top-1/3 left-1/4 w-32 h-24 bg-primary/20 border border-primary/50 transform rotate-12 group-hover:scale-105 transition-transform duration-500"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-40 h-32 bg-purple-500/20 border border-purple-500/50 transform -rotate-6 group-hover:scale-110 transition-transform duration-700"></div>

                                    {/* Floating Tooltip */}
                                    <div className="absolute top-1/2 left-1/3 bg-black/80 backdrop-blur-md px-3 py-2 rounded border border-white/10 shadow-xl transform translate-y-[-50%] animate-bounce">
                                        <div className="text-xs text-text-muted">Last Sale</div>
                                        <div className="font-bold text-sm">₹ 1.2 Cr</div>
                                    </div>
                                </div>

                                {/* Sidebar / Feed */}
                                <div className="col-span-1 row-span-2 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-surface/30 p-3 rounded border border-white/5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-white/5 flex-shrink-0"></div>
                                            <div className="space-y-1 w-full">
                                                <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                                                <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bg-primary/10 p-3 rounded border border-primary/20 text-center text-primary text-sm font-medium mt-4">
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
