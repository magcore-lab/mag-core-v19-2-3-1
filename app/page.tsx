'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V83 ENERGIE MAITRISEE - COEUR BLEU 0.68 + 7 SAT 0.54 32.0 + BLOOM 0.22 EXPO 0.68 SANS REFLET FROLEMENT
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:110,ch2:62,ch3:142,ch10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.68; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.22,0.32,0.88); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const data=new Uint8Array(128); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(data); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.24));
  const key=new THREE.PointLight(0x88ccff,32,12); key.position.set(3,3,4); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ffff,18,4.5); scene.add(coreLight);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.61636); scene.add(coreGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const linkGroup=new THREE.Group(); coreGroup.add(linkGroup);
  const SAT_COUNT=7; const RADIUS=0.54;
  const heartV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const heartF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.4); float c=0.38+f*0.28; vec3 base=vec3(0.22,0.72,0.92); base*=uE; base*=c; float pulse=0.08*sin(uT*1.4)+0.92; base*=pulse; gl_FragColor=vec4(base,0.78); }';
  const heartMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uE:{value:0.68}},vertexShader:heartV,fragmentShader:heartF,transparent:true} as any);
  const heart=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),heartMat); coreGroup.add(heart);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0x22bbff,transparent:true,opacity:0.06} as any)); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.44,32,32),new THREE.MeshBasicMaterial({color:0x1199dd,transparent:true,opacity:0.03} as any)); coreGroup.add(glow2);
  const sats:any[]=[]; const links:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.024,14,14),new THREE.MeshStandardMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.92} as any));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.042,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14} as any));
    const pulse=new THREE.Mesh(new THREE.SphereGeometry(0.062,14,14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.07} as any));
    g.add(core); g.add(halo); g.add(pulse);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,32.0,2.6); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core,halo,pulse,light:l,baseAngle:ang,radius:RADIUS,gravPhase:Math.random()*6.28318});
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),g.position.clone()]);
    const mat=new THREE.LineBasicMaterial({color:0x44aaff,transparent:true,opacity:0.08} as any);
    const line=new THREE.Line(geo,mat); linkGroup.add(line); links.push({line,mat});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.22; heartMat.uniforms.uE.value=0.68; heart.scale.setScalar(1.02); glow.scale.setScalar(1.06); coreLight.intensity=18; renderer.toneMappingExposure=0.68; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    heartMat.uniforms.uT.value=t;
    const dmx=dmxRef.current; const ch7=dmx.ch10? dmx.ch10/255 : 0.8;
    sats.forEach((s:any,i:number)=>{
      s.baseAngle+=0.0014;
      s.core.scale.setScalar(1.0+Math.sin(t*1.8+s.gravPhase)*0.12);
      s.halo.scale.setScalar(1.0+Math.sin(t*1.2+s.gravPhase)*0.14);
      s.pulse.scale.setScalar(1.0+Math.sin(t*0.7+s.gravPhase)*0.18);
      s.light.intensity=32.0+Math.sin(t*1.6+s.gravPhase)*6;
      const r=s.radius+Math.sin(t*0.5+s.gravPhase)*0.004; const ang=s.baseAngle;
      const x=Math.cos(ang)*r; const y=Math.sin(ang)*r;
      s.group.position.set(x,y,0); s.light.position.set(x,y,0);
      links[i].line.geometry.setFromPoints([new THREE.Vector3(0,0,0),s.group.position]);
      links[i].mat.opacity=0.08+Math.sin(t*1.4+i)*0.03;
    });
    heartMat.uniforms.uE.value=0.68+Math.sin(t*1.2)*0.06;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V83 ENERGIE MAITRISEE COEUR BLEU 0.68 + 7 SAT 0.54 32.0 SANS REFLET ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/5 MODS`:'IGNITION V83 MAITRISEE'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:12,borderRadius:999,border:0,background:'#88ffff',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>V83 ENERGIE MAITRISEE COEUR BLEU 0.22 0.68 BLOOM 0.22 EXPO 0.68 + 7 SAT FROLENT 0.54 SANS REFLET</button></div></div>);
}
