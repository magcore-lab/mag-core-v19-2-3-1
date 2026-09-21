export const AMENTI = {
  radii: [1.4, 1.7, 2.1] as const,
  tube: 0.0045,
  segments: { tubular: 12, radial: 192 } as const,
  rotation: { xBase: Math.PI/2.5, xStep: 0.42, yStep: 0.78 } as const,
  opacity: 0.48,
  emissive: 0.72,
  facette: { radius: 0.042, detail: 0 } as const,
  flow: 384,
  particles: { count: 256, goldenAngle: 2.399963, scatter: 4.2 } as const,
} as const;
