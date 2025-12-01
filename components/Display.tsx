/**
 * TRIPLE V:RusT3 - Display Component
 * 
 * Main LCD display with:
 * - Current patch name
 * - Categorized preset browser
 * - Random preset selection
 * - NO AI/Gemini dependency
 */

import React, { useState } from 'react';
import { Shuffle, Library, X, Music, ChevronRight, Zap, Volume2, Waves, Sparkles, Radio, Layers } from 'lucide-react';
import { SynthPatch } from './types';
import { 
  PRESET_CATEGORIES, 
  PRESET_CATEGORY_NAMES, 
  getRandomPreset, 
  getRandomPresetFromCategory 
} from './presets';

// Category icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; description: string }> = {
  INIT: { icon: <Radio className="w-3 h-3" />, color: '#888888', description: 'Basic initialized patches' },
  LEADS: { icon: <Zap className="w-3 h-3" />, color: '#ff4400', description: 'Cutting lead sounds' },
  BASSES: { icon: <Volume2 className="w-3 h-3" />, color: '#ffcc00', description: 'Deep bass sounds' },
  PADS: { icon: <Waves className="w-3 h-3" />, color: '#66ccff', description: 'Lush evolving pads' },
  PLUCKS: { icon: <Sparkles className="w-3 h-3" />, color: '#ff66aa', description: 'Percussive pluck sounds' },
  ARPS: { icon: <Layers className="w-3 h-3" />, color: '#4ade80', description: 'Arpeggiator presets' },
  SEQUENCES: { icon: <Music className="w-3 h-3" />, color: '#a855f7', description: 'Sequencer-ready sounds' },
  FX: { icon: <Radio className="w-3 h-3" />, color: '#06b6d4', description: 'Effects & textures' },
};

interface DisplayProps {
  patchName: string;
  onSelectPreset: (patch: SynthPatch) => void;
  onRandomize: () => void;
}

export const Display: React.FC<DisplayProps> = ({ 
  patchName, 
  onSelectPreset, 
  onRandomize
}) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PRESET_CATEGORIES>('LEADS');

  const handlePresetClick = (preset: SynthPatch) => {
    onSelectPreset(preset);
    setShowBrowser(false);
  };

  const handleRandomFromCategory = () => {
    const preset = getRandomPresetFromCategory(selectedCategory);
    onSelectPreset(preset);
  };

  const handleGlobalRandom = () => {
    const preset = getRandomPreset();
    onSelectPreset(preset);
    setShowBrowser(false);
  };

  const categoryConfig = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG.INIT;
  const categoryPresets = PRESET_CATEGORIES[selectedCategory];

  return (
    <div className="w-full h-24 bg-gradient-to-b from-[#0a1520] to-[#112233] rounded-lg border-2 border-[#334455] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] p-2 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.02),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
      
      {/* Header */}
      <div className="flex justify-between items-center z-20 text-[#66ccff] font-mono text-[10px] relative border-b border-[#66ccff]/20 pb-0.5 mb-0.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#66ccff]/10 border border-[#66ccff]/30">
            <Music className="w-3 h-3" />
            <span className="font-bold">POLY SYNTH</span>
          </div>
          <span className="text-[#666] text-[8px]">VIRUS STYLE</span>
        </div>

        <div className="flex gap-1">
          <button 
            onClick={handleGlobalRandom}
            title="Random Preset"
            className="hover:text-white flex items-center gap-1 border border-[#66ccff]/30 px-1.5 py-0.5 rounded hover:bg-[#66ccff]/10 transition-colors"
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden sm:inline">RND</span>
          </button>
          <button 
            onClick={() => setShowBrowser(!showBrowser)}
            className={`flex items-center gap-1 border px-1.5 py-0.5 rounded transition-colors ${
              showBrowser 
                ? 'bg-[#66ccff]/20 border-[#66ccff] text-white' 
                : 'border-[#66ccff]/30 hover:bg-[#66ccff]/10 hover:text-white'
            }`}
          >
            <Library className="w-3 h-3" />
            <span>LIBRARY</span>
          </button>
        </div>
      </div>

      {/* Preset Browser Overlay */}
      {showBrowser && (
        <div className="absolute inset-0 bg-[#0a1218] z-40 flex flex-col">
          
          {/* Browser Header */}
          <div className="flex justify-between items-center px-2 py-1 border-b border-[#334455] bg-[#0d1a26]">
            <div className="flex items-center gap-2">
              <span className="text-[#66ccff] text-[10px] font-mono font-bold">PRESET LIBRARY</span>
              <span className="text-[8px] text-[#666]">
                {categoryPresets.length} presets
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleRandomFromCategory}
                className="text-[#66ccff] hover:text-white p-1 hover:bg-[#66ccff]/10 rounded transition-colors"
                title={`Random from ${selectedCategory}`}
              >
                <Shuffle className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setShowBrowser(false)} 
                className="text-[#666] hover:text-white p-1 hover:bg-[#333] rounded transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Browser Content */}
          <div className="flex flex-1 min-h-0">
            
            {/* Category List */}
            <div className="w-24 border-r border-[#334455] overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
              {PRESET_CATEGORY_NAMES.map(category => {
                const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.INIT;
                const isSelected = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      w-full flex items-center gap-1 px-2 py-1.5 text-left text-[9px] font-mono transition-all
                      ${isSelected 
                        ? 'bg-[#1a2a3a] border-l-2' 
                        : 'hover:bg-[#152030] border-l-2 border-transparent'
                      }
                    `}
                    style={{ 
                      borderLeftColor: isSelected ? config.color : 'transparent',
                      color: isSelected ? config.color : '#888'
                    }}
                  >
                    {config.icon}
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>

            {/* Preset List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent p-1">
              <div className="grid grid-cols-2 gap-1">
                {categoryPresets.map((preset, i) => (
                  <button 
                    key={i}
                    onClick={() => handlePresetClick(preset)}
                    className="
                      text-left text-[9px] font-mono text-[#99bbdd] 
                      hover:bg-[#66ccff]/10 hover:text-white
                      px-1.5 py-1 rounded truncate transition-colors
                      border border-transparent hover:border-[#66ccff]/30
                    "
                  >
                    <span className="text-[#555] mr-1">{String(i + 1).padStart(2, '0')}</span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Description */}
          <div 
            className="px-2 py-1 text-[8px] border-t border-[#334455] flex items-center gap-1"
            style={{ color: categoryConfig.color }}
          >
            <ChevronRight className="w-2 h-2" />
            {categoryConfig.description}
          </div>
        </div>
      )}

      {/* Main Content Area - Patch Name */}
      <div className="z-20 flex-grow flex items-center justify-center relative overflow-hidden">
        <h1 className="text-[#66ccff] font-mono text-lg md:text-xl font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(102,204,255,0.6)] text-center truncate px-2 w-full animate-pulse-slow">
          {patchName}
        </h1>
      </div>

      {/* Bottom Status Bar */}
      <div className="z-20 flex items-center justify-between text-[8px] text-[#555] border-t border-[#66ccff]/10 pt-0.5 mt-0.5">
        <div className="flex items-center gap-2">
          <span>TRIPLE V:RusT3</span>
          <span className="text-[#333]">|</span>
          <span>NO AI MODE</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></div>
          <span>READY</span>
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or tailwind config
// @keyframes pulse-slow {
//   0%, 100% { opacity: 1; }
//   50% { opacity: 0.85; }
// }
// .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
