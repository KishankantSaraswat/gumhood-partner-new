import React, { useState } from 'react';
import { Users, Dumbbell } from 'lucide-react';

const Step2 = ({ data, updateData }) => {
    const types = [
        { id: 'unisex', icon: Users, name: 'Unisex Gym', color: 'indigo' },
        { id: 'men-only', icon: Users, name: 'Men Only', color: 'blue' },
        { id: 'women-only', icon: Users, name: 'Women Only', color: 'pink' },
        { id: 'fitness-studio', icon: Dumbbell, name: 'Fitness Studio', color: 'orange' }
    ];

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Gym Type & Category</h2>
            <p className="text-slate-500 mb-6">Select the category that best describes your facility.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {types.map((type, i) => (
                    <div key={i} onClick={() => updateData({ gymType: type.id })} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${data.gymType === type.id ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-2' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center`}>
                                <type.icon className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-slate-700">{type.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step2;
