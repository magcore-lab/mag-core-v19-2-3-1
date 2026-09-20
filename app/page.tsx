// 1. AUCUN RECUL DE ZOOM
camera z: 10.71 → 10.2 FIXE
fov 34 fixe, plus de dezoom 5%

// 2. DMX ACTIF STABILISATION
ws://localhost:8081 → connect Art-Net 6454 + sACN 5568
CH1 PROPULSION → rotation noyau
CH2 BLOOM → 0.85 + CH2*0.4
CH3 FLOW → flowSpeed + CH3*0.01
CH10 MASTER → 0.8 + master*0.4
Synthetic fallback si bridge OFF

// 3. POWER 70% MAITRISEE
exposure 1.15 (au lieu de 2.2)
bloom 0.85 radius 0.45 (au lieu de 2.5)
coreLight 240 (au lieu de 1500)
inner 2.4 scale 1.22 (au lieu de 12)
cages opacity 0.82/0.58/0.38 (visibles)
branches diamants 0.44 (visibles)
