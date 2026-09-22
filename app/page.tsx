
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
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x06080a);
  sc.fog=new THREE.FogExp2(0x0a0e14,0.018);
  const mob=innerWidth<768;
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,mob?5.2:C.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  ren.setSize(innerWidth,innerHeight);
  ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  ren.toneMapping=THREE.ACESFilmicToneMapping;
  ren.toneMappingExposure=0.82;
  mnt.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.36,0.58,0.82);
  comp.addPass(bloom);

  if((navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'})
.then((a:any)=>{ if(a) setMod(s=>({...s,webgpu:true})); });
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
    roughness:0.02, metalness:0.0, clearcoat:1.0, clearcoatRoughness:0.02,
    envMapIntensity:2.42, flatShading:true, side:THREE.DoubleSide,
    dispersion:0.22
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(C.midR,1),mat); g.add(diam);

  const m1=new THREE.MeshPhysicalMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:C.e1,
    transmission:0.92, thickness:0.36, ior:2.65, roughness:0.02,
    transparent:true, opacity:0.32
  });
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R1,2),m1); g.add(inn);

  const m2=new THREE.MeshPhysicalMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:C.e2,
    transmission:0.88, thickness:0.28, ior:2.65, roughness:0.01,
    transparent:true, opacity:0.26
  });
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(C.R2,2),m2); g.add(inn2);

  const drones:any[]=[]; const droneGroup=new THREE.Group(); sc.add(droneGroup);
  for(let i=0;i<6;i++){
    const drone=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(0.042,12,12),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1.62,transmission:0.88,ior:2.4,roughness:0.02}));
    drone.add(body);
    const spot=new THREE.SpotLight(0xffffff,0,2.2,Math.PI/5,0.32,0.92);
    spot.position.set(0,0,0); spot.target=g; sc.add(spot.target); drone.add(spot);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.92,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.14}));
    beam.rotation.x=Math.PI; beam.position.z=-0.46; drone.add(beam);
    const satLight=new THREE.PointLight(0xffffff,1.42,1.8); satLight.position.set(0,0,0); drone.add(satLight);
    drone.userData={ang:i*60*Math.PI/180,baseR:0.92,spot,beam,body,satLight,idx:i};
    drones.push(drone); droneGroup.add(drone);
  }

  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){
    const th=i*2.399963, ph=Math.acos(1-2*i/156), r=2.2+Math.random()*2.8;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new THREE.PointsMaterial({color:0xffffff,size:0.028,transparent:true,opacity:0.38,sizeAttenuation:true});
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  let ign=false, presence=0;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    bloom.strength=0.36; m1.emissiveIntensity=C.e1; m2.emissiveIntensity=C.e2;
    l1.intensity=2.42; l2.intensity=1.12;
    drones.forEach(d=>{ d.userData.spot.intensity=5.2; d.userData.beam.material.opacity=0.14; d.userData.body.material.emissiveIntensity=1.62; d.userData.satLight.intensity=1.42; });
  };
  const onPointer=()=>{ presence=1; ignite(); };
  addEventListener('pointermove',onPointer); addEventListener('touchstart',onPointer);
  addEventListener('pointerdown',ignite,{once:true}); setTimeout(ignite,400);

  let t=0,raf=0;
  const synth=(tt:number)=>{
    const c1=127+Math.sin(tt*0.6)*22, c2=42+Math.sin(tt*0.4)*12, c3=72+Math.sin(tt*0.8)*18, c10=18+Math.sin(tt*0.2)*2;
    if(!ws||ws.readyState!==1){
      dmx.current.ch[1]=Math.floor(c1); dmx.current.ch[2]=Math.floor(c2);
      dmx.current.ch[3]=Math.floor(c3); dmx.current.ch[10]=Math.floor(c10);
      for(let i=0;i<6;i++){ dmx.current.ch[21+i]=Math.floor(122+Math.sin(tt*0.6+i)*32); }
      dmx.current={ch:dmx.current.ch,c1:Math.floor(c1),c2:Math.floor(c2),c3:Math.floor(c3),c10:Math.floor(c10)};
    }
  };
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016; synth(t);
    const master=(dmx.current.c10||18)/255;
    const prop=(dmx.current.c1/255)*0.42*master;
    const bMod=(dmx.current.c2/255)*0.12;
    bloom.strength=0.36+bMod*0.12+presence*0.14;
    const rot=0.00032*(0.5+prop+presence*0.52);
    const breath=1.0+Math.sin(t*0.72)*0.022+Math.sin(t*1.22)*0.008+presence*0.042;
    g.scale.setScalar(breath);
    g.rotation.y+=rot; g.rotation.x+=rot*0.08;
    inn.rotation.y-=rot*0.18; inn2.rotation.y+=rot*0.28;

    // FOND ET COULEUR ADAPTE ECART NOYAU
    const avgR=drones.reduce((a,d)=>a+d.position.length(),0)/6;
    const ecart=Math.max(0,Math.min(1,(avgR-0.6)/1.2));
    const fogColor=new THREE.Color().lerpColors(new THREE.Color(0x0a0e14), new THREE.Color(0x101820), ecart);
    sc.fog=new THREE.FogExp2(fogColor, 0.018+ecart*0.012);
    sc.background=new THREE.Color().lerpColors(new THREE.Color(0x06080a), new THREE.Color(0x101418), ecart);
    ren.toneMappingExposure=0.78+master*0.12+presence*0.08;

    drones.forEach((d,idx)=>{
      const ch=dmx.current.ch[21+idx]||122;
      const intensity=(ch/255)*5.4+presence*1.8;
      const ang=d.userData.ang + t*0.22 + idx*0.12 + prop*0.92;
      const r=d.userData.baseR + Math.sin(t*0.8+idx)*0.06 + presence*0.14;
      const y=Math.sin(t*0.52+idx*0.8)*0.14 + presence*0.06;
      d.position.set(Math.cos(ang)*r, y, Math.sin(ang)*r);
      d.lookAt(g.position);
      d.userData.spot.intensity=intensity;
      d.userData.beam.material.opacity=0.08+intensity*0.022;
      d.userData.body.material.emissiveIntensity=1.62+intensity*0.18;
      d.userData.satLight.intensity=1.42+intensity*0.22;
      const dist=d.position.distanceTo(g.position);
      const gemmo=Math.max(0,1-dist/1.8)*0.72;
      mat.envMapIntensity=2.42+gemmo+presence*0.52;
      m1.emissiveIntensity=C.e1+gemmo*0.14;
      m2.emissiveIntensity=C.e2+gemmo*0.22;
    });

    pts.rotation.y+=0.00018; presence*=0.992; comp.render();
  }; anim();

  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); };
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointermove',onPointer); mnt.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);

 return(
  <div style={{width:'100%',height:'100dvh',background:'#06080a',overflow:'hidden'}}>
    <div ref={ref} style={{position:'fixed',inset:0}}/>
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#ffffff':'#0a0a0a',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
      {on?`💎 V19.2.3.50 ENERGY +4% FOND ADAPTE ECART Z6.12 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mod).filter(Boolean).length}/4`:'⚡ V19.2.3.50 +4% ADAPTE'}
    </div>
    <div style={{position:'fixed',bottom:12,left:12,right:12,display:'flex',justifyContent:'center',zIndex:10}}>
      <div style={{padding:'8px 14px',borderRadius:999,background:'rgba(255,255,255,0.92)',color:'#000',fontSize:9,fontWeight:800,textAlign:'center'}}>
        ENERGY 3%→7% CH10 18/255 • FOND ADAPTE ECART 0.92R FogExp2 0x0a0e14→0x101820 • DMX CH21-26 BLANC • GEMMO IOR2.65
      </div>
    </div>
  </div>
 );
}
