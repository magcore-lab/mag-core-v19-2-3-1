// RÉFLEXION DIAMANTALE
branches: IOR 2.4 → 2.417 (diamant vrai)
thickness 0.38 → 0.52 / transmission 0.92 → 0.96
dispersion 0.12 (feux diamant) + reflectivity 0.92 + envMapIntensity 1.5
roughness 0.04 → 0.02 / clearcoatRoughness 0.08 → 0.04
tetra: IOR 2.15 → 2.417 / dispersion 0.18 / reflectivity 0.95 / opacity 0.08 → 0.15

// NOYAU QUANTIQUE ACTIF DANS SON ENVIRONNEMENT
inner: IOR 2.65 → 2.417 + dispersion 0.22 + thickness 0.52 → 0.62
emissive 0.22 → 0.32 → ignition 0.75 → 1.15 + scale 0.96 → 1.02
inner2: dispersion 0.18 + emissive 0.28 → 0.42 → 0.85 + scale 1.02 → 1.08

// FRESNEL QUANTIQUE
fresF: q = sin(uT*2.8+length(vN)*6.0)*0.12 + cos(uT*1.3+vN.x*4.0)*0.08
→ noyau qui pulse quantiquement, pas statique
col += vec3(0.42,0.88,1.0)*q*0.32 → reflets quantiques bleus

// LUMEN GLOBAL
branches opacity 0.82 → 0.88 emissive 1.15 → 1.45 envMap 1.2
line 0.52 → 0.68 / tetra 0.72 → 0.88 + emissive 0.45
Z10.2 FIXE / spatial 1.4/1.7/2.1 SAT 2.1R conservé
DMX SYNTH + 4/4 MODS conservé
