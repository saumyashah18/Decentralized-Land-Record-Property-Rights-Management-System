import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info', className }) => {
    const variants = {
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };

    return (
        <span className={twMerge('px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>
            {label}
        </span>
    );
};
