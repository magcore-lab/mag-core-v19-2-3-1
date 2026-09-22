'use client';
// V19.2.3.31 NOYAU +20% CORRIGE - MEME QUE V19.2.3.14 MAIS +20%
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768; const cam=new THREE.PerspectiveCamera(mob?38:36,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,mob?7.44:6.0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.96; m.appendChild(ren.domElement);
  sc.add(new THREE.AmbientLight(0xffffff,0.88));
  const kL=new THREE.PointLight(0xffffff,105,12); kL.position.set(4,4,5); sc.add(kL);
  const fL=new THREE.PointLight(0xaaccff,48,12); fL.position.set(-4,2,4); sc.add(fL);
  const cg=new THREE.Group(); sc.add(cg);
  // MEME MAT QUE V19.2.3.14 - blanc-gris facetté - mais 0.52->0.624 (+20%)
  const mat=new (THREE as any).MeshPhysicalMaterial({color:0xe8eef4,emissive:0x8a9aaa,emissiveIntensity:0.08,transmission:0.96,thickness:0.58,ior:2.417,dispersion:0.12,roughness:0.06,metalness:0.01,clearcoat:1.0,clearcoatRoughness:0.06,transparent:true,opacity:0.92});
  const diamant=new THREE.Mesh(new THREE.IcosahedronGeometry(0.624,3),mat); cg.add(diamant);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.32,32,32),new (THREE as any).MeshPhysicalMaterial({color:0xd0d8e0,transparent:true,opacity:0.18,roughness:0.18})); cg.add(inner);
  // 156P CYAN COMME 22:40 - beaucoup d'étoiles
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156);
  for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=2.6+Math.random()*4.2; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.038+Math.random()*0.02; }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (360.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.48,0.92,0.96),a*0.78);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  let t=0,raf=0; const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; const breath=1.0+Math.sin(t*1.15)*0.024; (cg as any).scale.setScalar(breath); cg.rotation.y+=0.0005; cg.rotation.x+=0.00015; pts.rotation.y+=0.00025; ren.render(sc,cam); }; anim(); setTimeout(()=>setOn(true),200);
  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); m.removeChild(ren.domElement); ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.31 NOYAU +20% CORRIGE • 0.624 BLANC FACETTE • 156P':'⚡ CORRIGE +20%'}</div></div>);
}
