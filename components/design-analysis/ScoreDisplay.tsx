
import React from 'react';

interface ScoreDisplayProps {
    score: number;
    detectedStyle: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, detectedStyle }) => {
    const getScoreColor = (scoreValue: number) => {
        if (scoreValue >= 80) return 'text-[var(--accent-cyan)] border-[var(--accent-cyan)] shadow-[0_0_20px_rgba(23,245,245,0.3)]';
        if (scoreValue >= 60) return 'text-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]';
        return 'text-red-400 border-red-400 shadow-[0_0_20px_rgba(248,113,113,0.3)]';
    };

    return (
        <div className="w-full lg:w-72 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary-blue)]/5 to-transparent pointer-events-none" />
            
            <div className={`relative w-40 h-40 rounded-full border-[6px] flex items-center justify-center bg-[#0F131D] z-10 ${getScoreColor(score)}`}>
                <span className="text-6xl font-extrabold text-white tracking-tighter">{score}</span>
                <div className="absolute -bottom-4 bg-[#0F131D] px-4 py-1 rounded-full border border-white/10 shadow-lg">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Score</span>
                </div>
            </div>
            <div className="mt-8 text-center z-10">
                <span className="text-lg font-bold text-white block leading-tight mb-1">{detectedStyle}</span>
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Detected Style</span>
            </div>
        </div>
    );
};
