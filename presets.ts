/**
 * TRIPLE V:RusT3 - Preset Library
 * 
 * Inspired by Access Virus TI2 classic sounds.
 * No AI required - all presets are hand-crafted.
 * 
 * Categories:
 * - LD (Lead)
 * - BA (Bass)
 * - PD (Pad)
 * - PL (Pluck)
 * - ARP (Arpeggio)
 * - FX (Effects/Textures)
 * - SQ (Sequence)
 */

import { SynthPatch, Waveform, FilterType, ArpMode } from './types';

// ============================================================================
// HELPER: Create patch with defaults
// ============================================================================

const createPatch = (partial: Partial<SynthPatch> & { name: string }): SynthPatch => ({
  name: partial.name,
  osc1: {
    waveform: Waveform.Sawtooth,
    detune: 0,
    octave: 0,
    mix: 0.5,
    ...partial.osc1,
  },
  osc2: {
    waveform: Waveform.Sawtooth,
    detune: 0,
    octave: 0,
    mix: 0.5,
    ...partial.osc2,
  },
  filter: {
    cutoff: 2000,
    resonance: 1,
    type: FilterType.Lowpass,
    envAmount: 1000,
    ...partial.filter,
  },
  ampEnv: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0.5,
    release: 0.5,
    ...partial.ampEnv,
  },
  filterEnv: {
    attack: 0.01,
    decay: 0.5,
    sustain: 0.2,
    release: 0.5,
    ...partial.filterEnv,
  },
  arp: {
    mode: ArpMode.Off,
    speed: 8,
    octaveRange: 0,
    gate: 0.7,
    swing: 0,
    ...partial.arp,
  },
  effects: {
    distortion: 0,
    chorus: 0,
    delayTime: 0.3,
    delayFeedback: 0.3,
    reverbMix: 0.2,
    ...partial.effects,
  },
});

// ============================================================================
// LEADS (LD)
// ============================================================================

const LEADS: SynthPatch[] = [
  createPatch({
    name: "LD Cygnus",
    // Classic Virus supersaw lead - thick detuned saws
    osc1: { waveform: Waveform.Sawtooth, detune: -12, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: 12, octave: 0, mix: 0.6 },
    filter: { cutoff: 4500, resonance: 2, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.01, decay: 0.4, sustain: 0.7, release: 0.6 },
    filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5 },
    effects: { distortion: 0.15, chorus: 0.5, delayTime: 0.35, delayFeedback: 0.35, reverbMix: 0.3 },
  }),

  createPatch({
    name: "LD Darkstar",
    // Dark, aggressive lead with bandpass character
    osc1: { waveform: Waveform.Square, detune: -7, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 7, octave: 0, mix: 0.5 },
    filter: { cutoff: 2800, resonance: 8, type: FilterType.Bandpass, envAmount: 1500 },
    ampEnv: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.4 },
    filterEnv: { attack: 0.01, decay: 0.4, sustain: 0.2, release: 0.4 },
    effects: { distortion: 0.5, chorus: 0.3, delayTime: 0.25, delayFeedback: 0.4, reverbMix: 0.25 },
  }),

  createPatch({
    name: "LD Hardwired",
    // Hard, cutting lead for techno/industrial
    osc1: { waveform: Waveform.Square, detune: -5, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Square, detune: 5, octave: 1, mix: 0.4 },
    filter: { cutoff: 3500, resonance: 6, type: FilterType.Lowpass, envAmount: 2500 },
    ampEnv: { attack: 0.005, decay: 0.15, sustain: 0.5, release: 0.3 },
    filterEnv: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.2 },
    effects: { distortion: 0.7, chorus: 0.2, delayTime: 0.18, delayFeedback: 0.3, reverbMix: 0.15 },
  }),

  createPatch({
    name: "LD Neon",
    // Bright, modern lead
    osc1: { waveform: Waveform.Sawtooth, detune: -8, octave: 0, mix: 0.55 },
    osc2: { waveform: Waveform.Triangle, detune: 8, octave: 1, mix: 0.45 },
    filter: { cutoff: 6000, resonance: 3, type: FilterType.Lowpass, envAmount: 3000 },
    ampEnv: { attack: 0.01, decay: 0.25, sustain: 0.6, release: 0.5 },
    filterEnv: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
    effects: { distortion: 0.1, chorus: 0.6, delayTime: 0.3, delayFeedback: 0.45, reverbMix: 0.35 },
  }),

  createPatch({
    name: "LD Screamer",
    // High resonance screaming lead
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: 0, mix: 0.7 },
    osc2: { waveform: Waveform.Square, detune: 3, octave: 1, mix: 0.3 },
    filter: { cutoff: 2000, resonance: 12, type: FilterType.Lowpass, envAmount: 4000 },
    ampEnv: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.4 },
    filterEnv: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.3 },
    effects: { distortion: 0.4, chorus: 0.3, delayTime: 0.2, delayFeedback: 0.35, reverbMix: 0.2 },
  }),

  createPatch({
    name: "LD Vintage",
    // Classic analog-style lead
    osc1: { waveform: Waveform.Sawtooth, detune: -3, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Square, detune: 0, octave: -1, mix: 0.4 },
    filter: { cutoff: 1800, resonance: 5, type: FilterType.Lowpass, envAmount: 1200 },
    ampEnv: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.6 },
    filterEnv: { attack: 0.05, decay: 0.6, sustain: 0.3, release: 0.5 },
    effects: { distortion: 0.2, chorus: 0.4, delayTime: 0.4, delayFeedback: 0.3, reverbMix: 0.25 },
  }),
];

