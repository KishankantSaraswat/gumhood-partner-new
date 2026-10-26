import React, { useState } from 'react';

const PaymentContactInfoSection = ({ gym }) => {
    const [formData, setFormData] = useState({
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        let newErrors = {};

        // Required fields
        if (!formData.upiId.trim()) newErrors.upiId = 'UPI ID is required';
        else if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(formData.upiId)) {
            newErrors.upiId = 'Invalid UPI ID format (e.g. name@bank)';
        }

        if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account Number is required';
        else if (!/^\d{9,18}$/.test(formData.accountNumber)) {
            newErrors.accountNumber = 'Account Number should be 9-18 digits';
        }

        if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC Code is required';
        else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
            newErrors.ifscCode = 'Invalid IFSC format (e.g. SBIN0001234)';
        }

        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account Holder Name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSendToSupport = () => {
        if (!validateForm()) return;

        const ownerName = JSON.parse(localStorage.getItem('user'))?.name || 'Gym Owner';
        const subject = `bank details submission`;
        const body = `bank info Create Deatils request\ngym name: ${gym.name}\ngym id: ${gym.id}\nUPI id: ${formData.upiId}\naccount number: ${formData.accountNumber}\nifsc code: ${formData.ifscCode}\naccount holder name: ${formData.accountHolderName}\n\nbest regards,\n${ownerName}`;

        window.location.href = `mailto:support@gymshood.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Header Profile-style banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-400 p-8 flex items-end">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600">
                            <i className="fas fa-university text-2xl"></i>
                        </div>
                        <div className="text-white">
                            <h2 className="text-2xl font-black">Payment Contact Info</h2>
                            <p className="text-indigo-100 text-xs font-bold tracking-widest">Bank & UPI Details</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* UPI ID */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1">UPI ID</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <i className="fas fa-qrcode text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    name="upiId"
                                    placeholder="e.g. gymname@upi"
                                    value={formData.upiId}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all outline-none ${errors.upiId ? 'border-red-200 focus:border-red-300' : 'border-transparent focus:border-indigo-100 focus:bg-white'
 }`}
                                />
                            </div>
                            {errors.upiId && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.upiId}</p>}
                        </div>

                        {/* Account Holder Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1">Account Holder Name</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <i className="fas fa-user-circle text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    name="accountHolderName"
                                    placeholder="Full Name as per Bank"
                                    value={formData.accountHolderName}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all outline-none ${errors.accountHolderName ? 'border-red-200 focus:border-red-300' : 'border-transparent focus:border-indigo-100 focus:bg-white'
 }`}
                                />
                            </div>
                            {errors.accountHolderName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.accountHolderName}</p>}
                        </div>

                        {/* Account Number */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1">Account Number</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <i className="fas fa-credit-card text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    placeholder="e.g. 1234567890"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all outline-none ${errors.accountNumber ? 'border-red-200 focus:border-red-300' : 'border-transparent focus:border-indigo-100 focus:bg-white'
 }`}
                                />
                            </div>
                            {errors.accountNumber && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.accountNumber}</p>}
                        </div>

                        {/* IFSC Code */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] ml-1">IFSC Code</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                    <i className="fas fa-landmark text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    placeholder="e.g. SBIN0001234"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-50 border-2 rounded-2xl py-4 pl-12 pr-4 text-slate-900 font-bold placeholder:text-slate-300 transition-all outline-none ${errors.ifscCode ? 'border-red-200 focus:border-red-300' : 'border-transparent focus:border-indigo-100 focus:bg-white'
 }`}
                                />
                            </div>
                            {errors.ifscCode && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ifscCode}</p>}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-10 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <i className="fas fa-info-circle"></i>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-1">Important Note</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Please ensure all details are correct. These details will be sent to our support team to update your payment profile. Incorrect details may lead to settlement delays.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSendToSupport}
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm tracking-[0.2em] hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 group"
                    >
                        <span>Send to Support</span>
                        <i className="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentContactInfoSection;
