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
            className={`relative w-full bg-[var(--bg-surface)] rounded-2xl p-6 border transition-all duration-300 shadow-sm ${isSelected ? 'border-[var(--accent)] ring-1 ring-[var(--accent-subtle)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
        >
            {/* Rank Badge */}
            <div className="absolute top-[-10px] left-6 px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full text-[12px] font-bold text-[var(--accent)] shadow-sm">
                Candidate #{rank}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[20px] text-[var(--text-primary)] tracking-tight">
                            {candidate.filename.replace('.pdf', '')}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${badgeTheme.bg} ${badgeTheme.text}`}>
                            {candidate.decision || 'Review'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-[13px] text-[var(--text-tertiary)] font-medium">
                        <span className="flex items-center gap-1.5">
                            <FileText size={14} />
                            {candidate.experience_level || 'Mid'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                        <span>{candidate.experience_years} Years Exp.</span>
                    </div>
                </div>

                <div className="text-right flex items-baseline gap-1">
                    <span className={`text-[48px] font-black tracking-tighter leading-none ${colorTheme.scoreText}`}>
                        {Math.round(scoreVal)}
                    </span>
                    <span className="text-[18px] font-bold text-[var(--text-tertiary)] tracking-tight">%</span>
                </div>
            </div>

            {/* Main Score Progress */}
            <div className="w-full h-1.5 bg-[var(--bg-sunken)] rounded-full mb-8 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreVal}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full ${colorTheme.progress} rounded-full`}
                />
            </div>

            {/* Rationale Engine (Phase 3 Integration) */}
            <div className="bg-[var(--accent-subtle)] border border-[var(--accent-subtle)] rounded-xl p-4 mb-8">
                <div className="flex gap-3">
                    <div className="mt-1">
                        <CheckCircle2 size={18} className="text-[var(--accent)]" />
                    </div>
                    <div>
                        <h4 className="text-[12px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1">AI Insight</h4>
                        <p className="text-[14px] text-[var(--text-primary)] leading-relaxed font-medium">
                            {candidate.rationale || "Processing fit rationale..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
                        <CheckCircle2 size={14} className="text-[var(--green)]" />
                        Key Strengths
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.strengths?.map((s, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border)] text-[13px] text-[var(--text-primary)] font-medium">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
                        <AlertCircle size={14} className="text-[var(--amber)]" />
                        Skills Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {candidate.gaps?.map((g, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[var(--border)] text-[13px] text-[var(--text-secondary)]">
                                {g}
                            </span>
                        ))}
                        {(!candidate.gaps || candidate.gaps.length === 0) && (
                            <span className="text-[13px] text-[var(--text-tertiary)] italic px-1">No critical gaps identified</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-[var(--border)] pt-5 mt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-2 text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        View Evidence
                    </button>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-strong)] bg-white group-hover:border-[var(--accent)]'
                            }`}>
                            {isSelected && (
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4 8L11 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <span className="text-[13px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                            Multi-Compare
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
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-white rounded-xl text-[13px] font-bold hover:bg-black transition-all shadow-md active:scale-95"
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
                        <div className="bg-[var(--bg-sunken)] rounded-xl p-5 mt-6 text-[14px] leading-relaxed text-[var(--text-secondary)] border border-[var(--border)]">
                            <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)] font-bold uppercase tracking-wider text-[11px]">
                                <FileText size={14} className="text-[var(--accent)]" />
                                Extracted Evidence Chunks
                            </div>
                            <div className="space-y-3">
                                {candidate.evidence?.map((text, idx) => (
                                    <blockquote key={idx} className="border-l-2 border-[var(--accent)] pl-4 italic text-[13px] bg-white/50 py-2 pr-2 rounded">
                                        "{text}"
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResultCard;
