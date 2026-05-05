import { UploadCloud, Database } from 'lucide-react';

const TopNav = ({ uploadedCount, onUploadClick, onReset, onRegistryClick }) => {
    return (
        <nav className="sticky top-6 mx-auto w-[98%] max-w-6xl h-16 bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border)] shadow-[0_30px_100px_rgba(0,0,0,0.08)] z-[100] flex items-center justify-between px-8 rounded-[24px] mt-6 transition-all duration-300">
            <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={onReset}
            >
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--text-primary)] group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                <span className="font-[Inter] font-extrabold text-[16px] text-[var(--text-primary)] tracking-tight">Resume Screener</span>
            </div>
        </nav>
    );
};

export default TopNav;