// ============================================================================
// BASS (BA)
// ============================================================================

const BASSES: SynthPatch[] = [
  createPatch({
    name: "BA Oxygen",
    // Classic Virus bass - punchy and deep
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: -1, mix: 0.7 },
    osc2: { waveform: Waveform.Square, detune: 5, octave: -2, mix: 0.5 },
    filter: { cutoff: 800, resonance: 4, type: FilterType.Lowpass, envAmount: 1500 },
    ampEnv: { attack: 0.005, decay: 0.3, sustain: 0.6, release: 0.3 },
    filterEnv: { attack: 0.005, decay: 0.25, sustain: 0.2, release: 0.2 },
    effects: { distortion: 0.3, chorus: 0.1, delayTime: 0, delayFeedback: 0, reverbMix: 0.05 },
  }),

  createPatch({
    name: "BA Toxic",
    // Acid-style bass with resonance
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: -1, mix: 0.8 },
    osc2: { waveform: Waveform.Square, detune: 0, octave: -1, mix: 0.3 },
    filter: { cutoff: 400, resonance: 10, type: FilterType.Lowpass, envAmount: 3000 },
    ampEnv: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.2 },
    filterEnv: { attack: 0.005, decay: 0.15, sustain: 0.0, release: 0.1 },
    effects: { distortion: 0.5, chorus: 0, delayTime: 0, delayFeedback: 0, reverbMix: 0 },
  }),

  createPatch({
    name: "BA Submarine",
    // Deep sub bass
    osc1: { waveform: Waveform.Sine, detune: 0, octave: -2, mix: 0.9 },
    osc2: { waveform: Waveform.Triangle, detune: 0, octave: -1, mix: 0.3 },
    filter: { cutoff: 200, resonance: 2, type: FilterType.Lowpass, envAmount: 500 },
    ampEnv: { attack: 0.01, decay: 0.5, sustain: 0.8, release: 0.4 },
    filterEnv: { attack: 0.02, decay: 0.4, sustain: 0.5, release: 0.3 },
    effects: { distortion: 0.1, chorus: 0, delayTime: 0, delayFeedback: 0, reverbMix: 0.05 },
  }),

  createPatch({
    name: "BA Reese",
    // Classic reese bass - detuned saws
    osc1: { waveform: Waveform.Sawtooth, detune: -15, octave: -1, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 15, octave: -1, mix: 0.5 },
    filter: { cutoff: 600, resonance: 3, type: FilterType.Lowpass, envAmount: 800 },
    ampEnv: { attack: 0.01, decay: 0.6, sustain: 0.7, release: 0.5 },
    filterEnv: { attack: 0.1, decay: 1.0, sustain: 0.4, release: 0.5 },
    effects: { distortion: 0.4, chorus: 0.2, delayTime: 0, delayFeedback: 0, reverbMix: 0.1 },
  }),

  createPatch({
    name: "BA Growl",
    // Aggressive growling bass
    osc1: { waveform: Waveform.Sawtooth, detune: -10, octave: -1, mix: 0.6 },
    osc2: { waveform: Waveform.Square, detune: 10, octave: -2, mix: 0.5 },
    filter: { cutoff: 500, resonance: 8, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.2 },
    filterEnv: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.2 },
    effects: { distortion: 0.7, chorus: 0.1, delayTime: 0, delayFeedback: 0, reverbMix: 0.05 },
  }),

  createPatch({
    name: "BA Rubber",
    // Bouncy, elastic bass
    osc1: { waveform: Waveform.Triangle, detune: 0, octave: -1, mix: 0.6 },
    osc2: { waveform: Waveform.Sine, detune: 0, octave: -2, mix: 0.6 },
    filter: { cutoff: 1200, resonance: 6, type: FilterType.Lowpass, envAmount: 2500 },
    ampEnv: { attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.15 },
    filterEnv: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.1 },
    effects: { distortion: 0.2, chorus: 0, delayTime: 0, delayFeedback: 0, reverbMix: 0 },
  }),

  createPatch({
    name: "BA Techno",
    // Hard techno bass stab
    osc1: { waveform: Waveform.Sawtooth, detune: -5, octave: -1, mix: 0.7 },
    osc2: { waveform: Waveform.Square, detune: 5, octave: -1, mix: 0.4 },
    filter: { cutoff: 700, resonance: 5, type: FilterType.Lowpass, envAmount: 1800 },
    ampEnv: { attack: 0.003, decay: 0.12, sustain: 0.2, release: 0.1 },
    filterEnv: { attack: 0.003, decay: 0.1, sustain: 0.0, release: 0.08 },
    effects: { distortion: 0.6, chorus: 0, delayTime: 0.15, delayFeedback: 0.2, reverbMix: 0.1 },
  }),
];

