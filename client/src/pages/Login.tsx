import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { APP_NAME } from '../utils/constants';

export const Login: React.FC = () => {
    const [role, setRole] = useState<'citizen' | 'registrar'>('citizen');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (role === 'registrar') {
            navigate('/registrar');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <GlassCard className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                        {APP_NAME}
                    </h1>
                    <p className="text-text-muted">Decentralized Land Record Management</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Select Your Role</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div
                                onClick={() => setRole('citizen')}
                                className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 ${role === 'citizen'
                                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                        : 'bg-surface border-white/5 text-text-muted hover:bg-surfaceHighlight hover:border-white/10'
                                    }`}
                            >
                                <div className="text-center font-medium">Citizen</div>
                            </div>

                            <div
                                onClick={() => setRole('registrar')}
                                className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 ${role === 'registrar'
                                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                        : 'bg-surface border-white/5 text-text-muted hover:bg-surfaceHighlight hover:border-white/10'
                                    }`}
                            >
                                <div className="text-center font-medium">Registrar</div>
                            </div>
                        </div>
                    </div>

                    <Button fullWidth size="lg" className="mt-8 group">
                        Login as <span className="capitalize ml-1">{role}</span>
                        <svg
                            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Button>

                    <div className="text-center text-xs text-text-muted">
                        Secure Blockchain Authentication
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};
