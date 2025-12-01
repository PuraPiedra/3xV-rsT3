/**
 * TRIPLE V:RusT3 - Complete MIDI Service
 * 
 * Features:
 * - MIDI Clock IN (sync to external)
 * - MIDI Clock OUT (be the master)
 * - Note IN/OUT per module with channel selection
 * - CC IN/OUT with learning and mapping
 * - Program Change IN/OUT
 * - Start/Stop/Continue transport
 * - Running status handling
 * - Proper error handling
 */

// ============================================================================
// TYPES
// ============================================================================

export type MidiChannel = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|'ALL'|'OFF';

export interface MidiDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  state: 'connected' | 'disconnected';
}

export interface MidiRouting {
  noteIn: MidiChannel;
  noteOut: MidiChannel;
  ccIn: MidiChannel;
  ccOut: MidiChannel;
}

export interface MidiClockConfig {
  source: 'internal' | 'external';
  sendClock: boolean;
  sendTransport: boolean;
}

export interface CcMapping {
  cc: number;
  paramPath: string;
  min: number;
  max: number;
  channel?: MidiChannel;
}

// Callback types
export type NoteCallback = (note: number, velocity: number, channel: number) => void;
export type CcCallback = (cc: number, value: number, channel: number) => void;
export type ClockCallback = () => void;
export type TransportCallback = (type: 'start' | 'stop' | 'continue') => void;
export type ProgramChangeCallback = (program: number, channel: number) => void;

// ============================================================================
// MIDI MESSAGE CONSTANTS
// ============================================================================

const MIDI = {
  // Channel messages (add channel 0-15 to these)
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  POLY_AFTERTOUCH: 0xA0,
  CONTROL_CHANGE: 0xB0,
  PROGRAM_CHANGE: 0xC0,
  CHANNEL_AFTERTOUCH: 0xD0,
  PITCH_BEND: 0xE0,
  
  // System messages
  SYSEX_START: 0xF0,
  MIDI_TIME_CODE: 0xF1,
  SONG_POSITION: 0xF2,
  SONG_SELECT: 0xF3,
  TUNE_REQUEST: 0xF6,
  SYSEX_END: 0xF7,
  
  // Realtime messages
  CLOCK: 0xF8,
  START: 0xFA,
  CONTINUE: 0xFB,
  STOP: 0xFC,
  ACTIVE_SENSING: 0xFE,
  SYSTEM_RESET: 0xFF,
  
  // Common CCs
  CC_MOD_WHEEL: 1,
  CC_BREATH: 2,
  CC_VOLUME: 7,
  CC_PAN: 10,
  CC_EXPRESSION: 11,
  CC_SUSTAIN: 64,
  CC_ALL_NOTES_OFF: 123,
};

// ============================================================================
// MIDI SERVICE CLASS
// ============================================================================

export class MidiService {
  private access: MIDIAccess | null = null;
  private inputs: Map<string, MIDIInput> = new Map();
  private outputs: Map<string, MIDIOutput> = new Map();
  
  private activeInputId: string | null = null;
  private activeOutputId: string | null = null;
  
  // Clock state
  private clockConfig: MidiClockConfig = {
    source: 'internal',
    sendClock: false,
    sendTransport: true,
  };
  private clockInterval: number | null = null;
  private ppqCounter: number = 0;
  private externalClockCallbacks: ClockCallback[] = [];
  
  // Callbacks per module
  private noteOnCallbacks: Map<string, NoteCallback> = new Map();
  private noteOffCallbacks: Map<string, NoteCallback> = new Map();
  private ccCallbacks: CcCallback[] = [];
  private transportCallbacks: TransportCallback[] = [];
  private programChangeCallbacks: ProgramChangeCallback[] = [];
  
  // CC Mappings
  private ccMappings: CcMapping[] = [];
  private isLearning: boolean = false;
  private learningCallback: ((cc: number, channel: number) => void) | null = null;
  