// ============================================================================
// PADS (PD)
// ============================================================================

const PADS: SynthPatch[] = [
  createPatch({
    name: "PD Horizon",
    // Lush, evolving pad
    osc1: { waveform: Waveform.Sawtooth, detune: -7, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 7, octave: -1, mix: 0.5 },
    filter: { cutoff: 1500, resonance: 3, type: FilterType.Lowpass, envAmount: 800 },
    ampEnv: { attack: 0.8, decay: 1.5, sustain: 0.7, release: 2.0 },
    filterEnv: { attack: 1.2, decay: 2.0, sustain: 0.5, release: 2.0 },
    effects: { distortion: 0.05, chorus: 0.7, delayTime: 0.4, delayFeedback: 0.35, reverbMix: 0.6 },
  }),

  createPatch({
    name: "PD Cathedral",
    // Huge, ethereal pad
    osc1: { waveform: Waveform.Sawtooth, detune: -10, octave: 0, mix: 0.4 },
    osc2: { waveform: Waveform.Triangle, detune: 10, octave: 1, mix: 0.4 },
    filter: { cutoff: 2000, resonance: 2, type: FilterType.Lowpass, envAmount: 500 },
    ampEnv: { attack: 1.5, decay: 2.0, sustain: 0.8, release: 3.0 },
    filterEnv: { attack: 2.0, decay: 3.0, sustain: 0.6, release: 3.0 },
    effects: { distortion: 0, chorus: 0.8, delayTime: 0.5, delayFeedback: 0.5, reverbMix: 0.8 },
  }),

  createPatch({
    name: "PD Darkness",
    // Dark, ominous pad
    osc1: { waveform: Waveform.Square, detune: -5, octave: -1, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 5, octave: 0, mix: 0.4 },
    filter: { cutoff: 600, resonance: 5, type: FilterType.Lowpass, envAmount: 400 },
    ampEnv: { attack: 1.0, decay: 1.5, sustain: 0.6, release: 2.5 },
    filterEnv: { attack: 1.5, decay: 2.0, sustain: 0.3, release: 2.0 },
    effects: { distortion: 0.2, chorus: 0.5, delayTime: 0.6, delayFeedback: 0.4, reverbMix: 0.5 },
  }),

  createPatch({
    name: "PD Strings",
    // String ensemble simulation
    osc1: { waveform: Waveform.Sawtooth, detune: -8, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 8, octave: 0, mix: 0.5 },
    filter: { cutoff: 3000, resonance: 1, type: FilterType.Lowpass, envAmount: 1000 },
    ampEnv: { attack: 0.4, decay: 0.8, sustain: 0.7, release: 1.0 },
    filterEnv: { attack: 0.5, decay: 1.0, sustain: 0.5, release: 1.0 },
    effects: { distortion: 0, chorus: 0.6, delayTime: 0.3, delayFeedback: 0.2, reverbMix: 0.4 },
  }),

  createPatch({
    name: "PD Glass",
    // Crystalline, bright pad
    osc1: { waveform: Waveform.Triangle, detune: -5, octave: 1, mix: 0.5 },
    osc2: { waveform: Waveform.Sine, detune: 5, octave: 0, mix: 0.5 },
    filter: { cutoff: 5000, resonance: 4, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.6, decay: 1.0, sustain: 0.5, release: 1.5 },
    filterEnv: { attack: 0.8, decay: 1.5, sustain: 0.3, release: 1.5 },
    effects: { distortion: 0, chorus: 0.7, delayTime: 0.45, delayFeedback: 0.5, reverbMix: 0.7 },
  }),

  createPatch({
    name: "PD Warm",
    // Warm analog-style pad
    osc1: { waveform: Waveform.Sawtooth, detune: -4, octave: 0, mix: 0.55 },
    osc2: { waveform: Waveform.Square, detune: 4, octave: -1, mix: 0.45 },
    filter: { cutoff: 1200, resonance: 2, type: FilterType.Lowpass, envAmount: 600 },
    ampEnv: { attack: 0.5, decay: 1.0, sustain: 0.7, release: 1.5 },
    filterEnv: { attack: 0.6, decay: 1.2, sustain: 0.5, release: 1.2 },
    effects: { distortion: 0.1, chorus: 0.5, delayTime: 0.35, delayFeedback: 0.3, reverbMix: 0.45 },
  }),
];

