import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Wand2, Mail, CheckCircle2, AlertCircle, Info, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResultCard = ({ candidate, onCompareSelect, isSelected, rank, onImprove }) => {
    const [expanded, setExpanded] = useState(false);

    const scoreVal = candidate.ats_score || candidate.final_score || 0;
    const status = candidate.status || "REVIEW";
    const email = candidate.contact_email || "N/A";

    const getStatusStyles = (status) => {
        switch (status.toUpperCase()) {
            case 'SHORTLIST': return 'bg-[var(--green-subtle)] text-[#15803d] border-[#15803d]/20';
            case 'REVIEW': return 'bg-[var(--amber-subtle)] text-[#b45309] border-[#b45309]/20';
            case 'REJECT': return 'bg-[var(--red-subtle)] text-[#b91c1c] border-[#b91c1c]/20';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div
            className={`relative w-full bg-[var(--bg-surface)] rounded-[32px] p-8 border transition-all duration-500 shadow-sm overflow-hidden ${
                isSelected ? 'border-[var(--text-primary)] ring-4 ring-[var(--text-primary)]/5' : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
            }`}
        >
            {/* Header: Score & Meta */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-8 border-b border-[var(--border)]">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--text-primary)] text-[var(--bg-surface)] text-[12px] font-black italic">
                            #{rank}
                        </span>
                        <h3 className="font-display text-[28px] italic tracking-tight">
                            {candidate.filename.replace('.pdf', '')}
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-3 rounded-2xl bg-[var(--bg-sunken)] border border-[var(--border)]">
                            <span className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">ATS Score</span>
                            <span className="text-[18px] font-bold">{Math.round(scoreVal)}%</span>
                        </div>
                        <div className={`p-3 rounded-2xl border ${getStatusStyles(status)}`}>
                            <span className="block text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Status</span>
                            <span className="text-[14px] font-black italic tracking-wide">✓ {status}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[var(--bg-sunken)] border border-[var(--border)] overflow-hidden">
                            <span className="block text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Contact Email</span>
                            <span className="text-[13px] font-medium truncate flex items-center gap-2">
                                <Mail size={12} /> {email}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-[var(--border)] stroke-current" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-[var(--accent)] stroke-current" strokeWidth="2" strokeDasharray={`${scoreVal}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-display italic text-[24px]">
                            {Math.round(scoreVal)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Reasoning */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4 text-[11px] font-black uppercase tracking-widest text-[var(--accent)]">
                    <Target size={14} /> Reasoning
                </div>
                <div className="p-6 rounded-[24px] bg-[var(--bg-sunken)] border-l-4 border-[var(--accent)]">
                    <p className="text-[15px] leading-relaxed font-medium opacity-80 italic">
                        "{candidate.overall_reasoning || "No overall reasoning provided."}"
                    </p>
                </div>
            </div>

            {/* Dynamic Detailed Evaluations */}
            <div className="space-y-8 mb-10">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40">Pillar Analysis</h4>
                    <div className="h-px flex-1 mx-4 bg-[var(--border)] opacity-30" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {candidate.detailed_evaluations?.map((evalItem, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -4 }}
                            className="p-6 rounded-[24px] bg-[var(--bg-surface)] border border-[var(--border)] hover:shadow-xl transition-all"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[14px] font-black uppercase tracking-wider">{evalItem.pillar_name}</span>
                                <span className={`text-[14px] font-bold ${evalItem.score >= 70 ? 'text-[var(--green)]' : 'text-[var(--amber)]'}`}>
                                    {evalItem.score}%
                                </span>
                            </div>
                            
                            <p className="text-[13px] opacity-60 mb-6 leading-relaxed">
                                {evalItem.reasoning}
                            </p>

                            <div className="pt-4 border-t border-[var(--border)] border-dashed">
                                <p className="text-[11px] font-bold text-[var(--green)] mb-1 italic">
                                    Evidence: {evalItem.evidence_question}
                                </p>
                                <p className="text-[13px] font-medium opacity-80 bg-[var(--bg-sunken)] p-3 rounded-xl border border-[var(--border)]">
                                    "{evalItem.evidence_answer}"
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Identified Gaps */}
            <div className="mb-10 p-6 rounded-[24px] bg-[var(--red-subtle)]/30 border border-[var(--red)]/10">
                <h4 className="flex items-center gap-2 text-[11px] font-black text-[var(--red)] uppercase tracking-widest mb-4">
                    <AlertCircle size={14} /> Critical Gaps Identified
                </h4>
                <div className="flex flex-wrap gap-2">
                    {candidate.gaps?.map((gap, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--red)]/10 text-[12px] font-bold text-[var(--red)] shadow-sm">
                            • {gap}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-6 items-center justify-between pt-8 border-t border-[var(--border)]">
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                            isSelected ? 'bg-[var(--text-primary)] border-[var(--text-primary)]' : 'border-[var(--border)]'
                        }`}>
                            {isSelected && <CheckCircle2 size={16} className="text-[var(--bg-surface)]" />}
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-wider opacity-60 group-hover:opacity-100">
                            Compare
                        </span>
                        <input type="checkbox" className="hidden" checked={isSelected} onChange={() => onCompareSelect(candidate.filename)} />
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => onImprove(candidate.filename)}
                        className="flex items-center gap-2 px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-2xl text-[14px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        <Wand2 size={16} /> ATS Optimizer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
