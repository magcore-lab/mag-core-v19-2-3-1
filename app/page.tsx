'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V92 DMX CAPITAL RESTORE + QUANTUM ENV + COEUR MAITRISE 0.88 + FIX BUILD VERCEL
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:140,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  // @ts-ignore
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.38,0.38,0.82); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??140),ch6:cl(c[5]??80),ch7:cl(c[6]??160),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])}; if(msg.type==='artnet') setMods(mm=>({...mm,artnet:true,dmx:true})); if(msg.type==='sacn') setMods(mm=>({...mm,sacn:true,dmx:true})); } if(msg.type==='info') console.log('[MAG CORE]',msg.message); }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255; const mid=data.slice(10,60).reduce((a,b)=>a+b,0)/50/255; const high=data.slice(60,128).reduce((a,b)=>a+b,0)/68/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.18));
  const coreLight=new THREE.PointLight(0x88ffff,54,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,32,5); coreLight2.position.set(0,0,1.6); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.28); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);
  const moduleGroup=new THREE.Group(); coreGroup.add(moduleGroup);
  // QUANTUM ENV 512 POINTS 4.2R - DMX CH5 PART controle scatter
  const qGeo=new THREE.BufferGeometry(); const qCount=512; const qPos=new Float32Array(qCount*3);
  for(let i=0;i<qCount;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/qCount); const r=1.8+Math.random()*2.4; qPos[i*3]=Math.sin(ph)*Math.cos(th)*r; qPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; qPos[i*3+2]=Math.cos(ph)*r; }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x88ffff,size:0.014,transparent:true,opacity:0.22}); const qPoints=new THREE.Points(qGeo,qMat); quantumGroup.add(qPoints);
  // MODULES EXPLOITATION - DMX CH6 CODE + CH7 SAT
  const mod1=new THREE.Mesh(new THREE.TorusGeometry(0.68,0.0032,12,128),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18})); mod1.rotation.x=Math.PI/2.2; moduleGroup.add(mod1);
  const mod2=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.0024,12,128),new THREE.MeshBasicMaterial({color:0x22aaff,transparent:true,opacity:0.12})); mod2.rotation.x=Math.PI/3.1; moduleGroup.add(mod2);
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uLow; uniform float uHue; uniform float uBloom; vec3 hsl2rgb(vec3 hsl){ vec3 rgb=clamp(abs(mod(hsl.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0,0.0,1.0); return hsl.z+ hsl.y*(rgb-0.5)*(1.0-abs(2.0*hsl.z-1.0)); } void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float q=sin(uT*2.0+length(vN)*5.0)*0.10; float c=0.52+uI*0.36+q+uLow*0.20; float g=0.22+f*0.42*uI; vec3 baseCol=hsl2rgb(vec3(uHue,0.85,0.58+uBloom*0.1)); vec3 col=baseCol*(c+g); col+=vec3(0.18,0.42,0.92)*f*uI*0.52; col*=uE; gl_FragColor=vec4(col,0.92); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.86},uE:{value:0.92},uLow:{value:0},uHue:{value:0.55},uBloom:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.88,transmission:0.96,thickness:0.62,ior:2.417,dispersion:0.35,roughness:0.04,clearcoat:1.0,transparent:true,opacity:0.88} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.32,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.10} as any)); coreGroup.add(glow);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.38; middleMat.uniforms.uE.value=0.92; innerMat.emissiveIntensity=0.88; inner.scale.setScalar(1.04); glow.scale.setScalar(1.18); coreLight.intensity=54; coreLight2.intensity=32; renderer.toneMappingExposure=0.82; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    const dmx=dmxRef.current; const master=dmx.ch10/255; const prop=dmx.ch1/255; const bloomCH=dmx.ch2/255; const flowCH=dmx.ch3/255; const rgbCH=dmx.ch4/255; const partCH=dmx.ch5/255; const codeCH=dmx.ch6/255; const innerCH=dmx.ch8/255;
    const {low,mid,high}=audioRef.current;
    // DMX CAPITAL MAPPING
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uLow.value=low*0.5+partCH*0.5;
    middleMat.uniforms.uHue.value=0.52+rgbCH*0.32+Math.sin(t*0.14)*0.06+low*0.12;
    middleMat.uniforms.uI.value=0.86+Math.sin(t*2.0)*0.10+low*0.14+prop*0.18;
    middleMat.uniforms.uBloom.value=bloomCH;
    bloom.strength=0.38+bloomCH*0.5+low*0.18; // CH2 BLOOM
    renderer.toneMappingExposure=0.82*master+0.4; // CH10 MASTER
    innerMat.emissiveIntensity=0.88+innerCH*0.6+Math.sin(t*1.2)*0.08+low*0.18; // CH8 INNER
    coreLight.intensity=54*master+low*18+prop*12;
    const flowMod=flowCH*0.9+mid*0.4; // CH3 FLOW
    const rot=0.0008*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.52;
    quantumGroup.rotation.y+=0.0006+flowMod*0.0012; // CH3 FLOW
    moduleGroup.rotation.y-=0.0012+codeCH*0.002; // CH6 CODE
    mod1.rotation.z+=0.0018+prop*0.002; mod2.rotation.z-=0.0012+codeCH*0.001;
    mod1.scale.setScalar(1.0+codeCH*0.22); mod2.scale.setScalar(1.0+codeCH*0.32);
    qPoints.rotation.y+=0.0004+flowMod*0.0008;
    qMat.opacity=0.22*master+partCH*0.18; // CH5 PART + CH10 MASTER
    qMat.size=0.014+high*0.01+partCH*0.008;
    inner.scale.setScalar(1.04+low*0.12+innerCH*0.08);
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (dmxOn?'#88ffff':'#ffaa00') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V92 DMX CAPITAL RESTORE 10CH ARTNET 6454 sACN 5568 WS 8081 ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V92 DMX CAPITAL'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',flexDirection:'column',gap:6}}><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{Object.entries(dmxRef.current).map(([k,v])=><div key={k} style={{background: k==='ch10'?'#fff':'#111',color:k==='ch10'?'#000':'#88ffff',padding:'4px 8px',borderRadius:999,fontSize:9,fontWeight:900,border:'1px solid #333'}}>{k.toUpperCase()}: {v}</div>)}</div><button style={{padding:12,borderRadius:999,border:0,background:dmxOn?'#88ffff':'#ffaa00',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>💎 V92 DMX CAPITAL 10CH CH1 PROP CH2 BLOOM CH3 FLOW CH4 RGB CH5 PART CH6 CODE CH8 INNER CH10 MAST + QUANTUM 512</button></div></div>);
}
