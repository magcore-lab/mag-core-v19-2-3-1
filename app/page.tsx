'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V67 PRO CLEAN - 12 BRANCHES + DIAMANT 8 ARROWS + ENERGIE 35% CENTRE + 1er CERCLE 0.62*1.00 TANGENT ZOOM +20% 1.104
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.68; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.22,0.68,0.88); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:true});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(new Uint8Array(128)); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.22));
  const key=new THREE.PointLight(0xffffff,32,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,18,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0x88ccff,18,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,14,5); coreLight2.position.set(0,0,1.2); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.104); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup); const branchGroup=new THREE.Group(); coreGroup.add(branchGroup); const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,2),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.14} as any)); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,1),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.06} as any)); cageGroup.add(outer2);
  const RADIUS_FACTOR=1.00;
  const satPos:THREE.Vector3[]=[]; for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*RADIUS_FACTOR,Math.sin(a)*0.62*RADIUS_FACTOR,0)); }
  const branches:any[]=[];
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3,thick=0.005)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(thick,thick,len,8);
    const mat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.22} as any);
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    branches.push({mesh,mat,p1,p2});
  };
  satPos.forEach(p=>mkBranch(new THREE.Vector3(0,0,0),p,0.006));
  satPos.forEach((p,i)=>mkBranch(p,satPos[(i+1)%6],0.0032));
  const diamV='varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; varying vec2 vUv; uniform float uT; uniform float uI; uniform float uE; void main(){ float ang=atan(vUv.y-0.5,vUv.x-0.5); float rad=length(vUv-0.5); float sector=mod(ang*4.0/3.14159+uT*0.06,8.0); float arrow=pow(abs(sin(sector*3.14159)),28.0)*0.42; float star=pow(cos(ang*8.0),48.0)*0.22*exp(-rad*2.4); float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.4); float c=0.38+uI*0.28+arrow*0.92+star+f*0.32*uI; vec3 base=vec3(0.58,0.78,1.0); base+=vec3(0.14,0.28,0.58)*f*0.32; base+=vec3(0.78,0.88,1.0)*arrow*0.72; base*=uE; gl_FragColor=vec4(base*c,0.62); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.32}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,3),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.12,transmission:0.98,thickness:0.52,ior:2.417,roughness:0.12,clearcoat:0.4,transparent:true,opacity:0.38} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0.28,transmission:0.96,thickness:0.32,ior:2.417,roughness:0.06,clearcoat:0.8,transparent:true,opacity:0.48} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.24,20,20),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.06} as any)); coreGroup.add(glow);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.022,10,10),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.58} as any)); m.position.set(Math.cos(ang)*0.62*RADIUS_FACTOR,Math.sin(ang)*0.62*RADIUS_FACTOR,0); satGroup.add(m); const l=new THREE.PointLight(0x88ffff,8,1.8); l.position.copy(m.position); satGroup.add(l); }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.22; (bloom as any).radius=0.68; (innerMat as any).emissiveIntensity=0.32; (inner2Mat as any).emissiveIntensity=0.62; inner.scale.setScalar(1.02); inner2.scale.setScalar(1.03); middleMat.uniforms.uE.value=0.48; coreLight.intensity=18; coreLight2.intensity=14; renderer.toneMappingExposure=0.68; branches.forEach((b:any)=>{ b.mat.opacity=0.28; }); }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.28+Math.sin(t*1.0)*0.04+(ignited?0.08:0); const dmx=dmxRef.current; const prop=(dmx.ch1/255)*0.5; const rot=0.0006*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.28; inner.rotation.y-=rot*0.32; inner2.rotation.y+=rot*0.48; satGroup.rotation.z+=rot*0.12; composer.render(); }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'V67 PRO CLEAN 12B 0.62*1.00 1.104 NOYAU 35% CENTRE '+(dmxOn?'DMX WS':'DMX SYNTH')+' '+Object.values(mods).filter(Boolean).length+'/4 MODS':'IGNITION V67 PRO'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.12em'}}>V67 PRO 12 BRANCHES 6+6 HEXA 0.62*1.00 TANGENT 1.104 DIAMANT 8-ARROWS 35% CENTRE</button></div></div>);
}
