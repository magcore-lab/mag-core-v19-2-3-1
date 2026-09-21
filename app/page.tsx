'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V85 0 HALO SAT + STROBO BLANC PERTINENT 120ms + COHERENCE VISUELLE + 0 TIGE 0 REFLET
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:110,ch2:62,ch3:142,ch4:128,ch5:140,ch6:80,ch7:120,ch8:90,ch9:70,ch10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
 const [strobeOn,setStrobeOn]=useState(true);
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.64; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.18,0.28,0.92); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??140),ch6:cl(c[5]??80),ch7:cl(c[6]??120),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(new Uint8Array(128)); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.14));
  const coreLight=new THREE.PointLight(0xffffff,0,5); scene.add(coreLight);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.61636); scene.add(coreGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const SAT_COUNT=7; const RADIUS=0.54;
  const heartV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const heartF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uE; uniform float uStrobe; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0); float c=0.46+f*0.28; vec3 blue=vec3(0.22,0.72,0.92); vec3 white=vec3(1.0,1.0,1.0); vec3 base=mix(blue, white, uStrobe); base*=uE*(1.0+uStrobe*1.2); base*=c; gl_FragColor=vec4(base,0.84); }';
  const heartMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uE:{value:0.52},uStrobe:{value:0}},vertexShader:heartV,fragmentShader:heartF,transparent:true} as any);
  const heart=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),heartMat); coreGroup.add(heart);
  const sats:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.024,12,12),new THREE.MeshBasicMaterial({color:0x88ffff} as any));
    const g=new THREE.Group(); g.add(core);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,18.0,2.2); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,light:l,baseAngle:ang,radius:RADIUS});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.18; heartMat.uniforms.uE.value=0.52; heart.scale.setScalar(1.0); renderer.toneMappingExposure=0.64; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  window.addEventListener('keydown',(e:any)=>{ if(e.code==='Space') setStrobeOn(s=>!s); });
  let t=0; let raf=0; let lastFlash=0; let isFlashing=false;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    heartMat.uniforms.uT.value=t;
    const dmx=dmxRef.current; const ch5=dmx.ch5/255;
    const interval=0.8 - ch5*0.55;
    if(strobeOn){
      if(!isFlashing && t-lastFlash>interval){ isFlashing=true; lastFlash=t; heartMat.uniforms.uStrobe.value=1.0; coreLight.intensity=85; bloom.strength=0.48; renderer.toneMappingExposure=0.82; }
      if(isFlashing && t-lastFlash>0.12){ isFlashing=false; heartMat.uniforms.uStrobe.value=0.0; coreLight.intensity=0; bloom.strength=0.18; renderer.toneMappingExposure=0.64; }
    } else {
      heartMat.uniforms.uStrobe.value=0.0; coreLight.intensity=0;
    }
    sats.forEach((s:any)=>{
      s.baseAngle+=0.0012;
      const r=s.radius; const ang=s.baseAngle;
      s.group.position.set(Math.cos(ang)*r,Math.sin(ang)*r,0); s.light.position.copy(s.group.position);
    });
    heartMat.uniforms.uE.value=0.52+Math.sin(t*1.1)*0.04;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (strobeOn?'#ffffff':'#88ffff') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V85 0 HALO SAT 0 TIGE STROBO 120ms COHERENT ${strobeOn?'ON':'OFF'} ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/5 MODS`:'IGNITION V85 0 HALO'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',gap:8}}><button onClick={()=>setStrobeOn(s=>!s)} style={{flex:1,padding:14,borderRadius:999,border:0,background:strobeOn?'#ffffff':'#88ffff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.12em'}}>{strobeOn?'⚡ STROBO BLANC 120ms ON [SPACE]':'💤 STROBO OFF'} - 7 SAT SANS HALO 0 TIGE FROLENT 0.54</button></div></div>);
}
