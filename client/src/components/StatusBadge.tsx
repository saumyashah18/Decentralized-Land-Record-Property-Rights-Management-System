import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatusBadgeProps {
    status: 'active' | 'pending' | 'transferred';
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const styles = {
        active: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        transferred: 'bg-blue-100 text-blue-800',
    };

    return (
        <span className={twMerge('px-2 py-1 rounded-full text-sm font-medium', styles[status], className)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};
