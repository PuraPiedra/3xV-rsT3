/**
 * TRIPLE V:RusT3 - MIDI Settings Panel
 * 
 * Complete MIDI configuration:
 * - Device selection (IN/OUT)
 * - Clock source (Internal/External)
 * - Per-module channel routing
 * - CC Learn and mapping
 * - Transport controls
 */

import React, { useEffect, useState } from 'react';
import { 
  Cable, X, CheckCircle, RefreshCw, Play, Square, 
  Radio, Zap, Music, Volume2, Clock, ArrowRight, 
  ArrowLeft, Trash2, Settings2
} from 'lucide-react';
import { MidiService, MidiChannel, CcMapping, MidiClockConfig } from '../services/midiService';
import { MAPPABLE_PARAMETERS } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleRouting {
  id: string;
  label: string;
  color: string;
  noteIn: MidiChannel;
  noteOut: MidiChannel;
  ccIn: MidiChannel;
  ccOut: MidiChannel;
}

interface MidiSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  midiService: MidiService;
  
  // Module routing
  moduleRoutings: ModuleRouting[];
  onUpdateRouting: (moduleId: string, routing: Partial<ModuleRouting>) => void;
  
  // CC Mappings
  ccMappings: CcMapping[];
  onUpdateMappings: (mappings: CcMapping[]) => void;
  
  // Clock
  clockConfig: MidiClockConfig;
  onUpdateClock: (config: Partial<MidiClockConfig>) => void;
  
  // Transport callbacks
  onTransportStart: () => void;
  onTransportStop: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MidiSettings: React.FC<MidiSettingsProps> = ({
  isOpen,
  onClose,
  midiService,
  moduleRoutings,
  onUpdateRouting,
  ccMappings,
  onUpdateMappings,
  clockConfig,
  onUpdateClock,
  onTransportStart,
  onTransportStop,
}) => {
  // Local state
  const [inputs, setInputs] = useState<{ id: string; name: string }[]>([]);
  const [outputs, setOutputs] = useState<{ id: string; name: string }[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string | null>(null);
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DEVICES' | 'ROUTER' | 'CLOCK' | 'MAPPING'>('DEVICES');
  const [learningParam, setLearningParam] = useState<string | null>(null);
  const [lastCcReceived, setLastCcReceived] = useState<number | null>(null);
  
  // Scan devices on open
  useEffect(() => {
    if (isOpen) {
      scanDevices();
      setSelectedInputId(midiService.getActiveInput());
      setSelectedOutputId(midiService.getActiveOutput());
    }
  }, [isOpen]);

  // Handle CC learning
  useEffect(() => {
    if (learningParam) {
      midiService.startLearning((cc, channel) => {
        setLastCcReceived(cc);
        
        // Find parameter definition
        const paramDef = MAPPABLE_PARAMETERS.find(p => p.id === learningParam);
        if (paramDef) {
          const newMapping: CcMapping = {
            cc,
            paramPath: learningParam,
            min: paramDef.min,
            max: paramDef.max,
            channel: channel as MidiChannel,
          };
          
          const newMappings = ccMappings.filter(m => m.paramPath !== learningParam);
          newMappings.push(newMapping);
          onUpdateMappings(newMappings);
        }
        
        setLearningParam(null);
        midiService.stopLearning();
      });
    }
    
    return () => {
      if (learningParam) {
        midiService.stopLearning();
      }
    };
  }, [learningParam]);

  const scanDevices = () => {
    setInputs(midiService.getInputs().map(d => ({ id: d.id, name: d.name })));
    setOutputs(midiService.getOutputs().map(d => ({ id: d.id, name: d.name })));
  };

  const handleSelectInput = (id: string) => {
    setSelectedInputId(id);
    midiService.selectInput(id);
  };

  const handleSelectOutput = (id: string) => {
    setSelectedOutputId(id);
    midiService.selectOutput(id);
  };

  const getCcForParam = (paramPath: string): number | null => {
    const mapping = ccMappings.find(m => m.paramPath === paramPath);
    return mapping ? mapping.cc : null;
  };

  const clearMapping = (paramPath: string) => {
    onUpdateMappings(ccMappings.filter(m => m.paramPath !== paramPath));
  };

  // Channel select dropdown
  const ChannelSelect: React.FC<{
    value: MidiChannel;
    onChange: (val: MidiChannel) => void;
    allowAll?: boolean;
    allowOff?: boolean;
  }> = ({ value, onChange, allowAll = true, allowOff = true }) => (
    <select
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === 'ALL' ? 'ALL' : val === 'OFF' ? 'OFF' : parseInt(val) as MidiChannel);
      }}
      className="bg-[#222] border border-[#444] text-xs rounded px-2 py-1 text-gray-200 outline-none focus:border-[#ff4400] w-16"
    >
      {allowAll && <option value="ALL">ALL</option>}
      {allowOff && <option value="OFF">OFF</option>}
      {Array.from({ length: 16 }, (_, i) => i + 1).map(ch => (
        <option key={ch} value={ch}>{ch}</option>
      ))}
    </select>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1d] border border-[#333] rounded-lg w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d2d30] to-[#1a1a1d] p-4 flex justify-between items-center border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff4400] to-[#cc3300] flex items-center justify-center shadow-lg">
              <Cable className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-wide">MIDI CONFIGURATION</h2>
              <p className="text-[10px] text-[#666]">Devices • Routing • Clock • CC Mapping</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-[#333] hover:bg-[#444] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333]">
          {(['DEVICES', 'ROUTER', 'CLOCK', 'MAPPING'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 py-3 text-xs font-bold tracking-wider transition-all
                ${activeTab === tab 
                  ? 'bg-[#222] text-[#ff4400] border-b-2 border-[#ff4400]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]/50'
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* DEVICES TAB */}
          {activeTab === 'DEVICES' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-bold text-gray-300">MIDI INPUT</h3>
                </div>
                
                {inputs.length === 0 ? (
                  <div className="text-gray-600 text-sm italic p-4 bg-[#222] rounded-lg border border-dashed border-[#444]">
                    No MIDI inputs detected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inputs.map(input => (
                      <button
                        key={input.id}
                        onClick={() => handleSelectInput(input.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg border transition-all
                          ${selectedInputId === input.id 
                            ? 'bg-green-900/20 border-green-500/50 text-green-400' 
                            : 'bg-[#222] border-[#333] text-gray-400 hover:border-[#444]'
                          }
                        `}
                      >
                        <span className="text-sm truncate">{input.name}</span>
                        {selectedInputId === input.id && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Outputs */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowLeft className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-gray-300">MIDI OUTPUT</h3>
                </div>
                
                {outputs.length === 0 ? (
                  <div className="text-gray-600 text-sm italic p-4 bg-[#222] rounded-lg border border-dashed border-[#444]">
                    No MIDI outputs detected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {outputs.map(output => (
                      <button
                        key={output.id}
                        onClick={() => handleSelectOutput(output.id)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-lg border transition-all
                          ${selectedOutputId === output.id 
                            ? 'bg-orange-900/20 border-orange-500/50 text-orange-400' 
                            : 'bg-[#222] border-[#333] text-gray-400 hover:border-[#444]'
                          }
                        `}
                      >
                        <span className="text-sm truncate">{output.name}</span>
                        {selectedOutputId === output.id && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Rescan Button */}
              <div className="md:col-span-2">
                <button 
                  onClick={scanDevices} 
                  className="w-full flex items-center justify-center gap-2 p-3 border border-[#444] text-gray-400 hover:text-white hover:bg-[#333] rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">RESCAN DEVICES</span>
                </button>
              </div>
            </div>
          )}

          {/* ROUTER TAB */}
          {activeTab === 'ROUTER' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 mb-4">
                Configure MIDI channel routing for each module. Set to OFF to disable.
              </p>
              
              <div className="bg-[#222] rounded-lg border border-[#333] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1a1a1a] text-[10px] text-gray-500 uppercase">
                      <th className="p-3 text-left">Module</th>
                      <th className="p-3 text-center">Note IN</th>
                      <th className="p-3 text-center">Note OUT</th>
                      <th className="p-3 text-center">CC IN</th>
                      <th className="p-3 text-center">CC OUT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {moduleRoutings.map(module => (
                      <tr key={module.id} className="hover:bg-[#2a2a2a]">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: module.color }}
                            />
                            <span className="text-sm font-bold" style={{ color: module.color }}>
                              {module.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <ChannelSelect 
                            value={module.noteIn} 
                            onChange={(val) => onUpdateRouting(module.id, { noteIn: val })} 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <ChannelSelect 
                            value={module.noteOut} 
                            onChange={(val) => onUpdateRouting(module.id, { noteOut: val })} 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <ChannelSelect 
                            value={module.ccIn} 
                            onChange={(val) => onUpdateRouting(module.id, { ccIn: val })} 
                          />
                        </td>
                        <td className="p-3 text-center">
                          <ChannelSelect 
                            value={module.ccOut} 
                            onChange={(val) => onUpdateRouting(module.id, { ccOut: val })} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CLOCK TAB */}
          {activeTab === 'CLOCK' && (
            <div className="space-y-6">
              {/* Clock Source */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ff4400]" />
                  CLOCK SOURCE
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onUpdateClock({ source: 'internal' })}
                    className={`
                      p-4 rounded-lg border transition-all flex flex-col items-center gap-2
                      ${clockConfig.source === 'internal'
                        ? 'bg-[#ff4400]/20 border-[#ff4400] text-[#ff4400]'
                        : 'bg-[#222] border-[#333] text-gray-500 hover:border-[#444]'
                      }
                    `}
                  >
                    <Radio className="w-6 h-6" />
                    <span className="text-sm font-bold">INTERNAL</span>
                    <span className="text-[10px] opacity-70">Use app BPM</span>
                  </button>
                  
                  <button
                    onClick={() => onUpdateClock({ source: 'external' })}
                    className={`
                      p-4 rounded-lg border transition-all flex flex-col items-center gap-2
                      ${clockConfig.source === 'external'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-[#222] border-[#333] text-gray-500 hover:border-[#444]'
                      }
                    `}
                  >
                    <Cable className="w-6 h-6" />
                    <span className="text-sm font-bold">EXTERNAL</span>
                    <span className="text-[10px] opacity-70">Sync to MIDI IN</span>
                  </button>
                </div>
              </div>

              {/* Clock Output Options */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3">CLOCK OUTPUT</h3>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-[#333]">
                    <span className="text-sm text-gray-400">Send MIDI Clock</span>
                    <input
                      type="checkbox"
                      checked={clockConfig.sendClock}
                      onChange={(e) => onUpdateClock({ sendClock: e.target.checked })}
                      className="w-4 h-4 accent-[#ff4400]"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-[#333]">
                    <span className="text-sm text-gray-400">Send Transport (Start/Stop)</span>
                    <input
                      type="checkbox"
                      checked={clockConfig.sendTransport}
                      onChange={(e) => onUpdateClock({ sendTransport: e.target.checked })}
                      className="w-4 h-4 accent-[#ff4400]"
                    />
                  </label>
                </div>
              </div>

              {/* Transport Test */}
              <div>
                <h3 className="text-sm font-bold text-gray-300 mb-3">TRANSPORT TEST</h3>
                
                <div className="flex gap-3">
                  <button
                    onClick={onTransportStart}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-green-900/30 border border-green-800 text-green-400 rounded-lg hover:bg-green-900/50 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-bold">START</span>
                  </button>
                  
                  <button
                    onClick={onTransportStop}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">STOP</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAPPING TAB */}
          {activeTab === 'MAPPING' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                  Click LEARN and move a knob on your controller to assign CC.
                </p>
                {lastCcReceived !== null && (
                  <span className="text-xs bg-[#ff4400]/20 text-[#ff4400] px-2 py-1 rounded">
                    Last CC: {lastCcReceived}
                  </span>
                )}
              </div>
              
              {MAPPABLE_PARAMETERS.map(param => {
                const assignedCc = getCcForParam(param.id);
                const isLearning = learningParam === param.id;
                
                return (
                  <div 
                    key={param.id} 
                    className="flex items-center justify-between p-3 bg-[#222] rounded-lg border border-[#333]"
                  >
                    <span className="text-sm text-gray-300">{param.label}</span>
                    
                    <div className="flex items-center gap-2">
                      {assignedCc !== null ? (
                        <>
                          <span className="text-xs font-bold text-green-400 bg-green-900/30 px-3 py-1 rounded border border-green-800">
                            CC {assignedCc}
                          </span>
                          <button 
                            onClick={() => clearMapping(param.id)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setLearningParam(isLearning ? null : param.id)}
                          className={`
                            text-xs px-3 py-1.5 rounded border transition-all font-bold
                            ${isLearning 
                              ? 'bg-[#ff4400] text-white border-[#ff4400] animate-pulse' 
                              : 'bg-[#333] text-gray-400 border-[#444] hover:text-white hover:border-[#666]'
                            }
                          `}
                        >
                          {isLearning ? 'WAITING...' : 'LEARN'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#222] p-4 flex justify-between items-center border-t border-[#333]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${midiService.isConnected() ? 'bg-green-500' : 'bg-red-500'}`} />
            {midiService.isConnected() ? 'Connected' : 'Not connected'}
          </div>
          
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-[#ff4400] hover:bg-[#ff5500] text-white text-sm font-bold rounded-lg transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
