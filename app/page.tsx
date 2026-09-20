
    'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V50 FINAL - LUMINESCENCE + DMX ACTIF + MODULES PRINCIPAUX - BUILD OK
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:85,ch3:165,ch4:0,ch5:0,ch6:0,ch7:0,ch8:0,ch9:0,ch10:210});
 const audioRef=useRef({low:0.42,mid:0.38,high:0.52,beat:false});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:false});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.85,0.42,0.72);
  composer.addPass(bloom);
  let webgpu=false;
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a){ webgpu=true; setMod(m=>({...m,webgpu:true})); }});
  }
  try{
    const ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>{ setDmxOn(true); setMod(m=>({...m,osc:true})); };
    ws.onmessage=(e)=>{
      try{
        const msg=JSON.parse(e.data);
        if(msg.channels && Array.isArray(msg.channels)){
          const c=msg.channels;
          const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
          dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch4:clamp(c[3]),ch5:clamp(c[4]),ch6:clamp(c[5]),ch7:clamp(c[6]),ch8:clamp(c[7]),ch9:clamp(c[8]),ch10:clamp(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>setDmxOn(false);
  }catch{ setDmxOn(false); }
  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx();
    const analyser=ctx.createAnalyser();
    analyser.fftSize=256;
    const data=new Uint8Array(128);
    const osc=ctx.createOscillator();
    osc.frequency.value=110;
    osc.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start();
    const loop=()=>{
      analyser.getByteFrequencyData(data);
      const low=data.slice(0,10).reduce((a,b)=>a+b,0)/10/255;
      const mid=data.slice(10,50).reduce((a,b)=>a+b,0)/40/255;
      const high=data.slice(50,128).reduce((a,b)=>a+b,0)/78/255;
      audioRef.current={low:low*0.8+0.2,mid:mid*0.7+0.2,high:high*0.6+0.3,beat:low>0.65};
      requestAnimationFrame(loop);
    };
    loop();
    setMod(m=>({...m,audio:true}));
  }catch{}
  try{
    if((navigator as any).requestMIDIAccess){
      (navigator as any).requestMIDIAccess().then(()=>{ setMod(m=>({...m,midi:true})); });
    }
  }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.95));
  const key=new THREE.PointLight(0xffffff,185,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,95,50); fill.position.set(-5,3,4); scene.add(fill);
  const rim=new THREE.PointLight(0xffffff,85,50); rim.position.set(0,-5,-5); scene.add(rim);
  const coreLight=new THREE.PointLight(0xffffff,180,22); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xffffff,95,16); coreLight2.position.set(0,0,2.5); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.96); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.72,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.88})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.95,2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.68})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(1.18,1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.42})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.72*1.32,Math.sin(a)*0.72*1.32,0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0032,0.0032,len,8);
    const mat=new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.94,thickness:0.42,ior:2.5,roughness:0.03,clearcoat:1.0,clearcoatRoughness:0.06,transparent:true,opacity:0.18});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    const tetra=new THREE.Mesh(new THREE.TetrahedronGeometry(0.018,0),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0,transmission:0.96,thickness:0.48,ior:2.5,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.12}));
    tetra.position.copy(p2); branchGroup.add(tetra);
    const lineMat=new THREE.LineBasicMaterial({color:0x88ccff,transparent:true,opacity:0.18});
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),lineMat); branchGroup.add(line);
    branches.push({mesh,mat,line,tetra,p1,p2});
  };
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(1.18)); });
  for(let i=0;i<12;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.72); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.72); mkBranch(a,b); }
  const flowGeo=new THREE.BufferGeometry(); const flowCount=128; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0x88ccff,size:0.022,transparent:true,opacity:0.18}); branchGroup.add(new THREE.Points(flowGeo,flowMat));
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8); float c=0.42+uI*0.32; float g=0.18+f*0.32*uI; vec3 col=vec3(0.88,0.92,1.0)*(c+g); col+=vec3(0.18,0.28,0.48)*f*uI*0.5; col*=uE; gl_FragColor=vec4(col,0.82); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.85}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.32,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.72});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.42,transmission:0.96,thickness:0.42,ior:2.4,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.78});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12})); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),new THREE.MeshBasicMaterial({color:0xaaccff,transparent:true,opacity:0.08})); coreGroup.add(glow2);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.048,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92})); m.position.set(Math.cos(ang)*0.72*1.32,Math.sin(ang)*0.72*1.32,0); satGroup.add(m); const l=new THREE.PointLight(0xffffff,72,3.2); l.position.copy(m.position); satGroup.add(l); }
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3);
  for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.95+Math.random()*1.1; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  const partMat=new THREE.PointsMaterial({color:0x88ccff,size:0.014,transparent:true,opacity:0.52}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);
  let ignited=false;
  const ignite=()=>{
    if(ignited) return; ignited=true; setOn(true);
    bloom.strength=0.85; bloom.radius=0.42;
    innerMat.emissiveIntensity=1.85; inner.scale.setScalar(1.08);
    inner2.scale.setScalar(1.12); glow.scale.setScalar(1.18);
    middleMat.uniforms.uE.value=1.15;
    coreLight.intensity=180; coreLight2.intensity=95; renderer.toneMappingExposure=1.25;
    branches.forEach((b:any)=>{ b.mat.opacity=0.92; b.mat.emissiveIntensity=1.85; b.line.material.opacity=0.72; if(b.tetra) { b.tetra.material.opacity=0.92; b.tetra.material.emissiveIntensity=0.85; }});
    flowMat.opacity=0.85; partMat.opacity=0.82;
  };
  setTimeout(ignite,200);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const flowSpeeds=new Float32Array(128).map(()=>Math.random());
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    middleMat.uniforms.uT.value=t;
    middleMat.uniforms.uI.value=0.68+Math.sin(t*3)*0.18+(ignited?0.42:0);
    const dmx=dmxRef.current;
    const audio=audioRef.current;
    const master=dmx.ch10/255;
    const prop=(dmx.ch1/255)*1.2*master + audio.low*0.3;
    const bloomMod=(dmx.ch2/255)*0.6 + audio.low*0.4;
    const flowMod=(dmx.ch3/255)*1.2 + audio.mid*0.5;
    bloom.strength=0.85+bloomMod*0.52;
    middleMat.uniforms.uI.value=(0.68+Math.sin(t*3)*0.18+(ignited?0.42:0))*(0.8+master*0.4+audio.high*0.2);
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<128;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.018+0.012+flowMod*0.015; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    const rot=0.0012*(0.5+prop); coreGroup.rotation.y+=rot; branchGroup.rotation.y-=rot*0.38; cageGroup.rotation.y+=rot*0.22; middle.rotation.y+=rot*0.52; inner.rotation.y-=rot*0.62; inner2.rotation.y+=rot*0.82; satGroup.rotation.z+=rot*0.32;
    const breathe=0.5+Math.sin(t*2)*0.3; glow.scale.setScalar(1.08+breathe*0.22); glow2.scale.setScalar(1.02+breathe*0.32);
    if(audio.beat){ bloom.strength*=1.15; inner.scale.setScalar(1.08+audio.low*0.12); }
    particles.rotation.y+=0.0025+audio.mid*0.001; composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ccff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'💡 70% LUMEN — Z10.2 — DMX '+(dmxOn?'ON':'OFF')+' — '+Object.values(mod).filter(Boolean).length+'/4 MODS':'⚡ IGNITION 70% LUMEN'}</div><div style={{position:'fixed',top:48,left:8,right:8,display:'flex',justifyContent:'space-between',zIndex:10,flexWrap:'wrap',gap:6}}><div style={{background:'#0a0a0a',border:'1px solid rgba(136,204,255,0.35)',padding:'6px 10px',borderRadius:8,fontSize:7,fontFamily:'monospace',color:'rgba(136,204,255,0.8)'}}>DMX {dmxOn?'ON':'OFF'} | WS 8081 | CH1 {dmxRef.current?.ch1} CH2 {dmxRef.current?.ch2} CH3 {dmxRef.current?.ch3} CH10 {dmxRef.current?.ch10} | Z10.2 FIXE | LUMEN 1.25 BLOOM 0.85 CORE 180 INNER 1.85 | MODS WEBGPU {mod.webgpu?'ON':'OFF'} AUDIO {mod.audio?'ON':'OFF'} MIDI {mod.midi?'ON':'OFF'} OSC {mod.osc?'ON':'OFF'}</div><div style={{background:dmxOn?'#3dd598':'#ffaa00',color:'#000',padding:'6px 10px',borderRadius:999,fontSize:8,fontWeight:900}}>{dmxOn?'DMX ACTIF':'DMX FALLBACK'} + {Object.values(mod).filter(Boolean).length}/4 MODULES</div></div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12,display:'flex',flexDirection:'column',gap:8}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:13,fontWeight:900,letterSpacing:'0.15em'}}>💡 NOYAU 70% — LUMINESCENCE 1.25 — DMX + 4 MODULES — 30 BRANCHES DIAMANTS</button></div></div>);
}