// ============================================================================
// PLUCKS (PL)
// ============================================================================

const PLUCKS: SynthPatch[] = [
  createPatch({
    name: "PL Mercury",
    // Classic trance pluck
    osc1: { waveform: Waveform.Sawtooth, detune: 5, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: -5, octave: 1, mix: 0.4 },
    filter: { cutoff: 5000, resonance: 4, type: FilterType.Lowpass, envAmount: 4000 },
    ampEnv: { attack: 0.005, decay: 0.25, sustain: 0.0, release: 0.4 },
    filterEnv: { attack: 0.005, decay: 0.2, sustain: 0.0, release: 0.3 },
    effects: { distortion: 0.1, chorus: 0.4, delayTime: 0.375, delayFeedback: 0.5, reverbMix: 0.35 },
  }),

  createPatch({
    name: "PL Stab",
    // Short, punchy stab
    osc1: { waveform: Waveform.Sawtooth, detune: -8, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 8, octave: 0, mix: 0.5 },
    filter: { cutoff: 3500, resonance: 3, type: FilterType.Lowpass, envAmount: 2500 },
    ampEnv: { attack: 0.003, decay: 0.15, sustain: 0.0, release: 0.2 },
    filterEnv: { attack: 0.003, decay: 0.1, sustain: 0.0, release: 0.15 },
    effects: { distortion: 0.15, chorus: 0.3, delayTime: 0.25, delayFeedback: 0.4, reverbMix: 0.3 },
  }),

  createPatch({
    name: "PL Bell",
    // Bell-like pluck
    osc1: { waveform: Waveform.Triangle, detune: 0, octave: 1, mix: 0.5 },
    osc2: { waveform: Waveform.Sine, detune: 0, octave: 2, mix: 0.3 },
    filter: { cutoff: 6000, resonance: 5, type: FilterType.Lowpass, envAmount: 3000 },
    ampEnv: { attack: 0.005, decay: 0.8, sustain: 0.0, release: 1.0 },
    filterEnv: { attack: 0.005, decay: 0.5, sustain: 0.0, release: 0.8 },
    effects: { distortion: 0, chorus: 0.5, delayTime: 0.4, delayFeedback: 0.45, reverbMix: 0.5 },
  }),

  createPatch({
    name: "PL Piano",
    // Piano-like pluck
    osc1: { waveform: Waveform.Triangle, detune: -2, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: 2, octave: 0, mix: 0.3 },
    filter: { cutoff: 4000, resonance: 2, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.005, decay: 0.6, sustain: 0.2, release: 0.8 },
    filterEnv: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.6 },
    effects: { distortion: 0, chorus: 0.2, delayTime: 0.3, delayFeedback: 0.25, reverbMix: 0.35 },
  }),

  createPatch({
    name: "PL Marimba",
    // Marimba-style pluck
    osc1: { waveform: Waveform.Sine, detune: 0, octave: 0, mix: 0.7 },
    osc2: { waveform: Waveform.Triangle, detune: 0, octave: 1, mix: 0.3 },
    filter: { cutoff: 3000, resonance: 3, type: FilterType.Lowpass, envAmount: 1500 },
    ampEnv: { attack: 0.005, decay: 0.4, sustain: 0.0, release: 0.5 },
    filterEnv: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.4 },
    effects: { distortion: 0, chorus: 0.3, delayTime: 0.2, delayFeedback: 0.3, reverbMix: 0.25 },
  }),

  createPatch({
    name: "PL Synth",
    // Classic synth pluck
    osc1: { waveform: Waveform.Sawtooth, detune: -6, octave: 0, mix: 0.55 },
    osc2: { waveform: Waveform.Square, detune: 6, octave: 0, mix: 0.45 },
    filter: { cutoff: 4500, resonance: 5, type: FilterType.Lowpass, envAmount: 3500 },
    ampEnv: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.4 },
    filterEnv: { attack: 0.005, decay: 0.25, sustain: 0.0, release: 0.3 },
    effects: { distortion: 0.1, chorus: 0.4, delayTime: 0.28, delayFeedback: 0.4, reverbMix: 0.3 },
  }),
];

