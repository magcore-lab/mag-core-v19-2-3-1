'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C={midR:0.576,R1:0.264,R2:0.132,trans:0.72,ior:2.18,thick:0.38,op:0.94,e1:0.12,e2:0.18,z:8.16};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:110,c2:62,c3:142,c10:4});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mnt=ref.current!;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?7.44:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.52;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.06,0.84,0.98);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
  .then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
  }

  let ws:any=null;
  const arr=new Uint8Array(513);
  for(let i=1;i<513;i++) arr[i]=0;
  arr[1]=110; arr[2]=62; arr[3]=142; arr[10]=4;
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
    const o=ctx.createOscillator(); o.frequency.value=55;
    o.connect(an); an.connect(ctx.destination); o.start();
    const lp=()=>{ an.getByteFrequencyData(new Uint8Array(128)); setMod(s=>({...s,audio:true})); requestAnimationFrame(lp); }; lp();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(()=>setMod(s=>({...s,midi:true}))); }catch{}

  sc.add(new THREE.AmbientLight(0xffffff,0.38));
  const key=new THREE.DirectionalLight(0xffffff,0.42); key.position.set(4,6,5); sc.add(key);
  const fill=new THREE.DirectionalLight(0x88aabb,0.18); fill.position.set(-4,-2,4); sc.add(fill);
  const l1=new THREE.PointLight(0x88ffff,2.2,4); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0xffffff,1.2,2.5); l2.position.set(0,0,0.6); sc.add(l2);

  const g=new THREE.Group(); g.scale.setScalar(1.2); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0xc8d0d8, transparent:true, opacity:C.op,
    transmission:C.trans, thickness:C.thick, ior:C.ior,
    roughness:0.32, metalness:0.08, clearcoat:0.42, clearcoatRoughness:0.38,
    envMapIntensity:0.42, flatShading:true, side:THREE.DoubleSide
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0x4a5a6a, emissive:0x223344, emissiveIntensity:C.e1,
    transmission:0.62, thickness:0.22, ior:1.6, roughness:0.42,
    transparent:true, opacity:0.38
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1,1),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0x3a4a5a, emissive:0x223344, emissiveIntensity:C.e2,
    transmission:0.58, thickness:0.18, ior:1.5, roughness:0.38,
    transparent:true, opacity:0.32
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2,1),m2); g.add(inn2);

  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(160*3);
  for(let i=0;i<160;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/160), r=3.4+Math.random()*4.2;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0x445566,size:0.028,transparent:true,opacity:0.28,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  let ign=false;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.06; m1.emissiveIntensity=C.e1; m2.emissiveIntensity=C.e2;
    l1.intensity=2.2; l2.intensity=1.2;
  };
  setTimeout(ignite,180);
  addEventListener('pointerdown',ignite,{once:true});
  addEventListener('touchstart',ignite,{once:true});

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*42, c2=62+Math.sin(tt*0.4)*28, c3=142+Math.sin(tt*0.8)*32, c10=4+Math.sin(tt*0.2)*2;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||4)/255;
    const prop=(dmx.current.c1/255)*0.28*master;
    const bMod=(dmx.current.c2/255)*0.04;
    bloom.strength=0.06+bMod*0.04;
    const rot=0.00018*(0.5+prop);
    const breath=1.0+Math.sin(t*0.92)*0.038+Math.sin(t*1.68)*0.012;
    g.scale.setScalar(1.2*breath);
    g.rotation.y+=rot; g.rotation.x+=rot*0.12;
    inn.rotation.y-=rot*0.22; inn2.rotation.y+=rot*0.32;
    pts.rotation.y+=0.00006; comp.render();
  }; anim();

  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mnt.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#2a3a4a':'#3dd598',color:'#fff',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.39 RESP -98% Z8.16 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4`:'⚡ V19.2.3.39 RESP -98%'}
    </div>
  </div>
 );
}
