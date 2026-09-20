'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V39 DIAMANT DIFFUSION - NOYAU -> BRANCHES REFLEXIONS DIAMANTS - ENERGIE MAITRISEE
// CORE LOCK 0.62/0.78/0.92 R0.48 T0.995 IOR2.65 thickness0.52 Z10.71 - FIX 16:54 WHITE BLOB
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:48,ch3:135,ch10:180});
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?11.2:9.0);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=isMobile?0.82:0.98;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.32,0.48,0.86); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0x88ccff,0.72));
  const coreLight=new THREE.PointLight(0xaaddff,0,28); const coreLight2=new THREE.PointLight(0xffffff,0,18);
  scene.add(coreLight); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.84); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const diamondGroup=new THREE.Group(); coreGroup.add(diamondGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.28})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,4), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.22})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,3), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.18})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const mk=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.003,0.003,len,6);
    const mat=new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.72,thickness:0.28,ior:2.15,roughness:0.12,transparent:true,opacity:0});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize()); branchGroup.add(mesh);
    const tetra=new THREE.Mesh(new THREE.TetrahedronGeometry(0.018,0), new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:0.92,thickness:0.52,ior:2.15,roughness:0.08,transparent:true,opacity:0})); tetra.position.copy(p2); branchGroup.add(tetra);
    const lineMat=new THREE.LineBasicMaterial({color:0xaaddff,transparent:true,opacity:0}); const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]), lineMat); branchGroup.add(line);
    branches.push({mesh,mat,line,tetra,p1,p2});
  };
  satPos.forEach((p,i)=>{ mk(new THREE.Vector3(0,0,0),p); mk(p,satPos[(i+1)%6]); mk(p,p.clone().normalize().multiplyScalar(0.92)); });
  for(let i=0;i<12;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.62); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.62); mk(a,b); }
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const pos=new THREE.Vector3(Math.cos(ang)*0.92,Math.sin(ang)*0.92,0); const d=new THREE.Mesh(new THREE.OctahedronGeometry(0.028,0), new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.88,thickness:0.42,ior:2.15,transparent:true,opacity:0})); d.position.copy(pos); diamondGroup.add(d); branches.push({mesh:d,mat:d.material,line:{material:{opacity:0}},p1:pos,p2:pos,tetra:d}); }
  const flowGeo=new THREE.BufferGeometry(); const flowCount=128; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0xaaddff,size:0.038,transparent:true,opacity:0}); branchGroup.add(new THREE.Points(flowGeo,flowMat));
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8); float c=0.62+uI*0.68; float g=0.28+f*0.58*uI; vec3 base=vec3(0.92,0.94,1.0); vec3 col=base*(c+g); col+=vec3(0.22,0.32,0.52)*f*uI*0.9; col*=uE; gl_FragColor=vec4(col,0.92); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.98}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,6),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.42,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.04,clearcoat:1.0,transparent:true,opacity:0.92});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,5),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.62,transmission:0.92,thickness:0.38,ior:2.15,roughness:0.03,clearcoat:1.0,transparent:true,opacity:0.96});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,4),inner2Mat); coreGroup.add(inner2);
  const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; const mat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.32,transmission:0.42,thickness:0.22,ior:1.8,transparent:true,opacity:0.88}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.062,18,18),mat); m.position.set(Math.cos(a)*0.62*1.15,Math.sin(a)*0.62*1.15,0); satGroup.add(m); const l=new THREE.PointLight(0xaaddff,12,7); l.position.copy(m.position); satGroup.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(196*3); for(let i=0;i<196;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/196); const r=0.74+Math.random()*1.08; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); const partMat=new THREE.PointsMaterial({color:0x88ccff,size:0.012,transparent:true,opacity:0.48}); scene.add(new THREE.Points(partGeo,partMat));
  let ignition=0;
  const ignite=()=>{
    const start=performance.now(); const p1=600; const p2=1000; const total=p1+p2;
    const loop=()=>{
      const e=performance.now()-start;
      if(e<p1){ const pr=e/p1; const ease=1-Math.pow(1-pr,3); ignition=ease*1.08; const sc=0.06+ease*1.08; coreGroup.scale.setScalar(0.84*sc); middleMat.uniforms.uI.value=ignition; bloom.strength=0.22+ease*0.48; innerMat.emissiveIntensity=0.42+ease*1.85; inner2Mat.emissiveIntensity=0.62+ease*2.45; coreLight.intensity=ease*320; coreLight2.intensity=ease*180; satMats.forEach(m=>{m.emissiveIntensity=0.32+ease*1.42;}); satLights.forEach(l=>l.intensity=12+ease*32); branches.forEach((b:any)=>{ if(b.mat){ b.mat.opacity=0+ease*0.72; b.mat.emissiveIntensity=ease*1.42; } b.line.material.opacity=ease*0.52; }); flowMat.opacity=ease*0.72; partMat.opacity=0.48+ease*0.32; requestAnimationFrame(loop);
      } else if(e<total){ const pr=(e-p1)/p2; const ease=1-Math.pow(1-pr,2.5); ignition=1.08-ease*0.08; const sc=1.14-ease*0.06; coreGroup.scale.setScalar(0.84*sc); middleMat.uniforms.uI.value=ignition; bloom.strength=0.70-ease*0.28; innerMat.emissiveIntensity=2.27-ease*0.92; inner2Mat.emissiveIntensity=3.07-ease*1.32; coreLight.intensity=320-ease*155; coreLight2.intensity=180-ease*85; satMats.forEach(m=>m.emissiveIntensity=1.74-ease*0.54); satLights.forEach(l=>l.intensity=44-ease*14); branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; if(b.mat){ b.mat.opacity=0.72-ease*(isR?0.08:0.18); b.mat.emissiveIntensity=1.42-ease*0.22; } b.line.material.opacity=0.52-ease*(isR?0.08:0.14); }); flowMat.opacity=0.72-ease*0.10; if(pr>0.8&&navigator.vibrate) navigator.vibrate([50,25,70]); requestAnimationFrame(loop);
      } else { ignition=1.0; coreGroup.scale.setScalar(0.84*1.08); middleMat.uniforms.uI.value=1.0; bloom.strength=0.42; innerMat.emissiveIntensity=1.35; inner2Mat.emissiveIntensity=1.75; coreLight.intensity=165; coreLight2.intensity=95; satMats.forEach(m=>m.emissiveIntensity=1.20); satLights.forEach(l=>l.intensity=30); branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; if(b.mat){ b.mat.opacity=isR?0.64:0.48; b.mat.emissiveIntensity=1.20; } b.line.material.opacity=isR?0.44:0.34; }); flowMat.opacity=0.62; }
    }; loop();
  };
  setTimeout(ignite,100);
  let t=0; let raf=0; const flowSpeeds=new Float32Array(128).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t; const fPos=flowGeo.attributes.position.array as Float32Array; for(let i=0;i<128;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.020+ignition*0.022; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; } flowGeo.attributes.position.needsUpdate=true; const rot=0.0014*(dmxRef.current.ch1/255)*(1+ignition*0.8)*(dmxRef.current.ch10/255); coreGroup.rotation.y+=rot; branchGroup.rotation.y-=rot*0.38; cageGroup.rotation.y+=rot*0.22; middle.rotation.y+=rot*0.52; inner.rotation.y-=rot*0.85; inner2.rotation.y+=rot*1.05; satGroup.rotation.z+=rot*0.44; diamondGroup.rotation.y+=rot*0.32; composer.render(); }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:8,left:8,right:8,display:'flex',justifyContent:'space-between',zIndex:10}}><div style={{background:'#0a0a0a',border:'1px solid rgba(136,204,255,0.18)',padding:'7px 11px',borderRadius:8,fontSize:8,fontFamily:'monospace',color:'rgba(255,255,255,0.72)'}}>BRIDGE IP localhost | CONSOLE IP 192.168.1.100 | WS ws://localhost:8081 | CONSOLE LIVE GRANDMA/QLC+/ONYX | LIVE ON | WebGPU WGSL 2.399963 | DIAMANT IOR2.65 T0.995</div><div style={{background:'#88ccff',color:'#000',padding:'7px 13px',borderRadius:999,fontSize:9,fontWeight:900}}>NOYAU ACTIF DIFFUSION DIAMANT 0.62/0.78/0.92 0.48R 100% ON ENERGIE MAITRISEE</div></div></div>);
}z
