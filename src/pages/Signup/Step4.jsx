import React, { useState } from 'react';
import { Camera, Upload, Check } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

import api from '../../utils/api';

const Step4 = ({ data, updateData }) => {
    const { showAlert } = useAlert();
    const [uploading, setUploading] = useState({});

    const handleFileChange = async (id, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [id]: true }));

        try {
            const response = await api.upload(file);
            if (response.success) {
                updateData({ photos: { ...data.photos, [id]: response.url } });
                console.log(`✅ Uploaded ${id}:`, response.url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            showAlert({
                title: 'Upload Error',
                message: "We couldn't upload your photo. Please check your connection and try again.",
                type: 'error'
            });
        } finally {
            setUploading(prev => ({ ...prev, [id]: false }));
        }
    };

    const photoFields = [
        { id: 'frontPhotoUrl', label: 'Main Front Photo' },
        { id: 'receptionPhotoUrl', label: 'Reception Area' },
        { id: 'workoutFloorPhotoUrl', label: 'Workout Floor' },
        { id: 'lockerRoomPhotoUrl', label: 'Locker Rooms' },
        { id: 'trainerTeamPhotoUrl', label: 'Trainer/Team Photo' }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Photos Upload</h2>
            <p className="text-slate-500 mb-6">Upload high-quality images to attract more customers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {photoFields.map((field) => (
                    <div key={field.id} className="relative group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">{field.label}</label>
                        <div className={`relative h-48 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                            ${data.photos?.[field.id] ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50 group-hover:border-indigo-400 group-hover:bg-indigo-50'}
                        `}>
                            {data.photos?.[field.id] ? (
                                <>
                                    <img src={api.getMediaUrl(data.photos[field.id])} alt={field.label} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                                            Change Photo
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(field.id, e.target.files[0])} />
                                        </label>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                                    {uploading[field.id] ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-xs font-bold text-indigo-600">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">Click to upload photo</p>
                                            <p className="text-[10px] text-slate-400 mt-1">High resolution JPG or PNG</p>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" disabled={uploading[field.id]} onChange={(e) => handleFileChange(field.id, e.target.files[0])} />
                                </label>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Step4;
