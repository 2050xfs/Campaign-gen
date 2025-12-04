
import React from 'react';

interface ImprovementsListProps {
    suggestions: string[];
}

export const ImprovementsList: React.FC<ImprovementsListProps> = ({ suggestions }) => {
    return (
        <div className="w-full lg:w-80 p-8 bg-white/[0.03] flex flex-col relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--primary-blue)]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-6 relative z-10">
                Improvements
            </h4>
            <ul className="space-y-6 relative z-10">
                {suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex gap-3 group">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-[var(--accent-cyan)] flex-shrink-0 shadow-[0_0_8px_var(--accent-cyan)] group-hover:scale-125 transition-transform" />
                        <span className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
                            {suggestion}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
