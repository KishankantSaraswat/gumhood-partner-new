import React from 'react';
import { Dumbbell } from 'lucide-react';

const GymLoader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] animate-fade-in">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>

                {/* Inner Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
            </div>
            {text && (
                <p className="mt-4 text-sm font-bold text-slate-500 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default GymLoader;
