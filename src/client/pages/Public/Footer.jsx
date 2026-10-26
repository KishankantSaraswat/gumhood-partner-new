import React from 'react';
import { Dumbbell, Facebook, Instagram, Twitter, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                <Dumbbell className="w-4 h-4" />
                            </div>
                            <span className="text-xl font-bold text-white">Gymshood</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">Smart gym access with flexible credits.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all transform hover:scale-110">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all transform hover:scale-110">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all transform hover:scale-110">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                    {[
                        { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] },
                        { title: 'Support', links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms'] },
                        { title: 'For Gyms', links: ['Partner with us', 'Gym Dashboard', 'Success Stories'] }
                    ].map((col, i) => (
                        <div key={i}>
                            <h4 className="text-white font-bold mb-6">{col.title}</h4>
                            <ul className="space-y-3 text-sm">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        {link === 'Privacy Policy' ? (
                                            <button
                                                onClick={() => navigate('/privacy-policy')}
                                                className="hover:text-indigo-400 transition-colors text-left"
                                            >
                                                {link}
                                            </button>
                                        ) : (
                                            <a href="#" className="hover:text-indigo-400 transition-colors">{link}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>&copy; 2024 Gymshood. All rights reserved.</p>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Lock className="w-4 h-4" />
                        <span>Secured with Bank-Level Encryption</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
