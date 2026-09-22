'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const CORE={
  midR:0.576, innerR1:0.264, innerR2:0.132,
  trans:0.995, ior:2.65, thick:0.624, op:0.88,
  e1:2.8, e2:3.4, camZ:8.16
};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:110,c2:62,c3:142,c10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mount=ref.current!;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?7.44:CORE.camZ);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.92;
  mount.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.28,0.62,0.92);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
     .then((a:any)=>{ if(a) setMod(m=>({...m,webgpu:true})); });
  }

  let ws:any=null;
  const chArr=new Uint8Array(513);
  for(let i=1;i<513;i++) chArr[i]=0;
  chArr[1]=110; chArr[2]=62; chArr[3]=142; chArr[10]=178;
  try{
    ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>{ setDmxOn(true); setMod(m=>({...m,osc:true})); };
    ws.onmessage=(e:any)=>{
      try{
        const msg=JSON.parse(e.data);
        if(msg.channels){
          const c=msg.channels;
          const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(Number(v)||0)));
          for(let i=0;i<512&&i<c.length;i++){ chArr[i+1]=cl(c[i]); dmx.current.ch[i+1]=cl(c[i]); }
          dmx.current={ch:chArr,c1:cl(c[0]),c2:cl(c[1]),c3:cl(c[2]),c10:cl(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>setDmxOn(false);
    ws.onerror=()=>setDmxOn(false);
  }catch{ setDmxOn(false); }

  try{
    const AC=(window as any).AudioContext||(window as any).webkitAudioContext;
    const ctx=new AC(); const an=ctx.createAnalyser(); an.fftSize=256;
    const o=ctx.createOscillator(); o.frequency.value=110;
    o.connect(an); an.connect(ctx.destination); o.start();
    const lp=()=>{ an.getByteFrequencyData(new Uint8Array(128)); setMod(m=>({...m,audio:true})); requestAnimationFrame(lp); }; lp();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(()=>setMod(m=>({...m,midi:true}))); }catch{}

  sc.add(new THREE.AmbientLight(0xffffff,0.62));
  const k=new THREE.DirectionalLight(0xffffff,0.88); k.position.set(4,6,5); sc.add(k);
  const f=new THREE.DirectionalLight(0xaaccff,0.38); f.position.set(-4,-2,4); sc.add(f);
  const l1=new THREE.PointLight(0x88ffff,28,6); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0xffffff,18,4); l2.position.set(0,0,0.8); sc.add(l2);

  const g=new THREE.Group(); g.scale.setScalar(1.2); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0xe8eef2, transparent:true, opacity:CORE.op,
    transmission:CORE.trans, thickness:CORE.thick, ior:CORE.ior,
    roughness:0.08, metalness:0, clearcoat:1.0, clearcoatRoughness:0.08,
    envMapIntensity:1.18, flatShading:true, side:THREE.DoubleSide
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0xc8d8e8, emissive:0x88ddff, emissiveIntensity:CORE.e1,
    transmission:0.92, thickness:0.42, ior:2.1, roughness:0.12,
    transparent:true, opacity:0.58
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE.innerR1,2),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0xaaddff, emissive:0x88eeff, emissiveIntensity:CORE.e2,
    transmission:0.88, thickness:0.32, ior:2.0, roughness:0.08,
    transparent:true, opacity:0.62
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE.innerR2,2),m2); g.add(inn2);

  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(200*3);
  for(let i=0;i<200;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/200), r=2.8+Math.random()*5.2;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0x88eef0,size:0.042,transparent:true,opacity:0.72,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  let ign=false;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.28; m1.emissiveIntensity=CORE.e1; m2.emissiveIntensity=CORE.e2;
    l1.intensity=28; l2.intensity=18;
  };
  setTimeout(ignite,180);
  addEventListener('pointerdown',ignite,{once:true});
  addEventListener('touchstart',ignite,{once:true});

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*42, c2=62+Math.sin(tt*0.4)*28, c3=142+Math.sin(tt*0.8)*32, c10=178+Math.sin(tt*0.3)*22;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||178)/255;
    const prop=(dmx.current.c1/255)*0.72*master;
    const bMod=(dmx.current.c2/255)*0.18;
    bloom.strength=0.28+bMod*0.18;
    const rot=0.00062*(0.5+prop);
    const breath=1.0+Math.sin(t*1.15)*0.022;
    g.scale.setScalar(1.2*breath);
    g.rotation.y+=rot; inn.rotation.y-=rot*0.42; inn2.rotation.y+=rot*0.62;
    pts.rotation.y+=0.00018; comp.render();
  }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mount.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88eef0':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.37 INTERIEUR Z8.16 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4 MODS`:'⚡ V19.2.3.37'}
    </div>
  </div>
 );
}
