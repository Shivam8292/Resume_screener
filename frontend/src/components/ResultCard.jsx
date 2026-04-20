import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wand2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultCard = ({ candidate, onCompareSelect, isSelected, rank, onImprove }) => {
    const [expanded, setExpanded] = useState(false);

    // Score semantic colors (Simplified since score is now 0-100)
    const scoreVal = candidate.final_score;
    let colorTheme = { scoreText: 'text-[var(--text-primary)]', progress: 'bg-[var(--accent)]' };

    if (scoreVal >= 75) {
        colorTheme = { scoreText: 'text-[var(--green)]', progress: 'bg-[var(--green)]' };
    } else if (scoreVal >= 50) {
        colorTheme = { scoreText: 'text-[var(--amber)]', progress: 'bg-[var(--amber)]' };
    } else {
        colorTheme = { scoreText: 'text-[var(--red)]', progress: 'bg-[var(--red)]' };
    }

    const dLow = (candidate.decision || "").toLowerCase();
    let badgeTheme = { bg: 'bg-[var(--bg-sunken)]', text: 'text-[var(--text-tertiary)]' };

    if (dLow.includes('shortlist') || dLow.includes('hire')) {
        badgeTheme = { bg: 'bg-[var(--green-subtle)]', text: 'text-[#15803d]' };
    } else if (dLow.includes('review') || dLow.includes('maybe')) {
        badgeTheme = { bg: 'bg-[var(--amber-subtle)]', text: 'text-[#b45309]' };
    }

    return (
        <div
            className={`relative w-full bg-white rounded-[24px] p-8 border transition-all duration-400 shadow-sm ${isSelected ? 'border-black ring-4 ring-black/5' : 'border-[#D2D2D7]/40 hover:border-[#D2D2D7] hover:shadow-md'
                }`}
        >
            {/* Rank Badge */}
            <div
                className="absolute top-6 left-[-16px] hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-black/5 text-[12px] font-black text-black shadow-lg shadow-black/5"
            >
                #{rank}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[22px] text-black tracking-tight">
                            {candidate.filename.replace('.pdf', '')}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeTheme.bg} ${badgeTheme.text}`}>
                            {candidate.decision || 'Review'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-[13px] text-black/40 font-medium">
                        <span className="flex items-center gap-1.5">
                            <FileText size={14} />
                            {candidate.experience_level || 'Mid'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-black/10" />
                        <span>{candidate.experience_years} Years Professional Exp.</span>
                    </div>
                </div>

                <div className="text-right flex items-baseline gap-1">
                    <span className={`text-[54px] font-black tracking-tighter leading-none ${colorTheme.scoreText}`}>
                        {Math.round(scoreVal)}
                    </span>
                    <span className="text-[20px] font-bold text-black/20 tracking-tight">%</span>
                </div>
            </div>

            {/* Main Score Progress */}
            <div className="w-full h-1.5 bg-black/5 rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreVal}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full ${colorTheme.progress} rounded-full`}
                />
            </div>

            {/* Rationale Engine (Phase 3 Integration) */}
            <div className="bg-[#FBFBFD] border border-black/5 rounded-2xl p-5 mb-8">
                <div className="flex gap-4">
                    <div className="mt-1">
                        <CheckCircle2 size={20} className="text-black" />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-black text-black uppercase tracking-widest mb-1">AI Verdict</h4>
                        <p className="text-[15px] text-black/70 leading-relaxed font-medium">
                            {candidate.rationale || "Processing fit rationale..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-black text-black/30 uppercase tracking-widest mb-4">
                        <CheckCircle2 size={14} className="text-[#1D1D1F]" />
                        Key Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.strengths?.map((s, i) => (
                            <div key={i} className="group relative">
                                <span className="px-3 py-2 rounded-xl bg-black/5 border border-black/5 text-[13px] text-black font-semibold cursor-help">
                                    {typeof s === 'object' ? s.skill : s}
                                </span>
                                {typeof s === 'object' && s.evidence && (
                                    <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible w-64 p-3 bg-black text-white text-[11px] rounded-lg shadow-xl z-50 transition-all">
                                        "{s.evidence}"
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-black text-black/30 uppercase tracking-widest mb-4">
                        <AlertCircle size={14} className="text-black/30" />
                        Identified Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.gaps?.map((g, i) => (
                            <span key={i} className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-black/5 text-[13px] text-black/60 font-medium">
                                {g}
                            </span>
                        ))}
                        {(!candidate.gaps || candidate.gaps.length === 0) && (
                            <span className="text-[13px] text-black/30 italic px-1">Highly Compatible</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-black/5 pt-6 mt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-black/5 rounded-full text-[12px] font-bold text-black hover:bg-black hover:text-white transition-all duration-300 active:scale-95"
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        View Evidence
                    </button>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-400 ${isSelected ? 'bg-black border-black shadow-lg shadow-black/20' : 'border-[#D2D2D7] bg-white group-hover:border-black'
                            }`}>
                            {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-in zoom-in-50 duration-300" />
                            )}
                        </div>
                        <span className="text-[13px] font-bold text-black/50 group-hover:text-black transition-colors">
                            Select for Comparison
                        </span>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => onCompareSelect(candidate.filename)}
                        />
                    </label>
                </div>

                <button
                    onClick={() => onImprove(candidate.filename)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-[13px] font-bold hover:shadow-xl hover:shadow-black/10 transition-all active:scale-95"
                >
                    <Wand2 size={16} />
                    Improve Resume
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-[#FBFBFD] rounded-[20px] p-6 mt-8 text-[14px] leading-relaxed text-black/60 border border-black/5 shadow-inner">
                            <div className="flex items-center gap-2 mb-5 text-black font-black uppercase tracking-widest text-[10px]">
                                <FileText size={14} className="text-black/30" />
                                Contextual Evidence Chunks
                            </div>
                            <div className="space-y-4">
                                {(candidate.strengths && typeof candidate.strengths[0] === 'object') ? (
                                    candidate.strengths.map((s, idx) => (
                                        <blockquote key={idx} className="border-l-2 border-black/10 pl-5 italic text-[13px] bg-white/40 py-3 pr-3 rounded-r-xl">
                                            <span className="block font-black text-black/40 text-[9px] uppercase mb-1">{s.skill}</span>
                                            "{s.evidence}"
                                        </blockquote>
                                    ))
                                ) : (
                                    candidate.evidence?.map((text, idx) => (
                                        <blockquote key={idx} className="border-l-2 border-black/10 pl-5 italic text-[13px] bg-white/40 py-3 pr-3 rounded-r-xl">
                                            "{text}"
                                        </blockquote>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultCard;
