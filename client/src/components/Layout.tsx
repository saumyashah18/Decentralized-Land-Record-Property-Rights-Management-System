import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME } from '../utils/constants';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="flex flex-col min-h-screen">
            {!isLoginPage && (
                <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                                    {APP_NAME}
                                </Link>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="hidden md:flex items-center space-x-1 text-sm text-text-muted">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span>Network Active</span>
                                </div>
                                <div className="h-6 w-px bg-white/10"></div>
                                <Link to="/login" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
                                    Logout
                                </Link>
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