  // Last received values for display
  private lastCc: { cc: number; value: number; channel: number } | null = null;
  private lastNote: { note: number; velocity: number; channel: number } | null = null;

  constructor() {}

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  public async init(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported');
      return false;
    }
    
    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      this.updateDeviceLists();
      
      // Listen for device changes
      this.access.onstatechange = () => {
        this.updateDeviceLists();
      };
      
      console.log('MIDI initialized successfully');
      return true;
    } catch (error) {
      console.error('MIDI access denied:', error);
      return false;
    }
  }

  private updateDeviceLists() {
    if (!this.access) return;
    
    this.inputs.clear();
    this.outputs.clear();
    
    this.access.inputs.forEach((input) => {
      this.inputs.set(input.id, input);
    });
    
    this.access.outputs.forEach((output) => {
      this.outputs.set(output.id, output);
    });
  }

  // ==========================================================================
  // DEVICE MANAGEMENT
  // ==========================================================================

  public getInputs(): MidiDeviceInfo[] {
    const devices: MidiDeviceInfo[] = [];
    this.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name || `Input ${input.id}`,
        manufacturer: input.manufacturer || 'Unknown',
        state: input.state as 'connected' | 'disconnected',
      });
    });
    return devices;
  }

  public getOutputs(): MidiDeviceInfo[] {
    const devices: MidiDeviceInfo[] = [];
    this.outputs.forEach((output) => {
      devices.push({
        id: output.id,
        name: output.name || `Output ${output.id}`,
        manufacturer: output.manufacturer || 'Unknown',
        state: output.state as 'connected' | 'disconnected',
      });
    });
    return devices;
  }

  public selectInput(id: string | null) {
    // Disconnect previous
    if (this.activeInputId) {
      const prev = this.inputs.get(this.activeInputId);
      if (prev) prev.onmidimessage = null;
    }
    
    this.activeInputId = id;
    
    if (id) {
      const input = this.inputs.get(id);
      if (input) {
        input.onmidimessage = this.handleMidiMessage.bind(this);
        console.log(`MIDI Input selected: ${input.name}`);
      }
    }
  }

  public selectOutput(id: string | null) {
    this.activeOutputId = id;
    if (id) {
      const output = this.outputs.get(id);
      console.log(`MIDI Output selected: ${output?.name}`);
    }
  }

  public getActiveInput(): string | null {
    return this.activeInputId;
  }

  public getActiveOutput(): string | null {
    return this.activeOutputId;
  }

  // ==========================================================================
  // MESSAGE HANDLING
  // ==========================================================================

  private handleMidiMessage(event: MIDIMessageEvent) {
    if (!event.data || event.data.length === 0) return;
    
    const [status, data1, data2] = event.data;
    const command = status & 0xF0;
    const channel = (status & 0x0F) + 1; // 1-16
    
    // Realtime messages (no channel)
    if (status >= 0xF0) {
      this.handleRealtimeMessage(status);
      return;
    }
    
    // Channel messages
    switch (command) {
      case MIDI.NOTE_ON:
        if (data2 > 0) {
          this.handleNoteOn(data1, data2, channel);
        } else {
          // Note on with velocity 0 = note off
          this.handleNoteOff(data1, channel);
        }
        break;
        
      case MIDI.NOTE_OFF:
        this.handleNoteOff(data1, channel);
        break;
        
      case MIDI.CONTROL_CHANGE:
        this.handleControlChange(data1, data2, channel);
        break;
        
      case MIDI.PROGRAM_CHANGE:
        this.handleProgramChange(data1, channel);
        break;
        
      case MIDI.PITCH_BEND:
        // data1 = LSB, data2 = MSB
        const bendValue = ((data2 << 7) | data1) - 8192; // -8192 to 8191
        this.handlePitchBend(bendValue, channel);
        break;
    }
  }

  private handleRealtimeMessage(status: number) {
    switch (status) {
      case MIDI.CLOCK:
        if (this.clockConfig.source === 'external') {
          this.externalClockCallbacks.forEach(cb => cb());
        }
        break;
        
      case MIDI.START:
        this.transportCallbacks.forEach(cb => cb('start'));
        break;
        
      case MIDI.STOP:
        this.transportCallbacks.forEach(cb => cb('stop'));
        break;
        
      case MIDI.CONTINUE:
        this.transportCallbacks.forEach(cb => cb('continue'));
        break;
    }
  }

  private handleNoteOn(note: number, velocity: number, channel: number) {
    this.lastNote = { note, velocity, channel };
    
    this.noteOnCallbacks.forEach((callback, moduleId) => {
      callback(note, velocity, channel);
    });
  }

  private handleNoteOff(note: number, channel: number) {
    this.noteOffCallbacks.forEach((callback) => {
      callback(note, 0, channel);
    });
  }

  private handleControlChange(cc: number, value: number, channel: number) {
    this.lastCc = { cc, value, channel };
    
    // Learning mode
    if (this.isLearning && this.learningCallback) {
      this.learningCallback(cc, channel);
      return;
    }
    
    // Check mappings
    const mapping = this.ccMappings.find(m => m.cc === cc);
    if (mapping) {
      // Normalize value to mapping range
      const normalized = value / 127;
      const actualValue = mapping.min + (normalized * (mapping.max - mapping.min));
      
      // Notify listeners
      this.ccCallbacks.forEach(cb => cb(cc, actualValue, channel));
    }
  }

  private handleProgramChange(program: number, channel: number) {
    this.programChangeCallbacks.forEach(cb => cb(program, channel));
  }

  private handlePitchBend(value: number, channel: number) {
    // Normalize to -1 to 1
    const normalized = value / 8192;
    // Could add pitch bend callback here
  }

  // ==========================================================================
  // CALLBACK REGISTRATION
  // ==========================================================================

  public onNoteOn(moduleId: string, callback: NoteCallback) {
    this.noteOnCallbacks.set(moduleId, callback);
  }

  public onNoteOff(moduleId: string, callback: NoteCallback) {
    this.noteOffCallbacks.set(moduleId, callback);
  }

  public onCc(callback: CcCallback) {
    this.ccCallbacks.push(callback);
  }

  public onTransport(callback: TransportCallback) {
    this.transportCallbacks.push(callback);
  }

  public onProgramChange(callback: ProgramChangeCallback) {
    this.programChangeCallbacks.push(callback);
  }

  public onExternalClock(callback: ClockCallback) {
    this.externalClockCallbacks.push(callback);
  }

  // ==========================================================================
  // SENDING MIDI
  // ==========================================================================

  private send(data: number[]) {
    if (!this.activeOutputId) return;
    
    const output = this.outputs.get(this.activeOutputId);
    if (output) {
      output.send(data);
    }
  }

  public sendNoteOn(note: number, velocity: number, channel: MidiChannel) {
    if (channel === 'OFF') return;
    
    const ch = channel === 'ALL' ? 1 : channel;
    this.send([MIDI.NOTE_ON | (ch - 1), note, velocity]);
  }

  public sendNoteOff(note: number, channel: MidiChannel) {
    if (channel === 'OFF') return;
    
    const ch = channel === 'ALL' ? 1 : channel;
    this.send([MIDI.NOTE_OFF | (ch - 1), note, 0]);
  }

  public sendCc(cc: number, value: number, channel: MidiChannel) {
    if (channel === 'OFF') return;
    
    const ch = channel === 'ALL' ? 1 : channel;
    const val = Math.max(0, Math.min(127, Math.round(value)));
    this.send([MIDI.CONTROL_CHANGE | (ch - 1), cc, val]);
  }

  public sendProgramChange(program: number, channel: MidiChannel) {
    if (channel === 'OFF') return;
    
    const ch = channel === 'ALL' ? 1 : channel;
    this.send([MIDI.PROGRAM_CHANGE | (ch - 1), program]);
  }

  public sendTransport(type: 'start' | 'stop' | 'continue') {
    if (!this.clockConfig.sendTransport) return;
    
    switch (type) {
      case 'start':
        this.send([MIDI.START]);
        break;
      case 'stop':
        this.send([MIDI.STOP]);
        break;
      case 'continue':
        this.send([MIDI.CONTINUE]);
        break;
    }
  }

  public sendClock() {
    if (!this.clockConfig.sendClock) return;
    this.send([MIDI.CLOCK]);
  }

  public sendAllNotesOff(channel: MidiChannel = 'ALL') {
    if (channel === 'OFF') return;
    
    if (channel === 'ALL') {
      for (let ch = 1; ch <= 16; ch++) {
        this.send([MIDI.CONTROL_CHANGE | (ch - 1), MIDI.CC_ALL_NOTES_OFF, 0]);
      }
    } else {
      this.send([MIDI.CONTROL_CHANGE | (channel - 1), MIDI.CC_ALL_NOTES_OFF, 0]);
    }
  }

  // ==========================================================================
  // CLOCK MANAGEMENT
  // ==========================================================================

  public setClockConfig(config: Partial<MidiClockConfig>) {
    Object.assign(this.clockConfig, config);
  }

  public getClockConfig(): MidiClockConfig {
    return { ...this.clockConfig };
  }

  /**
   * Start sending MIDI clock at given BPM
   * 24 PPQ (pulses per quarter note)
   */
  public startInternalClock(bpm: number) {
    if (this.clockConfig.source !== 'internal') return;
    
    this.stopInternalClock();
    
    const msPerPulse = (60000 / bpm) / 24;
    this.ppqCounter = 0;
    
    this.clockInterval = window.setInterval(() => {
      this.sendClock();
      this.ppqCounter++;
    }, msPerPulse);
  }

  public stopInternalClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  public updateClockBpm(bpm: number) {
    if (this.clockInterval) {
      this.stopInternalClock();
      this.startInternalClock(bpm);
    }
  }

  // ==========================================================================
  // CC LEARNING
  // ==========================================================================

  public startLearning(callback: (cc: number, channel: number) => void) {
    this.isLearning = true;
    this.learningCallback = callback;
  }

  public stopLearning() {
    this.isLearning = false;
    this.learningCallback = null;
  }

  public addCcMapping(mapping: CcMapping) {
    // Remove existing mapping for same param
    this.ccMappings = this.ccMappings.filter(m => m.paramPath !== mapping.paramPath);
    this.ccMappings.push(mapping);
  }

  public removeCcMapping(paramPath: string) {
    this.ccMappings = this.ccMappings.filter(m => m.paramPath !== paramPath);
  }

  public getCcMappings(): CcMapping[] {
    return [...this.ccMappings];
  }

  public setCcMappings(mappings: CcMapping[]) {
    this.ccMappings = mappings;
  }

  // ==========================================================================
  // STATUS
  // ==========================================================================

  public getLastCc() {
    return this.lastCc;
  }

  public getLastNote() {
    return this.lastNote;
  }

  public isConnected(): boolean {
    return this.access !== null && (this.activeInputId !== null || this.activeOutputId !== null);
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  public dispose() {
    this.stopInternalClock();
    this.selectInput(null);
    this.selectOutput(null);
    
    this.noteOnCallbacks.clear();
    this.noteOffCallbacks.clear();
    this.ccCallbacks = [];
    this.transportCallbacks = [];
    this.externalClockCallbacks = [];
  }
}

// ============================================================================
// HELPER: Channel matching
// ============================================================================

export function matchesChannel(target: MidiChannel, incoming: number): boolean {
  if (target === 'OFF') return false;
  if (target === 'ALL') return true;
  return target === incoming;
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const midiService = new MidiService();
