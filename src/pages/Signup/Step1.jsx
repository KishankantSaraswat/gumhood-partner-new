import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

const Step1 = ({ data, updateData }) => {
    const { showAlert } = useAlert();
    const [locLoading, setLocLoading] = useState(false);
    const [locError, setLocError] = useState(null);
    const [accuracy, setAccuracy] = useState(null);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showAlert({
                title: 'Browser Limitation',
                message: 'Geolocation services are not supported by your current browser. Please try a modern one.',
                type: 'warning'
            });
            return;
        }

        setLocLoading(true);
        setLocError(null);
        setAccuracy(null);

        const success = (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log("📍 Location captured:", { latitude, longitude, accuracy });

            updateData({ coordinates: [longitude, latitude] });
            setAccuracy(Math.round(accuracy)); // Store accuracy in meters
            setLocLoading(false);

            if (accuracy > 1000) {
                setLocError("Location accuracy is low (" + Math.round(accuracy / 1000) + "km). Please try again or ensure GPS is enabled.");
            }
        };

        const error = (err) => {
            console.error("Error getting location:", err);
            setLocLoading(false);

            let msg = "Unable to retrieve your location.";
            if (err.code === 1) msg = "Location permission denied. Please enable it in browser settings.";
            else if (err.code === 2) msg = "Location unavailable. Check your device GPS/WiFi.";
            else if (err.code === 3) msg = "Location request timed out. Try again.";

            setLocError(msg);
            showAlert({
                title: 'Location Services',
                message: msg,
                type: 'error'
            });
        };

        // Try high accuracy first with a timeout
        navigator.geolocation.getCurrentPosition(success, (err) => {
            // If high accuracy fails, try low accuracy (IP based) as fallback
            console.warn("High accuracy failed, trying low accuracy...", err.message);
            navigator.geolocation.getCurrentPosition(success, error, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0
            });
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Gym Information</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gym Name</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="e.g. Iron Paradise Fitness"
                        value={data.name}
                        onChange={(e) => updateData({ name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Gym Description (About)</label>
                    <textarea
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Tell us about your gym, facilities, and mission..."
                        value={data.about}
                        onChange={(e) => updateData({ about: e.target.value })}
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Owner / Manager Name <span className="text-indigo-600">(Your Account Name)</span></label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            placeholder="e.g. Anoop Kumar"
                            value={data.ownerName}
                            onChange={(e) => updateData({ ownerName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Account Email <span className="text-indigo-600">(Used for Login)</span></label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            placeholder="name@business.com"
                            value={data.email}
                            onChange={(e) => updateData({ email: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Login Password <span className="text-slate-400 font-normal">(6-15 chars)</span></label>
                        <input
                            required
                            type="password"
                            className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            placeholder="••••••••"
                            minLength={6}
                            maxLength={15}
                            value={data.password}
                            onChange={(e) => updateData({ password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Account phone <span className="text-slate-400 font-normal">(10 digits)</span></label>
                        <input
                            required
                            type="tel"
                            pattern="[0-9]*"
                            className="w-full px-4 py-3 bg-white border-2 border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                            placeholder="9876543210"
                            value={data.phone}
                            onChange={(e) => updateData({ phone: e.target.value.replace(/\D/g, '') })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Gym Slogan</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. Get fit with us"
                            value={data.gymSlogan}
                            onChange={(e) => updateData({ gymSlogan: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Alternate Phone <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <input
                            type="tel"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="+91"
                            value={data.alternatePhone}
                            onChange={(e) => updateData({ alternatePhone: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Capacity</label>
                        <input
                            type="number"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. 50"
                            value={data.capacity}
                            onChange={(e) => updateData({ capacity: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Open Time</label>
                        <input
                            type="time"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={data.openTime}
                            onChange={(e) => updateData({ openTime: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Close Time</label>
                        <input
                            type="time"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={data.closeTime}
                            onChange={(e) => updateData({ closeTime: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Full Gym Address</label>

                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locLoading}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${data.coordinates?.length === 2
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100'
                                }`}
                        >
                            {locLoading ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 border-t-transparent"></div> : <MapPin className="w-3 h-3" />}
                            {data.coordinates?.length === 2 ? 'Update Location' : 'Get Current Location'}
                        </button>
                    </div>

                    <textarea
                        rows="3"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Street, Area, City, Pincode"
                        value={data.address}
                        onChange={(e) => updateData({ address: e.target.value })}
                    ></textarea>

                    {data.coordinates?.length === 2 && (
                        <div className="mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <p className="text-xs text-green-600 flex items-center gap-1 font-bold">
                                <MapPin className="w-3 h-3" />
                                Coordinates Captured: {data.coordinates[1].toFixed(6)}, {data.coordinates[0].toFixed(6)}
                            </p>
                            {accuracy && (
                                <p className={`text-[10px] mt-1 ${accuracy > 1000 ? 'text-orange-500 font-bold' : 'text-slate-500'}`}>
                                    Accuracy: ±{accuracy} meters {accuracy > 1000 && "(Low Accuracy - Try outdoors or enable GPS)"}
                                </p>
                            )}
                        </div>
                    )}

                    {locError && (
                        <p className="text-xs text-red-500 mt-2 font-medium">{locError}</p>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Step1;
