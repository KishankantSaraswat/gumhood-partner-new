import React from 'react';
import { X, Clock } from 'lucide-react';
import ProfileInput from './ProfileInput';
import { DAYS_OF_WEEK } from '../profile.logic';

export const ShiftModal = ({
    isOpen,
    editingIndex,
    data,
    onChange,
    onClose,
    onSave
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-[#121622]/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-white/10 space-y-4 animate-modal-in z-10">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                {editingIndex !== null ? 'Update Shift Slot' : 'Create Operating Shift'}
                            </h3>
                            <p className="text-[11px] text-slate-500">Define shift time window and gender access</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="space-y-3">
                    {/* Day Selection */}
                    <ProfileInput
                        as="select"
                        label="Operating Day"
                        name="day"
                        value={data.day}
                        onChange={(e) => onChange(prev => ({ ...prev, day: e.target.value }))}
                        options={DAYS_OF_WEEK}
                    />

                    {/* Shift Name */}
                    <ProfileInput
                        label="Shift Title / Label"
                        name="shiftName"
                        value={data.name}
                        onChange={(e) => onChange(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Morning Prime, Evening Surge, Ladies Special"
                    />

                    {/* Start and End Times */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <ProfileInput
                            type="time"
                            label="Start Time"
                            name="startTime"
                            value={data.startTime}
                            onChange={(e) => onChange(prev => ({ ...prev, startTime: e.target.value }))}
                        />
                        <ProfileInput
                            type="time"
                            label="End Time"
                            name="endTime"
                            value={data.endTime}
                            onChange={(e) => onChange(prev => ({ ...prev, endTime: e.target.value }))}
                        />
                    </div>

                    {/* Gender and Capacity */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <ProfileInput
                            as="select"
                            label="Gender Policy"
                            name="gender"
                            value={data.gender}
                            onChange={(e) => onChange(prev => ({ ...prev, gender: e.target.value }))}
                            options={[
                                { value: 'unisex', label: 'Unisex (All Members)' },
                                { value: 'male', label: 'Men Only' },
                                { value: 'female', label: 'Women Only' }
                            ]}
                        />

                        <ProfileInput
                            type="number"
                            min="1"
                            label="Slot Capacity Limit"
                            name="capacity"
                            value={data.capacity || ''}
                            onChange={(e) => onChange(prev => ({ ...prev, capacity: e.target.value }))}
                            placeholder="e.g. 30"
                        />
                    </div>
                </div>

                {/* Modal Action Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSave}
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                        Save Shift Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftModal;

