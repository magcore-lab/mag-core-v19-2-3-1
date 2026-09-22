
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C={midR:0.48,trans:0.88,ior:2.45,thick:0.52,op:0.92,R1:0.22,R2:0.11,e1:1.24,e2:1.68,z:10.2};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:127,c2:64,c3:142,c10:127});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mnt=ref.current!;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000208);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?9.4:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.88;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.38,0.62,0.86);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
.then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
  }

  let ws:any=null;
  const arr=new Uint8Array(513);
  for(let i=1;i<513;i++) arr[i]=0;
  arr[1]=127; arr[2]=64; arr[3]=142; arr[10]=127;
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
    const o=ctx.createOscillator(); o.frequency.value=72;
    o.connect(an); an.connect(ctx.destination); o.start();
    const lp=()=>{ an.getByteFrequencyData(new Uint8Array(128)); setMod(s=>({...s,audio:true})); requestAnimationFrame(lp); }; lp();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(()=>setMod(s=>({...s,midi:true}))); }catch{}

  // ÉCLAIRAGE BLEU PROFOND
  sc.add(new THREE.AmbientLight(0x001133,0.42));
  const key=new THREE.DirectionalLight(0x2244ff,0.92); key.position.set(4,6,5); sc.add(key);
  const fill=new THREE.DirectionalLight(0x0022aa,0.62); fill.position.set(-4,-2,4); sc.add(fill);
  const rim=new THREE.DirectionalLight(0x001155,0.52); rim.position.set(0,-6,-4); sc.add(rim);
  const l1=new THREE.PointLight(0x0033ff,24,8); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0x0011aa,18,5); l2.position.set(1.2,0.8,1.2); sc.add(l2);

  const g=new THREE.Group(); g.scale.setScalar(1.0); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0x1a2a6a, transparent:true, opacity:C.op,
    transmission:C.trans, thickness:C.thick, ior:C.ior,
    roughness:0.08, metalness:0.08, clearcoat:1.0, clearcoatRoughness:0.06,
    envMapIntensity:1.42, flatShading:true, side:THREE.DoubleSide
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0x0a1a88, emissive:0x0011ff, emissiveIntensity:C.e1,
    transmission:0.82, thickness:0.36, ior:2.12, roughness:0.08,
    transparent:true, opacity:0.68
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1,2),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0x0a22bb, emissive:0x0022ff, emissiveIntensity:C.e2,
    transmission:0.78, thickness:0.28, ior:2.22, roughness:0.06,
    transparent:true, opacity:0.58
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2,2),m2); g.add(inn2);

  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/156), r=2.8+Math.random()*4.2;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0x1144ff,size:0.042,transparent:true,opacity:0.72,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  let ign=false, presence=0;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.38; m1.emissiveIntensity=C.e1; m2.emissiveIntensity=C.e2;
    l1.intensity=24; l2.intensity=18;
  };
  const onPointer=()=>{ presence=1; ignite(); };
  addEventListener('pointermove',onPointer);
  addEventListener('touchstart',onPointer);
  addEventListener('pointerdown',ignite,{once:true});
  setTimeout(ignite,300);

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*42, c2=64+Math.sin(tt*0.4)*28, c3=142+Math.sin(tt*0.8)*32, c10=127+Math.sin(tt*0.3)*18;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||127)/255;
    const prop=(dmx.current.c1/255)*0.72*master;
    const bMod=(dmx.current.c2/255)*0.22;
    bloom.strength=0.38+bMod*0.22;
    const rot=0.00042*(0.5+prop+presence*0.6);
    const breath=1.0+Math.sin(t*0.88)*0.032+Math.sin(t*1.52)*0.012+presence*0.08;
    g.scale.setScalar(breath);
    g.rotation.y+=rot; g.rotation.x+=rot*0.12;
    inn.rotation.y-=rot*0.32; inn2.rotation.y+=rot*0.52;
    pts.rotation.y+=0.00032; presence*=0.992;
    comp.render();
  }; anim();

  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointermove',onPointer); mnt.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#000208',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#0011ff':'#0a1a88',color:'#fff',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.45 BLEU PROFOND Z10.2 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4`:'⚡ V19.2.3.45 BLEU PROFOND'}
    </div>
  </div>
 );
}
