import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import TopNav from './components/TopNav';
import UploadSection from './components/UploadSection';
import JDInput from './components/JDInput';
import ResultCard from './components/ResultCard';
import ComparisonView from './components/ComparisonView';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';

import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import { WifiOff, ShieldCheck, User as UserIcon, Sun, Moon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = "https://resume-screener-ojop.onrender.com";

function App() {
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [jd, setJd] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currentSessionFiles, setCurrentSessionFiles] = useState([]); // Files uploaded in THIS scan
  const [optimization, setOptimization] = useState(null);
  const [isImproving, setIsImproving] = useState(false);
  const [lastUploaded, setLastUploaded] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);



  useEffect(() => {
    let subscription = null;

    // Auth Listener - only if Supabase is configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      }).catch(() => {});

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data?.subscription;
    }

    // Offline Listener (Point 2)
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Working offline. Some features may be limited.', { duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const isResultsMode = results.length > 0;

  useEffect(() => {
    if (!isRecruiterMode || !user) return;
    const fetchExisting = async () => {
      setIsInitialSyncing(true);
      try {
        const res = await axios.get(`${API_BASE}/resumes`);
        if (res.data.resumes) {
          setUploadedFiles(res.data.resumes);
          setUploadStatus(`Ready (${res.data.resumes.length})`);
        }
      } catch (err) {
        console.error("Failed to fetch existing resumes", err);
      } finally {
        setIsInitialSyncing(false);
      }
    };
    fetchExisting();
  }, [isRecruiterMode, user]);

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
      setCurrentSessionFiles(prev => [...new Set([...prev, ...newFiles])]); // Track session files
      setLastUploaded(newFiles[newFiles.length - 1]);
    } catch (err) {
      setUploadStatus('Sync failed');
      const errorMsg = err.response?.data?.detail || 'Upload failed.';
      setError(errorMsg);
    }
  };

  const handleRemoveFile = async (filename) => {
    try {
      await axios.delete(`${API_BASE}/delete-resume?filename=${encodeURIComponent(filename)}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
      setCurrentSessionFiles(prev => prev.filter(f => f !== filename));
    } catch (err) {
      setError(`Delete Failed: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.post(`${API_BASE}/clear-data`);
      setUploadedFiles([]);
      setCurrentSessionFiles([]);
      setResults([]);
      setError('');
    } catch (err) {
      setError("Failed to clear data.");
    }
  };

  const handleRank = async (targetFiles = null) => {
    if (!jd.trim()) {
      setError("Please enter a Job Description first.");
      return;
    }

    let filesToAnalyze;
    if (Array.isArray(targetFiles) && targetFiles.length > 0) {
      filesToAnalyze = targetFiles;
    } else if (currentSessionFiles.length > 0) {
      filesToAnalyze = currentSessionFiles;
    } else {
      filesToAnalyze = [];
    }
    
    setResults([]); 
    setLoading(true);
    setError('');
    try {
      const payload = { 
        job_description: jd,
        filenames: filesToAnalyze
      };
      const res = await axios.post(`${API_BASE}/rank`, payload);
      
      // Robust data handling: backend might return {results: []} or just []
      let analysisList = [];
      if (Array.isArray(res.data)) {
        analysisList = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        analysisList = res.data.results;
      }
      
      setResults(analysisList);
    } catch (err) {
      setError(`Analysis Failed: ${err.response?.data?.detail || err.message}`);
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
      const response = await axios.post(`${API_BASE}/improve-resume`, {
        job_description: jd,
        filename: filename
      });
      setOptimization({ ...response.data, filename });
    } catch (err) {
      setError('Optimization failed.');
    } finally {
      setIsImproving(false);
    }
  };

  const resetToSetup = () => {
    setResults([]);
    setSelectedCandidates([]);
    setComparison(null);
    setJd('');
    setError('');
    setLastUploaded(null);
    if (!isRecruiterMode) {
      setCurrentSessionFiles([]); 
    }
  };

  const goHome = () => {
    resetToSetup();
    setShowLanding(true);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--bg-base)] text-[var(--text-primary)] font-[Inter] transition-colors duration-300">
      <Toaster position="top-right" />
      
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-2">
          <WifiOff size={14} /> YOU ARE OFFLINE - CHECK INTERNET CONNECTION
        </div>
      )}

      {isRecruiterMode && user && (
        <Sidebar 
          uploadedFiles={uploadedFiles}
          isLoading={isInitialSyncing}
          onNewScan={resetToSetup}
          onRemoveFile={handleRemoveFile}
          onClearAll={handleClearAll}
          theme={theme}
          toggleTheme={toggleTheme}
          onUploadClick={() => document.getElementById('sidebar-upload')?.click()}
          onProcessFile={(file) => {
            setLastUploaded(file);
            setCurrentSessionFiles([file]);
            if (jd.trim()) {
              handleRank([file]);
            }
          }}
        />
      )}

      <input 
        id="sidebar-upload"
        type="file" 
        multiple 
        accept=".pdf"
        className="hidden" 
        onChange={(e) => handleUpload(Array.from(e.target.files))}
      />

      <div className={`flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative ${(!isRecruiterMode || !user) ? 'max-w-4xl mx-auto' : ''}`}>
        <div className="flex justify-between items-center p-6 bg-[var(--bg-base)] sticky top-0 z-10 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
             <h1 
               onClick={goHome}
               className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity"
             >
              SleekScan AI
            </h1>
            {isRecruiterMode && user && !showLanding && (
              <span className="flex items-center gap-1 text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">
                <ShieldCheck size={10} /> ORG MODE
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-sunken)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {!showLanding && (
              <button 
                onClick={goHome}
                className="text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg-sunken)]"
              >
                Change Portal
              </button>
            )}
            {isRecruiterMode && user && !showLanding && (
              <button 
                onClick={() => supabase?.auth.signOut()}
                className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                title="Logout"
              >
                <UserIcon size={20} />
              </button>
            )}
          </div>
        </div>

        <main className="max-w-[1000px] mx-auto pt-12 px-6 pb-24 w-full">
          <AnimatePresence mode="wait">
            {showLanding ? (
               <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                 <LandingPage onSelectMode={(mode) => {
                   setIsRecruiterMode(mode === 'org');
                   setShowLanding(false);
                 }} />
               </motion.div>
            ) : isRecruiterMode && !user ? (
                <Auth key="auth" onAuthSuccess={() => {}} />
            ) : results.length === 0 ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <div className="flex flex-col items-center mb-8">
                  <h1 className="font-display text-[48px] md:text-[68px] leading-tight font-normal tracking-[-0.04em] text-center italic bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-2">
                    Who's the right fit?
                  </h1>
                  <p className="text-[15px] font-medium text-[var(--text-secondary)] text-center max-w-[480px] leading-relaxed">
                    Detail the skills you need and I'll rank your candidates by relevance.
                  </p>
                </div>

                <div className="w-full space-y-4">
                  <UploadSection
                    onUpload={handleUpload}
                    status={uploadStatus}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={() => setLastUploaded(null)}
                    lastFile={lastUploaded}
                  />

                  <JDInput
                    value={jd}
                    onChange={setJd}
                    onRank={() => handleRank()}
                    loading={loading}
                    disabled={uploadedFiles.length === 0}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-8 group">
                  <div className="flex items-center gap-4">
                    <button onClick={resetToSetup} className="p-2 -ml-2 hover:bg-[var(--bg-sunken)] rounded-full transition-colors text-[var(--text-secondary)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="font-display text-[32px] font-normal italic">Analysis Results</h2>
                  </div>
                  {selectedCandidates.length === 2 && (
                    <button onClick={triggerComparison} className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                      Compare top 2
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {results.map((candidate, idx) => (
                    <motion.div key={candidate.filename} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
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

                {/* New Scan Option for Job Seeker Mode */}
                {!isRecruiterMode && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex justify-center"
                  >
                    <button 
                      onClick={resetToSetup}
                      className="px-8 py-4 bg-[var(--bg-sunken)] border border-[var(--border)] rounded-2xl hover:bg-[var(--text-primary)] hover:text-[var(--bg-surface)] hover:border-[var(--text-primary)] transition-all font-bold tracking-wide flex items-center gap-3 shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" /><line x1="16" y1="5" x2="22" y2="5" /><line x1="19" y1="2" x2="19" y2="8" /></svg>
                      Start New Scan
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mt-8 bg-[var(--bg-surface)] border border-[var(--red)]/30 rounded-[24px] p-5 shadow-2xl flex items-center gap-4 relative overflow-hidden">
              <div className="h-10 w-10 bg-[var(--red)] rounded-full flex items-center justify-center text-white shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              </div>
              <div className="flex-1 text-[var(--text-primary)]">
                <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">Attention Required</h4>
                <p className="text-[14px] font-medium opacity-60">{error}</p>
              </div>
              <button onClick={() => setError('')} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
              <div className="absolute bottom-0 left-0 h-1 bg-[var(--red)]/10 w-full"><motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 8 }} onAnimationComplete={() => setError('')} className="h-full bg-[var(--red)]" /></div>
            </motion.div>
          )}
        </main>

        <footer className="mt-auto py-12 border-t border-[var(--border)] flex flex-col items-center gap-4 bg-[var(--bg-base)]">
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            <button className="hover:text-[var(--accent)] transition-colors">Privacy Policy</button>
            <button className="hover:text-[var(--accent)] transition-colors">Terms of Service</button>
            <button className="hover:text-[var(--accent)] transition-colors">Data Deletion</button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">&copy; 2026 Developed by Shivam8292 • Intelligent Screening</p>
        </footer>
      </div>

      {comparison && <ComparisonView comparison={comparison} onClose={() => setComparison(null)} />}

      <AnimatePresence>
        {optimization && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--bg-surface)] rounded-[32px] w-full max-w-[800px] max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border)] p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-[12px] uppercase tracking-widest mb-2">Tailored Improvement Plan</div>
                    <h2 className="text-[32px] font-display italic">Optimizing {optimization.filename}</h2>
                  </div>
                  <button onClick={() => setOptimization(null)} className="p-2 hover:bg-[var(--bg-sunken)] rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-widest mb-4">Rewritten Points</h3>
                    <div className="space-y-3">{optimization.improved_points?.map((p, i) => (<div key={i} className="bg-[var(--bg-sunken)] p-4 rounded-xl text-[14px] leading-relaxed">"{p}"</div>))}</div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[13px] font-black uppercase tracking-widest mb-4">Missing Keywords</h3>
                      <div className="flex flex-wrap gap-2">{optimization.missing_keywords?.map((k, i) => (<span key={i} className="px-3 py-1.5 rounded-lg bg-[var(--amber-subtle)] text-[12px] text-[var(--amber)] font-bold">{k}</span>))}</div>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-black uppercase tracking-widest mb-4">Strategic Advice</h3>
                      <ul className="space-y-3">{optimization.suggestions?.map((s, i) => (<li key={i} className="text-[14px] opacity-60">• {s}</li>))}</ul>
                    </div>
                  </div>
                </div>
                <button onClick={() => setOptimization(null)} className="w-full mt-10 py-4 bg-[var(--text-primary)] text-[var(--bg-surface)] font-bold rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all">Got it</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isImproving && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--bg-base)]/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[15px] font-bold">Optimizing Bullets...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
