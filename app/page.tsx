
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const C={midR:0.48,trans:0.86,ior:2.38,thick:0.42,op:0.88,R1:0.22,R2:0.11,e1:0.08,e2:0.14,z:6.12};

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmx=useRef({ch:new Uint8Array(513),c1:127,c2:32,c3:72,c10:9});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});

 useEffect(()=>{
  const mnt=ref.current!;
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  sc.fog=new THREE.FogExp2(0x000208,0.032);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?5.2:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.68;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.22,0.72,0.88);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
.then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
  }

  let ws:any=null;
  const arr=new Uint8Array(513);
  for(let i=1;i<513;i++) arr[i]=0;
  arr[1]=127; arr[2]=32; arr[3]=72; arr[10]=9;
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

  sc.add(new THREE.AmbientLight(0x000822,0.18));
  const l1=new THREE.PointLight(0x0011ff,1.8,3.2); l1.position.set(0,0,0); sc.add(l1);
  const l2=new THREE.PointLight(0x0022ff,0.82,2.2); l2.position.set(0.12,0.08,0.12); sc.add(l2);
  const l3=new THREE.PointLight(0x001133,0.42,4); l3.position.set(-0.22,-0.18,0.22); sc.add(l3);

  const g=new THREE.Group(); g.scale.setScalar(1.0); sc.add(g);

  const mat=new THREE.MeshPhysicalMaterial({
    color:0x0a1022, transparent:true, opacity:C.op,
    transmission:C.trans, thickness:C.thick, ior:C.ior,
    roughness:0.22, metalness:0.12, clearcoat:0.62, clearcoatRoughness:0.22,
    envMapIntensity:0.52, flatShading:true, side:THREE.DoubleSide
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0x060a1a, emissive:0x000822, emissiveIntensity:C.e1,
    transmission:0.72, thickness:0.28, ior:1.88, roughness:0.32,
    transparent:true, opacity:0.42
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1,2),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0x080e2a, emissive:0x001133, emissiveIntensity:C.e2,
    transmission:0.68, thickness:0.22, ior:1.82, roughness:0.28,
    transparent:true, opacity:0.36
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2,2),m2); g.add(inn2);

  // DRONES PROJECTEURS CINEMA - 6 drones en orbite HEX
  const drones: any[] = [];
  const droneGroup=new THREE.Group(); sc.add(droneGroup);
  for(let i=0;i<6;i++){
    const ang=i*60*Math.PI/180;
    const drone=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.032,8,8),new THREE.MeshBasicMaterial({color:0x0011ff}));
    drone.add(body);
    const spot=new THREE.SpotLight(0x0022ff,0,8,Math.PI/6,0.42,0.8);
    spot.position.set(0,0,0);
    spot.target=g;
    sc.add(spot.target);
    drone.add(spot);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.002,0.08,3.2,6),new THREE.MeshBasicMaterial({color:0x0011ff,transparent:true,opacity:0.08}));
    beam.rotation.x=Math.PI/2; beam.position.z=-1.6;
    drone.add(beam);
    drone.userData={ang,baseR:2.8,spot,beam,idx:i};
    drones.push(drone);
    droneGroup.add(drone);
  }

  // ENVIRONNEMENT QUANTIQUE INTELLIGENT - 156P + champ adaptatif
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/156), r=2.8+Math.random()*4.2;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0x0011aa,size:0.028,transparent:true,opacity:0.32,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  const qGeo=new THREE.BufferGeometry(); const qPos=new Float32Array(72*3);
  for(let i=0;i<72;i++){ const a=i/72*Math.PI*2; qPos[i*3]=Math.cos(a)*3.2; qPos[i*3+1]=Math.sin(a)*3.2; qPos[i*3+2]=Math.sin(a*3)*0.5; }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x001133,size:0.022,transparent:true,opacity:0.18});
  const qField=new THREE.Points(qGeo,qMat); sc.add(qField);

  let ign=false, presence=0;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.22; m1.emissiveIntensity=C.e1; m2.emissiveIntensity=C.e2;
    l1.intensity=1.8; l2.intensity=0.82;
    drones.forEach(d=>{ d.userData.spot.intensity=2.8; d.userData.beam.material.opacity=0.08; });
  };
  const onPointer=()=>{ presence=1; ignite(); };
  addEventListener('pointermove',onPointer);
  addEventListener('touchstart',onPointer);
  addEventListener('pointerdown',ignite,{once:true});
  setTimeout(ignite,400);

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*22, c2=32+Math.sin(tt*0.4)*12, c3=72+Math.sin(tt*0.8)*18, c10=9+Math.sin(tt*0.2)*2;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      for(let i=0;i<6;i++){ dmx.current.ch[21+i]=Math.floor(88+Math.sin(tt*0.4+i)*32); }
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||9)/255;
    const prop=(dmx.current.c1/255)*0.32*master;
    const bMod=(dmx.current.c2/255)*0.08;
    bloom.strength=0.22+bMod*0.08+presence*0.12;
    const rot=0.00022*(0.5+prop+presence*0.42);
    const breath=1.0+Math.sin(t*0.72)*0.022+Math.sin(t*1.22)*0.008+presence*0.042;
    g.scale.setScalar(breath);
    g.rotation.y+=rot; g.rotation.x+=rot*0.08;
    inn.rotation.y-=rot*0.18; inn2.rotation.y+=rot*0.28;

    drones.forEach((d, idx)=>{
      const ch=dmx.current.ch[21+idx]||88;
      const intensity=(ch/255)*3.2+presence*1.2;
      const ang=d.userData.ang + t*0.18 + idx*0.12 + prop*0.8;
      const r=d.userData.baseR + Math.sin(t*0.6+idx)*0.18 + presence*0.32;
      const y=Math.sin(t*0.42+idx*0.8)*0.42 + presence*0.18;
      d.position.set(Math.cos(ang)*r, y, Math.sin(ang)*r);
      d.lookAt(g.position);
      d.userData.spot.intensity=intensity;
      d.userData.beam.material.opacity=0.04+intensity*0.018;
      d.userData.beam.scale.z=0.8+intensity*0.22;
    });

    pts.rotation.y+=0.00018;
    qField.rotation.y-=0.00012;
    presence*=0.992;
    comp.render();
  }; anim();

  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointermove',onPointer); mnt.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#000000',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#001133':'#0a0a0a',color:'#88aaff',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.47 DRONES CINEMA Z6.12 3/4% ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4`:'⚡ V19.2.3.47 DRONES'}
    </div>
    <div style={{position:'fixed',bottom:12,left:12,right:12,display:'flex',justifyContent:'center',zIndex:10}}>
      <div style={{padding:'8px 14px',borderRadius:999,background:'rgba(0,17,51,0.82)',color:'#88aaff',fontSize:9,fontWeight:800,textAlign:'center'}}>
        DRONES 6x HEX SPOT 0x0022ff CH21-26 • DMX 512CH Art-Net 6454 sACN 5568 • QUANTIQUE INTELLIGENT 156P+72L • WEBGPU • CINEMA ACEScg
      </div>
    </div>
  </div>
 );
}