// ============================================================================
// ARPS (ARP)
// ============================================================================

const ARPS: SynthPatch[] = [
  createPatch({
    name: "ARP Matrix",
    // Classic trance arp
    osc1: { waveform: Waveform.Sawtooth, detune: 5, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: -5, octave: 1, mix: 0.4 },
    filter: { cutoff: 3000, resonance: 4, type: FilterType.Lowpass, envAmount: 2500 },
    ampEnv: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.3 },
    filterEnv: { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.2 },
    arp: { mode: ArpMode.Up, octaveRange: 2, gate: 0.5, swing: 0, speed: 8 },
    effects: { distortion: 0.1, chorus: 0.4, delayTime: 0.375, delayFeedback: 0.5, reverbMix: 0.35 },
  }),

  createPatch({
    name: "ARP Techno",
    // Hard techno arp
    osc1: { waveform: Waveform.Square, detune: -3, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: 3, octave: 0, mix: 0.4 },
    filter: { cutoff: 2000, resonance: 7, type: FilterType.Lowpass, envAmount: 3000 },
    ampEnv: { attack: 0.003, decay: 0.1, sustain: 0.2, release: 0.1 },
    filterEnv: { attack: 0.003, decay: 0.08, sustain: 0.0, release: 0.08 },
    arp: { mode: ArpMode.UpDown, octaveRange: 1, gate: 0.4, swing: 0.1, speed: 8 },
    effects: { distortion: 0.5, chorus: 0.2, delayTime: 0.2, delayFeedback: 0.35, reverbMix: 0.2 },
  }),

  createPatch({
    name: "ARP Ambient",
    // Soft, dreamy arp
    osc1: { waveform: Waveform.Triangle, detune: -4, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sine, detune: 4, octave: 1, mix: 0.5 },
    filter: { cutoff: 4000, resonance: 2, type: FilterType.Lowpass, envAmount: 1500 },
    ampEnv: { attack: 0.05, decay: 0.4, sustain: 0.4, release: 0.8 },
    filterEnv: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.6 },
    arp: { mode: ArpMode.Random, octaveRange: 2, gate: 0.8, swing: 0, speed: 6 },
    effects: { distortion: 0, chorus: 0.6, delayTime: 0.5, delayFeedback: 0.55, reverbMix: 0.6 },
  }),

  createPatch({
    name: "ARP Chord",
    // Chord stab arp
    osc1: { waveform: Waveform.Sawtooth, detune: -8, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 8, octave: 0, mix: 0.5 },
    filter: { cutoff: 3500, resonance: 3, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.005, decay: 0.25, sustain: 0.4, release: 0.4 },
    filterEnv: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.3 },
    arp: { mode: ArpMode.Chord, octaveRange: 0, gate: 0.6, swing: 0, speed: 4 },
    effects: { distortion: 0.15, chorus: 0.5, delayTime: 0.35, delayFeedback: 0.4, reverbMix: 0.35 },
  }),

  createPatch({
    name: "ARP Bounce",
    // Bouncy up/down arp
    osc1: { waveform: Waveform.Sawtooth, detune: 6, octave: 0, mix: 0.55 },
    osc2: { waveform: Waveform.Square, detune: -6, octave: 0, mix: 0.45 },
    filter: { cutoff: 2800, resonance: 5, type: FilterType.Lowpass, envAmount: 2200 },
    ampEnv: { attack: 0.005, decay: 0.15, sustain: 0.3, release: 0.2 },
    filterEnv: { attack: 0.005, decay: 0.12, sustain: 0.1, release: 0.15 },
    arp: { mode: ArpMode.UpDown, octaveRange: 2, gate: 0.55, swing: 0.15, speed: 8 },
    effects: { distortion: 0.2, chorus: 0.35, delayTime: 0.25, delayFeedback: 0.4, reverbMix: 0.3 },
  }),
];

