'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const mountRef=useRef<HTMLDivElement>(null);
 const [ok,setOk]=useState(false);
 useEffect(()=>{
  let raf=0; let renderer:THREE.WebGLRenderer|null=null; let composer:any=null;
  try{
   const mount=mountRef.current!; if(!mount) return;
   const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(34, innerWidth/innerHeight, 0.1, 100); camera.position.z=10.71;
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); renderer.setSize(innerWidth,innerHeight); mount.appendChild(renderer.domElement);
   const outer=new THREE.Mesh(new THREE.SphereGeometry(0.92,32,32), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true})); scene.add(outer);
   const outer2=new THREE.Mesh(new THREE.SphereGeometry(0.78,24,24), new THREE.MeshBasicMaterial({color:0xaaaaaa,wireframe:true})); scene.add(outer2);
   const middle=new THREE.Mesh(new THREE.SphereGeometry(0.48,32,32), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(middle);
   const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(inner);
   const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32), new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.25})); scene.add(glow);
   const satGroup=new THREE.Group(); scene.add(satGroup);
   for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,16,16), new THREE.MeshBasicMaterial({color:0xffffff})); m.position.set(Math.cos(ang)*0.92*1.15,Math.sin(ang)*0.92*1.15,0); satGroup.add(m); }
   const partGeo=new THREE.BufferGeometry(); const cnt=156; const pos=new Float32Array(cnt*3); const golden=2.399963;
   for(let i=0;i<cnt;i++){ const th=i*golden; const ph=Math.acos(1-2*i/cnt); const r=0.75+Math.random()*0.7; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; }
   partGeo.setAttribute('position', new THREE.BufferAttribute(pos,3)); const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.025})); scene.add(particles);
   composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),2.5,0.4,0.1));
   let t=0; const clock=new THREE.Clock(); const animate=()=>{ raf=requestAnimationFrame(animate); t+=clock.getDelta(); outer.rotation.y+=0.008; middle.rotation.y+=0.012; inner.rotation.y-=0.02; satGroup.rotation.z+=0.015; particles.rotation.y+=0.003; glow.scale.setScalar(1.2+Math.sin(t*2)*0.3); composer.render(); }; animate();
   const onResize=()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer!.setSize(innerWidth,innerHeight); composer!.setSize(innerWidth,innerHeight); }; addEventListener('resize',onResize);
   setOk(true); return ()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onResize); try{mount.removeChild(renderer!.domElement);}catch{} };
  }catch(e){ console.error(e); }
 },[]);
 return (<div style={{width:'100%',height:'100dvh',background:'#000'}}><div ref={mountRef} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:ok?'#3dd598':'#ff4444',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900}}>{ok?'MAG CORE V19.2.3.1 FIXED — IGNITION ON Z10.71':'LOADING...'}</div></div>);
}
