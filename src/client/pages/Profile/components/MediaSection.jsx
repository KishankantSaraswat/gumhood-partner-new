import React from 'react';
import { Camera, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import api from '@/common/utils/api';
import SectionTransition from './SectionTransition';

export const MediaSection = ({
    gymData,
    photoSlots,
    uploadingPhotos,
    handleMediaUpload,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm space-y-4">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>Facility Photo Showcase</span>
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {photoSlots.map((slot) => {
                        const rawUrl = gymData.media?.[slot.id];
                        const imageUrl = rawUrl ? api.getMediaUrl(rawUrl) : null;
                        const isUploading = uploadingPhotos[slot.id];

                        return (
                            <div
                                key={slot.id}
                                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 space-y-2 flex flex-col justify-between group hover:border-orange-400 transition-all shadow-2xs"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{slot.title}</h4>
                                        {imageUrl ? (
                                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Not Set
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500">{slot.desc}</p>
                                </div>

                                {/* Image Container / Upload Zone */}
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                    {imageUrl ? (
                                        <>
                                            <img 
                                                src={imageUrl} 
                                                alt={slot.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer px-3 py-1 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-md flex items-center gap-1 active:scale-95 transition-all">
                                                    <Camera className="w-3 h-3" />
                                                    <span>Change</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        disabled={isUploading}
                                                        onChange={(e) => handleMediaUpload(slot.id, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                            {isUploading ? (
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                                    <span className="text-[10px] font-bold text-amber-500">Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 text-slate-400 mb-1" />
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Photo</span>
                                                    <span className="text-[10px] text-slate-400">PNG / JPG</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                disabled={isUploading}
                                                onChange={(e) => handleMediaUpload(slot.id, e.target.files[0])}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </fieldset>
        </SectionTransition>
    );
};

export default MediaSection;

