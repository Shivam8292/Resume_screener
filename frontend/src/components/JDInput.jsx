import React, { useState, useEffect } from 'react';

const JDInput = ({ value, onChange, onRank, loading, disabled }) => {
    // Animated dots for the loading state
    const [dots, setDots] = useState('');

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setDots(prev => prev.length >= 3 ? '' : prev + '·');
            }, 400);
        } else {
            setDots('');
        }
        return () => clearInterval(interval);
    }, [loading]);

    const criteria = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const minCriteria = 3;
    const remaining = minCriteria - criteria.length;
    const isQualityMet = remaining <= 0;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            <div className={`
                relative overflow-hidden border rounded-[32px] transition-all duration-500 bg-[#FBFBFD] shadow-sm
                ${!isQualityMet && !disabled && value.trim().length > 0 ? 'border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.03)]' : 'border-[#D2D2D7]/40 focus-within:border-black focus-within:ring-8 focus-within:ring-black/5'}
            `}>
                {/* Header Integration */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-black/[0.03] bg-black/[0.01]">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black text-black/60 uppercase tracking-[0.4em]">
                            Job Skills
                        </label>
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3].map((i) => (
                                <div 
                                    key={i} 
                                    className={`h-1.5 w-4 rounded-full transition-all duration-700 ${
                                        criteria.length >= i ? 'bg-black' : 'bg-black/10'
                                    }`} 
                                />
                            ))}
                        </div>
                    </div>
                    {!isQualityMet && !disabled && (
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">
                            Need {remaining} more items
                        </span>
                    )}
                    {isQualityMet && !disabled && (
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">
                            Ready to go
                        </span>
                    )}
                </div>

                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="What skills are you looking for? (e.g. Sales, Python, Marketing...)"
                    className="w-full min-h-[180px] bg-white p-8 text-[15px] font-medium text-black placeholder-black/30 focus:outline-none resize-none transition-all duration-300"
                />
            </div>

            <button
                onClick={onRank}
                disabled={disabled || loading || !isQualityMet}
                className={`
                    mt-6 w-full h-16 rounded-full font-black text-[14px] uppercase tracking-[0.2em] transition-all duration-500 
                    flex items-center justify-center active:scale-[0.98] shadow-2xl
                    ${disabled || !isQualityMet ? 'bg-black/5 text-black/20 border border-black/5 shadow-none' : 'bg-black text-white hover:bg-black/80 shadow-black/20'}
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        Thinking <span className="inline-block w-4 text-left ml-1">{dots}</span>
                    </span>
                ) : disabled ? (
                    "Upload Files First"
                ) : !isQualityMet ? (
                    `Add ${remaining} more skills`
                ) : (
                    "Start Ranking"
                )}
            </button>
        </div>
    );
};

export default JDInput;
