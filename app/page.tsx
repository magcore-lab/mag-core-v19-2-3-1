
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V87 FINAL MASTER - DIAMANT 1.4/1.7/2.1 + 66 BRANCHES + NOYAU ENERGIE CONVENABLE 1.15 + 7 SAT 0.54 SANS HALO SANS TIGE SANS REFLET 1.82 ZOOM
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:128,ch5:140,ch6:80,ch7:160,ch8:90,ch9:70,ch10:210});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [strobeOn,setStrobeOn]=useState(false);
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100); camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.42,0.38,0.78); composer.addPass(bloom);
  setMods({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){ (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); }); }
  let ws:any=null; let retry=0;
  const connectWS=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true})); }; ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??128),ch5:cl(c[4]??140),ch6:cl(c[5]??80),ch7:cl(c[6]??160),ch8:cl(c[7]??90),ch9:cl(c[8]??70),ch10:cl(c[9])}; if((msg as any).type==='artnet') setMods(mm=>({...mm,artnet:true})); if((msg as any).type==='sacn') setMods(mm=>({...mm,sacn:true})); } }catch{} }; ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(10000,400*Math.pow(2,retry++))); }; ws.onerror=()=>{ try{ws.close();}catch{} }; }catch{} }; connectWS();
  try{ const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext; const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512; const data=new Uint8Array(256); const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start(); const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255; const mid=data.slice(10,60).reduce((a,b)=>a+b,0)/50/255; const high=data.slice(60,128).reduce((a,b)=>a+b,0)/68/255; audioRef.current={low,mid,high}; setMods(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop(); }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then((midi:any)=>{ for(const input of midi.inputs.values()){ input.onmidimessage=(e:any)=>{ const [st]=e.data; if(st===144) setMods(mm=>({...mm,midi:true})); }; } }); } }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.28));
  const key=new THREE.PointLight(0xffffff,72,24); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0x88ccff,42,18); fill.position.set(-4,2,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0x88ffff,62,8); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,38,5); coreLight2.position.set(0,0,1.8); scene.add(coreLight2);
  const strobeLight=new THREE.PointLight(0xffffff,0,9); scene.add(strobeLight);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.82); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const SAT_COUNT=7; const RADIUS=0.54;
  // DIAMANT ELARGI 1.4/1.7/2.1 - SANS REFLET (pas de envMap)
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.32})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.18})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.08})); cageGroup.add(outer3);
  for(let k=0;k<3;k++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4+k*0.38,0.0045,12,128),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18})); ring.rotation.x=Math.PI/2.5+k*0.42; ring.rotation.y=k*0.78; cageGroup.add(ring);
  }
  // 66 BRANCHES + DISP 0.35/0.42 SCATTER 4.2R - SANS TIGE COEUR->SAT
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*1.4*1.5,Math.sin(a)*1.4*1.5,0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length(); if(len<0.1) return;
    const cyl=new THREE.CylinderGeometry(0.0032,0.0032,len,6);
    const mat=new THREE.MeshStandardMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.32,transparent:true,opacity:0.22} as any);
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    branches.push({mesh,mat,p1,p2});
  };
  satPos.forEach((p,i)=>{ mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(2.1)); });
  for(let i=0;i<36;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(1.4); const b=new THREE.Vector3().randomDirection().multiplyScalar(1.4); mkBranch(a,b); }
  // FLOW PARTICLES 256 SUR BRANCHES
  const flowGeo=new THREE.BufferGeometry(); const flowCount=256; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; if(!b) continue; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0x88ffff,size:0.018,transparent:true,opacity:0.38}); const flowPoints=new THREE.Points(flowGeo,flowMat); branchGroup.add(flowPoints);
  // NOYAU ENERGIE CONVENABLE - DIAMANT + COEUR
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uLow; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0); float q=sin(uT*2.2+length(vN)*5.0)*0.12; float c=0.48+uI*0.32+q+uLow*0.18; float g=0.20+f*0.38*uI; vec3 col=vec3(0.42,0.88,1.0)*(c+g); col+=vec3(0.18,0.42,0.92)*f*uI*0.52; col*=uE; gl_FragColor=vec4(col,0.86); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.72},uE:{value:0.88},uLow:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.15,transparent:true,opacity:0.88} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat); coreGroup.add(inner);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.12} as any)); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.48,32,32),new THREE.MeshBasicMaterial({color:0x22aaff,transparent:true,opacity:0.06} as any)); coreGroup.add(glow2);
  // 7 SAT SANS HALO SANS TIGE - ENERGIE MAITRISEE 32.0
  const sats:any[]=[];
  for(let i=0;i<SAT_COUNT;i++){
    const ang=i*(360/SAT_COUNT)*Math.PI/180;
    const core=new THREE.Mesh(new THREE.SphereGeometry(0.026,16,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:1.28} as any));
    const g=new THREE.Group(); g.add(core);
    g.position.set(Math.cos(ang)*RADIUS,Math.sin(ang)*RADIUS,0); satGroup.add(g);
    const l=new THREE.PointLight(0x88ffff,28.0,3.2); l.position.copy(g.position); satGroup.add(l);
    sats.push({group:g,core,light:l,baseAngle:ang,radius:RADIUS,phase:Math.random()*6.28});
  }
  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.42; middleMat.uniforms.uE.value=0.88; innerMat.emissiveIntensity=1.15; inner.scale.setScalar(1.06); glow.scale.setScalar(1.18); coreLight.intensity=62; coreLight2.intensity=38; renderer.toneMappingExposure=0.82; }; setTimeout(ignite,200); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  window.addEventListener('keydown',(e:any)=>{ if(e.code==='Space') setStrobeOn(s=>!s); });
  let t=0; let raf=0; const flowSpeeds=new Float32Array(256).map(()=>Math.random()); let lastFlash=0; let isFlashing=false;
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    middleMat.uniforms.uT.value=t; middleMat.uniforms.uLow.value=audioRef.current.low;
    middleMat.uniforms.uI.value=0.72+Math.sin(t*2.2)*0.12+audioRef.current.low*0.18;
    const dmx=dmxRef.current; const master=dmx.ch10/255; const ch5=dmx.ch5/255; const {low,mid,high}=audioRef.current;
    if(strobeOn){
      const interval=0.72 - ch5*0.42 - low*0.12;
      if(!isFlashing && t-lastFlash>interval){ isFlashing=true; lastFlash=t; strobeLight.intensity=95; bloom.strength=0.62; renderer.toneMappingExposure=0.94; }
      if(isFlashing && t-lastFlash>0.12){ isFlashing=false; strobeLight.intensity=0; bloom.strength=0.42+low*0.18; renderer.toneMappingExposure=0.82; }
    }
    const prop=(dmx.ch1/255)*0.8*master;
    const flowMod=(dmx.ch3/255)*0.9+mid*0.4;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<256;i++){ const b=branches[i%branches.length]; if(!b) continue; flowSpeeds[i]+=0.018+flowMod*0.016; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    sats.forEach((s:any)=>{
      s.baseAngle+=0.0014+prop*0.0008+low*0.0006;
      const r=s.radius+Math.sin(t*0.6+s.phase)*0.004+high*0.008;
      const ang=s.baseAngle; const x=Math.cos(ang)*r; const y=Math.sin(ang)*r;
      s.group.position.set(x,y,0); s.light.position.set(x,y,0);
      s.light.intensity=28.0+high*12+Math.sin(t*1.6+s.phase)*4;
      s.core.scale.setScalar(1.0+high*0.32+Math.sin(t*1.8+s.phase)*0.10);
    });
    const rot=0.0008*(0.5+prop); coreGroup.rotation.y+=rot; branchGroup.rotation.y-=rot*0.28; cageGroup.rotation.y+=rot*0.18; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.52; satGroup.rotation.z+=rot*0.22;
    composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on? (strobeOn?'#ffffff':'#88ffff') :'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.12em',zIndex:10}}>{on?`V87 FINAL MASTER DIAMANT 1.4/1.7/2.1 + 66 BRANCHES + NOYAU 1.15 + 7 SAT 0.54 ${strobeOn?'STROBO':'MASTER'} ${dmxOn?'DMX WS':'DMX SYNTH'} ${Object.values(mods).filter(Boolean).length}/7 MODS`:'IGNITION V87 FINAL MASTER'}</div><div style={{position:'fixed',bottom:12,left:12,right:12,zIndex:10,display:'flex',gap:8}}><button onClick={()=>setStrobeOn(s=>!s)} style={{flex:1,padding:14,borderRadius:999,border:0,background:strobeOn?'#ffffff':'#88ffff',color:'#000',fontSize:11,fontWeight:900,letterSpacing:'0.10em'}}>{strobeOn?'⚡ FINAL MASTER + STROBO BLANC 120ms [SPACE]':'💎 FINAL MASTER DIAMANT + 66 BRANCHES + NOYAU ENERGIE CONVENABLE 1.15'} - 7 SAT SANS HALO 0 TIGE 1.82 ZOOM</button></div></div>);
}
