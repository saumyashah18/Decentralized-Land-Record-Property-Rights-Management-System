import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hoverEffect = false, ...props }) => {
    return (
        <div
            className={twMerge(
                'bg-surface border border-surfaceHighlight backdrop-blur-md rounded-xl p-6 shadow-xl active:scale-[0.98] transition-all duration-300',
                hoverEffect && 'hover:bg-surfaceHighlight hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
