import React from 'react';
import { Clock, Plus, Users, Edit3, Trash2 } from 'lucide-react';
import SectionTransition from './SectionTransition';
import { DAYS_OF_WEEK } from '../profile.logic';

export const ShiftsSection = ({
    form,
    filteredShifts,
    selectedShiftDayFilter,
    setSelectedShiftDayFilter,
    openAddShiftModal,
    openEditShiftModal,
    removeShift,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm space-y-4">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Daily Operating Shifts ({form.shifts?.length || 0} Configured)</span>
                </legend>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {/* Day Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
                        {['ALL', ...DAYS_OF_WEEK].map((day) => {
                            const isDaySelected = selectedShiftDayFilter === day;
                            const count = day === 'ALL' 
                                ? (form.shifts?.length || 0)
                                : (form.shifts?.filter(s => (s.day || '').toLowerCase() === day.toLowerCase()).length || 0);
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedShiftDayFilter(day)}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
 isDaySelected
 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
 : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
 }`}
                                >
                                    <span>{day}</span>
                                    {count > 0 && (
                                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
 isDaySelected ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-white/10'
 }`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={() => openAddShiftModal('Monday')}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Shift</span>
                    </button>
                </div>

                {/* Shifts Grid */}
                {filteredShifts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredShifts.map((shift, idx) => {
                            const originalIndex = form.shifts.indexOf(shift);
                            return (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 hover:border-orange-400 transition-all flex flex-col justify-between group shadow-2xs"
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold text-[10px]">
                                                {shift.day}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
 shift.gender === 'male' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' :
 shift.gender === 'female' ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300' :
 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300'
 }`}>
                                                {shift.gender === 'male' ? 'Men Only' : shift.gender === 'female' ? 'Women Only' : 'Unisex'}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                                {shift.startTime} - {shift.endTime}
                                            </p>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                {shift.name || 'General Slot'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-white/5">
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                            <Users className="w-3 h-3" />
                                            <span>{shift.capacity ? `Cap: ${shift.capacity}` : 'Unlimited'}</span>
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEditShiftModal(originalIndex)}
                                                className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                                                title="Edit Shift"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeShift(originalIndex)}
                                                className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                                                title="Delete Shift"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {selectedShiftDayFilter === 'ALL' ? 'No Operating Shifts Configured' : `No Shifts Configured for ${selectedShiftDayFilter}`}
                        </p>
                        <button
                            type="button"
                            onClick={() => openAddShiftModal(selectedShiftDayFilter === 'ALL' ? 'Monday' : selectedShiftDayFilter)}
                            className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create First Shift</span>
                        </button>
                    </div>
                )}
            </fieldset>
        </SectionTransition>
    );
};

export default ShiftsSection;

