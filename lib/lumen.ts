export const LUMEN = {
  background: '#000000' as const,
  exposure: 0.88,
  bloom: { strength: 0.68, radius: 0.35, threshold: 0.82 } as const,
  emissive: { core: 4.5, inner: 6.0 } as const,
  material: { IOR: 2.33, transmission: 0.96, thickness: 0.52, roughness: 0.02, clearcoat: 1.0, reflectivity: 0.96 } as const,
} as const;
