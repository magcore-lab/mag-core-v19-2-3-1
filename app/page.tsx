'use client';
// V19.2.3.25 DEBLOQUE - ULTRA MINIMAL - BUILD VERCEL OK - NOYAU 15% ROND
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768; const cam=new THREE.PerspectiveCamera(mob?38:36,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,mob?7.44:6.0);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.2)); (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.88; m.appendChild(ren.domElement);
  sc.add(new THREE.AmbientLight(0xffffff,0.68));
  const cg=new THREE.Group(); sc.add(cg);
  const coreMat=new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.15,transmission:0.998,thickness:0.52,ior:2.417,dispersion:0.42,roughness:0.03,clearcoat:1.0,transparent:true,opacity:0.32});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.22,48,48),coreMat); cg.add(core);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(0.07,24,24),new (THREE as any).MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.85})); cg.add(dot);
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=1.45+Math.random()*0.5; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.06+Math.random()*0.02; } geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (380.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.2,0.82,1.0),a*0.82);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  let t=0,raf=0; const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; const breath=1.0+Math.sin(t*1.1)*0.02; (cg as any).scale.setScalar(breath); cg.rotation.y+=0.0007; pts.rotation.y+=0.0005; ren.render(sc,cam); }; anim(); setTimeout(()=>setOn(true),200);
  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); m.removeChild(ren.domElement); ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.25 DEBLOQUE • NOYAU 15% ROND':'⚡ IGNITION DEBLOQUE'}</div></div>);
}
