import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { BackgroundGrid } from './ui/BackgroundGrid';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, userRole } = useAuth();
    const isLoginPage = location.pathname === '/login';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <BackgroundGrid />
            {!isLoginPage && (
                <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                <Link to={userRole === 'registrar' ? '/registrar' : '/dashboard'} className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                                    {APP_NAME}
                                </Link>
                                {userRole && (
                                    <span className="ml-3 px-2 py-0.5 rounded text-xs bg-white/5 text-text-muted uppercase tracking-wider border border-white/10">
                                        {userRole}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-4">
                                {user && (
                                    <div className="hidden md:flex items-center gap-3 mr-4">
                                        <img
                                            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full border border-white/10"
                                        />
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-white">{user.displayName}</span>
                                            <span className="text-xs text-text-muted">{user.email}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="h-6 w-px bg-white/10 hidden md:block"></div>

                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>
            )}

            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="border-t border-white/5 bg-background/30 backdrop-blur-sm py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-muted">
                    <p>&copy; 2024 {APP_NAME}. Decentralized Land Registry.</p>
                </div>
            </footer>
        </div>
    );
};
