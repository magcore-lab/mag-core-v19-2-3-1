'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
// V77 QUANTIQUE MATRICIEL CINEMASCOPE 2.39:1 TECHNO-FUTURE - 7 QUBITS ORBITALE PURE - ZOOM 1.469 - NOYAU 90% VIDE - DMX 10CH ARTNET SACN - FIX BUILD 67
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:100,ch6:80,ch7:120,ch8:90,ch9:70,ch10:210});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [vals,setVals]=useState({ch1:127,ch10:210});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.25)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.02; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.58,0.52,0.78); composer.addPass(bloom);
  const tronShader={ uniforms:{ tDiffuse:{value:null}, uT:{value:0}, uScan:{value:0.22}, uChroma:{value:0.0014}, uVign:{value:0.32} }, vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`, fragmentShader:`uniform sampler2D tDiffuse; uniform float uT; uniform float uScan; uniform float uChroma; uniform float uVign; varying vec2 vUv; void main(){ float chroma=uChroma+sin(vUv.x*18.0+uT*1.2)*0.0006; vec4 r=texture2D(tDiffuse,vec2(vUv.x+chroma,vUv.y)); vec4 g=texture2D(tDiffuse,vUv); vec4 b=texture2D(tDiffuse,vec2(vUv.x-chroma,vUv.y)); vec3 col=vec3(r.r,g.g,b.b); float scan=sin(vUv.y*900.0+uT*4.5)*0.035*uScan; col-=scan; float vign=1.0-dot(vUv-0.5,vUv-0.5)*uVign; vec2 cin=vUv*2.0-1.0; float letter=1.0-smoothstep(0.92,1.08,abs(cin.y*1.8)); col*=vign*letter; gl_FragColor=vec4(col,1.0); }` };
  const tronPass=new ShaderPass(tronShader); composer.addPass(tronPass);
  const cubeRenderTarget=new THREE.WebGLCubeRenderTarget(256); (cubeRenderTarget.texture as any).type=THREE.HalfFloatType;
  const cubeCamera=new THREE.CubeCamera(0.1,100,cubeRenderTarget); scene.add(cubeCamera);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0; const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch4:clamp(c[3]??128),ch5:clamp(c[4]??100),ch6:clamp(c[5]??80),ch7:clamp(c[6]??120),ch8:clamp(c[7]??90),ch9:clamp(c[8]??70),ch10:clamp(c[9])}; setVals({ch1:clamp(c[0]),ch10:clamp(c[9])}); if((msg as any).type==='artnet') setMods(mm=>({...mm,artnet:true})); if((msg as any).type==='sacn') setMods(mm=>({...mm,sacn:true})); } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); let lowAvg=0; let beat=0; const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,20).reduce((a,b)=>a+b,0)/20; lowAvg=lowAvg*0.92+low*0.08; if(low>lowAvg*1.35 && low>95 && performance.now()-beat>180){ beat=performance.now(); bloom.strength=0.68; setTimeout(()=>{ bloom.strength=0.58; },130); } (dmxRef.current as any)._audioLow=low/255; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st,note,vel]=e.data; if(st===144 && vel>0){ (dmxRef.current as any)._midi=note/127; setMods(mm=>({...mm,midi:true})); } }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.38));
  const key=new THREE.PointLight(0xffffff,88,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ccff,52,9); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,40,7); coreLight2.position.set(0,0,1.6); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.46942); scene.add(coreGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const quantGroup=new THREE.Group(); coreGroup.add(quantGroup);
  const SAT_COUNT=7; const RADIUS=0.88;
  const diamV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const diamF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uE; uniform float uPower; uniform samplerCube uEnv; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.9); vec3 R=reflect(-normalize(vV),normalize(vN)); vec3 env=textureCube(uEnv,R).rgb; float power=uPower; float c=0.50+f*0.24; vec3 base=vec3(0.62,0.82,0.94); base+=env*0.32*power; base*=uE*power; gl_FragColor=vec4(base*c,0.52); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uE:{value:0.72},uPower:{value:0.90},uEnv:{value:cubeRenderTarget.texture}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide} as any);
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,3),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ffff,emissiveIntensity:0.38,transmission:0.995,thickness:0.42,ior:2.65,roughness:0.08,clearcoat:0.5,envMap:cubeRenderTarget.texture,envMapIntensity:0.55,transparent:true,opacity:0.62} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const sats:any[]=[]; const quantLines:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const g=new THREE.Group();
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.038,16,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:2.0} as any));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(0.070,16,16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.26} as any));
    const pulse=new THREE.Mesh(new THREE.SphereGeometry(0.102,16,16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.16} as any));
    g.add(core); g.add(halo); g.add(pulse);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,48,4.0); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core,halo,pulse,light:l,baseAngle:ang,radius:RADIUS,gravPhase:Math.random()*6.28318});
  }
  for(let i=0;i<SAT_COUNT;i++){
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
    const mat=new THREE.LineBasicMaterial({color:0x88ffff,transparent:true,opacity:0.0} as any);
    const line=new THREE.Line(geo,mat); quantGroup.add(line); quantLines.push({line,mat,i,j:(i+1)%SAT_COUNT});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.58; (bloom as any).radius=0.48; (innerMat as any).emissiveIntensity=0.68; inner.scale.setScalar(1.10); middleMat.uniforms.uE.value=0.92; middleMat.uniforms.uPower.value=0.90; coreLight.intensity=52; coreLight2.intensity=40; renderer.toneMappingExposure=1.02; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016;
    middle.visible=false; inner.visible=false; cubeCamera.position.copy(coreGroup.position); cubeCamera.update(renderer,scene); middle.visible=true; inner.visible=true;
    middleMat.uniforms.uT.value=t; tronPass.uniforms.uT.value=t;
    const dmx=dmxRef.current; const ch7=dmx.ch7/255;
    const nucleoPower=0.90; const gravStrength=0.0014*nucleoPower*(0.5+ch7*0.8);
    const quantFlicker=Math.sin(t*8.3)*0.12;
    sats.forEach((s:any)=>{
      s.baseAngle+=0.0018+gravStrength*2.8;
      const pulseScale=1.0+Math.sin(t*2.4+s.gravPhase)*0.22+quantFlicker;
      s.core.scale.setScalar(pulseScale); s.halo.scale.setScalar(1.0+Math.sin(t*1.4+s.gravPhase)*0.26); s.pulse.scale.setScalar(1.0+Math.sin(t*0.9+s.gravPhase)*0.38);
      s.pulse.material.opacity=0.16+Math.sin(t*1.3+s.gravPhase)*0.08+quantFlicker*0.2; s.light.intensity=48+Math.sin(t*2.2+s.gravPhase)*16+quantFlicker*10;
      const r=s.radius+Math.sin(t*0.7+s.gravPhase)*0.012; const ang=s.baseAngle; const x=Math.cos(ang)*r; const y=Math.sin(ang)*r; const z=0.0;
      s.group.position.set(x,y,z); s.light.position.set(x,y,z);
    });
    quantLines.forEach((q:any)=>{
      const a=sats[q.i].group.position; const b=sats[q.j].group.position;
      q.line.geometry.setFromPoints([a,b]); const d=a.distanceTo(b); const op=ch7*0.18*(1.0-d/2.0); q.mat.opacity=Math.max(0,op+quantFlicker*0.08);
    });
    const rot=0.0005*(0.5+(dmx.ch1/255)*0.7);
    coreGroup.rotation.y+=rot*0.15; middle.rotation.y+=rot*0.32; inner.rotation.y-=rot*0.42;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?`V77 QUANTIQUE 7Q CINEMASCOPE 2.39 ZOOM 1.469 NOYAU 90% ${dmxOn?'DMX WS':'DMX SYNTH'} CH7:${vals.ch1} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V77 QUANTIQUE'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>V77 QUANTIQUE MATRICIEL 7 QUBITS GRAVITATION PURE XY ZOOM +10% 1.469 NOYAU 90% VIDE CINEMASCOPE TECHNO-FUTURE</button></div></div>);
}
