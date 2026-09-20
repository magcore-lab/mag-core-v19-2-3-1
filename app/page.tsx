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
  camera.position.set(0,0,12.5);

  const renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.92;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.18,0.55,0.92);
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,0.45));
  const key=new THREE.PointLight(0xffffff,70,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0xffffff,0,20); coreLight.position.set(0,0,0); scene.add(coreLight);

  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.78); scene.add(coreGroup);

  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.10})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.07})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.04})); coreGroup.add(outer3);

  const middleMat=new THREE.MeshPhysicalMaterial({color:0xd8d8d8, emissive:0xffffff, emissiveIntensity:0.35, roughness:0.25, metalness:0.05, transmission:0.22, thickness:0.52, ior:2.65, clearcoat:1.0, clearcoatRoughness:0.18, transparent:true, opacity:0.82});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xeeeeee, emissive:0xffffff, emissiveIntensity:0.25});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.4});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), inner2Mat); coreGroup.add(inner2);
  const glowMat=new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.08});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32), glowMat); coreGroup.add(glow);

  const satG=new THREE.Group(); coreGroup.add(satG);
  const satMats:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.15}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,12), mat); m.position.set(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0); satG.add(m); const l=new THREE.PointLight(0xffffff,15,3); l.position.copy(m.position); satG.add(l); }

  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.8; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.012,transparent:true,opacity:0.35})); scene.add(particles);

  let dmx={ch1:127,ch2:35,ch3:127,ch10:200};
  let ignition=0;
  try{ const ws=new WebSocket('ws://localhost:8081'); ws.onmessage=(e:any)=>{ try{ const m=JSON.parse(e.data); if(m.channels){ dmx={ch1:m.channels[0],ch2:m.channels[1],ch3:m.channels[2],ch10:m.channels[9]}; } }catch{} }; }catch{}

  const ignite=()=>{
    const start=performance.now();
    const animateIgn=()=>{
      const elapsed=(performance.now()-start)/2200;
      ignition=Math.min(1, elapsed);
      const e=ignition<0.5? 2*ignition*ignition : -1+(4-2*ignition)*ignition;
      bloom.strength=0.18 + e*0.62; middleMat.emissiveIntensity=0.35 + e*2.15;
      innerMat.emissiveIntensity=0.25 + e*1.75; inner2Mat.emissiveIntensity=0.4 + e*3.1;
      glowMat.opacity=0.08 + e*0.22; coreLight.intensity=e*380;
      renderer.toneMappingExposure=0.92 + e*0.18;
      middle.scale.setScalar(1 + e*0.08); inner.scale.setScalar(1 + e*0.22); inner2.scale.setScalar(1 + e*0.18);
      satMats.forEach(m=>m.emissiveIntensity=0.15 + e*1.35);
      if(ignition<1) requestAnimationFrame(animateIgn);
      else if(navigator.vibrate) navigator.vibrate([80,40,120]);
    }; animateIgn();
  };
  setTimeout(ignite,800);
  window.addEventListener('pointerdown',()=>{ if(ignition===0) ignite(); },{once:true});

  let t=0, raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   const p=partGeo.attributes.position.array as Float32Array; const flow=dmx.ch3/255 || 0.5;
   for(let i=0;i<156;i++){ const ph=phases[i]+t*0.35*flow; const a=0.01*flow*(0.6+ignition*0.8)*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; }
   partGeo.attributes.position.needsUpdate=true;
   const prop=(dmx.ch1/255)||0.5;
   coreGroup.rotation.y+=0.0012*prop*(1+ignition*0.5); outer.rotation.y+=0.0015*prop; middle.rotation.y+=0.0025*prop; inner.rotation.y-=0.004*prop; inner2.rotation.y+=0.008*prop; satG.rotation.z+=0.0015*(1+ignition); particles.rotation.y+=0.0005*flow;
   if(ignition>0.9){ const pulse=0.5+Math.sin(t*2.2)*0.2; middleMat.emissiveIntensity=2.5 + Math.sin(t*1.8)*0.25*pulse; bloom.strength=0.80 + Math.sin(t*1.5)*0.08; }
   composer.render();
  }; anim();

  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.75) 96%)',zIndex:2}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V23 IGNITION 100% ON — Z12.5 CORE 0.78 — ENERGIE MAITRISEE</div>
  </div>
 );
}
