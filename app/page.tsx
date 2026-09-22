
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C = { midR: 0.48, trans: 0.86, ior: 2.42, thick: 0.42, op: 0.84, R1: 0.22, R2: 0.11, e1: 0.048, e2: 0.082, z: 6.12 };

export default function Page() {
  const ref = useRef<HTMLDivElement>(null);
  const dmx = useRef({ ch: new Uint8Array(513), c1: 127, c2: 28, c3: 72, c10: 12 });
  const [on, setOn] = useState(false);
  const [dmxOn, setDmxOn] = useState(false);
  const [mod, setMod] = useState({ webgpu: false, audio: false, midi: false, osc: true });

  useEffect(() => {
    const mnt = ref.current!;
    const sc = new THREE.Scene();
    (sc as any).background = new THREE.Color(0x05070a);
    (sc as any).fog = new THREE.FogExp2(0x080c14, 0.016);
    const mob = (window as any).innerWidth < 768;
    const cam = new THREE.PerspectiveCamera(34, (window as any).innerWidth / (window as any).innerHeight, 0.1, 100);
    cam.position.set(0, 0, mob? 5.2 : C.z);
    const ren = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    ren.setSize((window as any).innerWidth, (window as any).innerHeight);
    ren.setPixelRatio(Math.min((window as any).devicePixelRatio, 1.2));
    ren.toneMapping = THREE.ACESFilmicToneMapping;
    ren.toneMappingExposure = 0.54;
    mnt.appendChild(ren.domElement);
    const comp = new EffectComposer(ren);
    comp.addPass(new RenderPass(sc, cam));
    const bloom = new UnrealBloomPass(new THREE.Vector2((window as any).innerWidth, (window as any).innerHeight), 0.22, 0.68, 0.86);
    comp.addPass(bloom);

    if ((navigator as any).gpu) {
      (navigator as any).gpu.requestAdapter({ powerPreference: 'high-performance' }).then((a: any) => { if (a) setMod(s => ({...s, webgpu: true })); });
    }

    let ws: any = null;
    const arr = new Uint8Array(513);
    for (let i = 1; i < 513; i++) arr[i] = 0;
    arr[1] = 127; arr[2] = 28; arr[3] = 72; arr[10] = 12;
    try {
      ws = new WebSocket('ws://localhost:8081');
      ws.onopen = () => { setDmxOn(true); setMod(s => ({...s, osc: true })); };
      ws.onmessage = (e: any) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.channels) {
            const c = msg.channels;
            const cl = (v: number) => Math.max(0, Math.min(255, Math.floor(Number(v) || 0)));
            for (let i = 0; i < 512 && i < c.length; i++) { arr[i + 1] = cl(c[i]); dmx.current.ch[i + 1] = cl(c[i]); }
            dmx.current = { ch: arr, c1: cl(c[0]), c2: cl(c[1]), c3: cl(c[2]), c10: cl(c[9]) };
          }
        } catch {}
      };
      ws.onclose = () => setDmxOn(false);
      ws.onerror = () => setDmxOn(false);
    } catch { setDmxOn(false); }

    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC(); const an = ctx.createAnalyser(); an.fftSize = 256;
      const o = ctx.createOscillator(); o.frequency.value = 36;
      o.connect(an); an.connect(ctx.destination); o.start();
      const lp = () => { an.getByteFrequencyData(new Uint8Array(128)); setMod(s => ({...s, audio: true })); requestAnimationFrame(lp); }; lp();
    } catch {}
    try { if ((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(() => setMod(s => ({...s, midi: true }))); } catch {}

    sc.add(new THREE.AmbientLight(0x334466, 0.22));
    const l1 = new THREE.PointLight(0x3355ff, 1.42, 3.2); l1.position.set(0, 0, 0); sc.add(l1);
    const l2 = new THREE.PointLight(0x1122aa, 0.72, 2.2); l2.position.set(0.12, 0.08, 0.12); sc.add(l2);

    const g = new THREE.Group(); g.scale.setScalar(1.0); sc.add(g);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0x6a8ec2,
      transparent: true,
      opacity: C.op,
      transmission: C.trans,
      thickness: C.thick,
      ior: C.ior,
      roughness: 0.12,
      metalness: 0.04,
      clearcoat: 0.72,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.22,
      flatShading: true,
      side: THREE.DoubleSide
    } as any);
    const diam = new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR, 1), mat); g.add(diam);

    const m1 = new THREE.MeshPhysicalMaterial({
      color: 0x2a4a88,
      emissive: 0x2244aa,
      emissiveIntensity: C.e1,
      transmission: 0.72,
      thickness: 0.32,
      ior: 2.12,
      roughness: 0.18,
      transparent: true,
      opacity: 0.42
    } as any);
    const inn = new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1, 2), m1); g.add(inn);

    const m2 = new THREE.MeshPhysicalMaterial({
      color: 0x4466aa,
      emissive: 0x3366cc,
      emissiveIntensity: C.e2,
      transmission: 0.68,
      thickness: 0.26,
      ior: 2.12,
      roughness: 0.14,
      transparent: true,
      opacity: 0.32
    } as any);
    const inn2 = new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2, 2), m2); g.add(inn2);

    const drones: any[] = [];
    const droneGroup = new THREE.Group(); sc.add(droneGroup);
    for (let i = 0; i < 6; i++) {
      const drone = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.72, roughness: 0.12 } as any));
      drone.add(body);
      const spot = new THREE.SpotLight(0xffffff, 0, 1.42, Math.PI / 7, 0.52, 0.82);
      spot.position.set(0, 0, 0); spot.target = g; sc.add(spot.target); drone.add(spot);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false });
      const beamGeo = new THREE.CylinderGeometry(0.001, 0.088, 0.92, 16, 1, true);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.rotation.x = Math.PI / 2;
      beam.position.set(0, 0, 0.46);
      drone.add(beam);
      const satLight = new THREE.PointLight(0xffffff, 0.62, 1.0); satLight.position.set(0, 0, 0); drone.add(satLight);
      (drone as any).userData = { ang: i * 60 * Math.PI / 180, baseR: 0.92, spot, beam, body, satLight, idx: i };
      drones.push(drone); droneGroup.add(drone);
    }

    const geo = new THREE.BufferGeometry(); const pos = new Float32Array(156 * 3);
    for (let i = 0; i < 156; i++) {
      const th = i * 2.399963, ph = Math.acos(1 - 2 * i / 156), r = 2.2 + Math.random() * 2.2;
      pos[i * 3] = Math.sin(ph) * Math.cos(th) * r; pos[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * r; pos[i * 3 + 2] = Math.cos(ph) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x6688bb, size: 0.022, transparent: true, opacity: 0.22, sizeAttenuation: true });
    const pts = new THREE.Points(geo, pMat); sc.add(pts);

    let ign = false, presence = 0;
    const ignite = () => {
      if (ign) return; ign = true; setOn(true);
      bloom.strength = 0.22; (m1 as any).emissiveIntensity = C.e1; (m2 as any).emissiveIntensity = C.e2;
      l1.intensity = 1.42; l2.intensity = 0.72;
      drones.forEach((d: any) => { d.userData.spot.intensity = 1.82; d.userData.beam.material.opacity = 0.12; d.userData.body.material.emissiveIntensity = 0.72; d.userData.satLight.intensity = 0.62; });
    };
    const onPointer = () => { presence = 1; ignite(); };
    (window as any).addEventListener('pointermove', onPointer);
    (window as any).addEventListener('touchstart', onPointer);
    (window as any).addEventListener('pointerdown', ignite, { once: true } as any);
    setTimeout(ignite, 400);

    let t = 0, raf = 0;
    const synth = (tt: number) => {
      const c1 = 127 + Math.sin(tt * 0.6) * 18, c2 = 28 + Math.sin(tt * 0.4) * 8, c3 = 72 + Math.sin(tt * 0.8) * 12, c10 = 12 + Math.sin(tt * 0.2) * 1.2;
      if (!ws || ws.readyState!== 1) {
        dmx.current.ch[1] = Math.floor(c1); dmx.current.ch[2] = Math.floor(c2);
        dmx.current.ch[3] = Math.floor(c3); dmx.current.ch[10] = Math.floor(c10);
        for (let i = 0; i < 6; i++) { dmx.current.ch[21 + i] = Math.floor(88 + Math.sin(tt * 0.6 + i) * 18); }
        (dmx.current as any) = { ch: dmx.current.ch, c1: Math.floor(c1), c2: Math.floor(c2), c3: Math.floor(c3), c10: Math.floor(c10) };
      }
    };
    const anim = () => {
      raf = requestAnimationFrame(anim); t += 0.016; synth(t);
      const master = (dmx.current.c10 || 12) / 255;
      const prop = (dmx.current.c1 / 255) * 0.32 * master;
      const bMod = (dmx.current.c2 / 255) * 0.08;
      bloom.strength = 0.22 + bMod * 0.06 + presence * 0.08;
      const rot = 0.00024 * (0.5 + prop + presence * 0.42);
      const breath = 1.0 + Math.sin(t * 0.72) * 0.016 + Math.sin(t * 1.22) * 0.006 + presence * 0.032;
      g.scale.setScalar(breath);
      g.rotation.y += rot; g.rotation.x += rot * 0.08;
      inn.rotation.y -= rot * 0.18; inn2.rotation.y += rot * 0.28;
      const avgR = drones.reduce((a: any, d: any) => a + d.position.length(), 0) / 6;
      const ecart = Math.max(0, Math.min(1, (avgR - 0.6) / 1.2));
      const fogColor = new THREE.Color().lerpColors(new THREE.Color(0x080c14), new THREE.Color(0x0e1420), ecart);
      (sc as any).fog = new THREE.FogExp2(fogColor, 0.014 + ecart * 0.008);
      (sc as any).background = new THREE.Color().lerpColors(new THREE.Color(0x05070a), new THREE.Color(0x0a0e14), ecart);
      ren.toneMappingExposure = 0.54 + master * 0.08 + presence * 0.06;
      drones.forEach((d: any, idx: number) => {
        const ch = dmx.current.ch[21 + idx] || 88;
        const intensity = (ch / 255) * 1.82 + presence * 0.62;
        const ang = d.userData.ang + t * 0.18 + idx * 0.08 + prop * 0.62;
        const r = d.userData.baseR + Math.sin(t * 0.8 + idx) * 0.04 + presence * 0.08;
        const y = Math.sin(t * 0.52 + idx * 0.8) * 0.12 + presence * 0.04;
        d.position.set(Math.cos(ang) * r, y, Math.sin(ang) * r);
        d.lookAt(g.position);
        d.userData.spot.intensity = intensity;
        d.userData.beam.material.opacity = 0.08 + intensity * 0.042;
        d.userData.body.material.emissiveIntensity = 0.72 + intensity * 0.12;
        d.userData.satLight.intensity = 0.62 + intensity * 0.12;
        const dist = d.position.distanceTo(g.position);
        const gemmo = Math.max(0, 1 - dist / 1.8) * 0.32;
        (mat as any).envMapIntensity = 1.22 + gemmo + presence * 0.18;
        (m1 as any).emissiveIntensity = C.e1 + gemmo * 0.06;
        (m2 as any).emissiveIntensity = C.e2 + gemmo * 0.08;
      });
      pts.rotation.y += 0.00012; presence *= 0.992; comp.render();
    }; anim();
    const onR = () => { cam.aspect = (window as any).innerWidth / (window as any).innerHeight; cam.updateProjectionMatrix(); ren.setSize((window as any).innerWidth, (window as any).innerHeight); comp.setSize((window as any).innerWidth, (window as any).innerHeight); };
    (window as any).addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); (window as any).removeEventListener('resize', onR); (window as any).removeEventListener('pointermove', onPointer); mnt.removeChild(ren.domElement); ren.dispose(); if (ws) ws.close(); };
  }, []);

  return (
    <div style={{ width: '100%', height: '100dvh', background: '#05070a', overflow: 'hidden' }}>
      <div ref={ref} style={{ position: 'fixed', inset: 0 }} />
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', background: on? '#6a8ec2' : '#0a0a0a', color: '#fff', padding: '8px 20px', borderRadius: 999, fontSize: 11, fontWeight: 900, zIndex: 10 }}>
        {on? `💎 V19.2.3.54 BLEU RETOUR BEAMS REELS +4% STABLE Z6.12 ${dmxOn? 'DMX WS' : 'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4` : '⚡ V19.2.3.54 BLEU BEAMS REELS'}
      </div>
    </div>
  );
}
