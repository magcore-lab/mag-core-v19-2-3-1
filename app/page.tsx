
'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,12.5); // DEZOOM -15%

  const renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.85; // moins cramé
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.18,0.5,0.95); // COHERENT
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,0.35));
  const key=new THREE.PointLight(0xffffff,60,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0xffffff,35,15); coreLight.position.set(0,0,0); scene.add(coreLight);

  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.78); scene.add(coreGroup);

  // CAGES FINES - visibles même surex
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.08})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.06})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.03})); coreGroup.add(outer3);

  // NOYAU ON REALISTE - PAS BLANC PUR
  const middleMat=new THREE.MeshStandardMaterial({color:0xcccccc, emissive:0xffffff, emissiveIntensity:0.35, roughness:0.35, metalness:0.1, transparent:true, opacity:0.75});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4), middleMat); coreGroup.add(middle);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), new THREE.MeshStandardMaterial({color:0xdddddd, emissive:0xffffff, emissiveIntensity:0.25})); coreGroup.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.4})); coreGroup.add(inner2);

  const satG=new THREE.Group(); coreGroup.add(satG);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,12), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.25})); m.position.set(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0); satG.add(m); }

  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.8; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.012,transparent:true,opacity:0.4})); scene.add(particles);

  // DMX READY - modules principaux
  let dmx={ch1:127,ch2:35,ch3:127,ch10:200};
  try{ const ws=new WebSocket('ws://localhost:8081'); ws.onmessage=(e:any)=>{ try{ const m=JSON.parse(e.data); if(m.channels){ dmx={ch1:m.channels[0],ch2:m.channels[1],ch3:m.channels[2],ch10:m.channels[9]}; } }catch{} }; }catch{}

  let t=0, raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   const p=partGeo.attributes.position.array as Float32Array; const flow=dmx.ch3/255;
   for(let i=0;i<156;i++){ const ph=phases[i]+t*0.3*flow; const a=0.01*flow*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; }
   partGeo.attributes.position.needsUpdate=true;
   const prop=dmx.ch1/255, bloomV=dmx.ch2/255;
   coreGroup.rotation.y+=0.0015*prop; outer.rotation.y+=0.002*prop; middle.rotation.y+=0.003*prop; inner.rotation.y-=0.006*prop; satG.rotation.z+=0.002; particles.rotation.y+=0.0006*flow;
   bloom.strength=0.12 + bloomV*0.18;
   middleMat.emissiveIntensity=0.25 + bloomV*0.25;
   composer.render();
  }; anim();

  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 95%)',zIndex:2}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 16px',borderRadius:999,fontSize:9,fontWeight:900,zIndex:10}}>MAG CORE V22 COHERENT — Z12.5 CORE 0.78 BLOOM 0.18 — DMX READY</div>
  </div>
 );
}
