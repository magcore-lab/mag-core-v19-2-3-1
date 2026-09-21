'use client';
// V19.2.3.19 RESTORE ALL AVANCES + NOYAU 15% ROND VISIBLE - PROD MUSIQUE CINEMA PRESS
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:110,ch2:62,ch3:142,ch10:178});
 const [on,setOn]=useState(false); const [dmxOn,setDmxOn]=useState(false); const [mod,setMod]=useState({webgpu:false,audio:false,midi:false,osc:true});
 useEffect(()=>{
  const mount=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768; const cam=new THREE.PerspectiveCamera(mob?38:36,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,mob?7.44:6.0);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.15));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.88; mount.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const bloom=new (UnrealBloomPass as any)(new THREE.Vector2(innerWidth,innerHeight),0.48,0.38,0.72); comp.addPass(bloom);
  let ws:any=null; try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>setDmxOn(true); ws.onmessage=(e:any)=>{ try{ const j=JSON.parse(e.data); if(j.channels){ const c=j.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; }catch{}
  sc.add(new THREE.AmbientLight(0xffffff,0.72));
  const key=new THREE.PointLight(0xffffff,105,30); key.position.set(4,4,5); sc.add(key);
  const fill=new THREE.PointLight(0xaaccff,65,30); fill.position.set(-4,3,4); sc.add(fill);
  const coreLight=new THREE.PointLight(0x88ffff,35,12); coreLight.position.set(0,0,1); sc.add(coreLight);
  const cg=new THREE.Group(); (cg as any).scale.setScalar(1.08); sc.add(cg);
  const cage=new THREE.Group(); cg.add(cage);
  const branch=new THREE.Group(); cg.add(branch);
  const sat=new THREE.Group(); cg.add(sat);
  // DIAMANT ELARGI 1.4/1.7/2.1 - ROND
  cage.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.4,3),new (THREE as any).MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.52,depthWrite:false})));
  cage.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2),new (THREE as any).MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.32,depthWrite:false})));
  cage.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1),new (THREE as any).MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.18,depthWrite:false})));
  // 3 ANNEAUX AMENTI
  for(let k=0;k<3;k++){ const r=new THREE.Mesh(new THREE.TorusGeometry(1.4+k*0.38,0.0042,12,192),new (THREE as any).MeshPhysicalMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:0.42,transmission:0.96,thickness:0.48,ior:2.417,dispersion:0.38,transparent:true,opacity:0.32,roughness:0.02,clearcoat:1.0,depthWrite:false} as any)); r.rotation.x=Math.PI/2.5+k*0.42; r.rotation.y=k*0.78; cage.add(r); }
  // 66 BRANCHES + SCATTER 4.2R
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[]; for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*1.4*1.5,Math.sin(a)*1.4*1.5,0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{ const dir=p2.clone().sub(p1); const len=dir.length(); const cyl=new THREE.CylinderGeometry(0.0038,0.0038,len,6); const mat=new (THREE as any).MeshPhysicalMaterial({color:0xffffff,emissive:0xaaffff,emissiveIntensity:0,transmission:0.96,thickness:0.48,ior:2.417,roughness:0.02,clearcoat:1.0,dispersion:0.35,transparent:true,opacity:0.14,depthWrite:false} as any); const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branch.add(mesh); const octa=new THREE.Mesh(new THREE.OctahedronGeometry(0.022,0),new (THREE as any).MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.18,transmission:0.98,thickness:0.52,ior:2.417,roughness:0.01,clearcoat:1.0,dispersion:0.42,transparent:true,opacity:0.14,depthWrite:false} as any)); octa.position.copy(p2); branch.add(octa); const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),new THREE.LineBasicMaterial({color:0x88ffff,transparent:true,opacity:0.14,depthWrite:false} as any)); branch.add(line); branches.push({mesh,mat,line,octa,p1,p2}); };
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(2.1)); });
  for(let i=0;i<36;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(1.4); const b=new THREE.Vector3().randomDirection().multiplyScalar(1.4); mkBranch(a,b); }
  // FLOW 256
  const flowGeo=new THREE.BufferGeometry(); const flowPos=new Float32Array(256*3); for(let i=0;i<256;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; } flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3)); branch.add(new THREE.Points(flowGeo,new (THREE as any).PointsMaterial({color:0x88ffff,size:0.028,transparent:true,opacity:0.18,depthWrite:false} as any)));
  // NOYAU 15% ROND VISIBLE - FRESNEL BLEU 15%
  const fresV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fresF='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6);float q=sin(uT*2.6)*0.05;float c=0.15+uI*0.32+q;float g=f*0.42*uI;vec3 base=vec3(0.72,0.88,1.0);vec3 col=base*(c+g)+vec3(0.32,0.72,1.0)*f*uI*0.48;col*=uE*1.4;gl_FragColor=vec4(col,0.62);}';
  const mMat=new (THREE as any).ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.15},uE:{value:0.32}},vertexShader:fresV,fragmentShader:fresF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const mid=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mMat); cg.add(mid);
  const innerMat=new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.28,transmission:0.994,thickness:0.52,ior:2.417,roughness:0.05,clearcoat:0.9,dispersion:0.28,transparent:true,opacity:0.48,depthWrite:false} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,48,48),innerMat); cg.add(inner);
  const inner2=new THREE.Mesh(new THREE.SphereGeometry(0.11,32,32),new (THREE as any).MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.28,depthWrite:false} as any)); cg.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.32,24,24),new (THREE as any).MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.04,depthWrite:false} as any)); cg.add(glow);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.042,16,16),new (THREE as any).MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.72,depthWrite:false} as any)); m.position.set(Math.cos(ang)*1.4*1.5,Math.sin(ang)*1.4*1.5,0); sat.add(m); const l=new THREE.PointLight(0xffffff,32,2.8); l.position.copy(m.position); sat.add(l); }
  // 256 PARTICULES RONDES
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(256*3); for(let i=0;i<256;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/256); const r=1.8+Math.random()*2.4; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); const partMat=new (THREE as any).PointsMaterial({color:0x88ffff,size:0.016,transparent:true,opacity:0.42,depthWrite:false} as any); sc.add(new THREE.Points(partGeo,partMat));
  // 156P RONDS
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=1.38+Math.random()*0.52; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.048+Math.random()*0.016; } geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; varying vec3 vC; void main(){vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (340.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.18,0.74,0.96),a*0.68);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true,depthWrite:false}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); (bloom as any).strength=0.48; (mMat as any).uniforms.uE.value=0.32; innerMat.emissiveIntensity=0.32; }; setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true});
  let t=0,raf=0; const flowSpeeds=new Float32Array(256).map(()=>Math.random());
  const synth=(tt:number)=>{ if(!ws||ws.readyState!==1){ dmxRef.current={ch1:127+Math.sin(tt*0.6)*42, ch2:62+Math.sin(tt*0.4)*28, ch3:142+Math.sin(tt*0.8)*32, ch10:178+Math.sin(tt*0.3)*22}; } };
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; synth(t); (mMat as any).uniforms.uT.value=t; (mMat as any).uniforms.uI.value=0.15+Math.sin(t*2.8)*0.03; const dmx=dmxRef.current; const prop=(dmx.ch1/255)*0.6*(dmx.ch10/255); const rot=0.0011*(0.5+prop); cg.rotation.y+=rot; mid.rotation.y+=rot*0.5; inner.rotation.y-=rot*0.4; pts.rotation.y+=0.0006; const fPos=flowGeo.attributes.position.array as Float32Array; for(let i=0;i<256;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.016+0.008; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; } flowGeo.attributes.position.needsUpdate=true; comp.render(); }; anim();
  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mount.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?(dmxOn?'#88ffff':'#3dd598'):'#3dd598',color:'#000',padding:'7px 18px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V19.2.3.19 RESTORE NOYAU 15% ROND • ${dmxOn?'DMX WS':'DMX SYNTH'} • 4/4 MODS`:'⚡ IGNITION RESTORE'}</div></div>);
}
