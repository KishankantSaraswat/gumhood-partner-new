import React, { useState } from 'react';
import { Dumbbell, Users } from 'lucide-react';

const Step3 = ({ data, updateData }) => {
    const facilities = [
        { name: 'Cardio Machines' },
        { name: 'Strength Machines' },
        { name: 'Free Weights' },
        { name: 'Personal Trainers' },
        { name: 'Steam / Sauna' },
        { name: 'Changing Rooms' }
    ];

    const toggle = (name) => {
        const newFacilities = data.facilities.includes(name)
            ? data.facilities.filter(x => x !== name)
            : [...data.facilities, name];
        updateData({ facilities: newFacilities });
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Facilities Available</h2>
            <p className="text-slate-500 mb-6">Select all the amenities your gym offers.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {facilities.map((facility, i) => (
                    <div key={i} onClick={() => toggle(facility.name)} className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all transform hover:scale-105 ${data.facilities.includes(facility.name) ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}>
                        <Dumbbell className={`w-8 h-8 mx-auto mb-2 ${data.facilities.includes(facility.name) ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-bold text-slate-700">{facility.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step3;
