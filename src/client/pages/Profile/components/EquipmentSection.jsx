import React from 'react';
import { Dumbbell, Plus, Search, X, Check } from 'lucide-react';
import SectionTransition from './SectionTransition';
import { PRESET_EQUIPMENT } from '../profile.logic';

export const EquipmentSection = ({
    form,
    filteredEquipmentList,
    equipmentSearchQuery,
    setEquipmentSearchQuery,
    customEquipmentInput,
    setCustomEquipmentInput,
    addEquipmentItem,
    removeEquipmentItem,
    togglePresetEquipment,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm space-y-4">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Equipment & Machinery Roster ({form.equipmentList?.length || 0} Items)</span>
                </legend>

                {/* Quick Add Custom Item Bar */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            value={customEquipmentInput}
                            onChange={(e) => setCustomEquipmentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (customEquipmentInput.trim()) {
                                        addEquipmentItem(customEquipmentInput);
                                        setCustomEquipmentInput('');
                                    }
                                }
                            }}
                            placeholder="Add equipment name (e.g. Rogue Power Rack, Hammer Strength Bench)..."
                            className="flex-1 h-9 px-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none shadow-2xs"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (customEquipmentInput.trim()) {
                                    addEquipmentItem(customEquipmentInput);
                                    setCustomEquipmentInput('');
                                }
                            }}
                            className="px-3.5 h-9 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                        </button>
                    </div>

                    {/* Search in existing equipment */}
                    <div className="relative w-full sm:w-60">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            value={equipmentSearchQuery}
                            onChange={(e) => setEquipmentSearchQuery(e.target.value)}
                            placeholder="Search inventory..."
                            className="w-full h-9 pl-8 pr-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none shadow-2xs"
                        />
                    </div>
                </div>

                {/* Active Equipment Tags */}
                {filteredEquipmentList.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {filteredEquipmentList.map((item, idx) => {
                            const originalIndex = form.equipmentList.indexOf(item);
                            return (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-amber-400 transition-all shadow-2xs"
                                >
                                    <Dumbbell className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{item}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeEquipmentItem(originalIndex)}
                                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                                        title="Remove Item"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <Dumbbell className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {equipmentSearchQuery ? 'No equipment matching your search.' : 'No equipment listed yet.'}
                        </p>
                    </div>
                )}

                {/* Popular Equipment Presets */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider">
                        Popular Presets (Click to Add / Remove)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {PRESET_EQUIPMENT.map((preset) => {
                            const isAdded = form.equipmentList?.includes(preset);
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => togglePresetEquipment(preset)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
 isAdded
 ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
 : 'bg-white dark:bg-[#151926] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300'
 }`}
                                >
                                    {isAdded ? <Check className="w-3 h-3 text-amber-500" /> : <Plus className="w-3 h-3 text-slate-400" />}
                                    <span>{preset}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </fieldset>
        </SectionTransition>
    );
};

export default EquipmentSection;

