import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
    Building2, MapPin, Sparkles, Clock, Dumbbell, 
    Camera, Star, Save, RotateCcw, Loader2 
} from 'lucide-react';
import { useProfileLogic } from './profile.logic';
import ProfileHeader from './components/ProfileHeader';
import GeneralSection from './components/GeneralSection';
import LocationSection from './components/LocationSection';
import AmenitiesSection from './components/AmenitiesSection';
import ShiftsSection from './components/ShiftsSection';
import EquipmentSection from './components/EquipmentSection';
import MediaSection from './components/MediaSection';
import ReviewsSection from './components/ReviewsSection';
import ShiftModal from './components/ShiftModal';

export const Profile = ({ gym }) => {
    const {
        gymData,
        companyInfo,
        loading,
        saving,
        activeTab,
        setActiveTab,
        tabDirection,
        form,
        formErrors,
        isDirty,
        updateField,
        handlePhoneChange,
        handleAltPhoneChange,
        handlePincodeChange,
        handleCapacityChange,
        resetForm,
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
        handleSaveProfile
    } = useProfileLogic(gym);

    const [customAmenityInput, setCustomAmenityInput] = useState('');
    const [customEquipmentInput, setCustomEquipmentInput] = useState('');
    const [equipmentSearchQuery, setEquipmentSearchQuery] = useState('');
    const [selectedShiftDayFilter, setSelectedShiftDayFilter] = useState('ALL');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[350px] p-6 space-y-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Loading facility profile...
                </p>
            </div>
        );
    }

    const filteredEquipmentList = (form.equipmentList || []).filter(item => 
        !equipmentSearchQuery.trim() || item.toLowerCase().includes(equipmentSearchQuery.toLowerCase().trim())
    );

    const filteredShifts = (form.shifts || []).filter(shift => {
        if (selectedShiftDayFilter === 'ALL') return true;
        return (shift.day || '').toLowerCase() === selectedShiftDayFilter.toLowerCase();
    });

    const photoSlots = [
        { id: 'frontPhotoUrl', title: 'Main Front Facade', desc: 'Exterior front view of the center' },
        { id: 'receptionPhotoUrl', title: 'Reception & Lobby', desc: 'Front desk and greeting area' },
        { id: 'workoutFloorPhotoUrl', title: 'Workout Floor', desc: 'Cardio, machines, and free weights' },
        { id: 'lockerRoomPhotoUrl', title: 'Locker & Washrooms', desc: 'Changing rooms and steam baths' },
        { id: 'trainerTeamPhotoUrl', title: 'Trainers & Staff', desc: 'Certified coaching staff' }
    ];

    const tabItems = [
        { id: 'general', label: 'General & Operations', icon: Building2 },
        { id: 'location', label: 'Location & Address', icon: MapPin },
        { id: 'facilities', label: 'Amenities & Features', icon: Sparkles, count: form.facilities?.length || 0 },
        { id: 'shifts', label: 'Operating Shifts', icon: Clock, count: form.shifts?.length || 0 },
        { id: 'equipment', label: 'Equipment Inventory', icon: Dumbbell, count: form.equipmentList?.length || 0 },
        { id: 'media', label: 'Media Gallery', icon: Camera },
        { id: 'reviews', label: 'Member Reviews', icon: Star, count: reviewStats.count }
    ];

    return (
        <div className="w-full space-y-4 pb-12">
            {/* Header Hero Card with Integrated Animated Tabs */}
            <ProfileHeader
                gymData={gymData}
                companyInfo={companyInfo}
                form={form}
                reviewStats={reviewStats}
                isDirty={isDirty}
                saving={saving}
                uploadingBanner={uploadingBanner}
                uploadingLogo={uploadingLogo}
                handleMediaUpload={handleMediaUpload}
                handleSaveProfile={handleSaveProfile}
                resetForm={resetForm}
                tabItems={tabItems}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Sub-Sections with Fluid Ease-In / Ease-Out Side Animation */}
            <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                    <GeneralSection
                        key="general"
                        form={form}
                        formErrors={formErrors}
                        updateField={updateField}
                        handlePhoneChange={handlePhoneChange}
                        handleAltPhoneChange={handleAltPhoneChange}
                        handleCapacityChange={handleCapacityChange}
                        companyInfo={companyInfo}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'location' && (
                    <LocationSection
                        key="location"
                        form={form}
                        formErrors={formErrors}
                        updateField={updateField}
                        handlePincodeChange={handlePincodeChange}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'facilities' && (
                    <AmenitiesSection
                        key="facilities"
                        form={form}
                        toggleFacility={toggleFacility}
                        customAmenityInput={customAmenityInput}
                        setCustomAmenityInput={setCustomAmenityInput}
                        addCustomFacility={addCustomFacility}
                        removeFacility={removeFacility}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'shifts' && (
                    <ShiftsSection
                        key="shifts"
                        form={form}
                        filteredShifts={filteredShifts}
                        selectedShiftDayFilter={selectedShiftDayFilter}
                        setSelectedShiftDayFilter={setSelectedShiftDayFilter}
                        openAddShiftModal={openAddShiftModal}
                        openEditShiftModal={openEditShiftModal}
                        removeShift={removeShift}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'equipment' && (
                    <EquipmentSection
                        key="equipment"
                        form={form}
                        filteredEquipmentList={filteredEquipmentList}
                        equipmentSearchQuery={equipmentSearchQuery}
                        setEquipmentSearchQuery={setEquipmentSearchQuery}
                        customEquipmentInput={customEquipmentInput}
                        setCustomEquipmentInput={setCustomEquipmentInput}
                        addEquipmentItem={addEquipmentItem}
                        removeEquipmentItem={removeEquipmentItem}
                        togglePresetEquipment={togglePresetEquipment}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'media' && (
                    <MediaSection
                        key="media"
                        gymData={gymData}
                        photoSlots={photoSlots}
                        uploadingPhotos={uploadingPhotos}
                        handleMediaUpload={handleMediaUpload}
                        direction={tabDirection}
                    />
                )}

                {activeTab === 'reviews' && (
                    <ReviewsSection
                        key="reviews"
                        reviews={reviews}
                        loadingReviews={loadingReviews}
                        reviewStats={reviewStats}
                        direction={tabDirection}
                    />
                )}
            </AnimatePresence>

            {/* Add / Edit Operating Shift Modal */}
            <ShiftModal
                isOpen={shiftModalOpen}
                editingIndex={editingShiftIndex}
                data={shiftModalData}
                onChange={setShiftModalData}
                onClose={closeShiftModal}
                onSave={saveShiftFromModal}
            />

            {/* Sticky Floating Save Bar when isDirty */}
            {isDirty && (
                <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-slide-up">
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xl border border-amber-500/40 flex items-center justify-between gap-3 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-bold text-slate-200">
                                Unsaved changes in facility profile.
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSaveProfile()}
                                disabled={saving}
                                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
                </div>
            )}
        </div>
    );
};

export default Profile;

