export const CORE_LOCK = {
  cages: [0.62, 0.78, 0.92] as const,
  middle: { R: 0.48, transmission: 0.995, thickness: 0.52, ior: 2.33, roughness: 0.02, clearcoat: 1.0 } as const,
  inner: [0.22, 0.11] as const,
  sat: { radiusFactor: 1.15, count: 6, sphere: 0.035 } as const,
  camera: { FOV: 34, Z: 10.2 } as const,
  background: '#000000' as const,
  particles: { count: 156, atmosphereMin: 0.75, atmosphereMax: 1.45 } as const,
  neural: { links: 54 } as const,
} as const;
