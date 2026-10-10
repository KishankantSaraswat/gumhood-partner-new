import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAlert } from '../../../context/AlertContext';

const GymProfile = ({ gym }) => {
    const { showAlert } = useAlert();
    const [gymData, setGymData] = useState(gym || {});
    const [loading, setLoading] = useState(!gym);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('about');

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isEditingShifts, setIsEditingShifts] = useState(false);
    const [editedShifts, setEditedShifts] = useState([]);
    const [isEditingPhotos, setIsEditingPhotos] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState({});
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [isEditingEquipment, setIsEditingEquipment] = useState(false);
    const [editedEquipment, setEditedEquipment] = useState([]);




    useEffect(() => {
        const fetchGymAndRatings = async () => {
            try {
                let currentGym = gym;
                if (!currentGym) {
                    const data = await api.get('/gymdb/gym/owner/me');
                    if (data.success && data.gyms.length > 0) {
                        currentGym = data.gyms[0];
                        setGymData(currentGym);
                    }
                }

                if (currentGym?.id) {
                    setLoadingReviews(true);
                    const ratingsData = await api.get(`/gymdb/ratings/gym/${currentGym.id}`);
                    if (ratingsData.success) {
                        setReviews(ratingsData.ratings);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
                setLoadingReviews(false);
            }
        };
        fetchGymAndRatings();
    }, [gym]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'location') {
            setGymData(prev => ({
                ...prev,
                location: { ...prev.location, address: value }
            }));
        } else {
            setGymData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (updatedData = gymData) => {
        setSaving(true);
        try {
            // Filter only allowed fields to prevent "Invalid updates" error from backend
            const allowedFields = [
                'name', 'capacity', 'openTime', 'closeTime',
                'contactEmail', 'phone', 'alternatePhone', 'about',
                'shifts', 'gymSlogan', 'equipmentList', 'gymType',
                'facilities', 'onboardingStep', 'onboardingStatus',
                'pincode', 'location'
            ];

            const filteredData = {};
            allowedFields.forEach(field => {
                if (updatedData[field] !== undefined) {
                    filteredData[field] = updatedData[field];
                }
            });

            // Clean shifts of _id and __v if they exist
            if (filteredData.shifts) {
                filteredData.shifts = filteredData.shifts.map(({ _id, __v, ...rest }) => rest);
            }

            const response = await api.put(`/gymdb/gym/${gymData.id}`, filteredData);
            if (response.success) {
                setGymData(response.gym);
                showAlert({
                    title: 'Profile Updated',
                    message: 'Your gym profile has been successfully updated.',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error('Save failed:', err);
            showAlert({
                title: 'Update Failed',
                message: err.message || 'We could not save your changes. Please try again.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleShiftEdit = () => {
        setEditedShifts(gymData.shifts || []);
        setIsEditingShifts(!isEditingShifts);
    };

    const handleShiftChange = (index, field, value) => {
        const newShifts = [...editedShifts];
        newShifts[index] = { ...newShifts[index], [field]: value };
        setEditedShifts(newShifts);
    };

    const saveShifts = async () => {
        const cleanShifts = editedShifts.map(({ day, name, startTime, endTime, gender, capacity }) => ({
            day, name, startTime, endTime, gender, capacity: Number(capacity) || 0
        }));
        await handleSave({ ...gymData, shifts: cleanShifts });
        setIsEditingShifts(false);
    };

    const addShift = (day = 'Monday') => {
        setEditedShifts([...editedShifts, { day, name: 'Morning', startTime: '06:00', endTime: '10:00', gender: 'unisex', capacity: 20 }]);
    };

    const removeShift = (index) => {
        setEditedShifts(editedShifts.filter((_, i) => i !== index));
    };

    const toggleEquipmentEdit = () => {
        setEditedEquipment(gymData.equipmentList || []);
        setIsEditingEquipment(!isEditingEquipment);
    };

    const handleEquipmentChange = (index, value) => {
        const newEquipment = [...editedEquipment];
        newEquipment[index] = value;
        setEditedEquipment(newEquipment);
    };

    const addEquipmentItem = () => {
        setEditedEquipment([...editedEquipment, '']);
    };

    const removeEquipmentItem = (index) => {
        setEditedEquipment(editedEquipment.filter((_, i) => i !== index));
    };

    const saveEquipment = async () => {
        const cleanEquipment = editedEquipment.filter(item => item && item.trim() !== '');
        await handleSave({ ...gymData, equipmentList: cleanEquipment });
        setIsEditingEquipment(false);
    };

    const handlePhotoUpload = async (field, file) => {
        if (!file) return;
        setUploadingPhotos(prev => ({ ...prev, [field]: true }));
        try {
            const uploadRes = await api.upload(file);
            if (uploadRes.success) {
                const newMedia = {
                    ...gymData.media,
                    [field]: uploadRes.url
                };

                delete newMedia.id;
                delete newMedia.__v;

                const response = await api.post(`/gymdb/gym/${gymData.id}/media`, newMedia);
                if (response.success) {
                    setGymData(prev => ({ ...prev, media: response.media }));
                }
            }
        } catch (err) {
            console.error('Photo upload failed:', err);
            showAlert({
                title: 'Upload Failed',
                message: 'Photo upload failed. Please check your connection or file size.',
                type: 'error'
            });
        } finally {
            setUploadingPhotos(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleBannerUpload = async (file) => {
        // ... (keep existing handleBannerUpload implementation)
        try {
            const uploadRes = await api.upload(file);
            if (uploadRes.success) {
                const newMedia = {
                    ...gymData.media,
                    bannerPhotoUrl: uploadRes.url
                };

                delete newMedia.id;
                delete newMedia.__v;

                const response = await api.post(`/gymdb/gym/${gymData.id}/media`, newMedia);
                if (response.success) {
                    setGymData(prev => ({ ...prev, media: response.media }));
                    showAlert({
                        title: 'Banner Updated',
                        message: 'Your new banner photo has been successfully set.',
                        type: 'success'
                    });
                }
            }
        } catch (err) {
            console.error('Banner upload failed:', err);
            showAlert({
                title: 'Upload Failed',
                message: 'We could not upload the banner photo. Please try again.',
                type: 'error'
            });
        } finally {
            setUploadingBanner(false);
        }
    };

    const handleLogoUpload = async (file) => {
        if (!file) return;
        setUploadingLogo(true);
        try {
            const uploadRes = await api.upload(file);
            if (uploadRes.success) {
                const newMedia = {
                    ...gymData.media,
                    logoUrl: uploadRes.url
                };

                delete newMedia.id;
                delete newMedia.__v;

                const response = await api.post(`/gymdb/gym/${gymData.id}/media`, newMedia);
                if (response.success) {
                    setGymData(prev => ({ ...prev, media: response.media }));
                    showAlert({
                        title: 'Logo Updated',
                        message: 'Your new gym logo has been updated successfully.',
                        type: 'success'
                    });
                }
            }
        } catch (err) {
            console.error('Logo upload failed:', err);
            showAlert({
                title: 'Upload Failed',
                message: 'We could not upload your logo. Please try again.',
                type: 'error'
            });
        } finally {
            setUploadingLogo(false);
        }
    };

    const photoCategories = [
        { id: 'frontPhotoUrl', label: 'Main Front Photo' },
        { id: 'receptionPhotoUrl', label: 'Reception Area' },
        { id: 'workoutFloorPhotoUrl', label: 'Workout Floor' },
        { id: 'lockerRoomPhotoUrl', label: 'Locker Rooms' },
        { id: 'trainerTeamPhotoUrl', label: 'Trainer/Team Photo' }
    ];

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    const mainImageUrl = api.getMediaUrl(gymData.media?.logoUrl || gymData.media?.frontPhotoUrl) ||
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

    const coverImageUrl = api.getMediaUrl(gymData.media?.bannerPhotoUrl);

    const galleryPhotos = [
        { url: gymData.media?.frontPhotoUrl, label: 'Front' },
        { url: gymData.media?.receptionPhotoUrl, label: 'Reception' },
        { url: gymData.media?.workoutFloorPhotoUrl, label: 'Workout Floor' },
        { url: gymData.media?.lockerRoomPhotoUrl, label: 'Locker Room' },
        { url: gymData.media?.trainerTeamPhotoUrl, label: 'Trainer Team' },
        ...(gymData.media?.mediaUrls?.map(url => ({ url, label: 'Extra' })) || [])
    ].filter(p => p.url).map(p => ({ ...p, url: api.getMediaUrl(p.url) }));

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Cover Banner */}
            <div className="bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="h-48 md:h-64 lg:h-96 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden group">
                        {coverImageUrl ? (
                            <img src={coverImageUrl} className="w-full h-full object-cover object-center" alt="Cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
                        )}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* Banner Upload Button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-xl flex items-center gap-2">
                                {uploadingBanner ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-camera"></i>
                                        {coverImageUrl ? 'Change Banner Photo' : 'Upload Banner Photo'}
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    disabled={uploadingBanner}
                                    onChange={(e) => handleBannerUpload(e.target.files[0])}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Logo and Gym Name Section */}
                    <div className="px-8 pb-4 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4">
                            {/* Logo and Name */}
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-1 shadow-xl border-4 border-white relative group">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img
                                            src={mainImageUrl}
                                            className="w-full h-full object-cover"
                                            alt="Gym logo"
                                        />
                                    </div>

                                    {/* Logo Upload Button */}
                                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-lg border-2 border-white transition-all transform hover:scale-105">
                                        {uploadingLogo ? (
                                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                                        ) : (
                                            <i className="fas fa-camera text-gray-700 text-sm"></i>
                                        )}
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={uploadingLogo}
                                            onChange={(e) => handleLogoUpload(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                                <div className="pb-2 text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-gray-900">{gymData.name}</h1>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {gymData.isVerified ? (
                                            <span className="inline-flex items-center gap-1 text-blue-600">
                                                <i className="fas fa-check-circle"></i> Verified
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Pending Verification</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pb-2">
                                <button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="border-t border-gray-200 mt-4">
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                                {[
                                    { id: 'about', label: 'About', icon: 'fa-info-circle' },
                                    { id: 'photos', label: 'Photos', icon: 'fa-images' },
                                    { id: 'reviews', label: 'Reviews', icon: 'fa-star' },
                                    { id: 'shifts', label: 'Shifts', icon: 'fa-clock' },
                                    { id: 'equipment', label: 'Equipment', icon: 'fa-dumbbell' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === tab.id
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <i className={`fas ${tab.icon} mr-2`}></i>
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Basic Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 space-y-4">
                            <h3 className="font-bold text-lg text-gray-900">Basic Information</h3>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Gym Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={gymData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    maxLength={10}
                                    value={gymData.phone || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleInputChange({ target: { name: 'phone', value: val } });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    maxLength={6}
                                    value={gymData.pincode || ''}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                        handleInputChange({ target: { name: 'pincode', value: val } });
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                                <textarea
                                    rows="3"
                                    name="location"
                                    value={gymData.location?.address || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Facilities</label>
                                <div className="flex flex-wrap gap-2">
                                    {gymData.facilities?.length > 0 ? (
                                        gymData.facilities.map((f, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                                {f}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400">No facilities listed</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* About Tab */}
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-bold text-xl text-gray-900 mb-4">About {gymData.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {gymData.description || "The best gym with world-class facilities and expert trainers."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Photos Tab */}
                        {activeTab === 'photos' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-gray-900">Photos</h3>
                                    <button
                                        onClick={() => setIsEditingPhotos(true)}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        <i className="fas fa-camera mr-2"></i>
                                        Manage Photos
                                    </button>
                                </div>

                                {galleryPhotos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {galleryPhotos.map((photo, i) => (
                                            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 group relative">
                                                <img src={photo.url} alt={photo.label} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                    <span className="text-xs font-semibold text-white">{photo.label}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-gray-50 rounded-lg">
                                        <i className="fas fa-camera text-gray-300 text-5xl mb-4"></i>
                                        <p className="text-gray-500 mb-4">No photos uploaded yet</p>
                                        <button
                                            onClick={() => setIsEditingPhotos(true)}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                                        >
                                            Upload Photos
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="font-bold text-xl text-gray-900 mb-6">Reviews ({reviews.length})</h3>

                                {loadingReviews ? (
                                    <div className="text-center py-10 text-gray-400">Loading reviews...</div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review, i) => (
                                            <div key={review.id || i} className="p-4 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                            {review.user?.profile_picture ? (
                                                                <img src={review.user.profile_picture} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span className="text-sm font-bold text-gray-500">{review.user?.name?.[0] || 'U'}</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{review.user?.name || "Anonymous"}</p>
                                                            <div className="flex gap-0.5 text-yellow-400 text-xs">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i key={i} className={`${i < review.rating ? 'fas' : 'far'} fa-star`}></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    "{review.feedback || review.comment || "No feedback provided"}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-gray-50 rounded-lg">
                                        <p className="text-gray-400">No reviews yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Shifts Tab */}
                        {activeTab === 'shifts' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-gray-900">Operating Shifts</h3>
                                    <button
                                        onClick={toggleShiftEdit}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        <i className="fas fa-cog mr-2"></i>
                                        Manage Shifts
                                    </button>
                                </div>

                                {gymData.shifts?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {gymData.shifts.map((shift, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-semibold">
                                                        {shift.day}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${shift.gender === 'male' ? 'bg-blue-100 text-blue-600' :
                                                        shift.gender === 'female' ? 'bg-pink-100 text-pink-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                        {shift.gender === 'male' ? 'Men Only' : shift.gender === 'female' ? 'Women Only' : 'Unisex'}
                                                    </span>
                                                </div>
                                                <p className="text-xl font-bold text-gray-900 mb-1">
                                                    {shift.startTime} - {shift.endTime}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {shift.name || 'General Shift'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-gray-50 rounded-lg">
                                        <i className="fas fa-calendar-times text-gray-300 text-5xl mb-4"></i>
                                        <p className="text-gray-500 mb-4">No shifts configured</p>
                                        <button
                                            onClick={toggleShiftEdit}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                                        >
                                            Add Shifts
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Equipment Tab */}
                        {activeTab === 'equipment' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-gray-900">Gym Equipment</h3>
                                    <button
                                        onClick={toggleEquipmentEdit}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        <i className="fas fa-edit mr-2"></i>
                                        Edit Equipment
                                    </button>
                                </div>

                                {gymData.equipmentList?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {gymData.equipmentList.map((eq, i) => (
                                            <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
                                                {eq}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center bg-gray-50 rounded-lg">
                                        <i className="fas fa-dumbbell text-gray-300 text-5xl mb-4"></i>
                                        <p className="text-gray-500 mb-4">No equipment listed</p>
                                        <button
                                            onClick={toggleEquipmentEdit}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                                        >
                                            Add Equipment
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {isEditingShifts && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={toggleShiftEdit} />
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-modal-in">
                        <div className="p-8 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">MANAGE OPERATING SHIFTS</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Configure your gym's daily schedule</p>
                            </div>
                            <button onClick={toggleShiftEdit} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-sm transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 sm:p-10 overflow-y-auto flex-1 space-y-6">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                const dayShifts = editedShifts.map((s, i) => ({ ...s, originalIndex: i })).filter(s => s.day === day);
                                return (
                                    <div key={day} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h4 className="text-xl font-black text-slate-800 tracking-tight">{day}</h4>
                                            <button
                                                onClick={() => addShift(day)}
                                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
                                            >
                                                <i className="fas fa-plus-circle"></i>
                                                Add {day} Shift
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {dayShifts.length > 0 ? (
                                                dayShifts.map((shift) => (
                                                    <div key={shift.originalIndex} className="bg-white p-6 rounded-[2rem] border border-slate-200 relative group shadow-sm">
                                                        <button
                                                            onClick={() => removeShift(shift.originalIndex)}
                                                            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-6">
                                                            <div className="lg:col-span-1">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Shift Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={shift.name}
                                                                    placeholder="e.g. Morning"
                                                                    onChange={(e) => handleShiftChange(shift.originalIndex, 'name', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={shift.startTime}
                                                                    onChange={(e) => handleShiftChange(shift.originalIndex, 'startTime', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={shift.endTime}
                                                                    onChange={(e) => handleShiftChange(shift.originalIndex, 'endTime', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Capacity</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={shift.capacity || ''}
                                                                    placeholder="Max Users"
                                                                    onChange={(e) => handleShiftChange(shift.originalIndex, 'capacity', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                                />
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Gender</label>
                                                                <select
                                                                    value={shift.gender}
                                                                    onChange={(e) => handleShiftChange(shift.originalIndex, 'gender', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                                >
                                                                    <option value="unisex">Unisex</option>
                                                                    <option value="male">Men Only</option>
                                                                    <option value="female">Women Only</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-8 text-center bg-white border border-dashed border-slate-200 rounded-[2rem]">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No shifts for {day}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-8 sm:p-10 border-t border-slate-100 flex gap-4 bg-slate-50">
                            <button
                                onClick={toggleShiftEdit}
                                className="flex-1 px-8 py-4 rounded-2xl font-black text-xs tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveShifts}
                                disabled={saving}
                                className="flex-[2] px-8 py-4 rounded-2xl font-black text-xs tracking-widest text-white bg-slate-900 hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 uppercase"
                            >
                                {saving ? 'SAVING CHANGES...' : 'SAVE ALL SHIFTS'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingEquipment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={toggleEquipmentEdit} />
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-modal-in">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">GYM EQUIPMENT</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">List the equipment available at your gym</p>
                            </div>
                            <button onClick={toggleEquipmentEdit} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-sm transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 space-y-4">
                            {editedEquipment.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={item}
                                        placeholder="e.g. Treadmill, Dumbbells, Bench Press"
                                        onChange={(e) => handleEquipmentChange(idx, e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                        autoFocus={item === ''}
                                    />
                                    <button
                                        onClick={() => removeEquipmentItem(idx)}
                                        className="w-12 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all flex items-center justify-center"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addEquipmentItem}
                                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black text-[10px] tracking-widest hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2 uppercase"
                            >
                                <i className="fas fa-plus-circle"></i>
                                Add Item
                            </button>
                        </div>
                        <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50">
                            <button
                                onClick={toggleEquipmentEdit}
                                className="flex-1 px-6 py-3.5 rounded-xl font-black text-xs tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 transition-all uppercase"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEquipment}
                                disabled={saving}
                                className="flex-[2] px-6 py-3.5 rounded-xl font-black text-xs tracking-widest text-white bg-slate-900 hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50 uppercase"
                            >
                                {saving ? 'SAVING...' : 'SAVE EQUIPMENT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isEditingPhotos && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsEditingPhotos(false)} />
                    <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-modal-in">
                        <div className="p-8 sm:p-10 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">PHOTOS UPLOAD</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1">Upload high-quality images to attract more customers.</p>
                            </div>
                            <button onClick={() => setIsEditingPhotos(false)} className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-all">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="p-8 sm:p-10 overflow-y-auto flex-1 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {photoCategories.map((cat) => (
                                    <div key={cat.id} className="space-y-4">
                                        <div className="flex justify-between items-center px-2">
                                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.1em]">{cat.label}</h4>
                                            {gymData.media?.[cat.id] && (
                                                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase">
                                                    <i className="fas fa-check-circle"></i> Uploaded
                                                </span>
                                            )}
                                        </div>
                                        <div className={`relative h-56 rounded-[2.5rem] border-2 border-dashed transition-all group overflow-hidden bg-white
                                                    ${gymData.media?.[cat.id] ? 'border-emerald-200' : 'border-slate-200 hover:border-indigo-400'}
                                                `}>
                                            {gymData.media?.[cat.id] ? (
                                                <>
                                                    <img src={api.getMediaUrl(gymData.media[cat.id])} alt={cat.label} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                                            Change Photo
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(cat.id, e.target.files[0])} />
                                                        </label>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
                                                    {uploadingPhotos[cat.id] ? (
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Uploading...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                                                                <i className="fas fa-cloud-upload-alt text-2xl text-slate-300 group-hover:text-indigo-400"></i>
                                                            </div>
                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-indigo-600">Click to upload photo</p>
                                                            <p className="text-[10px] text-slate-400 font-bold mt-2">High resolution JPG or PNG</p>
                                                        </>
                                                    )}
                                                    <input type="file" className="hidden" accept="image/*" disabled={uploadingPhotos[cat.id]} onChange={(e) => handlePhotoUpload(cat.id, e.target.files[0])} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 sm:p-10 border-t border-slate-100 flex justify-end bg-white">
                            <button
                                onClick={() => setIsEditingPhotos(false)}
                                className="bg-slate-900 text-white px-12 py-4 rounded-2xl font-black text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-95 uppercase"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GymProfile;
