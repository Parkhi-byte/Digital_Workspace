import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeftRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImpersonationBanner = () => {
    const { user, adminUser, stopImpersonating } = useAuth();

    if (!adminUser) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-500/90 dark:to-amber-600/90 text-white py-2 px-4 shadow-lg backdrop-blur-md border-b border-amber-400/30"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Shield size={18} className="text-white" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 opacity-80">Shadow Mode Active</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">Impersonating:</span>
                                <span className="text-xs font-black uppercase tracking-tight bg-white/10 px-2 py-0.5 rounded-md border border-white/20">
                                    {user?.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={stopImpersonating}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-amber-700 hover:bg-amber-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                        <LogOut size={14} />
                        <span>Return to {adminUser?.name}</span>
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ImpersonationBanner;
