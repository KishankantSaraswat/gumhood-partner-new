import React from 'react';
import { 
    Building2, Camera, ShieldCheck, AlertCircle, 
    Clock, Users, Star, RotateCcw, Save, Loader2 
} from 'lucide-react';
import api from '@/common/utils/api';
import ProfileTabs from './ProfileTabs';

export const ProfileHeader = ({
    gymData,
    companyInfo,
    form,
    reviewStats,
    isDirty,
    saving,
    uploadingBanner,
    uploadingLogo,
    handleMediaUpload,
    handleSaveProfile,
    resetForm,
    tabItems,
    activeTab,
    onTabChange
}) => {
    const coverImageUrl = gymData.media?.bannerPhotoUrl ? api.getMediaUrl(gymData.media.bannerPhotoUrl) : null;
    const logoImageUrl = gymData.media?.logoUrl ? api.getMediaUrl(gymData.media.logoUrl) : null;
    const fallbackLogo = logoImageUrl || (gymData.media?.frontPhotoUrl ? api.getMediaUrl(gymData.media.frontPhotoUrl) : null);

    return (
        <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
            {/* Cover Banner Area (Compact Height: h-28 sm:h-32) */}
            <div className="h-28 sm:h-32 relative overflow-hidden group bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
                {coverImageUrl ? (
                    <img 
                        src={coverImageUrl} 
                        alt="Facility Cover" 
                        className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500" 
                    />
                ) : (
                    <div className="w-full h-full relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0f_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                        <div className="flex items-center gap-2 text-slate-400/80 font-bold text-xs tracking-widest">
                            <Building2 className="w-4 h-4 text-amber-500" />
                            <span>Facility Cover Banner</span>
                        </div>
                    </div>
                )}
                
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none" />

                {/* Change Cover Button (Top Right) */}
                <div className="absolute top-2.5 right-2.5 z-10">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 shadow-xs transition-all active:scale-95">
                        {uploadingBanner ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Camera className="w-3 h-3 text-amber-400" />
                                <span>{coverImageUrl ? 'Change Cover' : 'Upload Cover'}</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            disabled={uploadingBanner}
                            onChange={(e) => handleMediaUpload('bannerPhotoUrl', e.target.files[0])}
                        />
                    </label>
                </div>

                {/* Verified & ID Badges (Top Left) */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2">
                    {gymData.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-extrabold backdrop-blur-md shadow-2xs">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Partner
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-extrabold backdrop-blur-md shadow-2xs">
                            <AlertCircle className="w-3 h-3" />
                            Pending Verification
                        </span>
                    )}

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300 text-[10px] font-mono backdrop-blur-md border border-white/10">
                        #{gymData.id || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Profile Identity Bar - 100% on White Card Surface */}
            <div className="px-4 sm:px-6 pb-3 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Avatar & Title Block */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3.5 text-center sm:text-left">
                        {/* Avatar (Only Avatar offsets the banner line) */}
                        <div className="-mt-10 sm:-mt-12 shrink-0 relative group/logo">
                            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-white dark:bg-slate-900 p-1 shadow-md ring-3 ring-white dark:ring-slate-900 overflow-hidden">
                                {fallbackLogo ? (
                                    <img 
                                        src={fallbackLogo} 
                                        alt={form.name || 'Facility Logo'} 
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-inner">
                                        {(form.name?.charAt(0) || 'F').toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <label 
                                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-slate-900 hover:bg-black text-amber-400 border border-white dark:border-slate-800 flex items-center justify-center cursor-pointer shadow-xs transition-all active:scale-95" 
                                title="Upload Facility Logo"
                            >
                                {uploadingLogo ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Camera className="w-3 h-3" />
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    disabled={uploadingLogo}
                                    onChange={(e) => handleMediaUpload('logoUrl', e.target.files[0])}
                                />
                            </label>
                        </div>

                        {/* Title & Metadata (100% on card surface) */}
                        <div className="pt-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                                    {form.name || 'Partner Facility'}
                                </h1>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
                                    {form.gymType || 'Gym & Fitness Center'}
                                </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl line-clamp-1 font-medium">
                                {form.gymSlogan || companyInfo?.name || 'World-class fitness infrastructure, modern equipment, and certified training.'}
                            </p>

                            {/* Meta Pills */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px]">
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    <span>{form.openTime || '06:00 AM'} - {form.closeTime || '10:00 PM'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px]">
                                    <Users className="w-3 h-3 text-blue-500" />
                                    <span>{form.capacity ? `${form.capacity} Capacity` : 'Capacity Unspecified'}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{reviewStats.average} ({reviewStats.count} Reviews)</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Top Action Buttons */}
                    <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0">
                        {isDirty && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>Discard</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => handleSaveProfile()}
                            disabled={saving}
                            className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
 isDirty 
 ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 ring-2 ring-amber-500/30' 
 : 'bg-slate-900 hover:bg-black dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-black'
 }`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Navigation Sub-Tabs using Animated ProfileTabs */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-white/10">
                    <ProfileTabs
                        tabs={tabItems}
                        activeTab={activeTab}
                        onChange={onTabChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;

