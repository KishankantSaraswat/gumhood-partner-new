import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import ProfileInput from './ProfileInput';
import SectionTransition from './SectionTransition';

export const LocationSection = ({
    form,
    formErrors,
    updateField,
    handlePincodeChange,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Facility Geographic Address & Routing</span>
                </legend>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="md:col-span-2 space-y-3">
                        <ProfileInput
                            as="textarea"
                            rows={3}
                            label="Full Street Address"
                            name="address"
                            value={form.address}
                            onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Building name, Floor/Suite, Landmark, Street road, City, State..."
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <ProfileInput
                                label="Postal Pincode"
                                name="pincode"
                                icon={MapPin}
                                maxLength={6}
                                value={form.pincode}
                                onChange={(e) => handlePincodeChange(e.target.value)}
                                placeholder="6-digit postal code"
                                required
                                error={formErrors.pincode}
                            />

                            <ProfileInput
                                label="Landmark / Nearby Metro"
                                name="landmark"
                                placeholder="e.g. Opposite City Mall, 200m from Central Metro"
                            />
                        </div>
                    </div>

                    {/* Location Preview Card */}
                    <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-3">
                        <div>
                            <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[11px] tracking-wider mb-1.5">
                                <Navigation className="w-3 h-3" />
                                <span>Navigation Card</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {form.name || 'Partner Facility'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {form.address || 'Address not yet specified.'}
                            </p>
                            {form.pincode && (
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                    PIN: {form.pincode}
                                </p>
                            )}
                        </div>

                        <div className="p-2.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span>Google Maps Routing</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>
                </div>
            </fieldset>
        </SectionTransition>
    );
};

export default LocationSection;

