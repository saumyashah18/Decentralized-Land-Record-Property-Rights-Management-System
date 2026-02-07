import React, { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { APP_NAME } from '../utils/constants';

interface SplashScreenProps {
    onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Start exit animation after 2.5 seconds
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 2500);

        // Complete after animation finishes
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3200);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A] transition-all duration-700 ease-in-out ${isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>

            {/* Content Container */}
            <div className={`flex flex-col items-center justify-center transition-all duration-700 ${isExiting ? 'scale-75' : 'scale-100'}`}>

                {/* Logo */}
                <div className="relative mb-8 animate-bounce-gentle">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <img src={logo} alt={APP_NAME} className="w-32 h-32 md:w-48 md:h-48 relative z-10 drop-shadow-2xl" />
                </div>

                {/* Text */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-clip-text text-transparent bg-300% animate-gradient">
                        {APP_NAME}
                    </h1>
                    <p className="text-blue-200/80 text-lg md:text-xl font-light tracking-wide max-w-md mx-auto leading-relaxed">
                        A Decentralized Unified Land and Property Right System
                    </p>
                </div>

            </div>
        </div>
    );
};
