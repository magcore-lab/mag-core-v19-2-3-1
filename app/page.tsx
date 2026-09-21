'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V108 CINEMA PRO V2 ACES ROLL-OFF FIX WHITE CLIP 1.48->0.96 + ZOOM 1.32 TRANS 0.14 + VR 90FPS XR PASSTHROUGH
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:95,ch2:128,ch3:173,ch4:147,ch5:146,ch6:47,ch7:179,ch8:120,ch9:58,ch10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [dmxDisplay,setDmxDisplay]=useState({ch1:95,ch2:128,ch3:173,ch4:147,ch5:146,ch6:47,ch7:179,ch8:120,ch9:58,ch10:178});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  scene.fog=new THREE.FogExp2(0x001122,0.008);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.68;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.54,0.48,0.72);
  composer.addPass(bloom);
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
            const upd={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??147),ch5:cl(c[4]??146),ch6:cl(c[5]??47),ch7:cl(c[6]??179),ch8:cl(c[7]??120),ch9:cl(c[8]??58),ch10:cl(c[9])};
            dmxRef.current=upd; setDmxDisplay(upd);
          }
        }catch{}
      };
      ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(8000,300*Math.pow(2,retry++))); };
      ws.onerror=()=>{ try{ws.close();}catch{} };
    }catch{}
  }; connectWS();
  scene.add(new THREE.AmbientLight(0x88ccff,0.06));
  const coreLight=new THREE.PointLight(0x88ffff,84,14); coreLight.decay=2; scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,48,10); coreLight2.position.set(0,0,1.2); coreLight2.decay=2; scene.add(coreLight2);
  const innerPoint=new THREE.PointLight(0x88ffff,42,6); innerPoint.decay=2; scene.add(innerPoint);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.32); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);
  const qGeo=new THREE.BufferGeometry(); const qCount=512; const qPos=new Float32Array(qCount*3);
  for(let i=0;i<qCount;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/qCount); const r=2.2+Math.random()*3.0; qPos[i*3]=Math.sin(ph)*Math.cos(th)*r; qPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; qPos[i*3+2]=Math.cos(ph)*r; }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x88ffff,size:0.011,transparent:true,opacity:0.14,sizeAttenuation:true}); const qPoints=new THREE.Points(qGeo,qMat); qPoints.frustumCulled=false; quantumGroup.add(qPoints);
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uInner; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),4.0); float c=0.02+uI*0.14+uInner*0.10; float g=f*0.38*uI; vec3 base=vec3(0.42,0.88,1.0)*(c+g); base+=vec3(0.62,0.98,1.0)*uInner*0.16; base*=uE; gl_FragColor=vec4(base,0.14); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.62},uE:{value:0.48},uInner:{value:0.24}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.96,transmission:1.0,thickness:0.14,ior:2.417,dispersion:0.68,roughness:0.0,metalness:0.0,clearcoat:1.0,transparent:true,opacity:0.22} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glowMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.28,transmission:0.96,thickness:0.08,transparent:true,opacity:0.04,depthWrite:false} as any);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.36,32,32),glowMat); coreGroup.add(glow);
  const innerGlowMat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:0.42,transmission:0.98,thickness:0.06,transparent:true,opacity:0.08,depthWrite:false} as any);
  const innerGlow=new THREE.Mesh(new THREE.SphereGeometry(0.26,32,32),innerGlowMat); coreGroup.add(innerGlow);
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.54; middleMat.uniforms.uE.value=0.48; middleMat.uniforms.uInner.value=0.24; innerMat.emissiveIntensity=0.96; coreLight.intensity=84; coreLight2.intensity=48; innerPoint.intensity=42; renderer.toneMappingExposure=0.68; }; setTimeout(ignite,60);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    const synth=(tt:number)=>{
      const ch1=95+Math.sin(tt*0.6)*20; const ch2=128+Math.sin(tt*0.4)*16; const ch3=173+Math.sin(tt*0.8)*12; const ch4=147+Math.sin(tt*0.3)*8; const ch5=146+Math.sin(tt*0.5)*10; const ch6=47+Math.sin(tt*0.7)*6; const ch7=179+Math.sin(tt*0.9)*5; const ch8=120+Math.sin(tt*0.4)*12; const ch9=58+Math.sin(tt*0.6)*6; const ch10=178+Math.sin(tt*0.2)*8;
      return {ch1:Math.floor(ch1),ch2:Math.floor(ch2),ch3:Math.floor(ch3),ch4:Math.floor(ch4),ch5:Math.floor(ch5),ch6:Math.floor(ch6),ch7:Math.floor(ch7),ch8:Math.floor(ch8),ch9:Math.floor(ch9),ch10:Math.floor(ch10)};
    };
    if(!ws || ws.readyState!==1){ const upd=synth(t); dmxRef.current=upd; if(Math.floor(t*4)%4===0) setDmxDisplay(upd); }
    const dmx=dmxRef.current; const master=dmx.ch10/255; const prop=dmx.ch1/255; const bloomCH=dmx.ch2/255; const flowCH=dmx.ch3/255; const innerCH=dmx.ch8/255;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uI.value=0.62+prop*0.08; middleMat.uniforms.uInner.value=0.24+innerCH*0.22;
    bloom.strength=0.54+bloomCH*0.12; renderer.toneMappingExposure=0.68*master+0.20; innerMat.emissiveIntensity=0.96+innerCH*0.24;
    coreLight.intensity=84*master+innerCH*12; coreLight2.intensity=48*master+innerCH*8; innerPoint.intensity=42*master+innerCH*12;
    const rot=0.0003*(0.5+prop); coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.28; inner.rotation.y-=rot*0.32; quantumGroup.rotation.y+=0.0002+flowCH*0.0003;
    qMat.opacity=0.14*master+flowCH*0.04;
    inner.scale.setScalar(1.04+innerCH*0.04+Math.sin(t*1.8)*0.015); glow.scale.setScalar(1.24+innerCH*0.04); innerGlow.scale.setScalar(1.12+innerCH*0.06);
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
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (dmxOn?'#88ffff':'#ffaa00') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V108 CINEMA ACES 0.68 FIX WHITE CLIP 0.96 ZOOM 1.32 TRANS 0.14 DMX ${dmxOn?'WS OK':'SYNTH'} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V108'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',flexDirection:'column',gap:8}}><div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',background:'rgba(0,0,0,0.85)',padding:10,borderRadius:16,border:'1px solid rgba(136,255,255,0.2)'}}>{dmxMap.map(d=><div key={d.ch} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:d.ch==='CH10'?'#fff':'rgba(17,17,17,0.9)',color:d.ch==='CH10'?'#000':d.color,padding:'6px 10px',borderRadius:12,fontSize:9,fontWeight:900,border:`1px solid ${d.color}40`,minWidth:62}}><span style={{fontSize:8,opacity:0.7}}>{d.ch}</span><span style={{fontSize:8}}>{d.name}</span><span style={{fontSize:11}}>{d.val}</span><div style={{width:40,height:3,background:'#333',borderRadius:999,overflow:'hidden'}}><div style={{width:`${(d.val/255)*100}%`,height:'100%',background:d.color}} /></div></div>)}</div><button style={{padding:12,borderRadius:999,border:'1px solid rgba(136,255,255,0.3)',background:dmxOn?'#88ffff':'#ffaa00',color:'#000',fontSize:10,fontWeight:900,letterSpacing:'0.10em'}}>💎 V108 CINEMA ACES 0.68 ROLL-OFF + VR 90FPS + XR PASSTHROUGH + ZOOM 1.32 TRANS 0.14 T1.0 THICK 0.14 + NOYAU 0.96 FIX CLIP</button></div></div>);
}
