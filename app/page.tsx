'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V37 GLOBAL ENERGISE - BRANCHES 200% ILLUMINEES - FIX GRISEES - 200% CONTROL
// CORE LOCK 0.62/0.78/0.92 R0.48 - TUBE EMISSIVE - BUILD OK
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:200,ch2:140,ch3:200,ch4:200,ch5:200,ch6:0,ch7:200,ch8:200,ch9:0,ch10:200});
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?10.2:8.0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=isMobile?1.12:1.38;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.62,0.32,0.68);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0x88ccff,0.82));
  const coreLight=new THREE.PointLight(0xaaddff,0,36); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(isMobile?0.88:1.08); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const shockGroup=new THREE.Group(); scene.add(shockGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.36})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,4), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.30})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,3), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.24})); cageGroup.add(outer3);
  // BRANCHES ILLUMINEES - TUBE EMISSIVE + LINE ADDITIVE - FIX GRISEES
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.004,0.004,len,6,1,false);
    const mat=new THREE.MeshStandardMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0.0,transparent:true,opacity:0.0});
    const mesh=new THREE.Mesh(cyl,mat);
    mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
    branchGroup.add(mesh);
    const lineMat=new THREE.LineBasicMaterial({color:0xaaddff,transparent:true,opacity:0.0});
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]), lineMat);
    branchGroup.add(line);
    branches.push({mesh,line,p1,p2});
  };
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(0.92)); });
  for(let i=0;i<16;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.62); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.62); mkBranch(a,b); }
  const flowGeo=new THREE.BufferGeometry(); const flowCount=180; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0xaaddff,size:isMobile?0.048:0.056,transparent:true,opacity:0});
  branchGroup.add(new THREE.Points(flowGeo,flowMat));
  // ... ignition 200% 0->780->400 + branches tube emissive 2.4 + bloom 0.82
