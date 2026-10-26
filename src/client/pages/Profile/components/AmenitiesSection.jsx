import React from 'react';
import { Sparkles, Check, Plus, X } from 'lucide-react';
import SectionTransition from './SectionTransition';
import { PRESET_FACILITIES } from '../profile.logic';

export const AmenitiesSection = ({
    form,
    toggleFacility,
    customAmenityInput,
    setCustomAmenityInput,
    addCustomFacility,
    removeFacility,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm space-y-4">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Amenities & Facility Perks ({form.facilities?.length || 0} Selected)</span>
                </legend>

                {/* Preset Amenities Interactive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
                    {PRESET_FACILITIES.map((facility) => {
                        const isSelected = form.facilities?.includes(facility);
                        return (
                            <button
                                key={facility}
                                type="button"
                                onClick={() => toggleFacility(facility)}
                                className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
 isSelected
 ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
 : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
 }`}
                            >
                                <span className="text-xs leading-snug">{facility}</span>
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
 isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600'
 }`}>
                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Custom Amenities Addition */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Add Custom Amenity or Special Facility
                    </label>
                    <div className="flex gap-2 max-w-md">
                        <input
                            type="text"
                            value={customAmenityInput}
                            onChange={(e) => setCustomAmenityInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (customAmenityInput.trim()) {
                                        addCustomFacility(customAmenityInput);
                                        setCustomAmenityInput('');
                                    }
                                }
                            }}
                            placeholder="e.g. Olympic Swimming Pool, Ice Bath"
                            className="flex-1 h-9 px-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none shadow-2xs"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (customAmenityInput.trim()) {
                                    addCustomFacility(customAmenityInput);
                                    setCustomAmenityInput('');
                                }
                            }}
                            className="px-3.5 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:from-amber-600 hover:to-orange-600"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                        </button>
                    </div>

                    {/* List of custom facilities */}
                    {form.facilities?.some(f => !PRESET_FACILITIES.includes(f)) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {form.facilities.filter(f => !PRESET_FACILITIES.includes(f)).map((customF) => (
                                <span
                                    key={customF}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 shadow-2xs"
                                >
                                    <span>{customF}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFacility(customF)}
                                        className="hover:text-rose-500 cursor-pointer ml-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </fieldset>
        </SectionTransition>
    );
};

export default AmenitiesSection;

