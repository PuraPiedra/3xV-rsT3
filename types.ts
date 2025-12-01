/**
 * TRIPLE V:RusT3 - Type Definitions (Updated)
 * 
 * Complete type system for:
 * - Synth Patch
 * - Drum Machine (with new params)
 * - Acid 303
 * - Trance Generator
 * - MIDI Routing
 */

// ============================================================================
// SYNTH TYPES
// ============================================================================

export enum Waveform {
  Sawtooth = 'sawtooth',
  Square = 'square',
  Sine = 'sine',
  Triangle = 'triangle',
}

export enum FilterType {
  Lowpass = 'lowpass',
  Highpass = 'highpass',
  Bandpass = 'bandpass',
}

export enum ArpMode {
  Off = 'off',
  Up = 'up',
  Down = 'down',
  UpDown = 'updown',
  Random = 'random',
  Chord = 'chord'
}

export interface OscillatorParams {
  waveform: Waveform;
  detune: number;       // -1200 to 1200 cents
  octave: number;       // -2 to 2
  mix: number;          // 0 to 1
}

export interface FilterParams {
  cutoff: number;       // 20 to 20000 Hz
  resonance: number;    // 0 to 20
  type: FilterType;
  envAmount: number;    // 0 to 5000 Hz modulation
}

export interface EnvelopeParams {
  attack: number;       // 0 to 5 s
  decay: number;        // 0 to 5 s
  sustain: number;      // 0 to 1 gain
  release: number;      // 0 to 10 s
}

export interface ArpParams {
  mode: ArpMode;
  speed: number;        // 1 to 20 Hz (legacy, not used with transport)
  octaveRange: number;  // 0 to 2
  gate: number;         // 0.1 to 1.0
  swing: number;        // 0 to 0.5
}

export interface EffectsParams {
  distortion: number;   // 0 to 1
  chorus: number;       // 0 to 1
  delayTime: number;    // 0 to 1 s
  delayFeedback: number; // 0 to 0.9
  reverbMix: number;    // 0 to 1
}

export interface SynthPatch {
  name: string;
  osc1: OscillatorParams;
  osc2: OscillatorParams;
  filter: FilterParams;
  ampEnv: EnvelopeParams;
  filterEnv: EnvelopeParams;
  arp: ArpParams;
  effects: EffectsParams;
}

// ============================================================================
// DRUM MACHINE TYPES (Updated)
// ============================================================================

export type DrumType = 'KICK' | 'SNARE' | 'HAT' | 'CLAP';

export interface DrumTrack {
  id: DrumType;
  steps: boolean[];     // 16 steps (true = active)
  vol: number;          // 0 to 1 - Track volume
  tune: number;         // 0 to 1 - Pitch/tuning
  decay: number;        // 0 to 1 - Envelope decay time (NEW)
  tone: number;         // 0 to 1 - Brightness/color (NEW)
}

export interface DrumState {
  enabled: boolean;
  tracks: Record<DrumType, DrumTrack>;
  
  // ProCo RAT Pedal
  ratDistortion: number; // 0 to 1 - Drive amount
  ratFilter: number;     // 0 to 1 - Lowpass filter
  masterVolume: number;  // 0 to 1 - Output level
  
  // Special modes
  kickMod: boolean;      // Harder kick mode for techno
}

// Default drum track factory
export const createDefaultDrumTrack = (id: DrumType): DrumTrack => ({
  id,
  steps: Array(16).fill(false),
  vol: 0.7,
  tune: 0.5,
  decay: 0.5,
  tone: 0.5,
});

// ============================================================================
// ACID 303 TYPES
// ============================================================================

export interface AcidStep {
  active: boolean;
  note: number;         // 0-12 relative to root
  octave: number;       // -1, 0, 1
  slide: boolean;
  accent: boolean;
}

export interface AcidState {
  enabled: boolean;
  waveform: 'sawtooth' | 'square';
  cutoff: number;       // 20 to 5000 Hz
  resonance: number;    // 0 to 25 (self-oscillation territory)
  envMod: number;       // 0 to 3000 Hz - Filter envelope amount
  decay: number;        // 0.1 to 1.0 s
  accent: number;       // 0 to 1 - Accent intensity
  distortion: number;   // 0 to 1
  steps: AcidStep[];    // 16 steps
  rootNote: number;     // MIDI note (36 = C2)
  volume: number;       // 0 to 1
}

// ============================================================================
// TRANCE GENERATOR TYPES
// ============================================================================

export type ScaleType = 'minor' | 'phrygian' | 'major' | 'dorian' | 'harmonic_minor';

export interface TranceState {
  enabled: boolean;
  density: number;      // 0 to 1 - Probability of trigger
  rootNote: number;     // MIDI note
  scale: ScaleType;
  routeToSynth: boolean;
  routeToAcid: boolean;
  octaveRange: number;  // 0 to 3
}

