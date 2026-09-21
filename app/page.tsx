
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V90 FIX BUILD VERCEL + COEUR PUR 0 BRANCHE 0 SATELLITE + NOYAU +30% 1.495 + DIAMANT 0.48 + ZOOM 1.28
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch10:210});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  // @ts-ignore
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.86; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.48,0.42,0.78); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255; const mid=data.slice(10,60).reduce((a,b)=>a+b,0)/50/255; const high=data.slice(60,128).reduce((a,b)=>a+b,0)/68/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.18));
  const coreLight=new THREE.PointLight(0x88ffff,72,7); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,42,5); coreLight2.position.set(0,0,1.6); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.28); scene.add(coreGroup);
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uLow; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float q=sin(uT*2.0+length(vN)*5.0)*0.10; float c=0.52+uI*0.36+q+uLow*0.20; float g=0.22+f*0.42*uI; vec3 col=vec3(0.42,0.88,1.0)*(c+g); col+=vec3(0.18,0.42,0.92)*f*uI*0.62; col*=uE; gl_FragColor=vec4(col,0.92); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.86},uE:{value:1.08},uLow:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.495,transmission:0.96,thickness:0.62,ior:2.417,dispersion:0.35,roughness:0.04,clearcoat:1.0,transparent:true,opacity:0.90} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.32,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.12} as any)); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),new THREE.MeshBasicMaterial({color:0x22aaff,transparent:true,opacity:0.05} as any)); coreGroup.add(glow2);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.48; middleMat.uniforms.uE.value=1.08; innerMat.emissiveIntensity=1.495; inner.scale.setScalar(1.06); glow.scale.setScalar(1.20); coreLight.intensity=72; coreLight2.intensity=42; renderer.toneMappingExposure=0.86; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uLow.value=audioRef.current.low;
    middleMat.uniforms.uI.value=0.86+Math.sin(t*2.0)*0.10+audioRef.current.low*0.16;
    const dmx=dmxRef.current; const prop=(dmx.ch1/255)*0.8*(dmx.ch10/255);
    const rot=0.0008*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.52;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V90 FIX BUILD COEUR PUR 0 BRANCHE 0 SAT 1.495 ZOOM 1.28 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/5 MODS`:'IGNITION V90 FIX BUILD'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',gap:8}}><button style={{flex:1,padding:14,borderRadius:999,border:0,background:'#88ffff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.10em'}}>💎 V90 FIX BUILD COEUR PUR 0 BRANCHE 0 SATELLITE NOYAU +30% 1.495 ZOOM 1.28</button></div></div>);
}
