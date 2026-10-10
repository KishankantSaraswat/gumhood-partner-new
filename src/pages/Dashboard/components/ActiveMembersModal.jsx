
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import MemberDetailsModal from './MemberDetailsModal';

const ActiveMembersModal = ({ gymId, onClose }) => {
    const [filterType, setFilterType] = useState('active'); // 'active' | 'expired'
    const [selectedMemberPlanId, setSelectedMemberPlanId] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/gymdb/dashboard/members/list/${gymId}?type=${filterType}`);
                if (response.success) {
                    setMembers(response.members);
                } else {
                    setError('Failed to fetch members');
                }
            } catch (err) {
                console.error("Error fetching active members:", err);
                setError('Error loading members');
            } finally {
                setLoading(false);
            }
        };

        if (gymId) {
            fetchMembers();
        }
    }, [gymId, filterType]);

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-100 bg-white z-10 gap-4 sm:gap-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <i className="fas fa-users-viewfinder text-indigo-600"></i>
                            {filterType === 'active' ? 'Active Members' : 'Expired Members'}
                        </h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                            Total {filterType === 'active' ? 'Active' : 'Expired'}: {loading ? '...' : members.length}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setFilterType('active')}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'active' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterType('expired')}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filterType === 'expired' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Expired
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors flex-shrink-0 ml-auto sm:ml-0"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-500 font-medium">Loading members list...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-exclamation-triangle text-2xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Unable to load members</h3>
                            <p className="text-slate-500 text-sm mt-1">{error}</p>
                        </div>
                    ) : filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                            <i className="fas fa-users-slash text-4xl text-slate-400 mb-4"></i>
                            <p className="text-slate-500 font-bold uppercase tracking-wider">No {filterType} members found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 divide-y divide-slate-100 bg-white">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.planId}
                                    onClick={() => setSelectedMemberPlanId(member.planId)}
                                    className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center cursor-pointer group"
                                >
                                    {/* Member Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-100">
                                            {member.photo ? (
                                                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                                    {member.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <i className="fas fa-phone text-[10px]"></i>
                                                    {member.phone}
                                                </span>
                                                {member.gender && (
                                                    <span className="flex items-center gap-1 capitalize px-2 py-0.5 bg-slate-100 rounded-full">
                                                        <i className={`fas fa-${member.gender.toLowerCase() === 'male' ? 'mars' : 'venus'}`}></i>
                                                        {member.gender}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plan Info */}
                                    <div className="flex flex-row sm:flex-col justify-between w-full sm:w-auto sm:text-right gap-2 sm:gap-0">
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md inline-block mb-1 ${filterType === 'expired' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                                                }`}>
                                                {member.planName}
                                            </p>
                                            <div className="text-xs text-slate-500 font-medium">
                                                {filterType === 'expired' ? 'Expired on:' : 'Expires:'} <span className="text-slate-700 font-bold">{new Date(member.expiryDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="sm:mt-2">
                                            {filterType === 'active' ? (
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${member.remainingDays <= 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                                    }`}>
                                                    {member.remainingDays} days left
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {selectedMemberPlanId && (
                <MemberDetailsModal
                    planId={selectedMemberPlanId}
                    onClose={() => setSelectedMemberPlanId(null)}
                />
            )}
        </div>
    );
};

export default ActiveMembersModal;
