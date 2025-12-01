/**
 * TRIPLE V:RusT3 - Professional Drum Engine
 * 
 * Authentic TR-909 inspired synthesis with:
 * - Multi-layer drum sounds (sub + body + transient + noise)
 * - ProCo RAT distortion emulation
 * - Per-track velocity sensitivity
 * - Sidechain-ready architecture
 * - KICK MOD for harder techno kicks
 */

import { DrumState, DrumType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface DrumVoiceConfig {
  volume: number;      // 0-1
  tune: number;        // 0-1 (maps to frequency range)
  decay: number;       // 0-1 (maps to envelope time)
  tone: number;        // 0-1 (brightness/color)
  velocity: number;    // 0-127 MIDI velocity
}

export interface RatConfig {
  distortion: number;  // 0-1 (drive amount)
  filter: number;      // 0-1 (lowpass cutoff)
  volume: number;      // 0-1 (output level)
}

// ============================================================================
// DRUM ENGINE CLASS
// ============================================================================

export class DrumEngine {
  private ctx: AudioContext;
  private outputNode: GainNode;
  
  // RAT Pedal Chain
  private ratInput: GainNode;
  private ratPreGain: GainNode;
  private ratWaveshaper: WaveShaperNode;
  private ratFilter: BiquadFilterNode;
  private ratPostGain: GainNode;
  
  // Compressor for glue
  private compressor: DynamicsCompressorNode;
  
  // State
  private kickModEnabled: boolean = false;
  private ratConfig: RatConfig = { distortion: 0.4, filter: 0.8, volume: 0.8 };

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.outputNode = ctx.createGain();
    this.outputNode.gain.value = 1.0;
    
    this.setupRatPedal();
    this.setupCompressor();
    
    // Chain: Drums → RAT → Compressor → Output
    this.ratPostGain.connect(this.compressor);
    this.compressor.connect(this.outputNode);
    this.outputNode.connect(destination);
  }

  // ==========================================================================
  // RAT PEDAL EMULATION (ProCo RAT style)
  // ==========================================================================
  
  private setupRatPedal() {
    // Input stage
    this.ratInput = this.ctx.createGain();
    this.ratInput.gain.value = 1.0;
    
    // Pre-gain (drive)
    this.ratPreGain = this.ctx.createGain();
    this.ratPreGain.gain.value = 1.0;
    
    // Waveshaper (asymmetric clipping like real RAT)
    this.ratWaveshaper = this.ctx.createWaveShaper();
    this.ratWaveshaper.curve = this.makeRatCurve(0.4);
    this.ratWaveshaper.oversample = '4x';
    
    // Filter (RAT's famous filter knob)
    this.ratFilter = this.ctx.createBiquadFilter();
    this.ratFilter.type = 'lowpass';
    this.ratFilter.frequency.value = 8000;
    this.ratFilter.Q.value = 0.7;
    
    // Post-gain (volume)
    this.ratPostGain = this.ctx.createGain();
    this.ratPostGain.gain.value = 0.8;
    
    // Connect chain
    this.ratInput.connect(this.ratPreGain);
    this.ratPreGain.connect(this.ratWaveshaper);
    this.ratWaveshaper.connect(this.ratFilter);
    this.ratFilter.connect(this.ratPostGain);
  }

  /**
   * RAT-style asymmetric soft clipping curve
   * The real RAT uses LM308 op-amp with asymmetric diode clipping
   */
  private makeRatCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const k = amount * 50 + 1; // Drive multiplier
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      
      // Asymmetric clipping (positive clips harder than negative)
      if (x >= 0) {
        // Positive: harder clip (like forward-biased diode)
        curve[i] = Math.tanh(x * k * 1.2) * 0.9;
      } else {
        // Negative: softer clip (like reverse-biased diode)
        curve[i] = Math.tanh(x * k * 0.8);
      }
    }
    return curve;
  }

  private setupCompressor() {
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -12;
    this.compressor.knee.value = 6;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.15;
  }

  // ==========================================================================
  // UPDATE METHODS
  // ==========================================================================

  public updateRat(config: Partial<RatConfig>) {
    Object.assign(this.ratConfig, config);
    
    const now = this.ctx.currentTime;
    
    // Distortion amount affects pre-gain and curve
    const drive = 1 + (this.ratConfig.distortion * 10);
    this.ratPreGain.gain.setTargetAtTime(drive, now, 0.05);
    this.ratWaveshaper.curve = this.makeRatCurve(this.ratConfig.distortion);
    
    // Filter: 200Hz to 20kHz logarithmic
    const minFreq = 200;
    const maxFreq = 20000;
    const freq = minFreq * Math.pow(maxFreq / minFreq, this.ratConfig.filter);
    this.ratFilter.frequency.setTargetAtTime(freq, now, 0.05);
    
    // Output volume
    this.ratPostGain.gain.setTargetAtTime(this.ratConfig.volume, now, 0.05);
  }

  public setKickMod(enabled: boolean) {
    this.kickModEnabled = enabled;
  }

  public setMasterVolume(vol: number) {
    this.outputNode.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
  }

  // ==========================================================================
  // DRUM TRIGGERS
  // ==========================================================================

  public trigger(type: DrumType, time: number, config: DrumVoiceConfig) {
    switch (type) {
      case 'KICK':
        this.triggerKick(time, config);
        break;
      case 'SNARE':
        this.triggerSnare(time, config);
        break;
      case 'HAT':
        this.triggerHiHat(time, config);
        break;
      case 'CLAP':
        this.triggerClap(time, config);
        break;
    }
  }

  // ==========================================================================
  // KICK DRUM - 3 Layer Design
  // ==========================================================================
  
  /**
   * TR-909 Kick with KICK MOD option
   * 
   * Layer 1: Sub (40-60Hz sine, long decay)
   * Layer 2: Body (pitch envelope 200→50Hz)  
   * Layer 3: Click (noise burst + HP filter)
   * 
   * KICK MOD adds: Higher pitch start, faster drop, more click
   */
  private triggerKick(time: number, config: DrumVoiceConfig) {
    const { volume, tune, velocity } = config;
    const vel = velocity / 127;
    const masterVol = volume * vel;
    
    const isModded = this.kickModEnabled;
    
    // Tuning maps to base frequency (35-55Hz)
    const baseFreq = 35 + (tune * 20);
    
    // === LAYER 1: SUB ===
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq, time);
    
    // Sub envelope: slow attack, long sustain
    subGain.gain.setValueAtTime(0, time);
    subGain.gain.linearRampToValueAtTime(masterVol * 0.8, time + 0.005);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + (isModded ? 0.4 : 0.5));
    
    subOsc.connect(subGain);
    subGain.connect(this.ratInput);
    subOsc.start(time);
    subOsc.stop(time + 0.6);
    
    // === LAYER 2: BODY (Pitch Envelope) ===
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    
    bodyOsc.type = 'sine';
    
    // Pitch envelope
    const startPitch = isModded ? 300 + (tune * 100) : 180 + (tune * 60);
    const endPitch = baseFreq;
    const pitchTime = isModded ? 0.04 : 0.08;
    
    bodyOsc.frequency.setValueAtTime(startPitch, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(endPitch, time + pitchTime);
    
    // Body envelope
    bodyGain.gain.setValueAtTime(masterVol * (isModded ? 1.2 : 0.9), time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + (isModded ? 0.25 : 0.35));
    
    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ratInput);
    bodyOsc.start(time);
    bodyOsc.stop(time + 0.4);
    
    // === LAYER 3: CLICK ===
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    const clickFilter = this.ctx.createBiquadFilter();
    
    clickOsc.type = isModded ? 'sawtooth' : 'square';
    clickOsc.frequency.setValueAtTime(isModded ? 120 : 80, time);
    clickOsc.frequency.exponentialRampToValueAtTime(40, time + 0.02);
    
    clickFilter.type = 'highpass';
    clickFilter.frequency.value = isModded ? 100 : 60;
    clickFilter.Q.value = 1;
    
    clickGain.gain.setValueAtTime(masterVol * (isModded ? 0.5 : 0.3), time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    
    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.ratInput);
    clickOsc.start(time);
    clickOsc.stop(time + 0.05);
    
    // === OPTIONAL: NOISE TRANSIENT (KICK MOD only) ===
    if (isModded) {
      const noiseBuffer = this.createNoiseBuffer(0.02);
      const noiseSrc = this.ctx.createBufferSource();
      const noiseGain = this.ctx.createGain();
      const noiseHP = this.ctx.createBiquadFilter();
      const noiseLP = this.ctx.createBiquadFilter();
      
      noiseSrc.buffer = noiseBuffer;
      
      noiseHP.type = 'highpass';
      noiseHP.frequency.value = 500;
      
      noiseLP.type = 'lowpass';
      noiseLP.frequency.value = 2000;
      
      noiseGain.gain.setValueAtTime(masterVol * 0.2, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
      
      noiseSrc.connect(noiseHP);
      noiseHP.connect(noiseLP);
      noiseLP.connect(noiseGain);
      noiseGain.connect(this.ratInput);
      noiseSrc.start(time);
    }
  }

  // ==========================================================================
  // SNARE DRUM - 4 Layer Design
  // ==========================================================================
  
  /**
   * TR-909 Snare
   * 
   * Layer 1: Body Low (detuned sine ~180Hz)
   * Layer 2: Body High (detuned sine ~330Hz with pitch env)
   * Layer 3: Snare Wires (bandpassed noise 2-5kHz)
   * Layer 4: Transient Click
   */
  private triggerSnare(time: number, config: DrumVoiceConfig) {
    const { volume, tune, velocity } = config;
    const vel = velocity / 127;
    const masterVol = volume * vel;
    
    // Tune affects pitch (150-250Hz base)
    const bodyFreq = 150 + (tune * 100);
    
    // === LAYER 1: BODY LOW ===
    const bodyLow = this.ctx.createOscillator();
    const bodyLowGain = this.ctx.createGain();
    
    bodyLow.type = 'sine';
    bodyLow.frequency.setValueAtTime(bodyFreq * 0.8, time);
    
    bodyLowGain.gain.setValueAtTime(masterVol * 0.5, time);
    bodyLowGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    
    bodyLow.connect(bodyLowGain);
    bodyLowGain.connect(this.ratInput);
    bodyLow.start(time);
    bodyLow.stop(time + 0.2);
    
    // === LAYER 2: BODY HIGH (pitch envelope) ===
    const bodyHigh = this.ctx.createOscillator();
    const bodyHighGain = this.ctx.createGain();
    
    bodyHigh.type = 'triangle';
    bodyHigh.frequency.setValueAtTime(bodyFreq * 2, time);
    bodyHigh.frequency.exponentialRampToValueAtTime(bodyFreq * 1.2, time + 0.05);
    
    bodyHighGain.gain.setValueAtTime(masterVol * 0.4, time);
    bodyHighGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    bodyHigh.connect(bodyHighGain);
    bodyHighGain.connect(this.ratInput);
    bodyHigh.start(time);
    bodyHigh.stop(time + 0.15);
    
    // === LAYER 3: SNARE WIRES (Bandpassed Noise) ===
    const noiseBuffer = this.createNoiseBuffer(0.3);
    const noiseSrc = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const noiseHP = this.ctx.createBiquadFilter();
    const noiseLP = this.ctx.createBiquadFilter();
    
    noiseSrc.buffer = noiseBuffer;
    
    noiseHP.type = 'highpass';
    noiseHP.frequency.value = 2000;
    noiseHP.Q.value = 0.5;
    
    noiseLP.type = 'lowpass';
    noiseLP.frequency.value = 8000 + (tune * 4000); // Tune affects brightness
    noiseLP.Q.value = 0.5;
    
    noiseGain.gain.setValueAtTime(masterVol * 0.6, time);
    noiseGain.gain.exponentialRampToValueAtTime(masterVol * 0.1, time + 0.08);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    
    noiseSrc.connect(noiseHP);
    noiseHP.connect(noiseLP);
    noiseLP.connect(noiseGain);
    noiseGain.connect(this.ratInput);
    noiseSrc.start(time);
    noiseSrc.stop(time + 0.35);
    
    // === LAYER 4: TRANSIENT CLICK ===
    const clickBuffer = this.createNoiseBuffer(0.01);
    const clickSrc = this.ctx.createBufferSource();
    const clickGain = this.ctx.createGain();
    const clickHP = this.ctx.createBiquadFilter();
    
    clickSrc.buffer = clickBuffer;
    
    clickHP.type = 'highpass';
    clickHP.frequency.value = 1000;
    
    clickGain.gain.setValueAtTime(masterVol * 0.3, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
    
    clickSrc.connect(clickHP);
    clickHP.connect(clickGain);
    clickGain.connect(this.ratInput);
    clickSrc.start(time);
  }

  // ==========================================================================
  // HI-HAT - Metallic Synthesis
  // ==========================================================================
  
  /**
   * TR-909 Hi-Hat
   * 
   * 6 detuned square oscillators at non-harmonic ratios
   * Bandpass filtered for metallic character
   * Fast envelope for closed, longer for open
   */
  private triggerHiHat(time: number, config: DrumVoiceConfig, isOpen: boolean = false) {
    const { volume, tune, velocity } = config;
    const vel = velocity / 127;
    const masterVol = volume * vel;
    
    // Base frequency (higher tune = higher pitch)
    const baseFreq = 300 + (tune * 400);
    
    // Non-harmonic frequency ratios for metallic sound
    const ratios = [1.0, 1.34, 1.67, 1.91, 2.18, 2.41];
    
    // Create oscillator bank
    const oscillators: OscillatorNode[] = [];
    const mixGain = this.ctx.createGain();
    
    ratios.forEach((ratio, i) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = baseFreq * ratio;
      
      // Slight random detune for thickness
      osc.detune.value = (Math.random() - 0.5) * 20;
      
      // Each oscillator slightly different level
      oscGain.gain.value = 0.15 - (i * 0.02);
      
      osc.connect(oscGain);
      oscGain.connect(mixGain);
      osc.start(time);
      osc.stop(time + (isOpen ? 0.5 : 0.1));
      
      oscillators.push(osc);
    });
    
    // Bandpass filter for metallic character
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 8000 + (tune * 4000);
    bp.Q.value = 1.5;
    
    // Highpass to remove low rumble
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    hp.Q.value = 0.5;
    
    // Output envelope
    const envGain = this.ctx.createGain();
    const decayTime = isOpen ? 0.35 : 0.05;
    
    envGain.gain.setValueAtTime(masterVol * 0.5, time);
    envGain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);
    
    // Connect chain
    mixGain.connect(bp);
    bp.connect(hp);
    hp.connect(envGain);
    envGain.connect(this.ratInput);
  }

  // ==========================================================================
  // CLAP - Multi-burst Noise
  // ==========================================================================
  
  /**
   * TR-909 Clap
   * 
   * Multiple noise bursts with slight delays
   * Bandpassed noise (1-3kHz)
   * Short reverb tail simulation
   */
  private triggerClap(time: number, config: DrumVoiceConfig) {
    const { volume, tune, velocity } = config;
    const vel = velocity / 127;
    const masterVol = volume * vel;
    
    // Number of "hands" in the clap
    const numBursts = 4;
    const burstSpacing = 0.012; // 12ms between bursts
    
    for (let i = 0; i < numBursts; i++) {
      const burstTime = time + (i * burstSpacing);
      const burstVol = i < numBursts - 1 ? masterVol * 0.4 : masterVol * 0.8; // Last burst loudest
      
      this.triggerClapBurst(burstTime, burstVol, tune);
    }
    
    // Add reverb tail
    this.triggerClapTail(time + 0.04, masterVol * 0.3, tune);
  }
  
  private triggerClapBurst(time: number, volume: number, tune: number) {
    const noiseBuffer = this.createNoiseBuffer(0.02);
    const noiseSrc = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const bp = this.ctx.createBiquadFilter();
    
    noiseSrc.buffer = noiseBuffer;
    
    bp.type = 'bandpass';
    bp.frequency.value = 1200 + (tune * 800);
    bp.Q.value = 2;
    
    noiseGain.gain.setValueAtTime(volume, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);
    
    noiseSrc.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(this.ratInput);
    noiseSrc.start(time);
  }
  
  private triggerClapTail(time: number, volume: number, tune: number) {
    const noiseBuffer = this.createNoiseBuffer(0.25);
    const noiseSrc = this.ctx.createBufferSource();
    const noiseGain = this.ctx.createGain();
    const bp = this.ctx.createBiquadFilter();
    const hp = this.ctx.createBiquadFilter();
    
    noiseSrc.buffer = noiseBuffer;
    
    bp.type = 'bandpass';
    bp.frequency.value = 1500 + (tune * 1000);
    bp.Q.value = 1;
    
    hp.type = 'highpass';
    hp.frequency.value = 800;
    
    // Longer decay for tail
    noiseGain.gain.setValueAtTime(volume, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    
    noiseSrc.connect(bp);
    bp.connect(hp);
    hp.connect(noiseGain);
    noiseGain.connect(this.ratInput);
    noiseSrc.start(time);
    noiseSrc.stop(time + 0.3);
  }

  // ==========================================================================
  // UTILITY
  // ==========================================================================
  
  private createNoiseBuffer(duration: number): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = Math.ceil(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  // Cleanup
  public dispose() {
    this.outputNode.disconnect();
  }
}
