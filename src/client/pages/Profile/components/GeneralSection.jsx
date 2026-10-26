import React from 'react';
import { 
    Building2, Clock, Info, Phone, Mail, 
    ShieldCheck, CheckCircle2, Users 
} from 'lucide-react';
import ProfileInput from './ProfileInput';
import SectionTransition from './SectionTransition';
import { FACILITY_TYPE_OPTIONS } from '../profile.logic';

export const GeneralSection = ({
    form,
    formErrors,
    updateField,
    handlePhoneChange,
    handleAltPhoneChange,
    handleCapacityChange,
    companyInfo,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
                {/* Left Column (2 Cols): Core Identity & Hours */}
                <div className="lg:col-span-2 space-y-3.5">
                    {/* Fieldset: Facility Identity */}
                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                        <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                            <Building2 className="w-3.5 h-3.5 text-amber-500" />
                            <span>Facility Identity & Category</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                            {/* Facility Name */}
                            <div className="sm:col-span-2">
                                <ProfileInput
                                    label="Facility / Gym Name"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="e.g. Fitness Corp International Flagship"
                                    required
                                    error={formErrors.name}
                                />
                            </div>

                            {/* Slogan / Tagline */}
                            <div>
                                <ProfileInput
                                    label="Facility Slogan / Tagline"
                                    name="gymSlogan"
                                    value={form.gymSlogan}
                                    onChange={(e) => updateField('gymSlogan', e.target.value)}
                                    placeholder="e.g. Redefining High-Performance Fitness"
                                />
                            </div>

                            {/* Facility Category */}
                            <div>
                                <ProfileInput
                                    as="select"
                                    label="Category / Type"
                                    name="gymType"
                                    value={form.gymType}
                                    onChange={(e) => updateField('gymType', e.target.value)}
                                    options={FACILITY_TYPE_OPTIONS}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Fieldset: Operating Schedule & Capacity */}
                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                        <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>Operating Hours & Member Capacity</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                            <ProfileInput
                                label="Opening Time"
                                name="openTime"
                                icon={Clock}
                                value={form.openTime}
                                onChange={(e) => updateField('openTime', e.target.value)}
                                placeholder="06:00 AM"
                            />

                            <ProfileInput
                                label="Closing Time"
                                name="closeTime"
                                icon={Clock}
                                value={form.closeTime}
                                onChange={(e) => updateField('closeTime', e.target.value)}
                                placeholder="10:00 PM"
                            />

                            <ProfileInput
                                label="Max Capacity"
                                name="capacity"
                                icon={Users}
                                value={form.capacity}
                                onChange={(e) => handleCapacityChange(e.target.value)}
                                placeholder="e.g. 150"
                                error={formErrors.capacity}
                            />
                        </div>
                    </fieldset>

                    {/* Fieldset: Facility Bio / Overview */}
                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                        <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                            <Info className="w-3.5 h-3.5 text-purple-500" />
                            <span>About the Facility</span>
                        </legend>

                        <div className="mt-1">
                            <ProfileInput
                                as="textarea"
                                rows={4}
                                name="about"
                                value={form.about}
                                onChange={(e) => updateField('about', e.target.value)}
                                placeholder="Describe your gym's environment, specialties, coaching philosophy, and unique perks..."
                                maxLength={1000}
                            />
                        </div>
                    </fieldset>
                </div>

                {/* Right Column (1 Col): Contact & Enterprise Context */}
                <div className="space-y-3.5">
                    {/* Fieldset: Direct Contact Channels */}
                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                        <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Direct Contact Channels</span>
                        </legend>

                        <div className="space-y-3 mt-1">
                            <ProfileInput
                                label="Primary Contact Phone"
                                name="phone"
                                icon={Phone}
                                maxLength={10}
                                value={form.phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder="10-digit mobile number"
                                error={formErrors.phone}
                            />

                            <ProfileInput
                                label="Alternate / Reception Phone"
                                name="alternatePhone"
                                icon={Phone}
                                maxLength={10}
                                value={form.alternatePhone}
                                onChange={(e) => handleAltPhoneChange(e.target.value)}
                                placeholder="Emergency / Alternate line"
                                error={formErrors.alternatePhone}
                            />

                            <ProfileInput
                                label="Facility Contact Email"
                                name="contactEmail"
                                type="email"
                                icon={Mail}
                                value={form.contactEmail}
                                onChange={(e) => updateField('contactEmail', e.target.value)}
                                placeholder="desk@gymfacility.com"
                                error={formErrors.contactEmail}
                            />
                        </div>
                    </fieldset>

                    {/* Fieldset: Enterprise Organization */}
                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm">
                        <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                            <span>Enterprise Affiliation</span>
                        </legend>

                        <div className="space-y-2 mt-1 text-xs">
                            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                                <span className="text-slate-500">Corporate Parent</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{companyInfo?.name || 'Partner Org'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                                <span className="text-slate-500">Company ID</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#{companyInfo?.id || '2'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-white/5">
                                <span className="text-slate-500">Branch Status</span>
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Operational
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-500">KYC Status</span>
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                    <ShieldCheck className="w-3 h-3" />
                                    Approved
                                </span>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </SectionTransition>
    );
};

export default GeneralSection;

