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
  camera.position.set(0,0,11.88); // DEZOOM -10%

  const renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.35,0.35,0.9);
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,0.6));
  const key=new THREE.PointLight(0xffffff,180,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,80,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,120,20); coreLight.position.set(0,0,0); scene.add(coreLight);

  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.9); scene.add(coreGroup);

  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.18})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.10})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.05})); coreGroup.add(outer3);

  const middleMat=new THREE.MeshPhysicalMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.9, roughness:0.22, metalness:0.0, transmission:0.18, thickness:0.52, ior:2.65, clearcoat:1.0, clearcoatRoughness:0.15, transparent:true, opacity:0.88});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.8})); coreGroup.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:1.2})); coreGroup.add(inner2);

  const satG=new THREE.Group(); coreGroup.add(satG);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,16,16), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.6})); m.position.set(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0); satG.add(m); const l=new THREE.PointLight(0xffffff,25,3); l.position.copy(m.position); satG.add(l); }

  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.7; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.015,transparent:true,opacity:0.55})); scene.add(particles);

  let dmx={ch1:127,ch2:64,ch3:127,ch4:127,ch5:127,ch6:0,ch7:127,ch8:127,ch9:0,ch10:200};
  let ws:any=null;
  try{ ws=new WebSocket('ws://localhost:8081'); ws.onmessage=(e:any)=>{ try{ const m=JSON.parse(e.data); if(m.channels){ dmx={ch1:m.channels[0],ch2:m.channels[1],ch3:m.channels[2],ch4:m.channels[3],ch5:m.channels[4],ch6:m.channels[5],ch7:m.channels[6],ch8:m.channels[7],ch9:m.channels[8],ch10:m.channels[9]}; } }catch{} }; ws.onerror=()=>{ ws=null; }; }catch{ ws=null; }

  let t=0, raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   if(!ws || ws.readyState!==1){ dmx.ch3=127+Math.sin(t*0.3)*30; dmx.ch2=64+Math.sin(t*0.15)*10; dmx.ch1=127+Math.cos(t*0.2)*20; }
   const p=partGeo.attributes.position.array as Float32Array; const flow=dmx.ch3/255; const mast=dmx.ch10/255;
   for(let i=0;i<156;i++){ const ph=phases[i]+t*0.4*flow; const a=0.012*flow*mast*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; }
   partGeo.attributes.position.needsUpdate=true;
   const prop=dmx.ch1/255, bloomV=dmx.ch2/255, satV=dmx.ch7/255, innerV=dmx.ch8/255;
   coreGroup.rotation.y+=0.002*prop; outer.rotation.y+=0.003*prop; outer2.rotation.y-=0.002*prop; outer3.rotation.y+=0.001*prop;
   middle.rotation.y+=0.004*prop; inner.rotation.y-=0.008*prop*innerV; inner2.rotation.y+=0.012*prop*innerV;
   satG.rotation.z+=0.004*satV; particles.rotation.y+=0.0008*flow;
   bloom.strength=0.25 + bloomV*0.35; middleMat.emissiveIntensity=0.7 + bloomV*0.6 + Math.sin(t)*0.15;
   composer.render();
  }; anim();

  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); try{ ws?.close(); }catch{} mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.65) 92%)',zIndex:2}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V21 QUANTUM — DEZOOM -10% Z11.88 CORE 0.9 — DMX READY</div>
  </div>
 );
}
