
import React from 'react';

interface PaletteDisplayProps {
    colorPalette: string[];
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colorPalette }) => {
    return (
        <div>
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--text-secondary)]"></span>
                Detected Palette
            </h4>
            <div className="flex flex-wrap gap-4">
                {colorPalette.map((color, idx) => (
                    <div key={idx} className="group relative">
                        <div 
                            className="w-14 h-14 rounded-xl shadow-lg border border-white/10 transition-all duration-300 transform hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer"
                            style={{ backgroundColor: color }}
                        />
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <span className="text-[10px] bg-black/90 text-white px-2 py-1 rounded border border-white/10 font-mono">
                                {color}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
