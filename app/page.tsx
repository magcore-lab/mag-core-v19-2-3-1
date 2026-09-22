
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C={midR:0.48,trans:0.92,ior:2.65,thick:0.42,op:0.94,R1:0.22,R2:0.11,e1:0.042,e2:0.082,z:6.12};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:127,c2:32,c3:72,c10:8});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mnt=ref.current!;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  sc.fog=new THREE.FogExp2(0x050505,0.028);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?5.2:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.72;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.24,0.68,0.88);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
.then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
  }

  let ws:any=null;
  const arr=new Uint8Array(513);
  for(let i=1;i<513;i++) arr[i]=0;
  arr[1]=127; arr[2]=32; arr[3]=72; arr[10]=8;
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
    const o=ctx.createOscillator(); o.frequency.value=38;
    o.connect(an); an.connect(ctx.destination); o.start();
    const lp=()=>{ an.getByteFrequencyData(new Uint8Array(128)); setMod(s=>({...s,audio:true})); requestAnimationFrame(lp); }; lp();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess) (navigator as any).requestMIDIAccess().then(()=>setMod(s=>({...s,midi:true}))); }catch{}

  sc.add(new THREE.AmbientLight(0xffffff,0.08));
  const l1=new THREE.PointLight(0xffffff,1.2,3.2); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0xffffff,0.52,2.2); l2.position.set(0.12,0.08,0.12); sc.add(l2);
  const l3=new THREE.PointLight(0xffffff,0.22,4); l3.position.set(-0.22,-0.18,0.22); sc.add(l3);

  const g=new THREE.Group(); g.scale.setScalar(1.0); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0xffffff, transparent:true, opacity:C.op,
    transmission:C.trans, thickness:C.thick, ior:C.ior,
    roughness:0.04, metalness:0.02, clearcoat:1.0, clearcoatRoughness:0.04,
    envMapIntensity:1.88, flatShading:true, side:THREE.DoubleSide,
    dispersion:0.18
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:C.e1,
    transmission:0.88, thickness:0.32, ior:2.65, roughness:0.04,
    transparent:true, opacity:0.32
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1,2),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:C.e2,
    transmission:0.82, thickness:0.24, ior:2.65, roughness:0.02,
    transparent:true, opacity:0.28
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2,2),m2); g.add(inn2);

  const drones:any[]=[]; const droneGroup=new THREE.Group(); sc.add(droneGroup);
  for(let i=0;i<6;i++){
    const drone=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.028,8,8),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.2,transmission:0.92,ior:2.4}));
    drone.add(body);
    const spot=new THREE.SpotLight(0xffffff,0,8,Math.PI/7,0.38,0.82);
    spot.position.set(0,0,0); spot.target=g; sc.add(spot.target); drone.add(spot);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.0015,0.12,3.2,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.06}));
    beam.rotation.x=Math.PI/2; beam.position.z=-1.6; drone.add(beam);
    drone.userData={ang:i*60*Math.PI/180,baseR:2.8,spot,beam,body,idx:i};
    drones.push(drone); droneGroup.add(drone);
  }

  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/156), r=2.8+Math.random()*4.2;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0xffffff,size:0.024,transparent:true,opacity:0.22,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  let ign=false, presence=0;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.24; m1.emissiveIntensity=C.e1; m2.emissiveIntensity=C.e2;
    l1.intensity=1.2; l2.intensity=0.52;
    drones.forEach(d=>{ d.userData.spot.intensity=3.2; d.userData.beam.material.opacity=0.06; d.userData.body.material.emissiveIntensity=1.2; });
  };
  const onPointer=()=>{ presence=1; ignite(); };
  addEventListener('pointermove',onPointer); addEventListener('touchstart',onPointer);
  addEventListener('pointerdown',ignite,{once:true}); setTimeout(ignite,400);

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*22, c2=32+Math.sin(tt*0.4)*12, c3=72+Math.sin(tt*0.8)*18, c10=8+Math.sin(tt*0.2)*1.5;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      for(let i=0;i<6;i++){ dmx.current.ch[21+i]=Math.floor(92+Math.sin(tt*0.4+i)*28); }
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||8)/255;
    const prop=(dmx.current.c1/255)*0.32*master;
    const bMod=(dmx.current.c2/255)*0.08;
    bloom.strength=0.24+bMod*0.08+presence*0.12;
    const rot=0.00022*(0.5+prop+presence*0.42);
    const breath=1.0+Math.sin(t*0.72)*0.022+Math.sin(t*1.22)*0.008+presence*0.042;
    g.scale.setScalar(breath);
    g.rotation.y+=rot; g.rotation.x+=rot*0.08;
    inn.rotation.y-=rot*0.18; inn2.rotation.y+=rot*0.28;

    drones.forEach((d,idx)=>{
      const ch=dmx.current.ch[21+idx]||92;
      const intensity=(ch/255)*3.8+presence*1.4;
      const ang=d.userData.ang + t*0.18 + idx*0.12 + prop*0.8;
      const r=d.userData.baseR + Math.sin(t*0.6+idx)*0.18 + presence*0.32;
      const y=Math.sin(t*0.42+idx*0.8)*0.42 + presence*0.18;
      d.position.set(Math.cos(ang)*r, y, Math.sin(ang)*r);
      d.lookAt(g.position);
      d.userData.spot.intensity=intensity;
      d.userData.beam.material.opacity=0.04+intensity*0.016;
      d.userData.body.material.emissiveIntensity=1.2+intensity*0.22;
      // GEMMO FX - brillance diamant quand drone passe
      const dist=d.position.distanceTo(g.position);
      const gemmoBoost=Math.max(0,1-dist/4)*0.42;
      mat.envMapIntensity=1.88+gemmoBoost+presence*0.42;
      mat.clearcoat=1.0;
      m1.emissiveIntensity=C.e1+gemmoBoost*0.08;
    });

    pts.rotation.y+=0.00018; presence*=0.992; comp.render();
  }; anim();

  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointermove',onPointer); mnt.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#ffffff':'#0a0a0a',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.48 DRONES BLANC NOYAU BLANC 3% GEMMO Z6.12 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4`:'⚡ V19.2.3.48 BLANC 3% GEMMO'}
    </div>
  </div>
 );
}
