
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V103 NOYAU CENTRAL -10% 1.2056->1.085 COHERENCE LUMIERE FIX HOTSPOTS BLANCS + TRANSLUCIDE 0.52
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:140,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [dmxDisplay,setDmxDisplay]=useState({ch1:127,ch2:85,ch3:165,ch4:128,ch5:140,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.78;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.52,0.38,0.84);
  composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); });
  }
  let ws:any=null; let retry=0;
  const connectWS=()=>{
    try{
      ws=new WebSocket('ws://localhost:8081');
      ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); };
      ws.onmessage=(e:any)=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.channels){
            const c=msg.channels;
            const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
            const upd={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??140),ch6:cl(c[5]??80),ch7:cl(c[6]??160),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])};
            dmxRef.current=upd; setDmxDisplay(upd);
            if(msg.type==='artnet') setMods(mm=>({...mm,artnet:true,dmx:true}));
            if(msg.type==='sacn') setMods(mm=>({...mm,sacn:true,dmx:true}));
          }
        }catch{}
      };
      ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); };
      ws.onerror=()=>{ try{ws.close();}catch{} };
    }catch{}
  };
  connectWS();
  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512;
    const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start();
    const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255; const mid=data.slice(10,60).reduce((a,b)=>a+b,0)/50/255; const high=data.slice(60,128).reduce((a,b)=>a+b,0)/68/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.14));
  const coreLight=new THREE.PointLight(0x88ffff,84,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,52,5); coreLight2.position.set(0,0,1.2); scene.add(coreLight2);
  const innerPoint=new THREE.PointLight(0x88ffff,42,3); innerPoint.position.set(0,0,0); scene.add(innerPoint);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.0506); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);
  const qGeo=new THREE.BufferGeometry(); const qCount=512; const qPos=new Float32Array(qCount*3);
  for(let i=0;i<qCount;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/qCount); const r=1.8+Math.random()*2.4; qPos[i*3]=Math.sin(ph)*Math.cos(th)*r; qPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; qPos[i*3+2]=Math.cos(ph)*r; }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x88ffff,size:0.014,transparent:true,opacity:0.26}); const qPoints=new THREE.Points(qGeo,qMat); quantumGroup.add(qPoints);
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uLow; uniform float uHue; uniform float uBloom; uniform float uInner; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),3.0); float q=sin(uT*2.2+length(vN)*6.0)*0.08; float c=0.10+uI*0.32+q+uLow*0.10+uInner*0.12; float g=f*0.58*uI; vec3 base=vec3(0.42,0.88,1.0)*(c+g); base+=vec3(0.18,0.48,0.92)*f*uI*0.48 + vec3(0.52,0.92,1.0)*uInner*0.16; base*=uE*(1.0+uHue*0.12+uBloom*0.14); gl_FragColor=vec4(base,0.48); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.84},uE:{value:0.68},uLow:{value:0},uHue:{value:0},uBloom:{value:0},uInner:{value:0.28}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.085,transmission:0.98,thickness:0.52,ior:2.417,dispersion:0.48,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.52} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.12} as any)); coreGroup.add(glow);
  const innerGlow=new THREE.Mesh(new THREE.SphereGeometry(0.24,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.14} as any)); coreGroup.add(innerGlow);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.52; middleMat.uniforms.uE.value=0.68; middleMat.uniforms.uInner.value=0.28; innerMat.emissiveIntensity=1.085; inner.scale.setScalar(1.04); glow.scale.setScalar(1.18); innerGlow.scale.setScalar(1.08); coreLight.intensity=84; coreLight2.intensity=52; innerPoint.intensity=42; renderer.toneMappingExposure=0.78; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    if(!ws || ws.readyState!==1){
      const tt=t;
      const ch1=127+Math.sin(tt*0.6)*42; const ch2=85+Math.sin(tt*0.4)*28; const ch3=165+Math.sin(tt*0.8)*32; const ch4=128+Math.sin(tt*0.3)*18; const ch5=140+Math.sin(tt*0.5)*22; const ch6=80+Math.sin(tt*0.7)*16; const ch7=160+Math.sin(tt*0.9)*12; const ch8=90+Math.sin(tt*0.4)*20; const ch9=70+Math.sin(tt*0.6)*14; const ch10=210+Math.sin(tt*0.2)*18;
      const upd={ch1:Math.floor(ch1),ch2:Math.floor(ch2),ch3:Math.floor(ch3),ch4:Math.floor(ch4),ch5:Math.floor(ch5),ch6:Math.floor(ch6),ch7:Math.floor(ch7),ch8:Math.floor(ch8),ch9:Math.floor(ch9),ch10:Math.floor(ch10)};
      dmxRef.current=upd; if(Math.floor(tt*4)%4===0) setDmxDisplay(upd);
    }
    const dmx=dmxRef.current; const master=dmx.ch10/255; const prop=dmx.ch1/255; const bloomCH=dmx.ch2/255; const flowCH=dmx.ch3/255; const rgbCH=dmx.ch4/255; const partCH=dmx.ch5/255; const innerCH=dmx.ch8/255;
    const {low,high}=audioRef.current;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uLow.value=low*0.5+partCH*0.5; middleMat.uniforms.uHue.value=rgbCH; middleMat.uniforms.uI.value=0.84+Math.sin(t*2.2)*0.08+low*0.10+prop*0.12; middleMat.uniforms.uBloom.value=bloomCH; middleMat.uniforms.uInner.value=0.28+innerCH*0.24+low*0.10;
    bloom.strength=0.52+bloomCH*0.18+low*0.06; renderer.toneMappingExposure=0.78*master+0.28; innerMat.emissiveIntensity=1.085+innerCH*0.28+Math.sin(t*1.4)*0.04+low*0.08;
    coreLight.intensity=84*master+low*10+prop*6+innerCH*10; coreLight2.intensity=52*master+low*5+innerCH*6; innerPoint.intensity=42*master+low*8+innerCH*12;
    const rot=0.0006*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.36; inner.rotation.y-=rot*0.42; quantumGroup.rotation.y+=0.0005+flowCH*0.0008;
    qPoints.rotation.y+=0.0005+flowCH*0.0006; qMat.opacity=0.26*master+partCH*0.12; qMat.size=0.014+high*0.005+partCH*0.003;
    inner.scale.setScalar(1.04+low*0.06+innerCH*0.05+Math.sin(t*1.8)*0.02); glow.scale.setScalar(1.18+low*0.06+innerCH*0.05); innerGlow.scale.setScalar(1.08+low*0.06+innerCH*0.08);
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
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
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (dmxOn?'#88ffff':'#ffaa00') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10,boxShadow:'0 0 20px rgba(136,255,255,0.4)'}}>{on?`V103 NOYAU -10% 1.085 COHERENCE LUMIERE FIX DMX ${dmxOn?'WS OK':'SYNTH'} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V103'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',flexDirection:'column',gap:8}}><div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',background:'rgba(0,0,0,0.8)',padding:10,borderRadius:16,border:'1px solid rgba(136,255,255,0.2)'}}>{dmxMap.map(d=><div key={d.ch} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:d.ch==='CH10'?'#fff':'rgba(17,17,17,0.9)',color:d.ch==='CH10'?'#000':d.color,padding:'6px 10px',borderRadius:12,fontSize:9,fontWeight:900,border:`1px solid ${d.color}40`,minWidth:62}}><span style={{fontSize:8,opacity:0.7}}>{d.ch}</span><span style={{fontSize:8}}>{d.name}</span><span style={{fontSize:11}}>{d.val}</span><div style={{width:40,height:3,background:'#333',borderRadius:999,overflow:'hidden'}}><div style={{width:`${(d.val/255)*100}%`,height:'100%',background:d.color,transition:'width 0.2s'}} /></div></div>)}</div><button style={{padding:12,borderRadius:999,border:'1px solid rgba(136,255,255,0.3)',background:dmxOn?'#88ffff':'#ffaa00',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em',boxShadow:'0 0 20px rgba(136,255,255,0.3)'}}>💎 V103 NOYAU -10% 1.2056→1.085 COHERENCE LUMIERE FIX 3 HOTSPOTS BLANCS + DIAMANT 0.48 T0.98 + 1 HALO</button></div></div>);
}
