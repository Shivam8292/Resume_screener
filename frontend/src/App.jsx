import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import TopNav from './components/TopNav';
import UploadSection from './components/UploadSection';
import JDInput from './components/JDInput';
import ResultCard from './components/ResultCard';
import ComparisonView from './components/ComparisonView';

const API_BASE = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : `https://${window.location.hostname}`); // Production usually runs on standard ports (80/443)

function App() {
  const [jd, setJd] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
<<<<<<< HEAD
  const [optimization, setOptimization] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
=======
  const [showRegistry, setShowRegistry] = useState(false);
  const [lastUploaded, setLastUploaded] = useState(null);
>>>>>>> origin/pr/4

  // Phase flags
  const isResultsMode = results.length > 0;

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await axios.get(`${API_BASE}/resumes`);
        if (res.data.resumes) {
          setUploadedFiles(res.data.resumes);
          setUploadStatus(`Ready (${res.data.resumes.length})`);
        }
      } catch (err) {
        console.error("Failed to fetch existing resumes", err);
      }
    };
    fetchExisting();
  }, []);

  const handleUpload = async (files) => {
    setUploadStatus('Syncing...');
    setError('');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const res = await axios.post(`${API_BASE}/upload-resumes`, formData);
      setUploadStatus(`Ready (${res.data.count})`);
      const newFiles = files.map(f => f.name);
      setUploadedFiles(prev => [...new Set([...prev, ...newFiles])]);
      setLastUploaded(newFiles[newFiles.length - 1]);
    } catch (err) {
      setUploadStatus('Sync failed');
      const errorMsg = err.response?.data?.detail || 'Upload failed. Ensure resumes are valid text-based PDFs.';
      setError(errorMsg);
      // Ensure we don't enable the Analyze button if upload failed
      setUploadedFiles([]);
    }
  };

  const handleRemoveFile = async (filename) => {
    if (filename === '__ALL__') {
      return handleClearAll();
    }
    try {
      await axios.delete(`${API_BASE}/delete-resume?filename=${encodeURIComponent(filename)}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
      setUploadStatus(prev => {
        const count = uploadedFiles.length - 1;
        return count > 0 ? `Ready (${count})` : '';
      });
    } catch (err) {
      console.error("Failed to delete resume", err);
      const msg = err.response?.data?.detail || err.message || "Failed to delete resume.";
      setError(`Delete Failed: ${msg}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.post(`${API_BASE}/clear-data`);
      setUploadedFiles([]);
      setUploadStatus('');
      setResults([]);
      setError('');
    } catch (err) {
      setError("Failed to clear cloud data.");
    }
  };

  const handleRank = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/rank`, { job_description: jd });
      setResults(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Analysis failed.";
      setError(`Analysis Failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSelect = (filename) => {
    setSelectedCandidates(prev => {
      if (prev.includes(filename)) return prev.filter(f => f !== filename);
      if (prev.length >= 2) return [prev[1], filename];
      return [...prev, filename];
    });
  };

  const triggerComparison = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/compare`, {
        job_description: jd,
        candidates: selectedCandidates
      });
      setComparison(res.data);
    } catch (err) {
      setError('Comparison failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImproveResume = async (filename) => {
    setIsImproving(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/improve-resume`, {
        job_description: jd,
        filename: filename
      });
      setOptimization({ ...res.data, filename });
    } catch (err) {
      setError('Optimization failed. Please try again.');
    } finally {
      setIsImproving(false);
    }
  };

  const resetToSetup = () => {
    setResults([]);
    setSelectedCandidates([]);
    setComparison(null);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-[Inter] overflow-x-hidden">

      <TopNav
        uploadedCount={uploadedFiles.length}
        onUploadClick={resetToSetup}
        onReset={resetToSetup}
        onRegistryClick={() => setShowRegistry(!showRegistry)}
      />

      <main className="max-w-[760px] mx-auto pt-[106px] px-6 pb-24">

        {/* Setup Phase */}
        <AnimatePresence mode="wait">
          {!isResultsMode && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center"
            >
              <div className="flex flex-col items-center mb-8">
                <h1 className="font-['Instrument_Serif'] text-[48px] md:text-[68px] leading-tight font-normal tracking-[-0.04em] text-center italic bg-gradient-to-b from-black to-black/60 bg-clip-text text-transparent mb-2">
                  Who's the right fit?
                </h1>
                <p className="text-[15px] font-medium text-black/50 text-center max-w-[480px] leading-relaxed">
                  Detail the skills you need and I'll rank your candidates by relevance.
                </p>
              </div>

              <div className="w-full space-y-4">
                <UploadSection
                  onUpload={handleUpload}
                  status={uploadStatus}
                  uploadedFiles={uploadedFiles}
                  onRemoveFile={handleRemoveFile}
                  lastFile={lastUploaded}
                />

                <JDInput
                  value={jd}
                  onChange={setJd}
                  onRank={handleRank}
                  loading={loading}
                  disabled={uploadedFiles.length === 0}
                />
              </div>
            </motion.div>
          )}

          {/* Results Phase */}
          {isResultsMode && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <div className="flex items-center justify-between mb-8 group">
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetToSetup}
                    className="p-2 -ml-2 hover:bg-[var(--bg-sunken)] rounded-full transition-colors text-[var(--text-secondary)]"
                    title="Back to Setup"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="font-['Instrument_Serif'] text-[32px] font-normal italic">
                    Analysis Results
                  </h2>
                </div>
                {selectedCandidates.length === 2 && (
                  <button
                    onClick={triggerComparison}
                    className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                  >
                    Compare top 2
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {results.map((candidate, idx) => (
                  <motion.div
                    key={candidate.filename}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ResultCard
                      candidate={candidate}
                      onCompareSelect={handleCompareSelect}
                      isSelected={selectedCandidates.includes(candidate.filename)}
                      rank={idx + 1}
                      onImprove={handleImproveResume}
                    />
                  </motion.div>
                ))}
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mt-8 overflow-hidden bg-white border border-red-500/30 rounded-[20px] shadow-2xl shadow-red-500/5 group"
          >
            <div className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 shrink-0 bg-red-500 rounded-full flex items-center justify-center text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-[14px] font-black text-black uppercase tracking-widest leading-none mb-1">Attention Required</h4>
                <p className="text-[13px] font-medium text-black/60 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="h-1 bg-red-500/10 w-full">
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10 }}
                onAnimationComplete={() => setError('')}
                className="h-full bg-red-500" 
              />
            </div>
          </motion.div>
        )}

      </main>

      <footer className="w-full py-12 bg-black/[0.07] border-t border-black/5 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-black/60 uppercase tracking-[0.4em]">
                &copy; 2026 Developed by Shivam8292
            </span>
            <span className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em]">
                Intelligent Screening System &bull; All rights reserved
            </span>
      </footer>

      {comparison && (
        <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />
      )}

