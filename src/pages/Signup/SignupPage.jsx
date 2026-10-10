import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowLeft, ArrowRight, Shield, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../context/AlertContext';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import SuccessPage from './SuccessPage';

const SignupPage = () => {
    const { showAlert } = useAlert();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [registrationSessionId, setRegistrationSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',

        alternatePhone: '',
        address: '',
        about: '',
        gymSlogan: '',
        capacity: '',
        openTime: '06:00',
        closeTime: '22:00',
        gymType: 'unisex',
        facilities: [],
        photos: {},
        documents: {
            panUrl: ''
        },
        coordinates: [] // [longitude, latitude]
    });
    const totalSteps = 5;
    const navigate = useNavigate();

    const updateData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const stepNames = ["Owner & Gym Info", "Gym Type", "Facilities", "Photos", "Documents"];

    const nextStep = () => {
        // Validation for Step 1
        if (currentStep === 1) {
            const requiredFields = ['name', 'ownerName', 'email', 'phone', 'password', 'about', 'gymSlogan', 'capacity', 'openTime', 'closeTime', 'address'];
            const missingFields = requiredFields.filter(field => !formData[field]);

            if (missingFields.length > 0) {
                showAlert({
                    title: 'Incomplete Information',
                    message: `Please fill in all mandatory fields before proceeding: ${missingFields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}.`,
                    type: 'warning'
                });
                return;
            }

            if (!formData.coordinates || formData.coordinates.length !== 2) {
                showAlert({
                    title: 'Location Required',
                    message: "Please use 'Get Current Location' to help us map your gym's presence.",
                    type: 'warning'
                });
                return;
            }
        }

        // Validation for Step 5 (Documents)
        if (currentStep === 5) {
            if (!formData.documents?.panUrl) {
                showAlert({
                    title: 'Document Missing',
                    message: "A PAN Card upload is mandatory to verify your business identity.",
                    type: 'warning'
                });
                return;
            }
            if (!formData.documents?.idProofUrl) {
                showAlert({
                    title: 'Identity Proof Required',
                    message: "Please upload the Owner's ID proof to complete the verification process.",
                    type: 'warning'
                });
                return;
            }
        }

        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            submitRegistration();
        }
    };

    const submitRegistration = async () => {
        console.log("🚀 Starting unified registration submission...");
        setLoading(true);

        try {
            // 1. Account Creation Trigger
            const regResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.ownerName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    role: 'GymOwner'
                })
            });

            const regData = await regResponse.json();
            if (!regData.success) throw new Error(regData.message || "Account creation failed");

            setRegistrationSessionId(regData.registrationSessionId);
            setOtpStep(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("❌ Registration error caught:", error);
            showAlert({
                title: 'Registration Error',
                message: error.message || "We encountered a problem while setting up your account. Please try again.",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const verifyAndComplete = async () => {
        setLoading(true);
        try {
            // 2. Verify OTP
            const otpResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp,
                    registrationSessionId,
                    role: 'GymOwner'
                })
            });

            const otpData = await otpResponse.json();
            if (!otpData.success) throw new Error(otpData.message || "OTP Verification failed");

            const authToken = otpData.token;
            localStorage.setItem('gymshood_token', authToken);
            localStorage.setItem('user', JSON.stringify(otpData.user));

            const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/gymdb`;
            const fetchOptions = (body) => ({
                method: body ? (body._method || 'POST') : 'GET',
                headers: {
                    'Content-Type': body ? 'application/json' : undefined,
                    'Authorization': `Bearer ${authToken}`
                },
                credentials: 'include',
                body: body ? JSON.stringify(body) : undefined
            });

            // 3. Register Gym
            const gymRegResponse = await fetch(`${API_BASE}/gym/register`, fetchOptions({
                name: formData.name,
                location: formData.address,
                about: formData.about,
                gymSlogan: formData.gymSlogan,
                capacity: parseInt(formData.capacity),
                openTime: formData.openTime,
                closeTime: formData.closeTime,
                contactEmail: formData.email,
                phone: formData.phone,
                alternatePhone: formData.alternatePhone,
                gymType: formData.gymType,
                facilities: formData.facilities,
                coordinates: formData.coordinates,
                onboardingStep: 3
            }));

            const gymData = await gymRegResponse.json();
            if (!gymData.success) throw new Error(gymData.message || "Gym registration failed");

            const gymId = gymData.gym._id;

            // 4. Upload Media
            await fetch(`${API_BASE}/gym/${gymId}/media`, fetchOptions({ ...formData.photos }));

            // 5. Upload Documents
            await fetch(`${API_BASE}/gyms/verification`, {
                ...fetchOptions({ ...formData.documents }),
                method: 'PUT'
            });

            // 6. Finalize
            await fetch(`${API_BASE}/gym/${gymId}`, {
                ...fetchOptions({ onboardingStep: 5, onboardingStatus: 'completed' }),
                method: 'PUT'
            });

            setIsSubmitted(true);
            setOtpStep(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error("❌ Completion error:", error);
            showAlert({
                title: 'Verification Failed',
                message: error.message || "We could not complete your registration. Please check the OTP and try again.",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/partner')}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white transform hover:scale-110 transition-transform">
                            <Dumbbell className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900">Gymshood</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                localStorage.removeItem('gymshood_token');
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-100 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            Reset Session
                        </button>
                        <button onClick={() => navigate('/partner')} className="text-slate-500 hover:text-slate-900 text-sm font-medium">Save & Exit</button>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 mt-8">
                {otpStep ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-indigo-100 animate-fade-in">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Verify Email</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                            We've sent a verification code to <span className="font-bold text-indigo-600">{formData.email}</span>. Please enter it to complete your registration.
                        </p>
                        <div className="max-w-xs mx-auto space-y-4">
                            <input
                                type="text"
                                maxLength={6}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                            />
                            <button
                                onClick={verifyAndComplete}
                                disabled={loading || otp.length < 6}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? 'Verifying...' : 'Verify & Complete Registration'}
                            </button>
                            <button
                                onClick={() => setOtpStep(false)}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700"
                            >
                                Back to Form
                            </button>
                        </div>
                    </div>
                ) : isSubmitted ? (
                    <SuccessPage />
                ) : (
                    <>
                        <div className="mb-8 animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-slate-900">Step {currentStep} of {totalSteps}</span>
                                <span className="text-sm text-slate-500 font-medium">{stepNames[currentStep - 1]}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10 animate-fade-in-up">
                            {currentStep === 1 && <Step1 data={formData} updateData={updateData} />}
                            {currentStep === 2 && <Step2 data={formData} updateData={updateData} />}
                            {currentStep === 3 && <Step3 data={formData} updateData={updateData} />}
                            {currentStep === 4 && <Step4 data={formData} updateData={updateData} />}
                            {currentStep === 5 && <Step5 data={formData} updateData={updateData} />}

                            <div className="flex items-center justify-between mt-8">
                                {currentStep > 1 && (
                                    <button
                                        onClick={prevStep}
                                        disabled={loading}
                                        className="bg-white border border-slate-200 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous
                                    </button>
                                )}
                                <button
                                    onClick={nextStep}
                                    disabled={loading}
                                    className="ml-auto bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? 'Processing...' : currentStep === totalSteps ? 'Submit Registration' : 'Next Step'}
                                    {!loading && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SignupPage;
