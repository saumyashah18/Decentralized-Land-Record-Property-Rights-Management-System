import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-text-muted mb-1.5">{label}</label>}
            <input
                className={twMerge(
                    'w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200',
                    error && 'border-red-500/50 focus:ring-red-500/50',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
    );
};
