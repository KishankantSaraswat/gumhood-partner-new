import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAlert } from '../../../context/AlertContext';


const AnnouncementsSection = ({ gym }) => {
    const { showAlert } = useAlert();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const fetchAnnouncements = async () => {
        try {
            const [gymData, adminData] = await Promise.all([
                api.get('/gymdb/announcements/gym'),
                api.get('/admin/announcements/user')
            ]);

            let combinedAnnouncements = [];
            if (gymData.success) {
                combinedAnnouncements = [...gymData.announcements];
            }
            if (adminData.success) {
                // Add admin announcements, marking them as such
                const adminAnns = adminData.announcements.map(ann => ({
                    ...ann,
                    isAdmin: true,
                    gymId: { name: 'Admin' }
                }));
                combinedAnnouncements = [...combinedAnnouncements, ...adminAnns];
            }

            // Sort by createdAt descending
            combinedAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAnnouncements(combinedAnnouncements);
        } catch (err) {
            console.error('Error fetching announcements:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const data = await api.post('/gymdb/gyms/announcements', { message: newMessage });
            if (data.success) {
                setNewMessage('');
                fetchAnnouncements();
            }
        } catch (err) {
            console.error('Error creating announcement:', err);
            showAlert({
                title: 'Post Failed',
                message: err.message || 'We could not publish your announcement. Please try again.',
                type: 'error'
            });
        } finally {
            setSending(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const data = await api.delete(`/gymdb/announcements/gym/${id}`);
            if (data.success) {
                fetchAnnouncements();
            }
        } catch (err) {
            console.error('Error deleting announcement:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Announcements</h2>
            </div>

            {/* Create New Announcement */}
            <div className="bg-white rounded-[2rem] p-6 mb-8 border border-indigo-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-plus-circle text-indigo-500"></i>
                    Post New Announcement
                </h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message to members here..."
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all min-h-[100px] text-sm"
                        disabled={sending}
                    />
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? (
                                <i className="fas fa-spinner animate-spin"></i>
                            ) : (
                                <i className="fas fa-paper-plane"></i>
                            )}
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>

            {/* Announcements List */}
            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic">No announcements yet</p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div key={item.id} className={`${item.gymId?.name === 'Admin' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-200'} border rounded-3xl p-6 relative group transition-all`}>
                            {new Date(item.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) && (
                                <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                    New
                                </span>
                            )}
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.gymId?.name === 'Admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    <i className={`fas ${item.gymId?.name === 'Admin' ? 'fa-shield-halved' : 'fa-bullhorn'} text-lg`}></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={`font-bold text-lg ${item.gymId?.name === 'Admin' ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {item.gymId?.name === 'Admin' ? 'System Announcement' : (item.gymId?.name || 'Gym Announcement')}
                                        </h3>
                                        {item.gymId?.name !== 'Admin' && (
                                            <button
                                                onClick={() => handleDeleteAnnouncement(item.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                                                title="Delete Announcement"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        )}
                                    </div>
                                    <p className={`${item.gymId?.name === 'Admin' ? 'text-indigo-800' : 'text-slate-600'} text-sm mb-4 leading-relaxed`}>
                                        {item.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {item.gymId?.name?.[0] || 'G'}
                                        </div>
                                        <p className="text-xs text-slate-400 font-semibold">
                                            Posted • {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnnouncementsSection;
