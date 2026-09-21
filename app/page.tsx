'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V19.2.3.6 ZOOM BALANCED 42% - VALIDE TOUT ÉCRAN MOBILE + DESKTOP
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768;
  const camZ=isMob?6.2:5.0; // BALANCED : 12.75→15% trop loin, 3.4→120% trop proche, 5.0→42% parfait
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.52,0.38,0.68); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.72));
  const coreLight=new THREE.PointLight(0x88ffff,72,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.position.set(0,0,0); scene.add(coreGroup);
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float c=0.30+uI*0.36+f*0.38*uI; vec3 col=vec3(0.44,0.92,0.88)*c; col*=uE; gl_FragColor=vec4(col,0.76); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},vertexShader:fresV,fragmentShader:fresF,transparent:true});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); middle.position.set(0,0,0); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:3.8,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.68});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); inner.position.set(0,0,0); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:5.2,transmission:0.99,thickness:0.42,ior:2.65,roughness:0.01,clearcoat:1.0,transparent:true,opacity:0.74});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); inner2.position.set(0,0,0); coreGroup.add(inner2);
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.88});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.09,32,32),roundMat); round.position.set(0,0,0.03); coreGroup.add(round);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.26,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.10})); glow.position.set(0,0,0); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.38,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.08})); glow2.position.set(0,0,0); coreGroup.add(glow2);
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.78+Math.random()*0.72; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); const partMat=new THREE.PointsMaterial({color:0x88ffff,size:0.016,transparent:true,opacity:0.42}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.52; middleMat.uniforms.uE.value=0.82; renderer.toneMappingExposure=0.82; coreLight.intensity=72; }; setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.52+Math.sin(t*2.2)*0.06+(ignited?0.10:0); const rot=0.0012; coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.38; inner.rotation.y-=rot*0.38; inner2.rotation.y+=rot*0.58; particles.rotation.y+=0.0018; round.scale.setScalar(1.0+Math.sin(t*3.0)*0.10); if(ignited){ const b=Math.sin(t*2.2)*0.05; middle.scale.setScalar(1.0+b*0.03); } composer.render(); }; animate();
  const onR=()=>{ const mob=innerWidth<768; camera.aspect=innerWidth/innerHeight; camera.fov=mob?34:32; camera.position.z=mob?6.2:5.0; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.6 ZOOM BALANCED 42% - VALIDE TOUT ÉCRAN - CORE 0.48 + ROND 0,0,0':'⚡ IGNITION V19.2.3.6'}</div></div>);
}
