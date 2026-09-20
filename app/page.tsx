'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:48,ch3:135,ch10:180});
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?11.2:9.0);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=isMobile?0.82:0.98;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.32,0.48,0.84); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0x88ccff,0.68));
  const coreLight=new THREE.PointLight(0xaaddff,0,28); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.82); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup); const branchGroup=new THREE.Group(); coreGroup.add(branchGroup); const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.26})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,4), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.20})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,3), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.16})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const mk=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0035,0.0035,len,6); const mat=new THREE.MeshStandardMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transparent:true,opacity:0});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize()); branchGroup.add(mesh);
    const lineMat=new THREE.LineBasicMaterial({color:0xaaddff,transparent:true,opacity:0}); const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]), lineMat); branchGroup.add(line);
    branches.push({mesh,line,p1,p2});
  };
  satPos.forEach((p,i)=>{ mk(new THREE.Vector3(0,0,0),p); mk(p,satPos[(i+1)%6]); mk(p,p.clone().normalize().multiplyScalar(0.92)); });
  for(let i=0;i<12;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.62); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.62); mk(a,b); }
  // ... ignition 100% 0→380→180 + branches tube emissive 1.6 + flow 128 + 196P golden 2.399963 + drone adapté
