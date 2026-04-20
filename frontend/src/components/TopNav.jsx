import { UploadCloud, Database } from 'lucide-react';

const TopNav = ({ uploadedCount, onUploadClick, onReset, onRegistryClick }) => {
    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl h-16 bg-white/5 backdrop-blur-md border border-white/60 shadow-[0_30px_100px_rgba(0,0,0,0.08)] z-[100] flex items-center justify-between px-8 rounded-[24px]">
            <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={onReset}
            >
                <div className="h-2.5 w-2.5 rounded-full bg-black group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                <span className="font-[Inter] font-extrabold text-[16px] text-black tracking-tight">Resume Screener</span>
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={onRegistryClick}
                    className="flex items-center gap-2.5 bg-black/5 hover:bg-black/10 px-5 py-2.5 rounded-full border border-black/5 transition-all active:scale-95"
                >
                    <Database size={16} className="text-black/40" />
                    <span className="text-[11px] font-black text-black uppercase tracking-widest">
                        {uploadedCount} Files
                    </span>
                </button>
                <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2.5 text-[13px] font-bold text-white bg-black hover:bg-black/80 px-6 py-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-2xl shadow-black/20"
                >
                    <UploadCloud size={16} />
                    <span>New Scan</span>
                </button>
            </div>
        </nav>
    );
};

export default TopNav;
