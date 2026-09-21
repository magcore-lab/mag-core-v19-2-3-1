'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// V78 SAT -10% + SANS REFLET CAMERA + ELECTRISATION BRANCHE BLEUTE DIAMANT + GRAVITATION PURE XY ZOOM 1.469 NOYAU 90% VIDE
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:100,ch6:80,ch7:120,ch8:90,ch9:70,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.98; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.52,0.52,0.78); composer.addPass(bloom);
  const tronShader={ uniforms:{ tDiffuse:{value:null}, uT:{value:0}, uScan:{value:0.18}, uChroma:{value:0.0010}, uVign:{value:0.28} }, vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, fragmentShader:`uniform sampler2D tDiffuse; uniform float uT; uniform float uScan; uniform float uChroma; uniform float uVign; varying vec2 vUv; void main(){ float chroma=uChroma+sin(vUv.x*18.0+uT*1.2)*0.0004; vec4 r=texture2D(tDiffuse,vec2(vUv.x+chroma,vUv.y)); vec4 g=texture2D(tDiffuse,vUv); vec4 b=texture2D(tDiffuse,vec2(vUv.x-chroma,vUv.y)); vec3 col=vec3(r.r,g.g,b.b); float scan=sin(vUv.y*900.0+uT*4.5)*0.025*uScan; col-=scan; float vign=1.0-dot(vUv-0.5,vUv-0.5)*uVign; vec2 cin=vUv*2.0-1.0; float letter=1.0-smoothstep(0.92,1.08,abs(cin.y*1.8)); col*=vign*letter; gl_FragColor=vec4(col,1.0); }` };
  const tronPass=new ShaderPass(tronShader); composer.addPass(tronPass);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch4:clamp(c[3]??128),ch5:clamp(c[4]??100),ch6:clamp(c[5]??80),ch7:clamp(c[6]??120),ch8:clamp(c[7]??90),ch9:clamp(c[8]??70),ch10:clamp(c[9])}; if((msg as any).type==='artnet') setMods(mm=>({...mm,artnet:true})); if((msg as any).type==='sacn') setMods(mm=>({...mm,sacn:true})); } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); let lowAvg=0; let beat=0; const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,20).reduce((a,b)=>a+b,0)/20; lowAvg=lowAvg*0.92+low*0.08; if(low>lowAvg*1.35 && low>95 && performance.now()-beat>180){ beat=performance.now(); bloom.strength=0.64; setTimeout(()=>{ bloom.strength=0.52; },130); } (dmxRef.current as any)._audioLow=low/255; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st,note,vel]=e.data; if(st===144 && vel>0){ (dmxRef.current as any)._midi=note/127; setMods(mm=>({...mm,midi:true})); } }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.36));
  const key=new THREE.PointLight(0xffffff,82,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ccff,46,9); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,36,7); coreLight2.position.set(0,0,1.6); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.46942); scene.add(coreGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const quantGroup=new THREE.Group(); coreGroup.add(quantGroup);
  const electrGroup=new THREE.Group(); coreGroup.add(electrGroup);
  const SAT_COUNT=7; const RADIUS=0.88;
  // DIAMANT SANS REFLET CAMERA - VIDE 90%
  const diamV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uE; uniform float uPower; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.9); float c=0.52+f*0.22; vec3 base=vec3(0.62,0.82,0.94); base*=uE*uPower; gl_FragColor=vec4(base*c,0.54); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uE:{value:0.68},uPower:{value:0.90}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,3),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ffff,emissiveIntensity:0.42,transmission:0.98,thickness:0.42,ior:2.65,roughness:0.06,clearcoat:0.6,transparent:true,opacity:0.64} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const sats:any[]=[]; const quantLines:any[]=[]; const electrLines:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.032,14,14),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:1.62} as any));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.056,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.20} as any));
    const pulse=new THREE.Mesh(new THREE.SphereGeometry(0.082,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.12} as any));
    g.add(core); g.add(halo); g.add(pulse);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,43.2,3.6); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core,halo,pulse,light:l,baseAngle:ang,radius:RADIUS,gravPhase:Math.random()*6.28318});
  }
  for(let i=0;i<SAT_COUNT;i++){
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
    const mat=new THREE.LineBasicMaterial({color:0x88ffff,transparent:true,opacity:0.0} as any);
    const line=new THREE.Line(geo,mat); quantGroup.add(line); quantLines.push({line,mat,i,j:(i+1)%SAT_COUNT});
  }
  for(let k=0;k<8;k++){
    const a1=Math.random()*Math.PI*2; const r1=0.22; const r2=0.48;
    const p1=new THREE.Vector3(Math.cos(a1)*r1,Math.sin(a1)*r1,0);
