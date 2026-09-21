export type DMXMode = 'synth' | 'ws' | 'off';
export const DMX_COHERENCE: { CH1: number; CH2: number; CH3: number; CH10: number } = { CH1: 127, CH2: 85, CH3: 165, CH10: 210 };
export const DMX_CONFIG = { modeDefault: 'synth' as DMXMode, rateHz: 44, min: 0, max: 255, bridge: { wsUrl: 'ws://localhost:8081', artnetPort: 6454, sacnPort: 5568 } } as const;
export function clampDMX(v: unknown): number { const n = Number(v); if (!isFinite(n) || isNaN(n)) return 0; return Math.max(0, Math.min(255, Math.floor(n))); }
export function synthDMX(t: number) { const s = (a: number, amp: number, f: number) => a + Math.sin(t*f)*amp; return { ch1: clampDMX(s(DMX_COHERENCE.CH1,42,0.6)), ch2: clampDMX(s(DMX_COHERENCE.CH2,28,0.4)), ch3: clampDMX(s(DMX_COHERENCE.CH3,32,0.8)), ch10: clampDMX(s(DMX_COHERENCE.CH10,22,0.3)) }; }
export function bytesPerRowAligned(w: number): number { return Math.ceil((w*4)/256)*256; }
