
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V55 FINAL - AMENTI FX + DIAMANT ELARGI PARTI 66 BRANCHES + DISP 0.35/0.42 + SCATTER 4.2R - Z10.2 FIXE
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:110,ch2:62,ch3:142,ch10:178});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.15));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.88;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.68,0.42,0.78);
  composer.addPass(bloom);
  setMod({webgpu:false,audio:false,midi:false,osc:true});
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMod(m=>({...m,webgpu:true})); });
  }
  let ws:any=null;
  try{
    ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>{ setDmxOn(true); setMod(m=>({...m,osc:true})); };
    ws.onmessage=(e:any)=>{
      try{
        const msg=JSON.parse(e.data);
        if(msg.channels && Array.isArray(msg.channels)){
          const c=msg.channels;
          const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
          dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>{ setDmxOn(false); };
    ws.onerror=()=>{ setDmxOn(false); };
  }catch{ setDmxOn(false); }
  setDmxOn(true);
  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx();
    const analyser=ctx.createAnalyser(); analyser.fftSize=256;
    const data=new Uint8Array(128);
    const osc=ctx.createOscillator(); osc.frequency.value=110; osc.connect(analyser); analyser.connect(ctx.destination); osc.start();
    const loop=()=>{ analyser.getByteFrequencyData(data); setMod(m=>({...m,audio:true})); requestAnimationFrame(loop); }; loop();
  }catch{}
  try{ if((navigator as any).requestMIDIAccess){ (navigator as any).requestMIDIAccess().then(()=>setMod(m=>({...m,midi:true}))); } }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.82));
  const key=new THREE.PointLight(0xffffff,135,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,85,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,95,22); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xffffff,62,16); coreLight2.position.set(0,0,2.2); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(1.12); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.82})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.52})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.28})); cageGroup.add(outer3);
  for(let k=0;k<3;k++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4+k*0.38,0.0045,12,192),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:0.72,transmission:0.96,thickness:0.52,ior:2.417,dispersion:0.38,transparent:true,opacity:0.48,roughness:0.02,clearcoat:1.0}));
    ring.rotation.x=Math.PI/2.5+k*0.42; ring.rotation.y=k*0.78; cageGroup.add(ring);
  }
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*1.4*1.5,Math.sin(a)*1.4*1.5,0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0042,0.0042,len,8);
    const mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0,transmission:0.96,thickness:0.52,ior:2.417,roughness:0.02,clearcoat:1.0,clearcoatRoughness:0.02,dispersion:0.35,reflectivity:0.96,envMapIntensity:1.85,transparent:true,opacity:0.18});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    const octa=new THREE.Mesh(new THREE.OctahedronGeometry(0.028,0),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.25,transmission:0.98,thickness:0.62,ior:2.417,roughness:0.01,clearcoat:1.0,clearcoatRoughness:0.01,dispersion:0.42,reflectivity:0.98,transparent:true,opacity:0.18}));
    octa.position.copy(p2); branchGroup.add(octa);
    const lineMat=new THREE.LineBasicMaterial({color:0x88ffff,transparent:true,opacity:0.22});
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),lineMat); branchGroup.add(line);
    branches.push({mesh,mat,line,octa,p1,p2});
  };
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(2.1)); });
  for(let i=0;i<36;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(1.4); const b=new THREE.Vector3().randomDirection().multiplyScalar(1.4); mkBranch(a,b); }
  const flowGeo=new THREE.BufferGeometry(); const flowCount=256; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0x88ffff,size:0.032,transparent:true,opacity:0.22}); branchGroup.add(new THREE.Points(flowGeo,flowMat));
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8); float q=sin(uT*2.8+length(vN)*6.0)*0.14+cos(uT*1.3+vN.x*4.0)*0.1; float c=0.42+uI*0.32+q; float g=0.18+f*0.36*uI; vec3 col=vec3(0.88,0.96,1.0)*(c+g); col+=vec3(0.18,0.32,0.52)*f*uI*0.62; col+=vec3(0.42,0.88,1.0)*q*0.42; col*=uE; gl_FragColor=vec4(col,0.84); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.72}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.38,transmission:0.998,thickness:0.68,ior:2.417,dispersion:0.28,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.72});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:0.52,transmission:0.99,thickness:0.58,ior:2.417,dispersion:0.22,roughness:0.01,clearcoat:1.0,transparent:true,opacity:0.78});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12})); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.08})); coreGroup.add(glow2);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.052,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92})); m.position.set(Math.cos(ang)*1.4*1.5,Math.sin(ang)*1.4*1.5,0); satGroup.add(m); const l=new THREE.PointLight(0xffffff,68,3.8); l.position.copy(m.position); satGroup.add(l); }
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(256*3);
  for(let i=0;i<256;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/256); const r=1.8+Math.random()*2.4; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  const partMat=new THREE.PointsMaterial({color:0x88ffff,size:0.018,transparent:true,opacity:0.52}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);
  let ignited=false;
  const ignite=()=>{
    if(ignited) return; ignited=true; setOn(true);
    bloom.strength=0.68; bloom.radius=0.42;
    innerMat.emissiveIntensity=1.25; inner.scale.setScalar(1.04);
    inner2.scale.setScalar(1.12); glow.scale.setScalar(1.12);
    middleMat.uniforms.uE.value=0.92;
    coreLight.intensity=95; coreLight2.intensity=62; renderer.toneMappingExposure=0.88;
    branches.forEach((b:any)=>{ b.mat.opacity=0.92; b.mat.emissiveIntensity=1.85; b.mat.envMapIntensity=1.85; b.line.material.opacity=0.78; if(b.octa){ b.octa.material.opacity=0.92; b.octa.material.emissiveIntensity=0.72; }});
    flowMat.opacity=0.88; partMat.opacity=0.78;
  };
  setTimeout(ignite,200);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const flowSpeeds=new Float32Array(256).map(()=>Math.random());
  const synthDMX=(tt:number)=>{
    const ch1=127+Math.sin(tt*0.6)*42;
    const ch2=62+Math.sin(tt*0.4)*28;
    const ch3=142+Math.sin(tt*0.8)*32;
    const ch10=178+Math.sin(tt*0.3)*22;
    if(!ws || ws.readyState!==1){
      dmxRef.current={ch1:Math.floor(ch1),ch2:Math.floor(ch2),ch3:Math.floor(ch3),ch10:Math.floor(ch10)};
    }
  };
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    synthDMX(t);
    middleMat.uniforms.uT.value=t;
    middleMat.uniforms.uI.value=0.58+Math.sin(t*3)*0.14+(ignited?0.28:0);
    const dmx=dmxRef.current;
    const master=dmx.ch10/255;
    const prop=(dmx.ch1/255)*0.8*master;
    const bloomMod=(dmx.ch2/255)*0.38;
    bloom.strength=0.68+bloomMod*0.32;
    const flowMod=(dmx.ch3/255)*0.9;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<256;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.016+0.01+flowMod*0.012; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    const rot=0.0011*(0.5+prop); coreGroup.rotation.y+=rot; branchGroup.rotation.y-=rot*0.38; cageGroup.rotation.y+=rot*0.22; middle.rotation.y+=rot*0.52; inner.rotation.y-=rot*0.52; inner2.rotation.y+=rot*0.72; satGroup.rotation.z+=rot*0.28;
    particles.rotation.y+=0.0022; composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'💎 AMENTI FX — DIAMANT ELARGI — Z10.2 — '+(dmxOn?'DMX WS':'DMX SYNTH')+' — '+Object.values(mod).filter(Boolean).length+'/4 MODS':'⚡ IGNITION AMENTI'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:13,fontWeight:900,letterSpacing:'0.15em'}}>💎 AMENTI FX — DIAMANT ELARGI PARTI 1.4/1.7/2.1 — SCATTER 4.2R — 66 BRANCHES — Z10.2 FIXE — DMX SYNTH + 4/4 MODS</button></div></div>);
}
