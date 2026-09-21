'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V70 REFLECTION GENERALE DIAMANT + NOYAU POWER 50% EXACT + 7 SAT GRAVITATION NUCLEO MOTEUR + 1 CERCLE 0.62*1.00 TANGENT + ZOOM +10% 1.214
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.78; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.28,0.58,0.88); composer.addPass(bloom);
  const cubeRenderTarget=new THREE.WebGLCubeRenderTarget(256); (cubeRenderTarget.texture as any).type=THREE.HalfFloatType;
  const cubeCamera=new THREE.CubeCamera(0.1,100,cubeRenderTarget); scene.add(cubeCamera);
  setMods({webgpu:false,audio:false,midi:false,osc:true});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])}; } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=256; const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(new Uint8Array(128)); setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMods(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.24));
  const key=new THREE.PointLight(0xffffff,48,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,28,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0x88ccff,24,7); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,18,5); coreLight2.position.set(0,0,1.2); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.2144); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup); const branchGroup=new THREE.Group(); coreGroup.add(branchGroup); const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,2),new THREE.MeshBasicMaterial({color:0x88ffff,wireframe:true,transparent:true,opacity:0.12} as any)); cageGroup.add(outer);
  const RADIUS_FACTOR=1.00;
  const SAT_COUNT=7;
  const satPos:THREE.Vector3[]=[];
  for(let i=0;i<SAT_COUNT;i++){ const a=i*(360/SAT_COUNT)*Math.PI/180; const r=0.62*RADIUS_FACTOR; satPos.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0)); }
  const branches:any[]=[];
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0035,0.0035,len,6);
    const mat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.20} as any);
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    branches.push({mesh,mat});
  };
  satPos.forEach(p=>mkBranch(new THREE.Vector3(0,0,0),p));
  const diamV='varying vec3 vN; varying vec3 vV; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; varying vec2 vUv; uniform float uT; uniform float uI; uniform float uE; uniform float uPower; uniform samplerCube uEnv; void main(){ float ang=atan(vUv.y-0.5,vUv.x-0.5); float sector=mod(ang*4.0/3.14159+uT*0.05,8.0); float arrow=pow(abs(sin(sector*3.14159)),30.0)*0.44; float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6); vec3 R=reflect(-normalize(vV),normalize(vN)); vec3 env=textureCube(uEnv,R).rgb; float power=uPower; float c=0.40+uI*0.20+arrow*0.68+f*0.30*uI; vec3 base=vec3(0.52,0.72,0.88); base+=env*0.48*power; base+=vec3(0.10,0.22,0.48)*f*0.32; base+=vec3(0.72,0.82,0.92)*arrow*0.62; base*=uE*power; gl_FragColor=vec4(base*c,0.60); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.36},uPower:{value:0.5},uEnv:{value:cubeRenderTarget.texture}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,3),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.10,transmission:0.99,thickness:0.42,ior:2.417,roughness:0.14,clearcoat:0.3,envMap:cubeRenderTarget.texture,envMapIntensity:0.8,transparent:true,opacity:0.38} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0.26,transmission:0.98,thickness:0.28,ior:2.417,roughness:0.08,clearcoat:0.6,envMap:cubeRenderTarget.texture,envMapIntensity:1.2,transparent:true,opacity:0.52} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.26,20,20),new THREE.MeshBasicMaterial({color:0x88ccff,transparent:true,opacity:0.05} as any)); coreGroup.add(glow);
  const sats:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.020,10,10),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.58} as any));
    m.position.copy(satPos[i]); satGroup.add(m);
    const l=new THREE.PointLight(0x88ffff,8,1.6); l.position.copy(m.position); satGroup.add(l);
    sats.push({mesh:m,light:l,baseAngle:ang,radius:0.62*RADIUS_FACTOR,gravPhase:Math.random()*6.28});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.28; (bloom as any).radius=0.64; (innerMat as any).emissiveIntensity=0.24; (inner2Mat as any).emissiveIntensity=0.50; inner.scale.setScalar(1.02); inner2.scale.setScalar(1.04); middleMat.uniforms.uE.value=0.44; middleMat.uniforms.uPower.value=0.5; coreLight.intensity=24; coreLight2.intensity=18; renderer.toneMappingExposure=0.78; branches.forEach((b:any)=>{ b.mat.opacity=0.24; }); }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016;
    middle.visible=false; inner.visible=false; inner2.visible=false;
    cubeCamera.position.copy(coreGroup.position); cubeCamera.update(renderer,scene);
    middle.visible=true; inner.visible=true; inner2.visible=true;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.24+Math.sin(t*0.7)*0.04+(ignited?0.08:0);
    const nucleoPower=0.5; const gravStrength=0.0008*nucleoPower; const coherence=Math.sin(t*0.3)*0.02;
    sats.forEach((s:any,i:number)=>{
      s.baseAngle+=0.0008+gravStrength*2.0;
      const r=s.radius+Math.sin(t*0.8+s.gravPhase)*0.015*coherence*10.0;
      const ang=s.baseAngle+Math.sin(t*0.5+i)*0.01;
      const x=Math.cos(ang)*r; const y=Math.sin(ang)*r; const z=Math.sin(t*0.6+s.gravPhase)*0.03;
      s.mesh.position.set(x,y,z); s.light.position.copy(s.mesh.position);
      const b=branches[i]; if(b){ const p1=new THREE.Vector3(0,0,0); const p2=s.mesh.position; const dir=p2.clone().sub(p1); const len=dir.length(); b.mesh.scale.set(1,len/ (b.mesh.geometry.parameters.height||1),1); b.mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); b.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); }
    });
    const rot=0.0005*(0.5+(dmxRef.current.ch1/255)*0.5);
    coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.24; inner.rotation.y-=rot*0.32; inner2.rotation.y+=rot*0.48;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'V70 DIAMANT REFLECTION GENERALE 50% 7 SAT GRAV NUCLEO '+(dmxOn?'DMX WS':'DMX SYNTH')+' '+Object.values(mods).filter(Boolean).length+'/4 MODS':'IGNITION V70'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.12em'}}>V70 REFLECTION GENERALE DIAMANT POWER 50% 7 SAT GRAVITATION COHERENCE MOTEUR NUCLEO 1 CERCLE 0.62*1.00 1.214</button></div></div>);
}
