import React from 'react';
import { motion } from 'framer-motion';
import { Plus, History, Trash2, Moon, Sun, Upload, FileText, RefreshCw } from 'lucide-react';

const Sidebar = ({ 
  uploadedFiles, 
  onNewScan, 
  onRemoveFile, 
  onClearAll, 
  theme, 
  toggleTheme,
  onUploadClick,
  onProcessFile
}) => {
  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col w-[280px] h-screen border-r border-[var(--border)] bg-[var(--bg-surface)] sticky top-0"
    >
      {/* Sidebar Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">History</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--bg-sunken)] rounded-xl transition-all active:scale-90"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <button 
          onClick={onNewScan}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-2xl font-bold text-[14px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          <Plus size={18} strokeWidth={3} />
          New Scan
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <div className="space-y-2 pb-6">
          {uploadedFiles.length === 0 ? (
            <div className="py-12 text-center opacity-20">
              <History className="mx-auto mb-2" size={24} />
              <p className="text-[11px] font-bold uppercase tracking-widest">No history</p>
            </div>
          ) : (
            uploadedFiles.map((file, idx) => (
              <motion.div 
                key={file}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-sunken)] border border-transparent hover:border-[var(--border)] transition-all cursor-default"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="shrink-0 p-2 bg-[var(--bg-sunken)] group-hover:bg-[var(--bg-surface)] rounded-lg transition-colors">
                    <FileText size={16} className="text-[var(--accent)]" />
                  </div>
                  <span className="text-[13px] font-semibold truncate max-w-[120px]">
                    {file.replace('.pdf', '')}
                  </span>
                </div>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onProcessFile(file)}
                    className="p-1.5 hover:text-[var(--accent)] transition-colors"
                    title="Re-sync"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button 
                    onClick={() => onRemoveFile(file)}
                    className="p-1.5 hover:text-[var(--red)] transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Footer / Upload Action */}
      <div className="p-6 border-t border-[var(--border)] space-y-4">
        <button 
          onClick={onUploadClick}
          className="w-full h-11 flex items-center justify-center gap-2 border-2 border-dashed border-[var(--border-strong)] rounded-2xl text-[12px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          <Upload size={16} />
          Upload More
        </button>

        {uploadedFiles.length > 0 && (
          <button 
            onClick={onClearAll}
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-tertiary)] hover:text-[var(--red)] transition-colors py-2"
          >
            Clear All
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
