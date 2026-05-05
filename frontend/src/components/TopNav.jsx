import { UploadCloud, Database } from 'lucide-react';

const TopNav = ({ uploadedCount, onUploadClick, onReset, onRegistryClick }) => {
    return (
        <nav className="sticky top-6 mx-auto w-[92%] max-w-4xl h-16 bg-white/5 backdrop-blur-md border border-white/60 shadow-[0_30px_100px_rgba(0,0,0,0.08)] z-[100] flex items-center justify-between px-8 rounded-[24px] mt-6">
            <div
                className="flex items-center gap-4 cursor-pointer group"
                onClick={onReset}
            >
                <div className="h-2.5 w-2.5 rounded-full bg-black group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
                <span className="font-[Inter] font-extrabold text-[16px] text-black tracking-tight">Resume Screener</span>
            </div>
        </nav>
    );
};

export default TopNav;
