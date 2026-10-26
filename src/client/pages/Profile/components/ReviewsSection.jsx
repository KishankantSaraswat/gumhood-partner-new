import React from 'react';
import { Star, Loader2 } from 'lucide-react';
import SectionTransition from './SectionTransition';

export const ReviewsSection = ({
    reviews,
    loadingReviews,
    reviewStats,
    direction = 1
}) => {
    return (
        <SectionTransition direction={direction} className="w-full">
            <fieldset className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-sm space-y-4">
                <legend className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-lg border border-slate-200/90 dark:border-white/10 shadow-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Member Ratings & Reviews ({reviewStats.count} Total)</span>
                </legend>

                {/* Ratings Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 pt-1">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center justify-center text-center sm:border-r border-slate-200/80 dark:border-white/10 pr-0 md:pr-4">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {reviewStats.average}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 my-1">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    className={`w-3.5 h-3.5 ${i < Math.round(Number(reviewStats.average)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                                />
                            ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">Based on {reviewStats.count} verified ratings</span>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="md:col-span-2 flex flex-col justify-center space-y-1">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const countForStar = reviewStats.breakdown[stars] || 0;
                            const percent = reviewStats.count > 0 ? (countForStar / reviewStats.count) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-2 text-xs">
                                    <span className="w-6 font-bold text-slate-600 dark:text-slate-400 flex items-center gap-0.5 text-[11px]">
                                        <span>{stars}</span>
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    </span>
                                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                                        <div 
                                            className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <span className="w-6 text-right font-mono text-[10px] text-slate-400">{countForStar}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews List */}
                {loadingReviews ? (
                    <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-1.5">
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        <span className="text-xs font-semibold">Loading member reviews...</span>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="space-y-2.5">
                        {reviews.map((rev, idx) => (
                            <div
                                key={rev.id || idx}
                                className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-2xs"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                                            {(rev.user?.name?.charAt(0) || 'M').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                {rev.user?.name || 'Verified Member'}
                                            </p>
                                            <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-2.5 h-2.5 ${i < (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="text-[10px] text-slate-400">
                                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic pl-9">
                                    "{rev.feedback || rev.comment || 'World-class facility, great atmosphere and supportive trainers!'}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                        <Star className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            No Member Reviews Yet
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            When active members rate their gym sessions, their feedback will display here.
                        </p>
                    </div>
                )}
            </fieldset>
        </SectionTransition>
    );
};

export default ReviewsSection;

