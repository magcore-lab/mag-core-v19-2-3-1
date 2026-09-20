
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
  renderer.toneMappingExposure=0.88;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.18,0.6,0.92);
  composer.addPass(bloom);

  scene.add(new THREE.AmbientLight(0xffffff,0.5));
  const key=new THREE.PointLight(0xffffff,55,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,30,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,0,15); coreLight.position.set(0,0,0); scene.add(coreLight);

  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.78); scene.add(coreGroup);

  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.11})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.08})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.045})); coreGroup.add(outer3);

  const middleMat=new THREE.MeshStandardMaterial({color:0xd0d0d0, emissive:0xffffff, emissiveIntensity:0.35, roughness:0.3, metalness:0.05, transparent:true, opacity:0.85});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);

  const innerMat=new THREE.MeshStandardMaterial({color:0xe0e0e0, emissive:0xffffff, emissiveIntensity:0.25});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.35});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), inner2Mat); coreGroup.add(inner2);

  const satG=new THREE.Group(); coreGroup.add(satG);
  const satLights:any[]=[]; const satMats:any[]=[];
  for(let i=0;i<6;i++){
   const ang=i*60*Math.PI/180;
   const mat=new THREE.MeshStandardMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.12});
   satMats.push(mat);
   const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,12), mat);
   m.position.set(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0);
   satG.add(m);
   const l=new THREE.PointLight(0xffffff,8,3); l.position.copy(m.position); satG.add(l); satLights.push(l);
  }

  const partGeo=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156);
  const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.75+Math.random()*0.8; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xffffff,size:0.011,transparent:true,opacity:0.32})); scene.add(particles);

  let dmx={ch1:127,ch2:32,ch3:110,ch4:127,ch5:110,ch6:0,ch7:120,ch8:120,ch9:0,ch10:200};
  let ignition=0;
  let ws:any=null; let audioAnalyser:any=null; let audioData:any=null;

  const initModules=()=>{
    try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>console.log('MAG CORE DMX CONNECTED'); ws.onmessage=(e:any)=>{ try{ const m=JSON.parse(e.data); if(m.channels){ dmx={ch1:m.channels[0],ch2:m.channels[1],ch3:m.channels[2],ch4:m.channels[3],ch5:m.channels[4],ch6:m.channels[5],ch7:m.channels[6],ch8:m.channels[7],ch9:m.channels[8],ch10:m.channels[9]}; } }catch{} }; }catch{}
    try{ const ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); audioAnalyser=ctx.createAnalyser(); audioAnalyser.fftSize=256; audioData=new Uint8Array(128); navigator.mediaDevices?.getUserMedia({audio:true}).then((s:any)=>{ ctx.createMediaStreamSource(s).connect(audioAnalyser); }).catch(()=>{}); }catch{}
  };

  const ignite=()=>{
    if(ignition>=1) return;
    initModules();
    const start=performance.now();
    const dur=2600;
    const loop=()=>{
      const elapsed=(performance.now()-start)/dur;
      ignition=Math.min(1,elapsed);
      const e=ignition<0.5? 2*ignition*ignition : -1+(4-2*ignition)*ignition;
      bloom.strength=0.18 + e*0.14;
      middleMat.emissiveIntensity=0.35 + e*0.85;
      innerMat.emissiveIntensity=0.25 + e*0.65;
      inner2Mat.emissiveIntensity=0.35 + e*0.85;
      coreLight.intensity=e*180;
      satMats.forEach(m=>m.emissiveIntensity=0.12 + e*0.58);
      satLights.forEach(l=>l.intensity=8 + e*22);
      middle.scale.setScalar(1 + e*0.06);
      inner.scale.setScalar(1 + e*0.14);
      inner2.scale.setScalar(1 + e*0.10);
      renderer.toneMappingExposure=0.88 + e*0.10;
      particles.material.opacity=0.32 + e*0.18;
      if(ignition<1) requestAnimationFrame(loop);
      else { if(navigator.vibrate) navigator.vibrate([60,30,100]); console.log('MAG CORE 100% ON - ALL MODULES DEPLOYED'); }
    };
    loop();
  };

  setTimeout(ignite,900);
  window.addEventListener('pointerdown',ignite,{once:true});

  let t=0, raf=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim); t+=0.016;
   if(audioAnalyser && audioData){ audioAnalyser.getByteFrequencyData(audioData); const low=audioData[2]/255; dmx.ch5= Math.floor(low*255); }
   const flow=(dmx.ch3/255)||0.5; const mast=(dmx.ch10/255)||0.8;
   const p=partGeo.attributes.position.array as Float32Array;
   for(let i=0;i<156;i++){ const ph=phases[i]+t*0.35*flow; const a=0.009*flow*mast*(0.7+ignition*0.6)*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; }
   partGeo.attributes.position.needsUpdate=true;
   const prop=(dmx.ch1/255)||0.5;
   coreGroup.rotation.y+=0.001*prop*(1+ignition*0.4);
   outer.rotation.y+=0.0012*prop; outer2.rotation.y-=0.001*prop; outer3.rotation.y+=0.0006*prop;
   middle.rotation.y+=0.002*prop; middle.rotation.x=Math.sin(t*0.12)*0.02;
   inner.rotation.y-=0.003*prop; inner2.rotation.y+=0.005*prop;
   satG.rotation.z+=0.0012*(1+ignition*0.3); particles.rotation.y+=0.0004*flow;
   if(ignition>0.95){
     const pulse=Math.sin(t*1.6)*0.08;
     middleMat.emissiveIntensity=1.2 + pulse;
     bloom.strength=0.32 + pulse*0.04;
   }
   composer.render();
  }; anim();

  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); try{ ws?.close(); }catch{} mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.78) 96%)',zIndex:2}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V24 IGNITION 100% ON MAITRISE — Z12.5 CORE 0.78 BLOOM 0.32</div>
  </div>
 );
}
