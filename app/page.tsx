'use client';
// V19.2.3.11 HALO LUMINEUX - 156P MODULES CLIQUABLES - BUILD SAFE - FIX 404
// CORE LOCK: 0.62/0.78/0.92 / 0.48 T0.995 IOR2.65 / 0.22/0.11 / ZOOM 5.0-6.2 VALIDÉ
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 const [sel,setSel]=useState<number|null>(null);
 const [info,setInfo]=useState('156 MODULES - CLIQUE UNE PARTICULE → HALO');
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768; const camZ=isMob?6.2:5.0;
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); (renderer as any).toneMapping=THREE.ACESFilmicToneMapping; (renderer as any).toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.62,0.38,0.68); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.72));
  const coreLight=new THREE.PointLight(0x88ffff,72,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); scene.add(coreGroup);

  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float c=0.30+uI*0.36+f*0.38*uI; vec3 col=vec3(0.44,0.92,0.88)*c; col*=uE; gl_FragColor=vec4(col,0.42); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},vertexShader:fresV,fragmentShader:fresF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.85} as any)); coreGroup.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.92} as any)); coreGroup.add(inner2);

  const diamV='varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  const diamF=`varying vec3 vP; uniform float uT; void main(){ float ang=atan(vP.y,vP.x); float star=pow(abs(cos(ang*4.0)),12.0)+pow(abs(cos(ang*4.0+0.785)),12.0); float center=1.0-smoothstep(0.0,0.22,length(vP)*3.0); vec3 col=mix(vec3(0.12,0.28,0.52),vec3(0.72,0.92,1.0),cos(ang*8.0)*0.5+0.5); col+=vec3(1.0)*center*1.2+star*0.6; gl_FragColor=vec4(col,0.82); }`;
  const diamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:diamV,fragmentShader:diamF,transparent:true});
  const diamHeart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,3),diamMat); coreGroup.add(diamHeart);

  // 156P MODULES FONCTIONNELS CLIQUABLES
  const modules=Array.from({length:156},(_,i)=>({id:i,dmxCh:111+i,audio:50+Math.floor(i/1.22)}));
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const colors=new Float32Array(156*3);
  for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=1.25+Math.random()*0.7; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; colors[i*3]=0.2; colors[i*3+1]=0.85; colors[i*3+2]=1.0; }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const cvs=document.createElement('canvas'); cvs.width=64; cvs.height=64; const ctx=cvs.getContext('2d')!; const g=ctx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'white'); g.addColorStop(0.4,'white'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(cvs);
  const mat=new THREE.PointsMaterial({size:0.08,map:tex,vertexColors:true,transparent:true,opacity:0.85,depthWrite:false} as any);
  const particles=new THREE.Points(geo,mat); scene.add(particles);

  // HALO LUMINEUX
  const haloGroup=new THREE.Group(); scene.add(haloGroup);
  const haloCore=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0} as any)); haloGroup.add(haloCore);
  const haloRing=new THREE.Mesh(new THREE.RingGeometry(0.08,0.14,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); haloGroup.add(haloRing);
  const haloGlow=new THREE.Mesh(new THREE.SphereGeometry(0.18,16,16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0} as any)); haloGroup.add(haloGlow);
  const haloLight=new THREE.PointLight(0x88ffff,0,2.5); haloGroup.add(haloLight);
  let haloT=0; let active=-1;

  const raycaster=new THREE.Raycaster(); (raycaster.params as any).Points={threshold:0.18}; const mouse=new THREE.Vector2();
  const onPointer=(e:PointerEvent)=>{ mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=-(e.clientY/innerHeight)*2+1; raycaster.setFromCamera(mouse,camera); const hits=raycaster.intersectObject(particles); if(hits.length>0){ const idx=hits[0].index!; setSel(idx); active=idx; haloT=0; const p=new THREE
