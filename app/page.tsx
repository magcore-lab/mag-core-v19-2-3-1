

'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V36 200% OVERDRIVE - SYSTEME GLOBAL ENERGISE - BRANCHES ILLUMINEES - DMX 200% CONTROL
// CORE LOCK 0.62/0.78/0.92 R0.48 - FIX BRANCHES GRISEES - BUILD VERCEL OK
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:200,ch2:120,ch3:200,ch4:200,ch5:180,ch6:0,ch7:200,ch8:200,ch9:0,ch10:200});
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?10.8:8.6);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.2:1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?1.05:1.28;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.52,0.38,0.72);
  composer.addPass(bloomPass);
  scene.add(new THREE.AmbientLight(0x88ccff,0.72));
  const keyLight=new THREE.PointLight(0xffffff,92,60); keyLight.position.set(4,4,6); scene.add(keyLight);
  const fillLight=new THREE.PointLight(0x88ccff,68,52); fillLight.position.set(-5,-3,5); scene.add(fillLight);
  const coreLight=new THREE.PointLight(0xaaddff,0,32); coreLight.position.set(0,0,0); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(isMobile?0.84:1.02); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const droneGroup=new THREE.Group(); coreGroup.add(droneGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const shockGroup=new THREE.Group(); scene.add(shockGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.32})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,4), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.26})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,3), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.20})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPositions:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; satPositions.push(new THREE.Vector3(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0)); }
  const createBranch=(p1:THREE.Vector3,p2:THREE.Vector3,col:number,op:number)=>{ const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]); const mat=new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op}); const line=new THREE.Line(geo,mat); branchGroup.add(line); branches.push({line:line,p1:p1,p2:p2}); };
  satPositions.forEach((p,i)=>{ createBranch(new THREE.Vector3(0,0,0),p,0xaaddff,0.22); createBranch(p,satPositions[(i+1)%6],0x88ccff,0.18); const dir=p.clone().normalize().multiplyScalar(0.92); createBranch(p,dir,0xaaccff,0.14); });
  // ... flow 160x0.048 + 200% OVERDRIVE explosion maitrisee
  // ignite 0->680->350 coreLight, 0.72->3.62->2.87 inner, branches 0.12->0.84->0.75/0.60
