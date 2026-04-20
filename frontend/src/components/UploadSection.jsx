import React, { useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadSection = ({ onUpload, status, lastFile }) => {
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onUpload(Array.from(e.target.files));
        }
    };

    const isSyncing = status === 'Syncing...';

    return (
        <div className="w-full max-w-2xl mx-auto py-0 space-y-6 animate-in fade-in duration-1000">
            {/* Interactive Apple Drop Zone */}
            <div
                onClick={() => !isSyncing && fileInputRef.current?.click()}
                className={`
                    relative group w-full aspect-[16/7] flex flex-col items-center justify-center 
                    bg-white border border-[#D2D2D7]/40 rounded-[32px] 
                    cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    hover:border-[#0066CC]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)]
                    ${isSyncing ? 'opacity-70 cursor-wait' : 'active:scale-[0.98]'}
                `}
            >
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleChange}
                    className="hidden"
                    disabled={isSyncing}
                />
                
                {/* Dynamic Background Pulse */}
                <div className={`absolute inset-0 rounded-[32px] transition-opacity duration-1000 ${isSyncing ? 'bg-[#0066CC]/5 animate-pulse' : 'opacity-0 group-hover:opacity-100 bg-[#F5F5F7]'}`} />

                <div className="relative flex flex-col items-center gap-2 z-10">
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700
                        ${isSyncing ? 'bg-[#0066CC] rotate-180 scale-110' : 'bg-[#1D1D1F] group-hover:bg-[#0066CC] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,102,204,0.3)]'}
                    `}>
                        <Upload 
                            size={24} 
                            className={`transition-all duration-500 ${isSyncing ? 'text-white animate-bounce' : 'text-white'}`} 
                            strokeWidth={1.5} 
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="text-[21px] font-bold text-[#1D1D1F] tracking-tight">
                            {isSyncing ? 'Reading Files' : 'Start here'}
                        </h3>
                        <p className="text-[15px] text-black/50 mt-1 font-medium">
                            {isSyncing ? 'Almost ready...' : 'Add candidate resumes (PDF)'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Most Recent File Only */}
            <AnimatePresence mode="popLayout">
                {lastFile && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group flex items-center justify-between bg-white border border-[#D2D2D7]/30 rounded-2xl px-6 py-4 hover:border-[#D2D2D7] hover:shadow-sm transition-all duration-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-black/5 rounded-xl flex items-center justify-center text-black">
                                <FileText size={18} strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[14px] text-black font-bold truncate max-w-[240px] uppercase tracking-tight">{lastFile}</span>
                                <span className="text-[10px] text-black/50 font-black uppercase tracking-widest mt-0.5">Recently Added</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600/70">Ready</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadSection;
