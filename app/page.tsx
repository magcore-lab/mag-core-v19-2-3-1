'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?14.8:12.5);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.0:1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?0.72:0.88;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),isMobile?0.14:0.18,isMobile?0.85:0.6,isMobile?0.97:0.92);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,isMobile?0.38:0.5));
  const key=new THREE.PointLight(0xffffff,isMobile?32:55,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0xffffff,0,12); coreLight.position.set(0,0,0); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(isMobile?0.62:0.78); scene.add(coreGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:isMobile?0.14:0.11})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,2), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:isMobile?0.10:0.08})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,1), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:isMobile?0.055:0.045})); coreGroup.add(outer3);
  const fresnel={vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6); float c=0.38+uI*0.62; float g=0.12+f*0.42*uI; vec3 col=vec3(0.93+g*0.07,0.93+g*0.07,0.96+g*0.04); col*=c+g*0.75; col*=uE; float p=0.92+sin(uT*1.6)*0.05*uI; gl_FragColor=vec4(col*p,0.80+uI*0.15); }`};
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:isMobile?0.72:0.88}},vertexShader:fresnel.vertexShader,fragmentShader:fresnel.fragmentShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xd8d8d8,emissive:0xffffff,emissiveIntensity:0.18,transparent:true,opacity:0.78});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.28,transparent:true,opacity:0.88});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2), inner2Mat); coreGroup.add(inner2);
  const satG=new THREE.Group(); coreGroup.add(satG); const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.08}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,10,10), mat); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satG.add(m); const l=new THREE.PointLight(0xffffff,6,3); l.position.copy(m.position); satG.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.85; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:isMobile?0.009:0.011,transparent:true,opacity:isMobile?0.30:0.32})); scene.add(particles);
  let dmx={ch1:127,ch2:28,ch3:100,ch4:127,ch5:90,ch6:0,ch7:110,ch8:110,ch9:0,ch10:190}; let ignition=0;
  const ignite=()=>{ if(ignition>=1) return; const start=performance.now(); const dur=2800; const loop=()=>{ const elapsed=(performance.now()-start)/dur; ignition=Math.min(1,elapsed); const e=ignition<0.5?2*ignition*ignition:-1+(4-2*ignition)*ignition; middleMat.uniforms.uI.value=e; bloom.strength=(isMobile?0.14:0.18)+e*(isMobile?0.10:0.14); innerMat.emissiveIntensity=0.18+e*0.42; inner2Mat.emissiveIntensity=0.28+e*0.52; coreLight.intensity=e*(isMobile?85:140); satMats.forEach(m=>m.emissiveIntensity=0.08+e*0.34); satLights.forEach(l=>l.intensity=6+e*13); middle.scale.setScalar(1+e*0.04); inner.scale.setScalar(1+e*0.11); inner2.scale.setScalar(1+e*0.09); if(ignition<1) requestAnimationFrame(loop); else if(navigator.vibrate) navigator.vibrate([50,20,80]); }; loop(); };
  setTimeout(ignite,800); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true,passive:true} as any);
  let t=0, raf=0; const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t; const flow=(dmx.ch3/255)||0.45; const mast=(dmx.ch10/255)||0.75; const p=partGeo.attributes.position.array as Float32Array; for(let i=0;i<156;i++){ const ph=phases[i]+t*0.32*flow; const a=0.008*flow*mast*(0.6+ignition*0.5)*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; } partGeo.attributes.position.needsUpdate=true; const prop=(dmx.ch1/255)||0.5; coreGroup.rotation.y+=0.0009*prop*(1+ignition*0.3); outer.rotation.y+=0.0011*prop; outer2.rotation.y-=0.0009*prop; middle.rotation.y+=0.0016*prop; inner.rotation.y-=0.0026*prop; inner2.rotation.y+=0.0042*prop; satG.rotation.z+=0.0011*(1+ignition*0.2); particles.rotation.y+=0.00032*flow; composer.render(); }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.82) 96%)',zIndex:2}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V26 NO POPUP — Z14.8 CORE 0.62 FX AMENTI — MOBILE CINEMA 100% ON</div></div>);
}
