
'use client';
/**
 * MAG CORE V19.2.3.2 UNIFIED RESTABILIZED — CORE LOCK SCELLÉ
 * Restaure V19.2.3 + fix single-core V121-V128
 * CORE LOCK: cages 0.62/0.78/0.92 / middle 0.48 T0.995 IOR2.65 / inner 0.22/0.11 / sat 6x 1.15R / cam 12.75 dezoom 25% / 156P golden 2.399963
 * FIX: branches supprimées, centré 0,0,0, rond blanc focal 0,0,0, allumage fixe + respiration, -50% vs 100% cramé = 70% balanced
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const CORE_LOCK = {
  cages: [0.62, 0.78, 0.92] as const,
  middle: { R: 0.48, transmission: 0.995, ior: 2.65, thickness: 0.52 },
  inner: { R1: 0.22, R2: 0.11 },
  sat: { radiusFactor: 1.15, count: 6 },
  camera: { fov: 34, z: 12.75 }, // DEZOOM 25% : 10.2*1.25
} as const;

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(CORE_LOCK.camera.fov, innerWidth/innerHeight, 0.1, 100); camera.position.set(0,0,CORE_LOCK.camera.z); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.88; renderer.outputColorSpace=THREE.SRGBColorSpace; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.68,0.42,0.78); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.72));
  const key=new THREE.PointLight(0xffffff,95,22); key.position.set(0,0,0); scene.add(key);
  const key2=new THREE.PointLight(0xaaccff,62,16); key2.position.set(0,0,2.2); scene.add(key2);
  const coreLight=new THREE.PointLight(0x88ffff,82,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.position.set(0,0,0); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); cageGroup.position.set(0,0,0); coreGroup.add(cageGroup);
  const satGroup=new THREE.Group(); satGroup.position.set(0,0,0); coreGroup.add(satGroup);
  // CAGES 0.62/0.78/0.92 - pas de branches
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[0],3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.52})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[1],2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.34})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[2],1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.18})); cageGroup.add(outer3);
  // MIDDLE 0.48 - 70% balanced pas cramé 100% ni plat 50%
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8); float c=0.36+uI*0.32; float g=0.16+f*0.32*uI; vec3 col=vec3(0.44,0.92,0.88)*(c+g); col*=uE; gl_FragColor=vec4(col,0.82); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.72}},vertexShader:fresV,fragmentShader:fresF,transparent:true});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.middle.R,5),middleMat); middle.position.set(0,0,0); coreGroup.add(middle);
  // INNER 0.22/0.11 + ROND BLANC FOCAL 0.10 centre 0,0,0
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:4.5,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.72});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R1,4),innerMat); inner.position.set(0,0,0); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:6.0,transmission:0.99,thickness:0.42,ior:2.65,roughness:0.01,clearcoat:1.0,transparent:true,opacity:0.78});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R2,3),inner2Mat); inner2.position.set(0,0,0); coreGroup.add(inner2);
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.10,32,32),roundMat); round.position.set(0,0,0.03); coreGroup.add(round);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.10})); glow.position.set(0,0,0); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.42,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.08})); glow2.position.set(0,0,0); coreGroup.add(glow2);
  // SAT HEX 6x 1.15R
  for(let i=0;i<CORE_LOCK.sat.count;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.038,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.88})); m.position.set(Math.cos(ang)*CORE_LOCK.cages[0]*CORE_LOCK.sat.radiusFactor,Math.sin(ang)*CORE_LOCK.cages[0]*CORE_LOCK.sat.radiusFactor,0); satGroup.add(m); const l=new THREE.PointLight(0xffffff,48,2.8); l.position.copy(m.position); satGroup.add(l); }
  // PARTICLES 156P golden 2.399963
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.75+Math.random()*0.6; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); const partMat=new THREE.PointsMaterial({color:0x88ffff,size:0.018,transparent:true,opacity:0.48}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);
  let ignited=false;
  const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.68; bloom.radius=0.42; innerMat.emissiveIntensity=4.5; inner2Mat.emissiveIntensity=6.0; middleMat.uniforms.uE.value=0.88; renderer.toneMappingExposure=0.88; coreLight.intensity=82; };
  setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.52+Math.sin(t*2.2)*0.08+(ignited?0.12:0); const rot=0.0012; coreGroup.rotation.y+=rot; cageGroup.rotation.y+=rot*0.18; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.42; inner2.rotation.y+=rot*0.62; satGroup.rotation.z+=rot*0.22; particles.rotation.y+=0.002; round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12); if(ignited){ const breath=Math.sin(t*2.2)*0.06; middle.scale.setScalar(1.0+breath*0.04); coreLight.intensity=82+breath*8; } composer.render(); }; animate();
  const onR=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.2 RESTABILIZED - CORE LOCK 0.62/0.78/0.92 - 0.48R - ROND BLANC 0,0,0 - 70% - DEZOOM 25%':'⚡ IGNITION V19.2.3.2'}</div></div>);
}
