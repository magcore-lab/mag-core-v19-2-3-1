'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V82 COEUR SEUL ALLUME 0.22 81% + 7 SAT 0.54 -10% SANS REFLET CAMERA SANS DIAMANT DEPLOIEMENT GENERAL
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:100,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.88; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.42,0.48,0.88); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??100),ch6:cl(c[5]??80),ch7:cl(c[6]??160),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(new Uint8Array(128)); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ffff,0.28));
  const coreLight=new THREE.PointLight(0x88ffff,38,5); scene.add(coreLight);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.61636); scene.add(coreGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const electrGroup=new THREE.Group(); coreGroup.add(electrGroup);
  const SAT_COUNT=7; const RADIUS=0.54;
  const innerMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:1.35,transparent:true,opacity:0.92} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14} as any);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.34,32,32),glowMat); coreGroup.add(glow);
  const sats:any[]=[]; const electrLines:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const g=new THREE.Group();
    const c=new THREE.Mesh(new THREE.SphereGeometry(0.028,14,14),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:1.46} as any));
    const h=new THREE.Mesh(new THREE.SphereGeometry(0.050,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18} as any));
    const p=new THREE.Mesh(new THREE.SphereGeometry(0.074,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.10} as any));
    g.add(c); g.add(h); g.add(p);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,38.8,2.8); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core:c,halo:h,pulse:p,light:l,baseAngle:ang,radius:RADIUS,gravPhase:Math.random()*6.28318});
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),g.position.clone()]);
    const mat=new THREE.LineBasicMaterial({color:0x88ccff,transparent:true,opacity:0.12} as any);
    const line=new THREE.Line(geo,mat); electrGroup.add(line); electrLines.push({line,mat,idx:i});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.42; (bloom as any).radius=0.48; innerMat.emissiveIntensity=1.85; inner.scale.setScalar(1.08); glow.scale.setScalar(1.12); coreLight.intensity=38; renderer.toneMappingExposure=0.88; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    const dmx=dmxRef.current; const ch7=dmx.ch7/255;
    const nucleoPower=0.81; const gravStrength=0.0016*nucleoPower*(0.5+ch7*0.9);
    sats.forEach((s:any,i:number)=>{
      s.baseAngle+=0.0020+gravStrength*3.0;
      const ps=1.0+Math.sin(t*2.4+s.gravPhase)*0.18;
      s.core.scale.setScalar(ps); s.halo.scale.setScalar(1.0+Math.sin(t*1.4+s.gravPhase)*0.20); s.pulse.scale.setScalar(1.0+Math.sin(t*0.9+s.gravPhase)*0.30);
      s.pulse.material.opacity=0.10+Math.sin(t*1.3+s.gravPhase)*0.05; s.light.intensity=38.8+Math.sin(t*2.2+s.gravPhase)*10;
      const r=s.radius+Math.sin(t*0.7+s.gravPhase)*0.006; const ang=s.baseAngle; const x=Math.cos(ang)*r; const y=Math.sin(ang)*r;
      s.group.position.set(x,y,0); s.light.position.set(x,y,0);
      electrLines[i].line.geometry.setFromPoints([new THREE.Vector3(0,0,0),s.group.position]);
      electrLines[i].mat.opacity=0.10+Math.sin(t*8.3+i)*0.06+ch7*0.10;
    });
    const rot=0.0006*(0.5+(dmx.ch1/255)*0.8);
    coreGroup.rotation.y+=rot*0.18; inner.rotation.y-=rot*0.44;
    innerMat.emissiveIntensity=1.35+Math.sin(t*1.8)*0.12;
    glow.material.opacity=0.14+Math.sin(t*2.0)*0.04;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?`V82 COEUR SEUL 0.22 81% + 7 SAT FROLENT 0.54 SANS REFLET ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/5 MODS`:'IGNITION V82 COEUR SEUL'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>V82 COEUR SEUL ALLUME 81% + 7 SATELLITES FROLENT 0.54 SANS REFLET CAMERA SANS DIAMANT</button></div></div>);
}