// ============================================================================
// MIDI TYPES
// ============================================================================

export type MidiChannel = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|'ALL'|'OFF';

export interface ModuleMidiConfig {
  noteIn: MidiChannel;
  noteOut: MidiChannel;
  ccIn: MidiChannel;
  ccOut: MidiChannel;
}

export interface MidiRouterConfig {
  polySynth: ModuleMidiConfig;
  acid303: ModuleMidiConfig;
  drums: ModuleMidiConfig;
  tranceGen: ModuleMidiConfig;
}

export interface MidiClockConfig {
  source: 'internal' | 'external';
  sendClock: boolean;
  sendTransport: boolean;
}

export interface MidiMapping {
  paramPath: string;    // e.g., 'filter.cutoff'
  cc: number;           // MIDI CC number (0-127)
  channel?: MidiChannel;
  min: number;
  max: number;
}

// ============================================================================
// MAPPABLE PARAMETERS
// ============================================================================

export interface MappableParamDef {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const MAPPABLE_PARAMETERS: MappableParamDef[] = [
  // Synth - Filter
  { id: 'filter.cutoff', label: 'Filter Cutoff', min: 20, max: 10000 },
  { id: 'filter.resonance', label: 'Filter Resonance', min: 0, max: 15 },
  { id: 'filter.envAmount', label: 'Filter Env Amount', min: 0, max: 5000 },
  
  // Synth - Oscillators
  { id: 'osc1.mix', label: 'OSC 1 Mix', min: 0, max: 1 },
  { id: 'osc2.mix', label: 'OSC 2 Mix', min: 0, max: 1 },
  { id: 'osc1.detune', label: 'OSC 1 Detune', min: -50, max: 50 },
  { id: 'osc2.detune', label: 'OSC 2 Detune', min: -50, max: 50 },
  
  // Synth - Envelopes
  { id: 'ampEnv.attack', label: 'Amp Attack', min: 0.01, max: 5 },
  { id: 'ampEnv.decay', label: 'Amp Decay', min: 0.01, max: 5 },
  { id: 'ampEnv.sustain', label: 'Amp Sustain', min: 0, max: 1 },
  { id: 'ampEnv.release', label: 'Amp Release', min: 0.01, max: 5 },
  { id: 'filterEnv.decay', label: 'Filter Env Decay', min: 0.01, max: 5 },
  
  // Synth - Effects
  { id: 'effects.distortion', label: 'Distortion', min: 0, max: 1 },
  { id: 'effects.chorus', label: 'Chorus', min: 0, max: 1 },
  { id: 'effects.delayTime', label: 'Delay Time', min: 0, max: 1 },
  { id: 'effects.delayFeedback', label: 'Delay Feedback', min: 0, max: 0.9 },
  { id: 'effects.reverbMix', label: 'Reverb', min: 0, max: 1 },
  
  // Acid 303
  { id: 'acid.cutoff', label: '303 Cutoff', min: 20, max: 5000 },
  { id: 'acid.resonance', label: '303 Resonance', min: 0, max: 25 },
  { id: 'acid.envMod', label: '303 Env Mod', min: 0, max: 3000 },
  { id: 'acid.decay', label: '303 Decay', min: 0.1, max: 1.0 },
  { id: 'acid.accent', label: '303 Accent', min: 0, max: 1 },
  { id: 'acid.distortion', label: '303 Distortion', min: 0, max: 1 },
  
  // Drums - RAT
  { id: 'drums.ratDistortion', label: 'RAT Distortion', min: 0, max: 1 },
  { id: 'drums.ratFilter', label: 'RAT Filter', min: 0, max: 1 },
  { id: 'drums.masterVolume', label: 'Drums Volume', min: 0, max: 1 },
  
  // Global
  { id: 'masterVolume', label: 'Master Volume', min: 0, max: 1 },
];

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_ARP: ArpParams = {
  mode: ArpMode.Off,
  speed: 6,
  octaveRange: 0,
  gate: 0.7,
  swing: 0,
};

export const DEFAULT_PATCH: SynthPatch = {
  name: "Init Saw",
  osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: 0, mix: 0.5 },
  osc2: { waveform: Waveform.Square, detune: 10, octave: 0, mix: 0.5 },
  filter: { cutoff: 2000, resonance: 1, type: FilterType.Lowpass, envAmount: 1000 },
  ampEnv: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
  filterEnv: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 1.0 },
  arp: DEFAULT_ARP,
  effects: { distortion: 0, chorus: 0, delayTime: 0.3, delayFeedback: 0.3, reverbMix: 0.2 },
};

