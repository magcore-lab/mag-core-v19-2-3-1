'use client';
// V19.2.3.26 RESTORE VALIDÉ - AVANT DEREGLAGE - CORE LOCK 0.62/0.78/0.92 - NOYAU 15% ROND DIAMANT
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
const CORE_LOCK = {
  cages: [0.62, 0.78, 0.92] as const,
  middle: { R: 0.48, transmission: 0.995, ior: 2.65, thickness: 0.52, roughness: 0.01, clearcoat: 1.0, opacity: 0.96 },
  inner: { R1: 0.22, R2: 0.11, emissiveIntensity1: 4.5, emissiveIntensity2: 6.0 },
  sat: { radiusFactor: 1.15, count: 6, sphereRadius: 0.035 },
  camera: { fov: 34, z: 10.2 },
} as const;
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false); const [sel,setSel]=useState<number|null>(null);
 const dmxRef=useRef<any>(null);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const cam=new THREE.PerspectiveCamera(CORE_LOCK.camera.fov,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,CORE_LOCK.camera.z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.15));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.88; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const bloom=new (UnrealBloomPass as any)(new THREE.Vector2(innerWidth,innerHeight),0.68,0.38,0.85); comp.addPass(bloom);
  sc.add(new THREE.AmbientLight(0xffffff,0.72));
  const cg=new THREE.Group(); sc.add(cg);
  // CAGES 0.62/0.78/0.92 - CORE LOCK
  CORE_LOCK.cages.forEach((r,i)=>{ const cage=new THREE.Mesh(new THREE.IcosahedronGeometry(r,2),new (THREE as any).MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.12/(i+1)})); cg.add(cage); });
  // MIDDLE 0.48 - DIAMANT ROND 15% - T0.995 IOR 2.65
  const midMat=new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.18,transmission:CORE_LOCK.middle.transmission,thickness:CORE_LOCK.middle.thickness,ior:CORE_LOCK.middle.ior,roughness:CORE_LOCK.middle.roughness,clearcoat:CORE_LOCK.middle.clearcoat,transparent:true,opacity:0.42});
  const middle=new THREE.Mesh(new THREE.SphereGeometry(CORE_LOCK.middle.R,64,64),midMat); cg.add(middle);
  // INNER 0.22 / 0.11
  const inner1=new THREE.Mesh(new THREE.SphereGeometry(CORE_LOCK.inner.R1,32,32),new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.22,transmission:0.992,transparent:true,opacity:0.48})); cg.add(inner1);
  const inner2=new THREE.Mesh(new THREE.SphereGeometry(CORE_LOCK.inner.R2,24,24),new (THREE as any).MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.82})); cg.add(inner2);
  // 156P GOLDEN ANGLE 2.399963 RONDES - PAS DE CARRE
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.75+Math.random()*0.7; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.06+Math.random()*0.02; } geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (380.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.2,0.82,1.0),a*0.82);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  let t=0,raf=0; const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; const breath=1.0+Math.sin(t*1.1)*0.018; (cg as any).scale.setScalar(breath); cg.rotation.y+=0.0006; pts.rotation.y+=0.0005; comp.render(); }; anim(); setTimeout(()=>setOn(true),200);
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); m.removeChild(ren.domElement); ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V19.2.3.26 RESTORE VALIDÉ • NOYAU 15% ROND DIAMANT • ${CORE_LOCK.cages.join('/')} • 156P`:'⚡ RESTORE VALIDÉ'}</div></div>);
}
