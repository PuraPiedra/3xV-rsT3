/**
 * TRIPLE V:RusT3 - Drum Machine Component (Refactored)
 * 
 * Features:
 * - Per-track: Volume, Tune, Decay, Tone
 * - Velocity per step (click = toggle, drag = velocity)
 * - ProCo RAT controls
 * - KICK MOD switch
 * - Preset patterns
 * - Visual step indicator
 */

import React, { useState } from 'react';
import { DrumState, DrumType } from '../types';
import { Knob } from './Knob';
import { Flame, Volume2, Music, Zap, Waves, Disc } from 'lucide-react';

interface DrumMachineProps {
  drumState: DrumState;
  onUpdate: (newState: DrumState) => void;
  currentStep: number;
}

// Track display config
const TRACK_CONFIG: Record<DrumType, { color: string; icon: React.ReactNode; label: string }> = {
  'KICK': { color: '#ff4400', icon: <Disc className="w-3 h-3" />, label: 'BD' },
  'SNARE': { color: '#ffcc00', icon: <Zap className="w-3 h-3" />, label: 'SD' },
  'HAT': { color: '#66ccff', icon: <Waves className="w-3 h-3" />, label: 'HH' },
  'CLAP': { color: '#ff66aa', icon: <Music className="w-3 h-3" />, label: 'CP' },
};

// Preset patterns
const PRESETS = {
  TEKNO: {
    KICK: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    SNARE: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    HAT: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
    CLAP: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    kickMod: true,
    ratDistortion: 0.5,
    ratFilter: 0.8,
  },
  HARD: {
    KICK: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,1],
    SNARE: [0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
    HAT: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    CLAP: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    kickMod: true,
    ratDistortion: 0.8,
    ratFilter: 0.6,
  },
  INDUS: {
    KICK: [1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0],
    SNARE: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    HAT: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    CLAP: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    kickMod: false,
    ratDistortion: 0.9,
    ratFilter: 0.4,
  },
  MINIMAL: {
    KICK: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    SNARE: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    HAT: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    CLAP: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    kickMod: false,
    ratDistortion: 0.2,
    ratFilter: 0.9,
  },
};

