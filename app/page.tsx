'use client';
// V19.2.3.34 NOYAU VERITABLE IDENTIQUE +20% - 4 DRONES ANALYSE - OPTIMISE
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const m=ref.current!; 
  const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768; 
  const cam=new THREE.PerspectiveCamera(mob?38:36,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,mob?7.44:6.0);
  const ren=new THREE.WebGLRenderer({antialias:false,powerPreference:'default',alpha:false});
  ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.96; 
  (ren as any).outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);

  // Lumières pour reflets blanc/noir comme photo 22:40
  sc.add(new THREE.AmbientLight(0xffffff,0.88));
  const key=new THREE.DirectionalLight(0xffffff,1.35); key.position.set(4,6,5); sc.add(key);
  const fill=new THREE.DirectionalLight(0xaaccff,0.62); fill.position.set(-4,-2,4); sc.add(fill);
  const point=new THREE.PointLight(0xffffff,45,8); point.position.set(0,0,2.2); sc.add(point);

  const cg=new THREE.Group(); sc.add(cg);

  // DRONE GEOMETRIE + TRANSPARENCE : vrai diamant facetté blanc-gris +20%
  const geoD=new THREE.IcosahedronGeometry(0.624,1); // detail 1 = 80 faces = facettes larges comme ref, pas 5
  const matD=new (THREE as any).MeshPhysicalMaterial({
    color:0xeef2f3,           // gris-blanc comme photo, pas cyan
    transparent:true,
    opacity:0.84,             // noir visible au centre
    transmission:0.96,        // bleu cyan traverse
    thickness:0.54,           // volume diamant
    ior:2.52,                 // diamant + moissanite = brillance ref
    roughness:0.07,           // reflets blancs purs nets
    metalness:0.0,
    clearcoat:1.0,            // couche blanche opaque sur facettes éclairées
    clearcoatRoughness:0.06,
    envMapIntensity:1.25,
    flatShading:true,         // facettes visibles
    side:THREE.DoubleSide
  });
  const diamant=new THREE.Mesh(geoD,matD); cg.add(diamant);

  // Coeur transparent bleu au centre (étoile cyan dans photo)
  const coreGeo=new THREE.SphereGeometry(0.12,12,12);
  const coreMat=new (THREE as any).MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18});
  const core=new THREE.Mesh(coreGeo,coreMat); cg.add(core);

  // DRONE RESPIRATION + OPTIMISATION : 156P cyan golden angle comme 22:40
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){ 
    const th=i*2.39996323; const ph=Math.acos(1-2*i/156); 
    const r=2.8+Math.random()*5.0; // plein écran comme ref, pas sphère serrée
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r; 
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; 
    pos[i*3+2]=Math.cos(ph)*r; 
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pMat=new (THREE as any).PointsMaterial({
    color:0x88eef0, size:0.048, transparent:true, opacity:0.84, sizeAttenuation:true
  });
  const pts=new THREE.Points(geo,pMat); sc.add(pts);

  // Respiration + rotation comme noyau vivant
  let t=0,raf=0; 
  const anim=()=>{
    raf=requestAnimationFrame(anim); t+=0.016;
    const breath=1.0+Math.sin(t*1.15)*0.024; // respire
    (cg as any).scale.setScalar(breath);
    cg.rotation.y+=0.00045; cg.rotation.x+=0.00012; 
    pts.rotation.y+=0.00020; pts.rotation.x+=0.00005;
    ren.render(sc,cam);
  }; 
  anim(); setTimeout(()=>setOn(true),180);

  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); }; 
  addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); m.removeChild(ren.domElement); ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.34 VERITABLE IDENTIQUE +20% • 0.624 FACETTE • TRANS 0.96 • 156P':'⚡ NOYAU VERITABLE +20%'}</div></div>);
}
