import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    userRole?: string; // Optional for compatibility
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
    const { user, registrarSession, userRole, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    const isAuthenticated = !!user || !!registrarSession;

    if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
