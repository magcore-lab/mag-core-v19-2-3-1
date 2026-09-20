
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
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.9,0.4,0.85);
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,1.5));
  const key=new THREE.PointLight(0xffffff,400,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,200,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,300,20); coreLight.position.set(0,0,0); scene.add(coreLight);

  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.35})); scene.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,2), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.25})); scene.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,1), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.12})); scene.add(outer3);

  const middleMat=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:2.5, roughness:0.2, metalness:0.1});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); scene.add(middle);

  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(inner2);

  const satG=new THREE.Group(); scene.add(satG);
  for(let i=0;i<6;i++){
   const ang=i*60*Math.PI/180;
   const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,16,16), new THREE.MeshBasicMaterial({color:0xffffff}));
   const r=0.62*1.15;
   m.position.set(Math.cos(ang)*r,Math.sin(ang)*r,0);
   satG.add(m);
   const l=new THREE.PointLight(0xffffff,80,3); l.position.copy(m.position); satG.add(l);
  }

  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3);
  const golden=2.399963;
  for(let i=0;i<156;i++){
   const th=i*golden;
   const ph=Math.acos(1-2*i/156);
   const r=0.75+Math.random()*0.7;
   pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
   pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
   pos[i*3+2]=Math.cos(ph)*r;
  }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.022,transparent:true,opacity:0.85})); scene.add(particles);

  let t=0; let ignited=false;
  const ignite=()=>{
   if(ignited) return; ignited=true;
   bloom.strength=1.2;
   middleMat.emissiveIntensity=4.5;
   inner.scale.setScalar(1.3);
   coreLight.intensity=600;
   renderer.toneMappingExposure=1.15;
   if(navigator.vibrate) navigator.vibrate([50]);
  };
  setTimeout(ignite,400);
  window.addEventListener('pointerdown',ignite,{once:true});

  let raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   outer.rotation.y+=0.006; outer2.rotation.y-=0.004; outer3.rotation.y+=0.002;
   middle.rotation.y+=0.008; middle.rotation.x=Math.sin(t*0.2)*0.05;
   inner.rotation.y-=0.015; inner2.rotation.y+=0.025;
   satG.rotation.z+=0.008; particles.rotation.y+=0.002;
   middleMat.emissiveIntensity=2.5+Math.sin(t*2)*0.5+(ignited?1.5:0);
   composer.render();
  }; anim();

  const onResize=()=>{
   camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight);
  };
  window.addEventListener('resize',onResize);
  return()=>{
   cancelAnimationFrame(raf); window.removeEventListener('resize',onResize);
   mount.removeChild(renderer.domElement); renderer.dispose();
  };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>MAG CORE V19.2.3.3 BALANCED — Z10.71 FOV34</div>
  </div>
 );
}
