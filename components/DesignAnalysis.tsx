
import React from 'react';
import { DesignAnalysis } from '../types';
import { ScoreDisplay } from './design-analysis/ScoreDisplay';
import { AuditCritique } from './design-analysis/AuditCritique';
import { ImprovementsList } from './design-analysis/ImprovementsList';

interface DesignAnalysisProps {
    analysis: DesignAnalysis;
}

export const DesignAnalysisDisplay: React.FC<DesignAnalysisProps> = ({ analysis }) => {
    return (
        <div className="glass-surface rounded-3xl mb-10 fade-in border border-[var(--primary-blue)]/30 overflow-hidden flex flex-col lg:flex-row relative bg-[#0B0F17]/90 backdrop-blur-xl shadow-2xl">
            <ScoreDisplay score={analysis.score} detectedStyle={analysis.detectedStyle} />
            <AuditCritique critique={analysis.critique} colorPalette={analysis.colorPalette} />
            <ImprovementsList suggestions={analysis.suggestions} />
        </div>
    );
};