// ============================================================================
// SEQUENCES (SQ) - Optimized for sequencer use
// ============================================================================

const SEQUENCES: SynthPatch[] = [
  createPatch({
    name: "SQ Berlin",
    // Berlin school sequence sound
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: 0, mix: 0.7 },
    osc2: { waveform: Waveform.Square, detune: 0, octave: -1, mix: 0.3 },
    filter: { cutoff: 1500, resonance: 6, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.2 },
    filterEnv: { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.15 },
    effects: { distortion: 0.2, chorus: 0.3, delayTime: 0.375, delayFeedback: 0.45, reverbMix: 0.25 },
  }),

  createPatch({
    name: "SQ Industrial",
    // Industrial sequence
    osc1: { waveform: Waveform.Square, detune: -5, octave: 0, mix: 0.6 },
    osc2: { waveform: Waveform.Sawtooth, detune: 5, octave: 0, mix: 0.4 },
    filter: { cutoff: 1800, resonance: 8, type: FilterType.Bandpass, envAmount: 1500 },
    ampEnv: { attack: 0.003, decay: 0.1, sustain: 0.2, release: 0.1 },
    filterEnv: { attack: 0.003, decay: 0.08, sustain: 0.0, release: 0.08 },
    effects: { distortion: 0.7, chorus: 0.1, delayTime: 0.15, delayFeedback: 0.3, reverbMix: 0.15 },
  }),

  createPatch({
    name: "SQ Acid",
    // 303-style for poly synth
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: -1, mix: 0.8 },
    osc2: { waveform: Waveform.Square, detune: 0, octave: -1, mix: 0.2 },
    filter: { cutoff: 500, resonance: 12, type: FilterType.Lowpass, envAmount: 3500 },
    ampEnv: { attack: 0.003, decay: 0.15, sustain: 0.2, release: 0.1 },
    filterEnv: { attack: 0.003, decay: 0.1, sustain: 0.0, release: 0.08 },
    effects: { distortion: 0.4, chorus: 0, delayTime: 0.2, delayFeedback: 0.3, reverbMix: 0.1 },
  }),

  createPatch({
    name: "SQ Trance",
    // Trance gate sequence
    osc1: { waveform: Waveform.Sawtooth, detune: 7, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: -7, octave: 0, mix: 0.5 },
    filter: { cutoff: 2500, resonance: 4, type: FilterType.Lowpass, envAmount: 2000 },
    ampEnv: { attack: 0.005, decay: 0.18, sustain: 0.35, release: 0.25 },
    filterEnv: { attack: 0.005, decay: 0.15, sustain: 0.15, release: 0.2 },
    effects: { distortion: 0.1, chorus: 0.45, delayTime: 0.375, delayFeedback: 0.5, reverbMix: 0.35 },
  }),
];

// ============================================================================
// FX / TEXTURES
// ============================================================================

