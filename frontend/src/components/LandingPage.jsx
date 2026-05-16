import React from 'react';
import { UserIcon, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage({ onSelectMode }) {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="flex flex-col items-center mb-12">
        <h1 className="font-display text-[48px] md:text-[64px] leading-tight font-normal tracking-[-0.04em] text-center italic bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-4">
          Select Your Portal
        </h1>
        <p className="text-[16px] font-medium text-[var(--text-secondary)] text-center max-w-[500px] leading-relaxed">
          Choose how you want to use SleekScan AI. Job seekers can quickly check their resume, while organizations can manage candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[900px]">
        {/* Job Seeker Option */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => onSelectMode('seeker')}
          className="cursor-pointer group relative bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[#6366f1] p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366f1] to-[#a855f7] opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="h-16 w-16 bg-[#6366f1]/10 rounded-2xl flex items-center justify-center text-[#6366f1] mb-6">
            <UserIcon size={32} />
          </div>
          
          <h2 className="font-display text-[28px] italic tracking-tight mb-3">Job Seeker Portal</h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] mb-8">
            Instantly score and evaluate your resume against a job description. Find missing keywords and get actionable tips to land the interview.
            <br/><br/>
            <strong className="text-[var(--text-primary)]">No login required.</strong>
          </p>
          
          <div className="flex items-center gap-2 text-[#6366f1] font-bold text-[13px] uppercase tracking-widest">
            Enter Portal <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Organization Option */}
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => onSelectMode('org')}
          className="cursor-pointer group relative bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[#ec4899] p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ec4899] to-[#f43f5e] opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="h-16 w-16 bg-[#ec4899]/10 rounded-2xl flex items-center justify-center text-[#ec4899] mb-6">
            <Building2 size={32} />
          </div>
          
          <h2 className="font-display text-[28px] italic tracking-tight mb-3">Organization Portal</h2>
          <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] mb-8">
            Manage multiple candidate resumes, compare top applicants side-by-side, and save screening history for future reference.
            <br/><br/>
            <strong className="text-[var(--text-primary)]">Requires login/registration.</strong>
          </p>
          
          <div className="flex items-center gap-2 text-[#ec4899] font-bold text-[13px] uppercase tracking-widest">
            Login Now <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