<<<<<<< HEAD
      {/* Optimization Modal (Phase 6) */}
      <AnimatePresence>
        {optimization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border)]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-[12px] uppercase tracking-widest mb-2">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                       Tailored Improvement Plan
                    </div>
                    <h2 className="text-[32px] font-['Instrument_Serif'] italic leading-tight">
                      Optimizing for {optimization.filename.replace('.pdf', '')}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setOptimization(null)}
                    className="p-2 hover:bg-[var(--bg-sunken)] rounded-full transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[11px]">1</span>
                        Highest Impact Multipliers
                      </h3>
                      <div className="space-y-4">
                        {optimization.improved_points?.map((p, i) => (
                          <div key={i} className="group relative bg-[var(--bg-sunken)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--accent-hover)] transition-all">
                            <p className="text-[14px] text-[var(--text-primary)] font-medium leading-relaxed">
                              "{p}"
                            </p>
                            <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[var(--accent)] uppercase">AI Rewritten</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--amber)] text-white flex items-center justify-center text-[11px]">2</span>
                        Missing ATS Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {optimization.missing_keywords?.map((k, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--amber-subtle)] border border-[var(--amber)]/20 text-[13px] text-[#b45309] font-bold">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[14px] font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-[11px]">3</span>
                        Strategic Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {optimization.suggestions?.map((s, i) => (
                          <li key={i} className="flex gap-3 text-[14px] text-[var(--text-secondary)] leading-relaxed">
                            <span className="text-[var(--accent)] mt-1">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8 border-t border-[var(--border)] bg-[var(--bg-sunken)] flex justify-between items-center">
                <p className="text-[12px] text-[var(--text-tertiary)] italic max-w-[400px]">
                  These suggestions are generated using LLM reasoning to maximize ATS compatibility and professional impact.
                </p>
                <button 
                  onClick={() => setOptimization(null)}
                  className="px-8 py-3 bg-[var(--text-primary)] text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay for Improvement */}
      {isImproving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 backdrop-blur-md">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">Optimizing Resume Bullet Points...</p>
           </div>
        </div>
      )}
=======
      {/* Registry Drawer */}
      <AnimatePresence>
        {showRegistry && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistry(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-[200] p-10 flex flex-col gap-8 border-l border-black/5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] font-black tracking-tighter uppercase italic">File Cabinet</h3>
                <button 
                  onClick={() => setShowRegistry(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/20 hover:text-black"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                {uploadedFiles.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-black/5 rounded-3xl opacity-30">
                    <p className="text-[14px] font-black uppercase tracking-widest leading-loose">No files added yet</p>
                  </div>
                ) : (
                  uploadedFiles.map((file, idx) => {
                    const candidateResult = results.find(r => r.filename === file);
                    return (
                      <motion.div 
                        key={file}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group flex items-center justify-between bg-[#FBFBFD] border border-black/5 rounded-2xl px-5 py-4 hover:border-black/10 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-black uppercase tracking-tight truncate max-w-[200px]">{file}</span>
                          <div className="flex items-center gap-2 mt-1">
                            {candidateResult ? (
                                <span className={`text-[10px] font-black uppercase tracking-widest ${candidateResult.final_score > 0.7 ? 'text-green-500' : 'text-black/50'}`}>
                                    MATCH: {Math.round(candidateResult.final_score * 100)}%
                                </span>
                            ) : (
                                <span className="text-[10px] font-black text-black/50 uppercase tracking-widest">Ready</span>
                            )}
                          </div>
                        </div>
                        <button 
                           onClick={() => handleRemoveFile(file)}
                           className="p-2 opacity-0 group-hover:opacity-100 text-black/30 hover:text-red-500 transition-all active:scale-90"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {uploadedFiles.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-[12px] uppercase tracking-[0.2em] rounded-full transition-all active:scale-95 shadow-xl shadow-red-500/10"
                >
                  Clear All Files
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
>>>>>>> origin/pr/4
    </div>
  );
}

export default App;
