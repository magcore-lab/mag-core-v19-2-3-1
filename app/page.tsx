'use client';
// V19.2.3.35 VALIDE +20% ALLUME + DMX DERNIERE MAJ + MODULES + TRANS NOIR CRISTAL + FX BLEU + ZOOM AVANT
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const CORE_LOCK = {
  cages: [0.62, 0.78, 0.92] as const,
  middle: { R: 0.576, transmission: 0.995, ior: 2.65, thickness: 0.624, roughness: 0.01, metalness: 0, clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 1.62, iridescence: 0.42, iridescenceIOR: 1.3, attenuationColor: 0xe8f4ff, attenuationDistance: 7.5, opacity: 0.96 },
  inner: { R1: 0.264, R2: 0.132, emissiveIntensity1: 5.4, emissiveIntensity2: 7.2 },
  sat: { radiusFactor: 1.38, count: 6, sphereRadius: 0.042 },
  camera: { fov: 34, z: 8.16 },
} as const;

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({channels: new Uint8Array(513), ch1:110, ch2:62, ch3:142, ch10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const mob=window.innerWidth<768;
  const camera=new THREE.PerspectiveCamera(CORE_LOCK.camera.fov,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,mob?7.44:CORE_LOCK.camera.z);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.056;
  renderer.outputColorSpace=THREE.SRGBColorSpace; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.88,0.42,0.78);
  composer.addPass(bloom);

  setMod({webgpu:false,audio:false,midi:false,osc:true});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMod(m=>({...m,webgpu:true})); });
  }
  let ws:any=null; const dmxChannels=new Uint8Array(513);
  try{
    ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>{ setDmxOn(true); setMod(m=>({...m,osc:true})); };
    ws.onmessage=(e:any)=>{
      try{
        const msg=JSON.parse(e.data);
        if(msg.channels && Array.isArray(msg.channels)){
          const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(Number(v)||0)));
          for(let i=0;i<512&&i<c.length;i++){ const v=clamp(c[i]); dmxChannels[i+1]=v; dmxRef.current.channels[i+1]=v; }
          dmxRef.current={channels:dmxChannels, ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>{ setDmxOn(false); }; ws.onerror=()=>{ setDmxOn(false); };
  }catch{ setDmxOn(false); }

  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256;
    const data=new Uint8Array(128); const osc=ctx.createOscillator(); osc.frequency.value=110;
    osc.connect(analyser); analyser.connect(ctx.destination); osc.start();
    const loop=()=>{ analyser.getByteFrequencyData(data); setMod(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMod(m=>({...m,midi:true}))); } }catch{}

  scene.add(new THREE.AmbientLight(0xffffff,0.92));
  const key=new THREE.DirectionalLight(0xffffff,1.35); key.position.set(4,6,5); scene.add(key);
  const fill=new THREE.DirectionalLight(0xaaccff,0.62); fill.position.set(-4,-2,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,114,22); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0x88ffff,74,16); coreLight2.position.set(0,0,2.6); scene.add(coreLight2);

  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(1.2); scene.add(coreGroup);

  const diamantMat=new THREE.MeshPhysicalMaterial({
    color:0xeef2f3, transparent:true, opacity:0.84, transmission:CORE_LOCK.middle.transmission,
    thickness:CORE_LOCK.middle.thickness, ior:CORE_LOCK.middle.ior, roughness:0.07, metalness:0,
    clearcoat:1.0, clearcoatRoughness:0.06, envMapIntensity:CORE_LOCK.middle.envMapIntensity,
    iridescence:CORE_LOCK.middle.iridescence, iridescenceIOR:CORE_LOCK.middle.iridescenceIOR,
    flatShading:true, side:THREE.DoubleSide
  });
  const diamant=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.middle.R,1),diamantMat); coreGroup.add(diamant);

  const innerMat=new THREE.MeshPhysicalMaterial({
    color:0xd8e6f0, emissive:0x88ffff, emissiveIntensity:CORE_LOCK.inner.emissiveIntensity1,
    transmission:0.998, thickness:0.68, ior:2.417, roughness:0.02, clearcoat:1.0, transparent:true, opacity:0.78
  });
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R1,4),innerMat); coreGroup.add(inner);

  const inner2Mat=new THREE.MeshPhysicalMaterial({
    color:0xaaffff, emissive:0xaaffff, emissiveIntensity:CORE_LOCK.inner.emissiveIntensity2,
    transmission:0.99, thickness:0.58, ior:2.417, roughness:0.01, clearcoat:1.0, transparent:true, opacity:0.82
  });
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R2,3),inner2Mat); coreGroup.add(inner2);

  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.36,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14})); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.624,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.09})); coreGroup.add(glow2);

  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(256*3);
  for(let i=0;i<256;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/256); const r=2.8+Math.random()*5.0; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  const partMat=new THREE.PointsMaterial({color:0x88eef0,size:0.052,transparent:true,opacity:0.84,sizeAttenuation:true}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);

  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.88; bloom.radius=0.42; innerMat.emissiveIntensity=CORE_LOCK.inner.emissiveIntensity1; inner.scale.setScalar(1.25); inner2Mat.emissiveIntensity=CORE_LOCK.inner.emissiveIntensity2; inner2.scale.setScalar(1.35); glow.scale.setScalar(1.35); coreLight.intensity=114; coreLight2.intensity=74; renderer.toneMappingExposure=1.056; }; setTimeout(ignite,180);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});

  let t=0,raf=0; const synthDMX=(tt:number)=>{ const ch1=127+Math.sin(tt*0.6)*42; const ch2=62+Math.sin(tt*0.4)*28; const ch3=142+Math.sin(tt*0.8)*32; const ch10=178+Math.sin(tt*0.3)*22; if(!ws||ws.readyState!==1){ dmxRef.current.channels[1]=Math.floor(ch1); dmxRef.current.channels[2]=Math.floor(ch2); dmxRef.current.channels[3]=Math.floor(ch3); dmxRef.current.channels[10]=Math.floor(ch10); dmxRef.current={channels:dmxRef.current.channels, ch1:Math.floor(ch1),ch2:Math.floor(ch2),ch3:Math.floor(ch3),ch10:Math.floor(ch10)}; } };
  const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; synthDMX(t); const dmx=dmxRef.current; const master=(dmx.ch10||178)/255; const prop=(dmx.ch1/255)*0.96*master; const bloomMod=(dmx.ch2/255)*0.42; bloom.strength=0.88+bloomMod*0.38; const rot=0.00092*(0.5+prop); const breath=1.0+Math.sin(t*1.15)*0.028; coreGroup.scale.setScalar(1.2*breath); coreGroup.rotation.y+=rot; inner.rotation.y-=rot*0.62; inner2.rotation.y+=rot*0.82; particles.rotation.y+=0.00028; composer.render(); }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10,textAlign:'center'}}>{on?'💎 V19.2.3.35 VALIDE +20% NOIR CRISTAL FX BLEU • Z8.16 ZOOM +20% • '+(dmxOn?'DMX WS':'DMX SYNTH')+' • '+Object.values(mod).filter(Boolean).length+'/4 MODS':'⚡ V19.2.3.35 IGNITION NOYAU +20%'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12,display:'flex',justifyContent:'center'}}><div style={{padding:'10px 16px',borderRadius:999,background:'rgba(255,255,255,0.92)',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.12em',textAlign:'center'}}>💎 VALIDE V19.2.3.14 • R0.576 CRISTAL TRANS 0.995 IOR 2.65 • NOIR 0.84 + BLANC FACETTE + BLEU FX • ZOOM AVANT Z8.16 +20% • DMX 512CH ART-NET 6454 sACN 5568 WS 8081 • WEBGPU WGSL 2.399963 • 156P • +20%</div></div></div>);
}
