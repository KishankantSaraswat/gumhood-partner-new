import React from 'react';
import { Dumbbell, ArrowLeft, ArrowRight, Shield, ShieldCheck } from 'lucide-react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import SuccessPage from './SuccessPage';
import { useSignupLogic } from './signup.logic';

const SignupPage = () => {
    const {
        currentStep,
        isSubmitted,
        otpStep,
        otp,
        setOtp,
        loading,
        formData,
        totalSteps,
        stepNames,
        progress,
        updateData,
        nextStep,
        prevStep,
        verifyAndComplete,
        navigate
    } = useSignupLogic();

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
                {/* Progress bar */}
                {!isSubmitted && (
                    <div className="w-full bg-slate-100 h-1">
                        <div
                            className="bg-indigo-600 h-1 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}
            </nav>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {isSubmitted ? (
                    <SuccessPage />
                ) : otpStep ? (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-md mx-auto text-center">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
                        <p className="text-slate-600 text-sm mb-6">
                            We've sent a 6-digit verification code to <span className="font-semibold text-slate-900">{formData.email}</span>. Please enter it below to complete registration.
                        </p>

                        <div className="mb-6">
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="w-full text-center tracking-widest text-2xl font-mono py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            />
                        </div>

                        <button
                            onClick={verifyAndComplete}
                            disabled={loading || otp.length !== 6}
                            className={`w-full py-3 rounded-xl text-white font-medium shadow-sm transition-all ${
 loading || otp.length !== 6
 ? 'bg-slate-300 cursor-not-allowed'
 : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow'
 }`}
                        >
                            {loading ? 'Verifying & Setting up Gym...' : 'Verify & Finish Registration'}
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Stepper Wizard Indicator */}
                        <div className="mb-8 hidden sm:block">
                            <div className="flex justify-between items-center relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10"></div>
                                {stepNames.map((name, index) => {
                                    const stepNumber = index + 1;
                                    const isCompleted = stepNumber < currentStep;
                                    const isCurrent = stepNumber === currentStep;

                                    return (
                                        <div key={name} className="flex flex-col items-center bg-slate-50 px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
 isCompleted ? 'bg-indigo-600 text-white' :
 isCurrent ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' :
 'bg-white text-slate-400 border border-slate-200'
 }`}>
                                                {stepNumber}
                                            </div>
                                            <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                                                {name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 mb-8">
                            <div className="mb-6 pb-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-indigo-600 tracking-wider">Step {currentStep} of {totalSteps}</span>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{stepNames[currentStep - 1]}</h1>
                                </div>
                            </div>

                            {/* Render Steps */}
                            {currentStep === 1 && <Step1 data={formData} updateData={updateData} />}
                            {currentStep === 2 && <Step2 data={formData} updateData={updateData} />}
                            {currentStep === 3 && <Step3 data={formData} updateData={updateData} />}
                            {currentStep === 4 && <Step4 data={formData} updateData={updateData} />}
                            {currentStep === 5 && <Step5 data={formData} updateData={updateData} />}

                            {/* Navigation controls */}
                            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1 || loading}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
 currentStep === 1 || loading
 ? 'text-slate-300 cursor-not-allowed'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
 }`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </button>

                                <button
                                    onClick={nextStep}
                                    disabled={loading}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition-all ${
 loading
 ? 'bg-indigo-400 cursor-not-allowed'
 : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow'
 }`}
                                >
                                    {loading ? (
                                        <span>Saving...</span>
                                    ) : currentStep === totalSteps ? (
                                        <>
                                            Complete Registration
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            Next Step
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SignupPage;
