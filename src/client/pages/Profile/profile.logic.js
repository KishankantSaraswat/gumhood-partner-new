import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/common/utils/api';
import { useAlert } from '@/context/AlertContext';

export const FACILITY_TYPE_OPTIONS = [
    'Gym & Fitness Center',
    'Strength & Conditioning',
    'CrossFit Box',
    'Yoga & Wellness Studio',
    'Boutique Fitness Club',
    'Pilates & Barre Studio',
    'MMA & Martial Arts Club',
    'Sports & Performance Complex'
];

export const PRESET_FACILITIES = [
    'Cardio Arena',
    'Free Weights & Dumbbells',
    'Strength Machines',
    'Powerlifting Platform',
    'Air Conditioning',
    'Locker Rooms & Showers',
    'Steam Bath & Sauna',
    'Personal Trainers',
    'High-Speed Wi-Fi',
    'Dedicated Parking',
    'Diet & Nutritionist Desk',
    'Cafeteria & Juice Bar',
    'Zumba & Aerobics Studio',
    'CrossFit Rig'
];

export const PRESET_EQUIPMENT = [
    'Motorized Treadmills',
    'Cross Trainers / Ellipticals',
    'Stationary Spin Bikes',
    'Rowing Ergometers',
    'Olympic Barbells & Bumper Plates',
    'Dumbbells Set (2.5kg - 50kg)',
    'Dual Cable Crossover Station',
    'Smith Machine',
    'Squat Racks & Power Cages',
    'Leg Press 45-Degree',
    'Lat Pulldown & Seated Row',
    'Adjustable Incline / Flat Benches',
    'Preacher Curl Bench',
    'Kettlebells Roster (4kg - 32kg)',
    'Battle Ropes & Plyo Boxes'
];

export const DAYS_OF_WEEK = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const ALLOWED_UPDATE_FIELDS = [
    'name', 'capacity', 'openTime', 'closeTime',
    'contactEmail', 'phone', 'alternatePhone', 'about',
    'shifts', 'gymSlogan', 'equipmentList', 'gymType',
    'facilities', 'onboardingStep', 'onboardingStatus',
    'pincode', 'location'
];

export const validateProfileData = (form) => {
    const errors = {};
    if (!form.name || !form.name.trim()) {
        errors.name = 'Facility Name is required';
    } else if (form.name.trim().length < 2) {
        errors.name = 'Facility Name must be at least 2 characters';
    }

    if (form.contactEmail && form.contactEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.contactEmail.trim())) {
            errors.contactEmail = 'Please enter a valid email address';
        }
    }

    if (form.phone && form.phone.trim()) {
        const cleanPhone = form.phone.replace(/\D/g, '');
        if (cleanPhone.length > 0 && cleanPhone.length !== 10) {
            errors.phone = 'Primary contact number must be 10 digits';
        }
    }

    if (form.alternatePhone && form.alternatePhone.trim()) {
        const cleanAlt = form.alternatePhone.replace(/\D/g, '');
        if (cleanAlt.length > 0 && cleanAlt.length !== 10) {
            errors.alternatePhone = 'Alternate contact number must be 10 digits';
        }
    }

    if (form.pincode && form.pincode.trim()) {
        const cleanPin = form.pincode.replace(/\D/g, '');
        if (cleanPin.length > 0 && cleanPin.length !== 6) {
            errors.pincode = 'Pincode must be exactly 6 digits';
        }
    }

    if (form.capacity !== undefined && form.capacity !== null && form.capacity !== '') {
        const cap = Number(form.capacity);
        if (isNaN(cap) || cap < 0) {
            errors.capacity = 'Capacity must be a valid positive number';
        }
    }

    return errors;
};

