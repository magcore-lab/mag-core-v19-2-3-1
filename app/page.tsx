
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V88 DRONES GEMMOLOGIQUE OCTA + ZOOM ARRIERE 1.28 + 0 BRANCHE + NOYAU +30% 1.495 FINAL
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:140,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.94; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.55,0.42,0.76); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??140),ch6:cl(c[5]??80),ch7:cl(c[6]??160),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255; const mid=data.slice(10,60).reduce((a,b)=>a+b,0)/50/255; const high=data.slice(60,128).reduce((a,b)=>a+b,0)/68/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.22));
  const key=new THREE.PointLight(0xffffff,68,24); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0x88ccff,38,18); fill.position.set(-4,2,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0x88ffff,80.6,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,49.4,5); coreLight2.position.set(0,0,1.8); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.28); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const SAT_COUNT=7; const RADIUS=0.54;
  // DIAMANT CAGE GEMMOLOGIQUE - 0 REFLET
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.28})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.14})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.06})); cageGroup.add(outer3);
  for(let k=0;k<3;k++){ const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4+k*0.38,0.0032,12,128),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14})); ring.rotation.x=Math.PI/2.5+k*0.42; ring.rotation.y=k*0.78; cageGroup.add(ring); }
  // NOYAU +30% ENERGIE
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uLow; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0); float q=sin(uT*2.2+length(vN)*5.0)*0.12; float c=0.52+uI*0.36+q+uLow*0.22; float g=0.22+f*0.42*uI; vec3 col=vec3(0.42,0.88,1.0)*(c+g); col+=vec3(0.18,0.42,0.92)*f*uI*0.62; col*=uE; gl_FragColor=vec4(col,0.88); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.86},uE:{value:1.14},uLow:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.495,transmission:0.96,thickness:0.62,ior:2.417,dispersion:0.35,roughness:0.04,clearcoat:1.0,transparent:true,opacity:0.92} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.32,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14} as any)); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),new THREE.MeshBasicMaterial({color:0x22aaff,transparent:true,opacity:0.06} as any)); coreGroup.add(glow2);
  // DRONES STRUCTURE GEMMOLOGIQUE - OCTAHEDRE + ICOSA FACETTE
  const sats:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const gemMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.42,transmission:0.92,thickness:0.42,ior:2.417,dispersion:0.35,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.88} as any);
    const octa=new THREE.Mesh(new THREE.OctahedronGeometry(0.032,0),gemMat);
    const innerGem=new THREE.Mesh(new THREE.IcosahedronGeometry(0.016,1),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92} as any));
    const g=new THREE.Group(); g.add(octa); g.add(innerGem);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,32.0,3.4); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core:octa,inner:innerGem,mat:gemMat,light:l,baseAngle:ang,radius:RADIUS,phase:Math.random()*6.28});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.55; middleMat.uniforms.uE.value=1.14; innerMat.emissiveIntensity=1.495; inner.scale.setScalar(1.08); glow.scale.setScalar(1.22); coreLight.intensity=80.6; coreLight2.intensity=49.4; renderer.toneMappingExposure=0.94; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uLow.value=audioRef.current.low;
    middleMat.uniforms.uI.value=0.86+Math.sin(t*2.2)*0.12+audioRef.current.low*0.18;
    const dmx=dmxRef.current; const master=dmx.ch10/255; const {low,mid,high}=audioRef.current;
    const prop=(dmx.ch1/255)*0.8*master;
    sats.forEach((s:any)=>{
      s.baseAngle+=0.0012+prop*0.0008+low*0.0006;
      const r=s.radius+Math.sin(t*0.6+s.phase)*0.004+high*0.008;
      const ang=s.baseAngle; const x=Math.cos(ang)*r; const y=Math.sin(ang)*r;
      s.group.position.set(x,y,0); s.light.position.set(x,y,0);
      s.group.rotation.y+=0.018; s.group.rotation.x+=0.012;
      s.light.intensity=32.0+high*12+Math.sin(t*1.6+s.phase)*4;
      const scale=1.0+high*0.22;
      s.core.scale.setScalar(scale); s.inner.scale.setScalar(scale);
    });
    const rot=0.0008*(0.5+prop); coreGroup.rotation.y+=rot; cageGroup.rotation.y+=rot*0.18; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.52; satGroup.rotation.z+=rot*0.22;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V88 GEMMO DRONES OCTA + ZOOM ARRIERE 1.28 + 0 BRANCHE + NOYAU +30% 1.495 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/5 MODS`:'IGNITION V88 GEMMO'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',gap:8}}><button style={{flex:1,padding:14,borderRadius:999,border:0,background:'#88ffff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.10em'}}>💎 V88 DRONES STRUCTURE GEMMOLOGIQUE OCTA + ZOOM ARRIERE 1.28 + 0 BRANCHE + NOYAU +30% 1.495</button></div></div>);
}
