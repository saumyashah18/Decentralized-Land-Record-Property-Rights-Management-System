import React from 'react';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
    userRole: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, userRole }) => {
    if (!allowedRoles.includes(userRole)) {
        return <div>Access Denied</div>;
    }
    return <>{children}</>;
};

export default RoleGuard;
