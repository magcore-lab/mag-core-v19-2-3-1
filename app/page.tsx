'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C={midR:0.48,trans:0.94,ior:2.65,thick:0.42,op:0.96,R1:0.22,R2:0.11,e1:0.092,e2:0.168,z:6.12};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:127,c2:42,c3:72,c10:18});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mnt=ref.current!;
  const sc=new THREE.Scene();
  (sc as any).background=new THREE.Color(0x06080a);
  (sc as any).fog=new THREE.FogExp2(0x0a0e14,0.018);
  const mob=(window as any).innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,(window as any).innerWidth/(window as any).innerHeight,0.1,100);
  cam.position.set(0,0,mob?5.2:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize((window as any).innerWidth,(window as any).innerHeight);
  ren.setPixelRatio(Math.min((window as any).devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.82;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2((window as any).innerWidth,(window as any).innerHeight),0.36,0.58,0.82);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
  }

  let ws:any=null;
  const arr=new Uint8Array(513);
  for(let i=1;i<513;i++) arr[i]=0;
  arr[1]=127; arr[2]=42; arr[3]=72; arr[10]=18;
  try{
    ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>{ setDmxOn(true); setMod(s=>({...s,osc:true})); };
    ws.onmessage=(e:any)=>{
      try{
        const msg=JSON.parse(e.data);
        if(msg.channels){
          const c=msg.channels;
          const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(Number(v)||0)));
          for(let i=0;i<512&&i<c.length;i++){ arr[i+1]=cl(c[i]); dmx.current.ch[i+1]=cl(c[i]); }
          dmx.current={ch:arr,c1:cl(c[0]),c2:cl(c[1]),c3:cl(c[2]),c10:cl(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>setDmxOn(false);
    ws.onerror=()=>setDmxOn(false);
  }catch{ setDmxOn(false); }

  try{
    const AC=(window as any).AudioContext||(window as any).webkitAudioContext;
    const ctx=new AC(); const an=ctx.createAnalyser(); an.fftSize=256;
    const o=ctx.createOscillator(); o.frequency.value=42;
    o.connect(an); an.connect(ctx.destination); o.start();
    const lp=()=>{ an.getByteFrequencyData(new Uint8Array(128)); setMod(s=>({...s,audio:true})); requestAnimationFrame(lp); }; lp();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(()=>setMod(s=>({...s,midi:true}))); }catch{}

  sc.add(new THREE.AmbientLight(0xffffff,0.18));
  const l1=new THREE.PointLight(0xffffff,2.42,3.2); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0xffffff,1.12,2.2); l2.position.set(0.12,0.08,0.12); sc.add(l2);
  const key=new THREE.DirectionalLight(0xffffff,0.52); key.position.set(3,4,3); sc.add(key);
  const fill=new THREE.DirectionalLight(0xe8f0ff,0.32); fill.position.set(-3,-2,2); sc.add(fill);

  const g=new THREE.Group(); g.scale.setScalar(1.0); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0xffffff, transparent:true, opacity:C.op,
    transmission:C.trans, thickness:C.thick, ior:C.ior,
    roughness:0.02, clearcoat:1.0, clearcoatRoughness:0