const FX: SynthPatch[] = [
  createPatch({
    name: "FX Noise Sweep",
    // Filtered noise sweep
    osc1: { waveform: Waveform.Sawtooth, detune: -50, octave: 2, mix: 0.3 },
    osc2: { waveform: Waveform.Square, detune: 50, octave: 2, mix: 0.3 },
    filter: { cutoff: 500, resonance: 10, type: FilterType.Bandpass, envAmount: 4000 },
    ampEnv: { attack: 0.5, decay: 2.0, sustain: 0.3, release: 2.0 },
    filterEnv: { attack: 2.0, decay: 3.0, sustain: 0.0, release: 2.0 },
    effects: { distortion: 0.3, chorus: 0.5, delayTime: 0.4, delayFeedback: 0.6, reverbMix: 0.7 },
  }),

  createPatch({
    name: "FX Riser",
    // Build-up riser effect
    osc1: { waveform: Waveform.Sawtooth, detune: -20, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 20, octave: 1, mix: 0.5 },
    filter: { cutoff: 200, resonance: 8, type: FilterType.Lowpass, envAmount: 5000 },
    ampEnv: { attack: 3.0, decay: 0.5, sustain: 0.8, release: 1.0 },
    filterEnv: { attack: 4.0, decay: 0.5, sustain: 0.9, release: 1.0 },
    effects: { distortion: 0.2, chorus: 0.6, delayTime: 0.3, delayFeedback: 0.4, reverbMix: 0.5 },
  }),

  createPatch({
    name: "FX Drone",
    // Dark drone texture
    osc1: { waveform: Waveform.Sawtooth, detune: -3, octave: -2, mix: 0.5 },
    osc2: { waveform: Waveform.Square, detune: 3, octave: -1, mix: 0.4 },
    filter: { cutoff: 400, resonance: 5, type: FilterType.Lowpass, envAmount: 200 },
    ampEnv: { attack: 2.0, decay: 3.0, sustain: 0.8, release: 4.0 },
    filterEnv: { attack: 3.0, decay: 4.0, sustain: 0.5, release: 4.0 },
    effects: { distortion: 0.3, chorus: 0.4, delayTime: 0.6, delayFeedback: 0.5, reverbMix: 0.7 },
  }),
];

// ============================================================================
// INIT PATCHES
// ============================================================================

const INIT: SynthPatch[] = [
  createPatch({
    name: "INIT Saw",
    osc1: { waveform: Waveform.Sawtooth, detune: 0, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sawtooth, detune: 0, octave: 0, mix: 0.5 },
  }),

  createPatch({
    name: "INIT Square",
    osc1: { waveform: Waveform.Square, detune: 0, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Square, detune: 0, octave: 0, mix: 0.5 },
  }),

  createPatch({
    name: "INIT Sine",
    osc1: { waveform: Waveform.Sine, detune: 0, octave: 0, mix: 0.5 },
    osc2: { waveform: Waveform.Sine, detune: 0, octave: 0, mix: 0.5 },
    filter: { cutoff: 10000, resonance: 0, type: FilterType.Lowpass, envAmount: 0 },
  }),
];

// ============================================================================
// EXPORTS
// ============================================================================

// All presets organized by category
export const PRESET_CATEGORIES = {
  INIT: INIT,
  LEADS: LEADS,
  BASSES: BASSES,
  PADS: PADS,
  PLUCKS: PLUCKS,
  ARPS: ARPS,
  SEQUENCES: SEQUENCES,
  FX: FX,
} as const;

// Flat array of all presets (for legacy compatibility)
export const PRESETS: SynthPatch[] = [
  ...INIT,
  ...LEADS,
  ...BASSES,
  ...PADS,
  ...PLUCKS,
  ...ARPS,
  ...SEQUENCES,
  ...FX,
];

// Category names for UI
export const PRESET_CATEGORY_NAMES = Object.keys(PRESET_CATEGORIES) as (keyof typeof PRESET_CATEGORIES)[];

// Get presets by category
export function getPresetsByCategory(category: keyof typeof PRESET_CATEGORIES): SynthPatch[] {
  return PRESET_CATEGORIES[category];
}

// Find preset by name
export function findPresetByName(name: string): SynthPatch | undefined {
  return PRESETS.find(p => p.name.toLowerCase() === name.toLowerCase());
}

// Get random preset
export function getRandomPreset(): SynthPatch {
  return PRESETS[Math.floor(Math.random() * PRESETS.length)];
}

// Get random preset from category
export function getRandomPresetFromCategory(category: keyof typeof PRESET_CATEGORIES): SynthPatch {
  const presets = PRESET_CATEGORIES[category];
  return presets[Math.floor(Math.random() * presets.length)];
}

// Default export for backwards compatibility
export default PRESETS;
