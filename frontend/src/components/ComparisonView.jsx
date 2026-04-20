import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';

const ComparisonView = ({ comparison, onClose }) => {
    if (!comparison) return null;

    const [c1_key, c2_key] = Object.keys(comparison.comparison);
    const c1 = comparison.comparison[c1_key];
    const c2 = comparison.comparison[c2_key];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={onClose}
            >
                <motion.div
                    className="relative w-full max-w-[680px] bg-white rounded-[32px] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/5"
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 transition-all text-black/20 hover:text-black active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>

                    <div className="mb-10 overflow-hidden border border-[#D2D2D7]/40 rounded-[28px] bg-[#FBFBFD]">
                        <div className="px-6 py-4 border-b border-black/[0.03] bg-black/[0.01]">
                            <h2 className="text-[10px] font-black leading-none text-black/40 tracking-[0.4em] uppercase">
                                The Decision
                            </h2>
                        </div>
                        <div className="p-8 text-[15px] font-medium leading-relaxed text-black/70">
                            {comparison.reason}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6">

                        {/* Candidate 1 */}
                        <div className={`flex-1 flex flex-col p-8 rounded-[28px] border transition-all ${comparison.better_candidate === c1.filename ? 'border-black bg-black text-white shadow-2xl' : 'border-[#D2D2D7]/40 bg-white'}`}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className={`font-black text-[18px] tracking-tighter uppercase italic truncate max-w-[180px] ${comparison.better_candidate === c1.filename ? 'text-white' : 'text-black'}`}>
                                        {c1.filename.replace('.pdf', '')}
                                    </h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 block ${comparison.better_candidate === c1.filename ? 'text-white/40' : 'text-black/30'}`}>
                                        Candidate A
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[28px] font-black tracking-tighter ${comparison.better_candidate === c1.filename ? 'text-white' : 'text-black'}`}>
                                        {Math.round(c1.final_score * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${comparison.better_candidate === c1.filename ? 'text-white/40' : 'text-black/30'}`}>Background</h4>
                                    <p className={`text-[15px] font-bold ${comparison.better_candidate === c1.filename ? 'text-white' : 'text-black'}`}>{c1.experience_years} Years Experience</p>
                                </div>
                                <div>
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${comparison.better_candidate === c1.filename ? 'text-white/40' : 'text-black/30'}`}>Top Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {c1.matched_skills?.slice(0, 3).map((m, i) => (
                                            <span 
                                                key={i} 
                                                className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${
                                                    comparison.better_candidate === c1.filename 
                                                    ? 'bg-white/10 border-white/10 text-white' 
                                                    : 'bg-black/5 border-black/5 text-black'
                                                }`}
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider (only visible on md+) */}
                        <div className="hidden md:block w-px bg-[var(--border-strong)] my-4" />

                        {/* Candidate 2 */}
                        <div className={`flex-1 flex flex-col p-8 rounded-[28px] border transition-all ${comparison.better_candidate === c2.filename ? 'border-black bg-black text-white shadow-2xl' : 'border-[#D2D2D7]/40 bg-white'}`}>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className={`font-black text-[18px] tracking-tighter uppercase italic truncate max-w-[180px] ${comparison.better_candidate === c2.filename ? 'text-white' : 'text-black'}`}>
                                        {c2.filename.replace('.pdf', '')}
                                    </h3>
                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 block ${comparison.better_candidate === c2.filename ? 'text-white/40' : 'text-black/30'}`}>
                                        Candidate B
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[28px] font-black tracking-tighter ${comparison.better_candidate === c2.filename ? 'text-white' : 'text-black'}`}>
                                        {Math.round(c2.final_score * 100)}%
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${comparison.better_candidate === c2.filename ? 'text-white/40' : 'text-black/30'}`}>Background</h4>
                                    <p className={`text-[15px] font-bold ${comparison.better_candidate === c2.filename ? 'text-white' : 'text-black'}`}>{c2.experience_years} Years Experience</p>
                                </div>
                                <div>
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${comparison.better_candidate === c2.filename ? 'text-white/40' : 'text-black/30'}`}>Top Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {c2.matched_skills?.slice(0, 3).map((m, i) => (
                                            <span 
                                                key={i} 
                                                className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${
                                                    comparison.better_candidate === c2.filename 
                                                    ? 'bg-white/10 border-white/10 text-white' 
                                                    : 'bg-black/5 border-black/5 text-black'
                                                }`}
                                            >
                                                {m}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ComparisonView;
