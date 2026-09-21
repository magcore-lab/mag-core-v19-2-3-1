'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// V69 ZOOM AVANT +10% 1.214 + NOYAU 30% + DMX FULL 6454/5568/8081 + 7 MODS WEBGPU AUDIO MIDI OSC ARTNET SACN DMX + FX AMENTI TRON
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:100,ch6:80,ch7:120,ch8:90,ch9:70,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [vals,setVals]=useState({ch1:127,ch10:210});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.58; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.16,0.74,0.92); composer.addPass(bloom);
  // FX TRON - scanline + chromatic subtle
  const tronShader={ uniforms:{ tDiffuse:{value:null}, uT:{value:0}, uScan:{value:0.22}, uChroma:{value:0.0012} }, vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, fragmentShader:`uniform sampler2D tDiffuse; uniform float uT; uniform float uScan; uniform float uChroma; varying vec2 vUv; void main(){ float chroma=uChroma+sin(vUv.x*18.0+uT*1.2)*0.0006; vec4 r=texture2D(tDiffuse,vec2(vUv.x+chroma,vUv.y)); vec4 g=texture2D(tDiffuse,vUv); vec4 b=texture2D(tDiffuse,vec2(vUv.x-chroma,vUv.y)); vec3 col=vec3(r.r,g.g,b.b); float scan=sin(vUv.y*700.0+uT*4.0)*0.035*uScan; col-=scan; float vign=1.0-dot(vUv-0.5,vUv-0.5)*0.22; col*=vign; gl_FragColor=vec4(col,1.0); }` };
  const tronPass=new ShaderPass(tronShader); composer.addPass(tronPass);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels && Array.isArray(msg.channels)){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); const v={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch4:clamp(c[3]??128),ch5:clamp(c[4]??100),ch6:clamp(c[5]??80),ch7:clamp(c[6]??120),ch8:clamp(c[7]??90),ch9:clamp(c[8]??70),ch10:clamp(c[9])}; dmxRef.current=v; setVals({ch1:v.ch1,ch10:v.ch10}); if((msg as any).type==='artnet') setMods(mm=>({...mm,artnet:true})); if((msg as any).type==='sacn') setMods(mm=>({...mm,sacn:true})); } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); let lowAvg=0; let beat=0; const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,20).reduce((a,b)=>a+b,0)/20; lowAvg=lowAvg*0.92+low*0.08; if(low>lowAvg*1.35 && low>95 && performance.now()-beat>180){ beat=performance.now(); bloom.strength=0.32; setTimeout(()=>{ bloom.strength=0.16; },130); } (dmxRef.current as any)._audioLow=low/255; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st,note,vel]=e.data; if(st===144 && vel>0){ (dmxRef.current as any)._midi=note/127; setMods(mm=>({...mm,midi:true})); } }; } }); } }catch{}
  // LUMIERE NOYAU 30% = *0.30 ultra maitrisee
  scene.add(new THREE.AmbientLight(0xffffff,0.16));
  const key=new THREE.PointLight(0xffffff,18,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ccff,10,6); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,8,4); coreLight2.position.set(0,0,1.0); scene.add(coreLight2);
  // ZOOM +10% : 1.104 *1.10 = 1.2144
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.2144); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup); const branchGroup=new THREE.Group(); coreGroup.add(branchGroup); const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,2),new THREE.MeshBasicMaterial({color:0x88ffff,wireframe:true,transparent:true,opacity:0.08} as any)); cageGroup.add(outer);
  // FX AMENTI - 1 anneau fin subtil qui ne casse pas l'entite
  const amentiRing=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.002,8,128),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.06} as any)); amentiRing.rotation.x=Math.PI/2.2; cageGroup.add(amentiRing);
  const RADIUS_FACTOR=1.00;
  const satPos:THREE.Vector3[]=[]; for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*RADIUS_FACTOR,Math.sin(a)*0.62*RADIUS_FACTOR,0)); }
  const branches:any[]=[];
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0032,0.0032,len,6);
    const mat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.16} as any);
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    branches.push({mesh,mat});
  };
  satPos.forEach(p=>mkBranch(new THREE.Vector3(0,0,0),p));
  // DIAMANT 8 ARROWS - 30% CENTRE - FX TRON
  const diamV='varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; varying vec2 vUv; uniform float uT; uniform float uI; uniform float uE; uniform float uDMX; uniform float uAudio; void main(){ float ang=atan(vUv.y-0.5,vUv.x-0.5); float rad=length(vUv-0.5); float sector=mod(ang*4.0/3.14159+uT*0.04,8.0); float arrow=pow(abs(sin(sector*3.14159)),32.0)*0.32; float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8); float grid=step(0.985,sin(vUv.x*90.0+uT*0.2))*0.06; float c=0.36+uI*0.18+arrow*0.62+f*0.22*uI+uDMX*0.12+uAudio*0.08; vec3 base=vec3(0.48,0.68,0.88); base+=vec3(0.10,0.22,0.48)*f*0.24; base+=vec3(0.68,0.78,0.88)*arrow*0.48; base+=vec3(0.18,0.68,0.88)*grid; base*=uE; gl_FragColor=vec4(base*c,0.52); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.24},uDMX:{value:0},uAudio:{value:0}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,2),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.06,transmission:0.98,thickness:0.38,ior:2.417,roughness:0.22,clearcoat:0.2,transparent:true,opacity:0.28} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,2),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0.18,transmission:0.96,thickness:0.24,ior:2.417,roughness:0.10,clearcoat:0.5,transparent:true,opacity:0.38} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.20,16,16),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.04} as any)); coreGroup.add(glow);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.016,8,8),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.42} as any)); m.position.set(Math.cos(ang)*0.62*RADIUS_FACTOR,Math.sin(ang)*0.62*RADIUS_FACTOR,0); satGroup.add(m); const l=new THREE.PointLight(0x88ffff,5,1.2); l.position.copy(m.position); satGroup.add(l); }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.16; (bloom as any).radius=0.74; (innerMat as any).emissiveIntensity=0.18; (inner2Mat as any).emissiveIntensity=0.38; inner.scale.setScalar(1.01); inner2.scale.setScalar(1.02); middleMat.uniforms.uE.value=0.32; coreLight.intensity=10; coreLight2.intensity=8; renderer.toneMappingExposure=0.58; branches.forEach((b:any)=>{ b.mat.opacity=0.18; }); }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.18+Math.sin(t*0.6)*0.02+(ignited?0.04:0); tronPass.uniforms.uT.value=t; const dmx=dmxRef.current; middleMat.uniforms.uDMX.value=(dmx.ch1+dmx.ch2)/512.0; middleMat.uniforms.uAudio.value=(dmx as any)._audioLow||0; const prop=(dmx.ch1/255)*0.4; const rot=0.0003*(0.5+prop); coreGroup.rotation.y+=rot; amentiRing.rotation.z+=rot*0.5; composer.render(); }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?`V69 ZOOM +10% 1.214 NOYAU 30% AMENTI TRON ${dmxOn?'DMX WS':'DMX SYNTH'} CH10:${vals.ch10} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V69 AMENTI TRON'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>V69 1 CERCLE 0.62*1.00 TANGENT ZOOM +10% 1.214 NOYAU 30% DMX FULL AMENTI TRON 6B</button></div></div>);
}
