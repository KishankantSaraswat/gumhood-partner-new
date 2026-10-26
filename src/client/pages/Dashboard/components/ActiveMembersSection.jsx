import React, { useState, useEffect } from 'react';
import api from '@/common/utils/api';
import MemberDetailsModal from './MemberDetailsModal';

const ActiveMembersSection = ({ gym, initialType = 'active' }) => {
    const [filterType, setFilterType] = useState(initialType); // 'active' | 'expired' | 'expiring'
    const [selectedMemberPlanId, setSelectedMemberPlanId] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const gymId = gym?.id;

    useEffect(() => {
        const fetchMembers = async () => {
            if (!gymId) return;
            setLoading(true);
            try {
                const response = await api.get(`/gymdb/dashboard/members/list/${gymId}?type=${filterType}`);
                if (response.success) {
                    setMembers(response.members);
                } else {
                    setError('Failed to fetch members');
                }
            } catch (err) {
                console.error("Error fetching members:", err);
                setError('Error loading members');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [gymId, filterType]);

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${filterType === 'active' ? 'bg-indigo-50 text-indigo-600' :
 filterType === 'expired' ? 'bg-red-50 text-red-600' :
 'bg-amber-50 text-amber-600'
 }`}>
                            <i className="fas fa-users-viewfinder"></i>
                        </div>
                        {filterType === 'active' ? 'Active Members' :
                            filterType === 'expired' ? 'Expired Members' :
                                'Expiring Soon'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                        Viewing {filterType === 'expiring' ? 'memberships ending within 7 days' : `all ${filterType} gym memberships`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex shadow-sm">
                        <button
                            onClick={() => setFilterType('active')}
                            className={`px-5 py-2 rounded-[0.9rem] text-sm font-black transition-all ${filterType === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            ACTIVE
                        </button>
                        <button
                            onClick={() => setFilterType('expiring')}
                            className={`px-5 py-2 rounded-[0.9rem] text-sm font-black transition-all ${filterType === 'expiring' ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            EXPIRING
                        </button>
                        <button
                            onClick={() => setFilterType('expired')}
                            className={`px-5 py-2 rounded-[0.9rem] text-sm font-black transition-all ${filterType === 'expired' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            EXPIRED
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <i className="fas fa-search text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
                    </div>
                    <input
                        type="text"
                        placeholder="Search members by name, phone or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                    />
                </div>
                <div className="bg-indigo-600 rounded-2xl p-4 flex items-center justify-between text-white shadow-lg shadow-indigo-200">
                    <div>
                        <p className="text-[10px] font-black tracking-widest opacity-80">Showing</p>
                        <h4 className="text-xl font-black">{filteredMembers.length} Members</h4>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <i className="fas fa-filter text-sm"></i>
                    </div>
                </div>
            </div>

            {/* Members Grid */}
            <div className="overflow-visible">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-slate-500 font-black tracking-widest text-xs mt-6">Fetching members...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-6">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 rotate-12 shadow-inner">
                            <i className="fas fa-exclamation-triangle text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h3>
                        <p className="text-slate-500 max-w-sm font-medium">{error}</p>
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-center px-6">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6 -rotate-12">
                            <i className="fas fa-user-slash text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No members found</h3>
                        <p className="text-slate-500 max-w-sm font-medium">Try adjusting your search or filters to see more results.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.planId}
                                onClick={() => setSelectedMemberPlanId(member.planId)}
                                className="group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity ${filterType === 'active' ? 'bg-indigo-500' :
 filterType === 'expired' ? 'bg-red-500' :
 'bg-amber-500'
 }`}></div>

                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:ring-indigo-200 transition-all">
                                                {member.photo ? (
                                                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xl">
                                                        {member.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center text-[8px] text-white shadow-sm ${filterType === 'expired' ? 'bg-slate-400' :
 member.remainingDays <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
 }`}>
                                                <i className={`fas ${filterType === 'expired' ? 'fa-times' : 'fa-check'}`}></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors leading-tight">{member.name}</h4>
                                            <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 mt-1">
                                                <i className="fas fa-phone text-[10px] text-slate-300"></i>
                                                {member.phone}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider ${filterType === 'active' ? 'bg-indigo-50 text-indigo-600' :
 filterType === 'expired' ? 'bg-red-50 text-red-600' :
 'bg-amber-50 text-amber-600'
 }`}>
                                            {member.planName}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-px bg-slate-50 w-full"></div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 tracking-widest">Expiration</p>
                                            <p className="text-sm font-black text-slate-800">
                                                {new Date(member.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {filterType === 'active' ? (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none">Status</p>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${member.remainingDays <= 7 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'
 }`}>
                                                        <span className="w-2 h-2 rounded-full bg-current"></span>
                                                        {member.remainingDays} days left
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 tracking-widest leading-none text-right">Status</p>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-black">
                                                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                                        Inactive
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-slate-50 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                                        <span>View Full Profile</span>
                                        <i className="fas fa-arrow-right text-[10px]"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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

export default ActiveMembersSection;