export const DEFAULT_DRUM_STATE: DrumState = {
  enabled: true,
  tracks: {
    KICK: { ...createDefaultDrumTrack('KICK'), vol: 0.8, tune: 0.2 },
    SNARE: { ...createDefaultDrumTrack('SNARE'), vol: 0.7, tune: 0.5 },
    HAT: { ...createDefaultDrumTrack('HAT'), vol: 0.4, tune: 0.8 },
    CLAP: { ...createDefaultDrumTrack('CLAP'), vol: 0.6, tune: 0.5 },
  },
  ratDistortion: 0.4,
  ratFilter: 0.8,
  masterVolume: 0.8,
  kickMod: false,
};

export const DEFAULT_ACID_STATE: AcidState = {
  enabled: true,
  waveform: 'sawtooth',
  cutoff: 1000,
  resonance: 10,
  envMod: 2000,
  decay: 0.3,
  accent: 0.5,
  distortion: 0.2,
  rootNote: 36,
  volume: 0.6,
  steps: Array(16).fill(null).map((_, i) => ({
    active: i % 4 === 0 || i === 14,
    note: i === 14 ? 12 : 0,
    octave: 0,
    slide: i === 3,
    accent: i === 0,
  })),
};

export const DEFAULT_TRANCE_STATE: TranceState = {
  enabled: false,
  density: 0.6,
  rootNote: 48,
  scale: 'minor',
  routeToSynth: false,
  routeToAcid: false,
  octaveRange: 2,
};

export const DEFAULT_MIDI_MODULE_CONFIG: ModuleMidiConfig = {
  noteIn: 'ALL',
  noteOut: 'OFF',
  ccIn: 'ALL',
  ccOut: 'OFF',
};

export const DEFAULT_MIDI_ROUTER: MidiRouterConfig = {
  polySynth: { ...DEFAULT_MIDI_MODULE_CONFIG },
  acid303: { ...DEFAULT_MIDI_MODULE_CONFIG },
  drums: { ...DEFAULT_MIDI_MODULE_CONFIG },
  tranceGen: { noteIn: 'OFF', noteOut: 'OFF', ccIn: 'OFF', ccOut: 'OFF' },
};

export const DEFAULT_MIDI_CLOCK: MidiClockConfig = {
  source: 'internal',
  sendClock: false,
  sendTransport: true,
};

// ============================================================================
// PRESETS
// ============================================================================

export const PRESETS: SynthPatch[] = [
  DEFAULT_PATCH,
  {
    name: "Polivoks Bass",
    osc1: { waveform: Waveform.Sawtooth, detune: -10, octave: -2, mix: 0.8 },
    osc2: { waveform: Waveform.Triangle, detune: 10, octave: -2, mix: 0.4 },
    filter: { cutoff: 400, resonance: 8, type: FilterType.Lowpass, envAmount: 1200 },
    ampEnv: { attack: 0.01, decay: 0.4, sustain: 0.8, release: 0.4 },
    filterEnv: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.2 },
    arp: DEFAULT_ARP,
    effects: { distortion: 0.6, chorus: 0.2, delayTime: 0.1, delayFeedback: 0.1, reverbMix: 0.1 },
  },
  {
    name: "Industrial Lead",
    osc1: { waveform: Waveform.Square, detune: -15, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Square, detune: 15, octave: 0, mix: 0.5 },
    filter: { cutoff: 3000, resonance: 10, type: FilterType.Bandpass, envAmount: 2000 },
    ampEnv: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.4 },
    filterEnv: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.5 },
    arp: DEFAULT_ARP,
    effects: { distortion: 0.8, chorus: 0.6, delayTime: 0.35, delayFeedback: 0.4, reverbMix: 0.4 },
  },
  {
    name: "Trance Pluck",
    osc1: { waveform: Waveform.Sawtooth, detune: 5, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: -5, octave: 1, mix: 0.4 },
    filter: { cutoff: 5000, resonance: 4, type: FilterType.Lowpass, envAmount: 3000 },
    ampEnv: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 },
    filterEnv: { attack: 0.01, decay: 0.2, sustain: 0.0, release: 0.3 },
    arp: { mode: ArpMode.Up, speed: 8, octaveRange: 1, gate: 0.5, swing: 0 },
    effects: { distortion: 0.1, chorus: 0.4, delayTime: 0.375, delayFeedback: 0.5, reverbMix: 0.3 },
  },
  {
    name: "Dark Pad",
    osc1: { waveform: Waveform.Sawtooth, detune: -7, octave: -1, mix: 0.5 },
    osc2: { waveform: Waveform.Square, detune: 7, octave: 0, mix: 0.5 },
    filter: { cutoff: 800, resonance: 6, type: FilterType.Lowpass, envAmount: 500 },
    ampEnv: { attack: 0.8, decay: 1.0, sustain: 0.7, release: 2.0 },
    filterEnv: { attack: 1.0, decay: 2.0, sustain: 0.5, release: 2.0 },
    arp: DEFAULT_ARP,
    effects: { distortion: 0.2, chorus: 0.7, delayTime: 0.5, delayFeedback: 0.4, reverbMix: 0.6 },
  },
];
