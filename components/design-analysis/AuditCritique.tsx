
import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PaletteDisplay } from './PaletteDisplay';

interface AuditCritiqueProps {
    critique: string;
    colorPalette: string[];
}

export const AuditCritique: React.FC<AuditCritiqueProps> = ({ critique, colorPalette }) => {
    return (
        <div className="flex-1 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="mb-8">
                <h3 className="text-xl font-bold text-[var(--accent-cyan)] flex items-center gap-2 mb-4">
                    <SparklesIcon className="h-5 w-5" />
                    Feng Shui Audit
                </h3>
                <div className="relative pl-6">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-blue)]/30 rounded-full"></div>
                    <p className="text-gray-200 text-lg leading-relaxed italic font-light">
                        "{critique}"
                    </p>
                </div>
            </div>
            
            <PaletteDisplay colorPalette={colorPalette} />
        </div>
    );
};
