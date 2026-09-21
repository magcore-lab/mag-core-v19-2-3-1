'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V110 FINAL UNIFIED LIVING — CINEMA ACES 0.72 + MATRICIEL INSTANCED + INTERPOLATION QUANTIQUE DMX + ZOOM 1.32 TRANS 0.18 NOYAU 1.32
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 // QUANTUM DMX MATRIX — 10CH avec interpolation quantique
 const dmxRef=useRef({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});
 const dmxTargetRef=useRef({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [dmxDisplay,setDmxDisplay]=useState({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  scene.fog=new THREE.FogExp2(0x001419,0.01);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.72;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.68,0.42,0.68);
  composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); });
  }
  let ws:any=null; let retry=0;
  const connectWS=()=>{
    try{
      ws=new WebSocket('ws://localhost:8081');
      ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true,artnet:true,sacn:true})); };
      ws.onmessage=(e:any)=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.channels){
            const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
            // QUANTUM TARGET — pas direct, interpolation ensuite
            dmxTargetRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??139),ch5:cl(c[4]??136),ch6:cl(c[5]??43),ch7:cl(c[6]??179),ch8:cl(c[7]??131),ch9:cl(c[8]??62),ch10:cl(c[9])};
            if(msg.type==='artnet') setMods(mm=>({...mm,artnet:true,dmx:true}));
            if(msg.type==='sacn') setMods(mm=>({...mm,sacn:true,dmx:true}));
          }
        }catch{}
      };
      ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(8000,300*Math.pow(2,retry++))); };
      ws.onerror=()=>{ try{ws.close();}catch{} };
    }catch{}
  }; connectWS();
  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512;
    const data=new Uint8Array(256);
    const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,20).reduce((a,b)=>a+b,0)/20/255; const mid=data.slice(20,80).reduce((a,b)=>a+b,0)/60/255; const high=data.slice(80,200).reduce((a,b)=>a+b,0)/120/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.06));
  const coreLight=new THREE.PointLight(0x88ffff,124,16); coreLight.decay=2; scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,68,12); coreLight2.position.set(0,0,1.2); coreLight2.decay=2; scene.add(coreLight2);
  const innerPoint=new THREE.PointLight(0x88ffff,68,8); innerPoint.decay=2; scene.add(innerPoint);
  // OPTIMISATION MATRICIELLE — 1 groupe matriciel 1.32
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.32); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);
  const qGeo=new THREE.BufferGeometry(); const qCount=512; const qPos=new Float32Array(qCount*3);
  for(let i=0;i<qCount;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/qCount); const r=2.0+Math.random()*3.2; qPos[i*3]=Math.sin(ph)*Math.cos(th)*r; qPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; qPos[i*3+2]=Math.cos(ph)*r; }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x88ffff,size:0.011,transparent:true,opacity:0.16,sizeAttenuation:true}); const qPoints=new THREE.Points(qGeo,qMat); qPoints.frustumCulled=false; quantumGroup.add(qPoints);
  // LIVING ORGANIC SSS SHADER — heartbeat + veins
  const fresV='varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vP=position; vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform float uT; uniform float uI; uniform float uE; uniform float uInner; uniform float uLow; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),5.0); float veins=sin(uT*1.2+vP.x*6.0+vP.y*4.0)*0.12 + sin(uT*0.8+vP.z*8.0)*0.08; float heartbeat=sin(uT*2.2)*0.08; float c=0.04+uI*0.22+uInner*0.18+veins+heartbeat+uLow*0.08; float g=f*0.58*uI; vec3 base=vec3(0.38,0.86,0.96)*(c+g); base+=vec3(0.52,0.98,1.0)*uInner*0.22; base*=uE; gl_FragColor=vec4(base,0.18); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.72},uE:{value:0.58},uInner:{value:0.32},uLow:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.32,transmission:1.0,thickness:0.12,ior:2.417,dispersion:0.72,roughness:0.0,metalness:0.0,clearcoat:1.0,sheen:0.3,sheenColor:0x88ffff,transparent:true,opacity:0.28} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const veinGeo=new THREE.BufferGeometry(); const veinCount=128; const veinPos=new Float32Array(veinCount*3);
  for(let i=0;i<veinCount;i++){ const a=Math.random()*Math.PI*2; const r=0.22+Math.random()*0.26; veinPos[i*3]=Math.cos(a)*r; veinPos[i*3+1]=Math.sin(a)*r; veinPos[i*3+2]=(Math.random()-0.5)*0.2; }
  veinGeo.setAttribute('position',new THREE.BufferAttribute(veinPos,3));
  const veinMat=new THREE.PointsMaterial({color:0xaaffff,size:0.018,transparent:true,opacity:0.32}); const veins=new THREE.Points(veinGeo,veinMat); coreGroup.add(veins);
  const glowMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.42,transmission:0.98,thickness:0.06,transparent:true,opacity:0.08} as any);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),glowMat); coreGroup.add(glow);
  const innerGlowMat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:0.68,transmission:0.99,thickness:0.04,transparent:true,opacity:0.14} as any);
  const innerGlow=new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32),innerGlowMat); coreGroup.add(innerGlow);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.68; middleMat.uniforms.uE.value=0.58; middleMat.uniforms.uInner.value=0.32; innerMat.emissiveIntensity=1.32; coreLight.intensity=124; coreLight2.intensity=68; innerPoint.intensity=68; renderer.toneMappingExposure=0.72; }; setTimeout(ignite,50);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const flowSpeeds=new Float32Array(veinCount).map(()=>Math.random());
  // INTERPOLATION QUANTIQUE DMX — lissage exponentiel + inertia Heisenberg
  const quantumLerp=(a:number,b:number,alpha:number)=> a + (b-a)*alpha;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    // QUANTUM DMX UPDATE — target → current avec inertia 0.08
    const target=dmxTargetRef.current; const cur=dmxRef.current;
    const qAlpha=0.08;
    cur.ch1=quantumLerp(cur.ch1,target.ch1,qAlpha); cur.ch2=quantumLerp(cur.ch2,target.ch2,qAlpha);
    cur.ch3=quantumLerp(cur.ch3,target.ch3,qAlpha); cur.ch4=quantumLerp(cur.ch4,target.ch4,qAlpha);
    cur.ch5=quantumLerp(cur.ch5,target.ch5,qAlpha); cur.ch6=quantumLerp(cur.ch6,target.ch6,qAlpha);
    cur.ch7=quantumLerp(cur.ch7,target.ch7,qAlpha); cur.ch8=quantumLerp(cur.ch8,target.ch8,qAlpha);
    cur.ch9=quantumLerp(cur.ch9,target.ch9,qAlpha); cur.ch10=quantumLerp(cur.ch10,target.ch10,qAlpha*0.5);
    if(!ws || ws.readyState!==1){
      const tt=t; const synth={ch1:111+Math.sin(tt*0.6)*18,ch2:143+Math.sin(tt*0.4)*14,ch3:176+Math.sin(tt*0.8)*10,ch4:139+Math.sin(tt*0.3)*8,ch5:136+Math.sin(tt*0.5)*10,ch6:43+Math.sin(tt*0.7)*6,ch7:179+Math.sin(tt*0.9)*5,ch8:131+Math.sin(tt*0.4)*12,ch9:62+Math.sin(tt*0.6)*6,ch10:183+Math.sin(tt*0.2)*8};
      dmxTargetRef.current=synth as any;
    }
    if(Math.floor(t*4)%4===0) setDmxDisplay({ch1:Math.floor(cur.ch1),ch2:Math.floor(cur.ch2),ch3:Math.floor(cur.ch3),ch4:Math.floor(cur.ch4),ch5:Math.floor(cur.ch5),ch6:Math.floor(cur.ch6),ch7:Math.floor(cur.ch7),ch8:Math.floor(cur.ch8),ch9:Math.floor(cur.ch9),ch10:Math.floor(cur.ch10)});
    const dmx=cur; const master=dmx.ch10/255; const prop=dmx.ch1/255; const bloomCH=dmx.ch2/255; const flowCH=dmx.ch3/255; const innerCH=dmx.ch8/255;
    const {low}=audioRef.current;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.72+Math.sin(t*2.2)*0.06+prop*0.10+low*0.08; middleMat.uniforms.uInner.value=0.32+innerCH*0.28+Math.sin(t*1.2)*0.06+low*0.10; (middleMat.uniforms as any).uLow.value=low*0.12;
    bloom.strength=0.68+bloomCH*0.14+low*0.08; renderer.toneMappingExposure=0.72*master+0.22; innerMat.emissiveIntensity=1.32+innerCH*0.32+Math.sin(t*1.2)*0.08+low*0.12;
    coreLight.intensity=124*master+innerCH*16+low*8+Math.sin(t*2.2)*6; coreLight2.intensity=68*master+innerCH*10+low*4; innerPoint.intensity=68*master+innerCH*18+low*6;
    const heartbeat=1.0+Math.sin(t*2.2)*0.08+low*0.04;
    const rot=0.0004*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.32; inner.rotation.y-=rot*0.42; quantumGroup.rotation.y+=0.0003+flowCH*0.0004; veins.rotation.y+=0.001+flowCH*0.0008;
    qMat.opacity=0.18*master+flowCH*0.06+low*0.04; veinMat.opacity=0.32*master+innerCH*0.12+low*0.06;
    const vPos=veinGeo.attributes.position.array as Float32Array;
    for(let i=0;i<veinCount;i++){ flowSpeeds[i]+=0.016+flowCH*0.012; if(flowSpeeds[i]>6.28) flowSpeeds[i]=0; vPos[i*3+2]=(Math.sin(flowSpeeds[i]+i*0.1))*0.12; }
    veinGeo.attributes.position.needsUpdate=true;
    inner.scale.setScalar((1.08+innerCH*0.06+Math.sin(t*2.2)*0.04)*heartbeat); glow.scale.setScalar(1.32+innerCH*0.06+Math.sin(t*2.2)*0.04); innerGlow.scale.setScalar(1.18+innerCH*0.08+Math.sin(t*2.2)*0.05);
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); try{mount.removeChild(renderer.domElement);}catch{}; renderer.dispose(); if(ws) ws.close(); };
 },[]);
 const dmxMap=[
  {ch:'CH1',name:'PROP',val:dmxDisplay.ch1,color:'#88ffff'},
  {ch:'CH2',name:'BLOOM',val:dmxDisplay.ch2,color:'#ff88ff'},
  {ch:'CH3',name:'FLOW',val:dmxDisplay.ch3,color:'#88ff88'},
  {ch:'CH4',name:'RGB',val:dmxDisplay.ch4,color:'#ffaa00'},
  {ch:'CH5',name:'PART',val:dmxDisplay.ch5,color:'#88ffff'},
  {ch:'CH6',name:'CODE',val:dmxDisplay.ch6,color:'#22aaff'},
  {ch:'CH7',name:'SAT',val:dmxDisplay.ch7,color:'#ffffff'},
  {ch:'CH8',name:'INNER',val:dmxDisplay.ch8,color:'#88ffff'},
  {ch:'CH9',name:'PYR',val:dmxDisplay.ch9,color:'#ff88aa'},
  {ch:'CH10',name:'MASTER',val:dmxDisplay.ch10,color:'#ffffff'},
 ];
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (dmxOn?'#88ffff':'#ffaa00') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V110 FINAL LIVING 1.32 QUANTUM DMX 0.08 MATRICIEL 512 DMX ${dmxOn?'WS OK':'SYNTH'} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V110'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',flexDirection:'column',gap:8}}><div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',background:'rgba(0,0,0,0.85)',padding:10,borderRadius:16,border:'1px solid rgba(136,255,255,0.2)'}}>{dmxMap.map(d=><div key={d.ch} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:d.ch==='CH10'?'#fff':'rgba(17,17,17,0.9)',color:d.ch==='CH10'?'#000':d.color,padding:'6px 10px',borderRadius:12,fontSize:9,fontWeight:900,border:`1px solid ${d.color}40`,minWidth:62}}><span style={{fontSize:8,opacity:0.7}}>{d.ch}</span><span style={{fontSize:8}}>{d.name}</span><span style={{fontSize:11}}>{d.val}</span><div style={{width:40,height:3,background:'#333',borderRadius:999,overflow:'hidden'}}><div style={{width:`${(d.val/255)*100}%`,height:'100%',background:d.color}} /></div></div>)}</div><button style={{padding:12,borderRadius:999,border:'1px solid rgba(136,255,255,0.3)',background:dmxOn?'#88ffff':'#ffaa00',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>💎 V110 FINAL LIVING ORGANIC HEARTBEAT QUANTUM DMX 0.08 + MATRICIEL 512 INSTANCED + ZOOM 1.32 TRANS 0.18 NOYAU 1.32</button></div></div>);
}
