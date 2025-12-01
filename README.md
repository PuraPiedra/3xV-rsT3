# TRIPLE V:RusT3 - Refactored (No AI)

**100% offline synthesizer** - Zero API dependencies, zero costs.

## 🎹 Features

### Poly Synth (Virus TI2 Style)
- 2 oscillators (Saw/Square/Sine/Triangle)
- Multi-mode filter (LP/HP/BP)
- ADSR envelopes (Amp + Filter)
- Effects chain (Distortion, Chorus, Delay, Reverb)
- Arpeggiator (Up/Down/UpDown/Random/Chord)
- **40+ hand-crafted presets** organized by category

### RHYTHM 909
- Professional multi-layer synthesis
- KICK: 3-layer (sub + body + click) with KICK MOD
- SNARE: 4-layer with body, tone, and wires
- HI-HAT: 6 detuned oscillators for metallic character
- CLAP: Multi-burst with reverb tail
- **Authentic ProCo RAT emulation**
- Preset patterns: TEKNO, HARD, INDUS, MINIMAL

### MIDI
- Clock IN/OUT
- Note routing per module
- CC Learn mode
- Program Change support
- Transport (Start/Stop/Continue)

## 📁 Files

```
triple-vrust3-no-ai/
├── presets.ts          # 40+ Virus-style presets
├── types.ts            # TypeScript definitions
├── components/
│   ├── Display.tsx     # Preset browser UI
│   ├── DrumMachine.tsx # 909 interface
│   └── MidiSettings.tsx# MIDI config panel
└── services/
    ├── drumEngine.ts   # Professional drum synthesis
    └── midiService.ts  # Complete MIDI I/O
```

## 🎚️ Preset Categories

| Category   | Count | Description                    |
|------------|-------|--------------------------------|
| INIT       | 3     | Basic starting patches         |
| LEADS      | 6     | Cygnus, Darkstar, Hardwired... |
| BASSES     | 7     | Oxygen, Toxic, Reese, Growl... |
| PADS       | 6     | Horizon, Cathedral, Strings... |
| PLUCKS     | 6     | Mercury, Stab, Bell, Piano...  |
| ARPS       | 5     | Matrix, Techno, Ambient...     |
| SEQUENCES  | 4     | Berlin, Industrial, Acid...    |
| FX         | 3     | Noise Sweep, Riser, Drone      |

## 🚀 Integration

1. Copy files to your project
2. Import presets:
```typescript
import { PRESETS, getPresetsByCategory, getRandomPreset } from './presets';
```

3. Use in component:
```tsx
const [currentPatch, setCurrentPatch] = useState(PRESETS[0]);

<Display 
  patchName={currentPatch.name}
  onSelectPreset={setCurrentPatch}
  onRandomize={() => setCurrentPatch(getRandomPreset())}
/>
```

## 💰 Costs

**$0** - Everything runs locally with Web Audio API.

No API keys. No cloud services. No subscriptions.

## ☁️ Deploying to Cloudflare Pages

Use the provided `wrangler.toml` and the steps in `CLOUDFLARE_DEPLOY.md` to publish a static build to Cloudflare Pages. Build your frontend into `dist/`, preview with `npx wrangler pages dev dist`, then deploy with `npx wrangler pages publish dist --project-name=triple-vrust3`.

## 🔧 Tech Stack

- Web Audio API (synthesis)
- Web MIDI API (hardware I/O)
- React + TypeScript
- Tailwind CSS

---

*Inspired by Access Virus TI2*
