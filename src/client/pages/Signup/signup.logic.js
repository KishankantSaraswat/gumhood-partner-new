import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '@/context/AlertContext';

export const INITIAL_SIGNUP_FORM = {
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
};

export const STEP_NAMES = ["Owner & Gym Info", "Gym Type", "Facilities", "Photos", "Documents"];

export const useSignupLogic = () => {
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [registrationSessionId, setRegistrationSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(INITIAL_SIGNUP_FORM);
    const totalSteps = 5;

    const updateData = (data) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

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
            console.error("Registration error:", error);
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
            console.error("Completion error:", error);
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

    return {
        currentStep,
        isSubmitted,
        otpStep,
        otp,
        setOtp,
        loading,
        formData,
        totalSteps,
        stepNames: STEP_NAMES,
        progress,
        updateData,
        nextStep,
        prevStep,
        verifyAndComplete,
        navigate
    };
};

