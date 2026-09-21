'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V72 CLEAN - SANS CERCLE GRISE - NOYAU CENTRAL 75% + 7 SAT ACTIFS ENERGIE CENTRALE + REFLECTION GENERALE
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.88; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.42,0.52,0.82); composer.addPass(bloom);
  const cubeRenderTarget=new THREE.WebGLCubeRenderTarget(256); (cubeRenderTarget.texture as any).type=THREE.HalfFloatType;
  const cubeCamera=new THREE.CubeCamera(0.1,100,cubeRenderTarget); scene.add(cubeCamera);
  setMods({webgpu:false,audio:false,midi:false,osc:true});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(new Uint8Array(128)); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.32));
  const key=new THREE.PointLight(0xffffff,68,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ccff,38,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,28,6); coreLight2.position.set(0,0,1.4); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.2144); scene.add(coreGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup); const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const SAT_COUNT=7; const RADIUS=0.72;
  const satPos:THREE.Vector3[]=[]; for(let i=0;i<SAT_COUNT;i++){ const a=i*(360/SAT_COUNT)*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*RADIUS,Math.sin(a)*RADIUS,0)); }
  const branches:any[]=[];
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0035,0.0035,len,6);
    const mat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18} as any);
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    branches.push({mesh,mat});
  };
  satPos.forEach(p=>mkBranch(new THREE.Vector3(0,0,0),p));
  const diamV='varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; varying vec2 vUv; uniform float uT; uniform float uI; uniform float uE; uniform float uPower; uniform samplerCube uEnv; void main(){ float ang=atan(vUv.y-0.5,vUv.x-0.5); float sector=mod(ang*4.0/3.14159+uT*0.06,8.0); float arrow=pow(abs(sin(sector*3.14159)),30.0)*0.48; float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6); vec3 R=reflect(-normalize(vV),normalize(vN)); vec3 env=textureCube(uEnv,R).rgb; float power=uPower; float c=0.42+uI*0.24+arrow*0.72+f*0.32*uI; vec3 base=vec3(0.52,0.72,0.88); base+=env*0.52*power; base+=vec3(0.72,0.82,0.92)*arrow*0.68; base*=uE*power; gl_FragColor=vec4(base*c,0.64); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.52},uPower:{value:0.75},uEnv:{value:cubeRenderTarget.texture}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,3),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.22,transmission:0.99,thickness:0.42,ior:2.417,roughness:0.12,clearcoat:0.4,envMap:cubeRenderTarget.texture,envMapIntensity:1.1,transparent:true,opacity:0.48} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0.48,transmission:0.98,thickness:0.32,ior:2.417,roughness:0.08,clearcoat:0.7,envMap:cubeRenderTarget.texture,envMapIntensity:1.6,transparent:true,opacity:0.62} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,20,20),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.10} as any)); coreGroup.add(glow);
  const sats:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.032,12,12),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:1.4} as any));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.058,12,12),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.20} as any));
    const pulse=new THREE.Mesh(new THREE.SphereGeometry(0.082,12,12),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.10} as any));
    g.add(core); g.add(halo); g.add(pulse); g.position.copy(satPos[i]); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,28,3.2); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core,halo,pulse,light:l,baseAngle:i*(360/SAT_COUNT)*Math.PI/180,radius:RADIUS,gravPhase:Math.random()*6.28});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.42; (bloom as any).radius=0.52; (innerMat as any).emissiveIntensity=0.45; (inner2Mat as any).emissiveIntensity=0.75; inner.scale.setScalar(1.04); inner2.scale.setScalar(1.08); middleMat.uniforms.uE.value=0.68; middleMat.uniforms.uPower.value=0.75; coreLight.intensity=38; coreLight2.intensity=28; renderer.toneMappingExposure=0.88; branches.forEach((b:any)=>{ b.mat.opacity=0.22; }); }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016;
    middle.visible=false; inner.visible=false; inner2.visible=false; cubeCamera.position.copy(coreGroup.position); cubeCamera.update(renderer,scene); middle.visible=true; inner.visible=true; inner2.visible=true;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.32+Math.sin(t*0.9)*0.06+(ignited?0.14:0);
    const nucleoPower=0.75; const gravStrength=0.0009*nucleoPower;
    sats.forEach((s:any,i:number)=>{
      s.baseAngle+=0.0010+gravStrength*2.2;
      const pulseScale=1.0+Math.sin(t*2.2+s.gravPhase)*0.18;
      s.core.scale.setScalar(pulseScale); s.halo.scale.setScalar(1.0+Math.sin(t*1.4+s.gravPhase)*0.22); s.pulse.scale.setScalar(1.0+Math.sin(t*0.8+s.gravPhase)*0.32);
      s.pulse.material.opacity=0.10+Math.sin(t*1.2+s.gravPhase)*0.05; s.light.intensity=28+Math.sin(t*2.0+s.gravPhase)*10;
      const r=s.radius+Math.sin(t*0.7+s.gravPhase)*0.012; const ang=s.baseAngle; const x=Math.cos(ang)*r; const y=Math.sin(ang)*r; const z=Math.sin(t*0.5+s.gravPhase)*0.04;
      s.group.position.set(x,y,z); s.light.position.copy(s.group.position);
      const b=branches[i]; if(b){ const p1=new THREE.Vector3(0,0,0); const p2=s.group.position; const dir=p2.clone().sub(p1); const len=dir.length(); b.mesh.scale.set(1,len/ (b.mesh.geometry.parameters.height||1),1); b.mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); b.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); }
    });
    const rot=0.0006*(0.5+(dmxRef.current.ch1/255)*0.6);
    coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.28; inner.rotation.y-=rot*0.36; inner2.rotation.y+=rot*0.52;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'V72 CLEAN SANS CERCLE GRISE NOYAU 75% 7 SAT ACTIFS '+(dmxOn?'DMX WS':'DMX SYNTH')+' '+Object.values(mods).filter(Boolean).length+'/4 MODS':'IGNITION V72 75% CLEAN'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.12em'}}>V72 SANS CERCLE GRISE 7 SAT ACTIVES NOYAU CENTRAL 75% REFLECTION GENERALE DIAMANT</button></div></div>);
}
