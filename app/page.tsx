
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
  camera.position.set(0,0,10.71);

  const renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.0;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.85,0.45,0.88);
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,0.8));
  const key=new THREE.PointLight(0xffffff,250,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,100,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,200,20); coreLight.position.set(0,0,0); scene.add(coreLight);

  // 3 CAGES - opacité divisée par 2.5 vs ton image blanche
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.22})); scene.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.14})); scene.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.06})); scene.add(outer3);

  // NOYAU ON REALISTE - Physical + IOR 2.65 (diamant quantique)
  const middleMat=new THREE.MeshPhysicalMaterial({
    color:0xffffff, emissive:0xffffff, emissiveIntensity:1.6,
    roughness:0.18, metalness:0.0, transmission:0.28, thickness:0.5, ior:2.65,
    clearcoat:1.0, clearcoatRoughness:0.12, transparent:true, opacity:0.92
  });
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); scene.add(middle);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:1.8})); scene.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:2.5})); scene.add(inner2);

  // SATS HEXA
  const satG=new THREE.Group(); scene.add(satG);
  for(let i=0;i<6;i++){
   const ang=i*60*Math.PI/180;
   const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,16,16), new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:1.2}));
   m.position.set(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0);
   satG.add(m);
   const l=new THREE.PointLight(0xffffff,45,3); l.position.copy(m.position); satG.add(l);
  }

  // QUANTUM MATRIX 156 - avec phase individuelle
  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3);
  const orig=new Float32Array(156*3);
  const phases=new Float32Array(156);
  const golden=2.399963;
  for(let i=0;i<156;i++){
   const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.7;
   pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r;
   orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2];
   phases[i]=Math.random()*6.28;
  }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.018,transparent:true,opacity:0.65})); scene.add(particles);

  let t=0, ign=false;
  const ignite=()=>{ if(ign) return; ign=true; bloom.strength=1.05; middleMat.emissiveIntensity=2.8; inner.scale.setScalar(1.15); coreLight.intensity=400; renderer.toneMappingExposure=1.08; if(navigator.vibrate) navigator.vibrate(30); };
  setTimeout(ignite,500); window.addEventListener('pointerdown',ignite,{once:true});

  let raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   const p=partGeo.attributes.position.array as Float32Array;
   for(let i=0;i<156;i++){ const ph=phases[i]+t*0.6; const a=0.018*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; }
   partGeo.attributes.position.needsUpdate=true;
   outer.rotation.y+=0.003; outer2.rotation.y-=0.002; outer3.rotation.y+=0.001;
   middle.rotation.y+=0.005; middle.rotation.x=Math.sin(t*0.12)*0.03;
   inner.rotation.y-=0.01; inner2.rotation.y+=0.015; satG.rotation.z+=0.005; particles.rotation.y+=0.0012;
   middleMat.emissiveIntensity=1.6+Math.sin(t*1.2)*0.25+(ign?0.6:0);
   composer.render();
  }; anim();

  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,0.5) 100%)',zIndex:2}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'rgba(61,213,152,0.95)',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:10,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>MAG CORE V20 QUANTUM AMENTI — Z10.71 FOV34 IOR2.65 — CINEMA VR</div>
  </div>
 );
}
