
    // AVANT V46 (ton screen branches grises) → APRES V47
branchMat transmission 0.72 → 0.92
thickness 0.22 → 0.38 / ior 2.15 → 2.4 / roughness 0.1 → 0.04
+ clearcoat 1.0 + clearcoatRoughness 0.08
opacity 0.32 → 0.72 (diamants visibles non gris)
emissiveIntensity 0.32 → 0.85 (bleu aaddff)
line opacity 0.14 → 0.42

// DIFFUSION NOYAU 70% VRAI
inner emissive 0.85 → 0.42 / scale 1.08 → 0.88
inner2 scale 1.05 → 0.92
coreLight 90 → 48
exposure 0.82 → 0.68
bloom 0.42 → 0.38 radius 0.58 → 0.62
middle fresnel 0.32 → 0.52 (diffusion dans branches)
flow 0.22 → 0.52 (flux visible)