export function useProfileLogic(initialGym = null) {
    const { showAlert } = useAlert();
    const [gymData, setGymData] = useState(initialGym || {});
    const [loading, setLoading] = useState(!initialGym);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    // Direction tracking for side animations
    const [tabDirection, setTabDirection] = useState(1);

    // Company & User session context
    const [companyInfo, setCompanyInfo] = useState(() => {
        try {
            const raw = localStorage.getItem('client_company') || localStorage.getItem('company');
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    });

    // Form State
    const [form, setForm] = useState({
        name: '',
        gymSlogan: '',
        gymType: 'Gym & Fitness Center',
        capacity: '',
        openTime: '06:00 AM',
        closeTime: '10:00 PM',
        contactEmail: '',
        phone: '',
        alternatePhone: '',
        about: '',
        address: '',
        pincode: '',
        facilities: [],
        shifts: [],
        equipmentList: []
    });

    const [formErrors, setFormErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Upload states
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingPhotos, setUploadingPhotos] = useState({});

    // Shift modal states
    const [shiftModalOpen, setShiftModalOpen] = useState(false);
    const [editingShiftIndex, setEditingShiftIndex] = useState(null);
    const [shiftModalData, setShiftModalData] = useState({
        day: 'Monday',
        name: 'Standard Slot',
        startTime: '06:00',
        endTime: '10:00',
        gender: 'unisex',
        capacity: 30
    });

    // Change Tab with direction tracking
    const handleTabChange = useCallback((newTabId) => {
        const tabOrder = ['general', 'location', 'facilities', 'shifts', 'equipment', 'media', 'reviews'];
        const currentIndex = tabOrder.indexOf(activeTab);
        const nextIndex = tabOrder.indexOf(newTabId);
        setTabDirection(nextIndex >= currentIndex ? 1 : -1);
        setActiveTab(newTabId);
    }, [activeTab]);

    // Populate form from gym data
    const populateFormFromGym = useCallback((gym) => {
        if (!gym) return;
        setForm({
            name: gym.name || '',
            gymSlogan: gym.gymSlogan || '',
            gymType: gym.gymType || 'Gym & Fitness Center',
            capacity: gym.capacity !== undefined && gym.capacity !== null ? String(gym.capacity) : '',
            openTime: gym.openTime || '06:00 AM',
            closeTime: gym.closeTime || '10:00 PM',
            contactEmail: gym.contactEmail || '',
            phone: gym.phone || '',
            alternatePhone: gym.alternatePhone || '',
            about: gym.about || gym.description || '',
            address: gym.location?.address || (typeof gym.location === 'string' ? gym.location : '') || '',
            pincode: gym.pincode || '',
            facilities: Array.isArray(gym.facilities) ? [...gym.facilities] : [],
            shifts: Array.isArray(gym.shifts) ? [...gym.shifts] : [],
            equipmentList: Array.isArray(gym.equipmentList) ? [...gym.equipmentList] : []
        });
        setIsDirty(false);
        setFormErrors({});
    }, []);

    // Fetch Gym and Reviews
    const fetchGymProfile = useCallback(async () => {
        try {
            setLoading(true);
            let currentGym = initialGym;
            if (!currentGym?.id) {
                const data = await api.get('/gymdb/gym/owner/me');
                if (data.success && Array.isArray(data.gyms) && data.gyms.length > 0) {
                    const activeBranchId = localStorage.getItem('active_branch_id');
                    currentGym = activeBranchId 
                        ? data.gyms.find(g => String(g.id) === String(activeBranchId)) || data.gyms[0]
                        : data.gyms[0];
                    setGymData(currentGym);
                }
            } else {
                setGymData(currentGym);
            }

            if (currentGym) {
                populateFormFromGym(currentGym);
            }

            if (currentGym?.id) {
                setLoadingReviews(true);
                try {
                    const ratingsData = await api.get(`/gymdb/ratings/gym/${currentGym.id}`);
                    if (ratingsData?.success && Array.isArray(ratingsData.ratings)) {
                        setReviews(ratingsData.ratings);
                    }
                } catch (ratingErr) {
                    console.warn('Ratings fetch non-fatal:', ratingErr.message);
                } finally {
                    setLoadingReviews(false);
                }
            }
        } catch (err) {
            console.error('Error fetching gym profile:', err);
            showAlert({
                title: 'Data Load Warning',
                message: err.message || 'Could not refresh facility data from server.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, [initialGym, populateFormFromGym, showAlert]);

    useEffect(() => {
        fetchGymProfile();
    }, [fetchGymProfile]);

    // Update form field
    const updateField = useCallback((name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);

        setFormErrors(prev => {
            if (!prev[name]) return prev;
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    }, []);

    // Sanitized inputs
    const handlePhoneChange = useCallback((value) => {
        const clean = value.replace(/\D/g, '').slice(0, 10);
        updateField('phone', clean);
    }, [updateField]);

    const handleAltPhoneChange = useCallback((value) => {
        const clean = value.replace(/\D/g, '').slice(0, 10);
        updateField('alternatePhone', clean);
    }, [updateField]);

    const handlePincodeChange = useCallback((value) => {
        const clean = value.replace(/\D/g, '').slice(0, 6);
        updateField('pincode', clean);
    }, [updateField]);

    const handleCapacityChange = useCallback((value) => {
        const clean = value.replace(/\D/g, '').slice(0, 5);
        updateField('capacity', clean);
    }, [updateField]);

    // Facilities Management
    const toggleFacility = useCallback((facilityName) => {
        setForm(prev => {
            const exists = prev.facilities.includes(facilityName);
            const nextFacilities = exists
                ? prev.facilities.filter(f => f !== facilityName)
                : [...prev.facilities, facilityName];
            return { ...prev, facilities: nextFacilities };
        });
        setIsDirty(true);
    }, []);

    const addCustomFacility = useCallback((customName) => {
        const trimmed = (customName || '').trim();
        if (!trimmed) return;
        setForm(prev => {
            if (prev.facilities.includes(trimmed)) return prev;
            return { ...prev, facilities: [...prev.facilities, trimmed] };
        });
        setIsDirty(true);
    }, []);

    const removeFacility = useCallback((facilityName) => {
        setForm(prev => ({
            ...prev,
            facilities: prev.facilities.filter(f => f !== facilityName)
        }));
        setIsDirty(true);
    }, []);

    // Equipment Management
    const addEquipmentItem = useCallback((item) => {
        const trimmed = (item || '').trim();
        if (!trimmed) return;
        setForm(prev => {
            if (prev.equipmentList.includes(trimmed)) return prev;
            return { ...prev, equipmentList: [...prev.equipmentList, trimmed] };
        });
        setIsDirty(true);
    }, []);

    const removeEquipmentItem = useCallback((index) => {
        setForm(prev => ({
            ...prev,
            equipmentList: prev.equipmentList.filter((_, i) => i !== index)
        }));
        setIsDirty(true);
    }, []);

    const togglePresetEquipment = useCallback((itemName) => {
        setForm(prev => {
            const exists = prev.equipmentList.includes(itemName);
            const nextList = exists
                ? prev.equipmentList.filter(item => item !== itemName)
                : [...prev.equipmentList, itemName];
            return { ...prev, equipmentList: nextList };
        });
        setIsDirty(true);
    }, []);

    // Shift Management
    const openAddShiftModal = useCallback((preferredDay = 'Monday') => {
        setEditingShiftIndex(null);
        setShiftModalData({
            day: preferredDay,
            name: 'Standard Slot',
            startTime: '06:00',
            endTime: '10:00',
            gender: 'unisex',
            capacity: Number(form.capacity) || 25
        });
        setShiftModalOpen(true);
    }, [form.capacity]);

    const openEditShiftModal = useCallback((index) => {
        const shiftToEdit = form.shifts[index];
        if (!shiftToEdit) return;
        setEditingShiftIndex(index);
        setShiftModalData({
            day: shiftToEdit.day || 'Monday',
            name: shiftToEdit.name || 'Slot',
            startTime: shiftToEdit.startTime || '06:00',
            endTime: shiftToEdit.endTime || '10:00',
            gender: shiftToEdit.gender || 'unisex',
            capacity: shiftToEdit.capacity || 25
        });
        setShiftModalOpen(true);
    }, [form.shifts]);

    const closeShiftModal = useCallback(() => {
        setShiftModalOpen(false);
        setEditingShiftIndex(null);
    }, []);

    const saveShiftFromModal = useCallback(() => {
        if (!shiftModalData.day || !shiftModalData.startTime || !shiftModalData.endTime) {
            showAlert({
                title: 'Invalid Shift',
                message: 'Please provide Day, Start Time, and End Time for the shift.',
                type: 'warning'
            });
            return;
        }

        const formattedShift = {
            day: shiftModalData.day,
            name: shiftModalData.name || 'Standard Slot',
            startTime: shiftModalData.startTime,
            endTime: shiftModalData.endTime,
            gender: shiftModalData.gender || 'unisex',
            capacity: Number(shiftModalData.capacity) || 0
        };

        setForm(prev => {
            const updated = [...prev.shifts];
            if (editingShiftIndex !== null && editingShiftIndex >= 0) {
                updated[editingShiftIndex] = formattedShift;
            } else {
                updated.push(formattedShift);
            }
            return { ...prev, shifts: updated };
        });

        setIsDirty(true);
        closeShiftModal();
    }, [shiftModalData, editingShiftIndex, showAlert, closeShiftModal]);

    const removeShift = useCallback((index) => {
        setForm(prev => ({
            ...prev,
            shifts: prev.shifts.filter((_, i) => i !== index)
        }));
        setIsDirty(true);
    }, []);

    // Save Profile Handler
    const handleSaveProfile = useCallback(async (customOverrides = {}) => {
        const payloadToValidate = { ...form, ...customOverrides };
        const validationErrors = validateProfileData(payloadToValidate);

        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            showAlert({
                title: 'Validation Error',
                message: 'Please review the highlighted fields in the form.',
                type: 'warning'
            });
            return false;
        }

        if (!gymData?.id) {
            showAlert({
                title: 'Cannot Save',
                message: 'No active facility ID found to update.',
                type: 'error'
            });
            return false;
        }

        setSaving(true);
        try {
            const sanitizedShifts = (payloadToValidate.shifts || []).map(({ _id, __v, ...rest }) => ({
                day: rest.day,
                name: rest.name,
                startTime: rest.startTime,
                endTime: rest.endTime,
                gender: rest.gender,
                capacity: Number(rest.capacity) || 0
            }));

            const cleanEquipment = (payloadToValidate.equipmentList || []).filter(item => item && item.trim() !== '');

            const updatePayload = {
                name: payloadToValidate.name.trim(),
                gymSlogan: payloadToValidate.gymSlogan?.trim() || '',
                gymType: payloadToValidate.gymType || 'Gym & Fitness Center',
                capacity: payloadToValidate.capacity ? Number(payloadToValidate.capacity) : 0,
                openTime: payloadToValidate.openTime || '06:00 AM',
                closeTime: payloadToValidate.closeTime || '10:00 PM',
                contactEmail: payloadToValidate.contactEmail?.trim() || '',
                phone: payloadToValidate.phone?.trim() || '',
                alternatePhone: payloadToValidate.alternatePhone?.trim() || '',
                about: payloadToValidate.about?.trim() || '',
                pincode: payloadToValidate.pincode?.trim() || '',
                location: {
                    address: payloadToValidate.address?.trim() || ''
                },
                facilities: payloadToValidate.facilities || [],
                shifts: sanitizedShifts,
                equipmentList: cleanEquipment
            };

            const response = await api.put(`/gymdb/gym/${gymData.id}`, updatePayload);
            if (response.success && response.gym) {
                setGymData(response.gym);
                populateFormFromGym(response.gym);
                showAlert({
                    title: 'Facility Profile Saved',
                    message: 'Your facility information and operational parameters have been updated successfully.',
                    type: 'success'
                });
                return true;
            } else {
                throw new Error(response.message || 'Server did not confirm changes');
            }
        } catch (err) {
            console.error('Profile save error:', err);
            showAlert({
                title: 'Update Failed',
                message: err.message || 'Unable to update facility profile. Please try again.',
                type: 'error'
            });
            return false;
        } finally {
            setSaving(false);
        }
    }, [form, gymData?.id, populateFormFromGym, showAlert]);

    // Media Upload Handlers
    const handleMediaUpload = useCallback(async (field, file) => {
        if (!file) return;
        if (!gymData?.id) {
            showAlert({ title: 'Error', message: 'No facility loaded', type: 'error' });
            return;
        }

        if (field === 'bannerPhotoUrl') setUploadingBanner(true);
        else if (field === 'logoUrl') setUploadingLogo(true);
        else setUploadingPhotos(prev => ({ ...prev, [field]: true }));

        try {
            const uploadRes = await api.upload(file);
            if (uploadRes?.success && uploadRes?.url) {
                const currentMedia = { ...(gymData.media || {}) };
                delete currentMedia.id;
                delete currentMedia.__v;

                const newMedia = {
                    ...currentMedia,
                    [field]: uploadRes.url
                };

                const mediaRes = await api.post(`/gymdb/gym/${gymData.id}/media`, newMedia);
                if (mediaRes.success && mediaRes.media) {
                    setGymData(prev => ({ ...prev, media: mediaRes.media }));
                    showAlert({
                        title: 'Media Updated',
                        message: 'Image has been uploaded and linked to your facility profile.',
                        type: 'success'
                    });
                }
            } else {
                throw new Error(uploadRes?.message || 'File upload failed');
            }
        } catch (err) {
            console.error('Media upload error:', err);
            showAlert({
                title: 'Upload Failed',
                message: err.message || 'Could not upload selected file. Ensure it is a valid PNG/JPEG under 10MB.',
                type: 'error'
            });
        } finally {
            if (field === 'bannerPhotoUrl') setUploadingBanner(false);
            else if (field === 'logoUrl') setUploadingLogo(false);
            else setUploadingPhotos(prev => ({ ...prev, [field]: false }));
        }
    }, [gymData?.id, gymData.media, showAlert]);

    // Average rating calculation
    const reviewStats = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
        }
        const total = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const rounded = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
            breakdown[rounded] = (breakdown[rounded] || 0) + 1;
        });
        return {
            average: (total / reviews.length).toFixed(1),
            count: reviews.length,
            breakdown
        };
    }, [reviews]);

    return {
        gymData,
        companyInfo,
        loading,
        saving,
        activeTab,
        setActiveTab: handleTabChange,
        tabDirection,
        form,
        formErrors,
        isDirty,
        updateField,
        handlePhoneChange,
        handleAltPhoneChange,
        handlePincodeChange,
        handleCapacityChange,
        resetForm: () => populateFormFromGym(gymData),
        toggleFacility,
        addCustomFacility,
        removeFacility,
        addEquipmentItem,
        removeEquipmentItem,
        togglePresetEquipment,
        shiftModalOpen,
        shiftModalData,
        setShiftModalData,
        editingShiftIndex,
        openAddShiftModal,
        openEditShiftModal,
        closeShiftModal,
        saveShiftFromModal,
        removeShift,
        uploadingBanner,
        uploadingLogo,
        uploadingPhotos,
        handleMediaUpload,
        reviews,
        loadingReviews,
        reviewStats,
        handleSaveProfile,
        fetchGymProfile
    };
}

