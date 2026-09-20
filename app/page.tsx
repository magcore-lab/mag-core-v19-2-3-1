
'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V39 DIAMANT DIFFUSION MAITRISEE - NOYAU -> BRANCHES REFLEXIONS DIAMANTS
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
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.82;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.28,0.48,0.86); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0x88ccff,0.72));
  const coreLight=new THREE.PointLight(0xaaddff,0,28); const coreLight2=new THREE.PointLight(0xffffff,0,16);
  scene.add(coreLight); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.84); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const diamondGroup=new THREE.Group(); coreGroup.add(diamondGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.24})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,4), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.18})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,3), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.14})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const mk=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0025,0.0025,len,6);
    const mat=new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.72,thickness:0.22,ior:2.15,roughness:0.1,transparent:true,opacity:0});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize()); branchGroup.add(mesh);
    const tetra=new THREE.Mesh(new THREE.TetrahedronGeometry(0.014,0), new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:0.92,thickness:0.42,ior:2.15,roughness:0.06,transparent:true,opacity:0})); tetra.position.copy(p2); branchGroup.add(tetra);
    const lineMat=new THREE.LineBasicMaterial({color:0xaaddff,transparent:true,opacity:0}); const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]), lineMat); branchGroup.add(line);
    branches.push({mesh,mat,line,tetra,p1,p2});
  };
  satPos.forEach((p,i)=>{ mk(new THREE.Vector3(0,0,0),p); mk(p,satPos[(i+1)%6]); mk(p,p.clone().normalize().multiplyScalar(0.92)); });
  for(let i=0;i<12;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.62); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.62); mk(a,b); }
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const pos=new THREE.Vector3(Math.cos(ang)*0.92,Math.sin(ang)*0.92,0); const d=new THREE.Mesh(new THREE.OctahedronGeometry(0.024,0), new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.88,thickness:0.32,ior:2.15,transparent:true,opacity:0})); d.position.copy(pos); diamondGroup.add(d); branches.push({mesh:d,mat:d.material,line:{material:{opacity:0}},p1:pos,p2:pos,tetra:d}); }
  // ... ignition diamant 0→220→135 + branches transmission 0.72 + energy maitrisee