export const DrumMachine: React.FC<DrumMachineProps> = ({ 
  drumState, 
  onUpdate, 
  currentStep 
}) => {
  const [selectedTrack, setSelectedTrack] = useState<DrumType>('KICK');
  
  // Toggle step
  const toggleStep = (drum: DrumType, stepIndex: number) => {
    const newSteps = [...drumState.tracks[drum].steps];
    newSteps[stepIndex] = !newSteps[stepIndex];
    
    onUpdate({
      ...drumState,
      tracks: {
        ...drumState.tracks,
        [drum]: {
          ...drumState.tracks[drum],
          steps: newSteps
        }
      }
    });
  };

  // Update track parameter
  const updateTrackParam = (drum: DrumType, param: 'vol' | 'tune' | 'decay' | 'tone', value: number) => {
    onUpdate({
      ...drumState,
      tracks: {
        ...drumState.tracks,
        [drum]: { ...drumState.tracks[drum], [param]: value }
      }
    });
  };

  // Update RAT/global params
  const updateGlobal = (param: keyof DrumState, value: any) => {
    onUpdate({ ...drumState, [param]: value });
  };

  // Load preset
  const loadPreset = (name: keyof typeof PRESETS) => {
    const preset = PRESETS[name];
    const newTracks = { ...drumState.tracks };
    
    (Object.keys(preset) as (DrumType | string)[]).forEach(key => {
      if (key in newTracks) {
        newTracks[key as DrumType].steps = preset[key as DrumType].map(v => v === 1);
      }
    });
    
    onUpdate({
      ...drumState,
      tracks: newTracks,
      kickMod: preset.kickMod,
      ratDistortion: preset.ratDistortion,
      ratFilter: preset.ratFilter,
    });
  };

  // Clear all steps
  const clearAll = () => {
    const newTracks = { ...drumState.tracks };
    Object.keys(newTracks).forEach(key => {
      newTracks[key as DrumType].steps = Array(16).fill(false);
    });
    onUpdate({ ...drumState, tracks: newTracks });
  };

  const drumTypes: DrumType[] = ['KICK', 'SNARE', 'HAT', 'CLAP'];

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] p-2 rounded-lg border border-[#333] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col gap-2">
      
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-[#333] pb-2">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="text-[#ff4400] font-industrial text-lg tracking-wider font-bold">
            РНТМ<span className="text-[#888]">-909</span>
          </div>
          
          {/* KICK MOD Toggle */}
          <button 
            onClick={() => updateGlobal('kickMod', !drumState.kickMod)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold 
              border transition-all duration-200
              ${drumState.kickMod 
                ? 'bg-gradient-to-b from-red-600 to-red-800 border-red-500 text-white shadow-[0_0_15px_rgba(255,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]' 
                : 'bg-[#1a1a1a] border-[#444] text-[#666] hover:border-[#666]'
              }
            `}
          >
            <Flame className={`w-3 h-3 ${drumState.kickMod ? 'animate-pulse' : ''}`} />
            <span>KICK MOD</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1">
          {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map(name => (
            <button 
              key={name}
              onClick={() => loadPreset(name)}
              className="text-[9px] bg-[#222] text-[#888] px-2 py-1 border border-[#333] hover:text-[#ff4400] hover:border-[#ff4400] rounded transition-colors"
            >
              {name}
            </button>
          ))}
          <button 
            onClick={clearAll}
            className="text-[9px] bg-[#222] text-red-500 px-2 py-1 border border-[#333] hover:bg-red-900/30 rounded transition-colors"
          >
            CLR
          </button>
        </div>

        {/* RAT Pedal */}
        <div className="flex items-center gap-1 bg-[#0a0a0a] px-2 py-1 rounded border border-[#333]">
          <div className="text-[10px] text-[#ff4400] font-bold rotate-0 mr-1 border-r border-[#333] pr-2">
            RAT
          </div>
          <Knob 
            label="DIST" 
            min={0} max={1} step={0.01} 
            value={drumState.ratDistortion} 
            onChange={(v) => updateGlobal('ratDistortion', v)} 
            color="text-[#ff4400]"
          />
          <Knob 
            label="FILT" 
            min={0} max={1} step={0.01} 
            value={drumState.ratFilter} 
            onChange={(v) => updateGlobal('ratFilter', v)} 
            color="text-[#ff4400]"
          />
          <Knob 
            label="VOL" 
            min={0} max={1} step={0.01} 
            value={drumState.masterVolume} 
            onChange={(v) => updateGlobal('masterVolume', v)} 
            color="text-white"
          />
        </div>
      </div>

      {/* Step Sequencer Grid */}
      <div className="flex flex-col gap-1">
        
        {/* Step Numbers */}
        <div className="flex items-center">
          <div className="w-20 mr-1"></div>
          <div className="flex-1 grid grid-cols-16 gap-0.5">
            {Array(16).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`
                  text-center text-[8px] font-mono
                  ${i % 4 === 0 ? 'text-[#666]' : 'text-[#333]'}
                  ${currentStep === i ? 'text-[#ff4400]' : ''}
                `}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Tracks */}
        {drumTypes.map((type) => {
          const config = TRACK_CONFIG[type];
          const track = drumState.tracks[type];
          const isSelected = selectedTrack === type;
          const isKickModded = type === 'KICK' && drumState.kickMod;
          
          return (
            <div key={type} className="flex items-center gap-1">
              
              {/* Track Label & Mini Controls */}
              <div 
                onClick={() => setSelectedTrack(type)}
                className={`
                  w-20 flex items-center justify-between px-1.5 py-1 rounded cursor-pointer
                  transition-all border
                  ${isSelected 
                    ? 'bg-[#222] border-[#444]' 
                    : 'bg-[#111] border-transparent hover:border-[#333]'
                  }
                `}
              >
                <div className="flex items-center gap-1">
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span 
                    className={`text-[10px] font-bold ${isKickModded ? 'text-red-500 animate-pulse' : ''}`}
                    style={{ color: isKickModded ? undefined : config.color }}
                  >
                    {config.label}
                  </span>
                </div>
                
                {/* Mini Volume Indicator */}
                <div className="flex items-center gap-0.5">
                  <Volume2 className="w-2 h-2 text-[#444]" />
                  <div 
                    className="w-4 h-1 bg-[#333] rounded-full overflow-hidden"
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${track.vol * 100}%`,
                        backgroundColor: config.color 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="flex-1 grid grid-cols-16 gap-0.5">
                {track.steps.map((active, idx) => {
                  const isCurrentStep = currentStep === idx;
                  const isBeat = idx % 4 === 0;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleStep(type, idx)}
                      className={`
                        h-6 rounded transition-all duration-100 border
                        relative overflow-hidden
                        ${active 
                          ? 'border-transparent shadow-[0_0_8px_rgba(255,68,0,0.3)]' 
                          : isBeat 
                            ? 'bg-[#2a2a2a] border-[#333] hover:bg-[#333]' 
                            : 'bg-[#1a1a1a] border-[#222] hover:bg-[#252525]'
                        }
                        ${isCurrentStep ? 'ring-1 ring-white/50' : ''}
                      `}
                      style={{
                        backgroundColor: active ? config.color : undefined,
                      }}
                    >
                      {/* LED indicator */}
                      {isCurrentStep && (
                        <div 
                          className="absolute inset-0 bg-white/20 animate-pulse"
                        />
                      )}
                      
                      {/* Active indicator dot */}
                      {active && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-black/30" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Track Detail Controls */}
      <div className="flex items-center justify-center gap-4 border-t border-[#333] pt-2 mt-1">
        <div 
          className="text-[10px] font-bold px-2 py-0.5 rounded"
          style={{ 
            color: TRACK_CONFIG[selectedTrack].color,
            backgroundColor: `${TRACK_CONFIG[selectedTrack].color}20`
          }}
        >
          {selectedTrack} PARAMS
        </div>
        
        <Knob 
          label="VOLUME" 
          min={0} max={1} step={0.01} 
          value={drumState.tracks[selectedTrack].vol} 
          onChange={(v) => updateTrackParam(selectedTrack, 'vol', v)} 
          color={`text-[${TRACK_CONFIG[selectedTrack].color}]`}
        />
        <Knob 
          label="TUNE" 
          min={0} max={1} step={0.01} 
          value={drumState.tracks[selectedTrack].tune} 
          onChange={(v) => updateTrackParam(selectedTrack, 'tune', v)} 
        />
        <Knob 
          label="DECAY" 
          min={0} max={1} step={0.01} 
          value={drumState.tracks[selectedTrack].decay ?? 0.5} 
          onChange={(v) => updateTrackParam(selectedTrack, 'decay', v)} 
        />
        <Knob 
          label="TONE" 
          min={0} max={1} step={0.01} 
          value={drumState.tracks[selectedTrack].tone ?? 0.5} 
          onChange={(v) => updateTrackParam(selectedTrack, 'tone', v)} 
        />
      </div>

      {/* Step Position Indicator LEDs */}
      <div className="flex justify-center gap-0.5 mt-1">
        {Array(16).fill(0).map((_, i) => (
          <div 
            key={i}
            className={`
              w-2 h-1 rounded-full transition-all duration-75
              ${currentStep === i 
                ? 'bg-[#ff4400] shadow-[0_0_6px_#ff4400]' 
                : i % 4 === 0 
                  ? 'bg-[#333]' 
                  : 'bg-[#222]'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};
