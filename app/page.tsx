
    'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V48 FINAL - GLOBAL ENERGIE TOUTES BRANCHES + COHERENCE 99.5% - BUILD OK
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:48,ch3:135,ch10:180});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
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
  renderer.toneMappingExposure=0.68;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.38,0.52,0.82);
  composer.addPass(bloom);
  try{
    const ws=new WebSocket('ws://localhost:8081');
    ws.onopen=()=>setDmxOn(true);
    ws.onmessage=(e)=>{
      try{
        const m=JSON.parse(e.data);
        if(m.channels && m.channels.length>=10){
          const c=m.channels;
          const clamp=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
          dmxRef.current={ch1:clamp(c[0]),ch2:clamp(c[1]),ch3:clamp(c[2]),ch10:clamp(c[9])};
        }
      }catch{}
    };
    ws.onclose=()=>setDmxOn(false);
  }catch{}
  scene.add(new THREE.AmbientLight(0xffffff,0.62));
  const key=new THREE.PointLight(0xffffff,90,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0xaaccff,55,50); fill.position.set(-5,3,4); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,72,18); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xffffff,42,12); coreLight2.position.set(0,0,2); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.84); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.92})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,2),new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.72})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,1),new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.48})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15,Math.sin(a)*0.62*1.15,0)); }
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.0025,0.0025,len,6);
    const mat=new THREE.MeshPhysicalMaterial({color:0xaaddff,emissive:0x88ccff,emissiveIntensity:0,transmission:0.92,thickness:0.38,ior:2.4,roughness:0.04,clearcoat:1.0,clearcoatRoughness:0.08,transparent:true,opacity:0.12});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    const tetra=new THREE.Mesh(new THREE.TetrahedronGeometry(0.014,0),new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:0.92,thickness:0.42,ior:2.15,roughness:0.06,transparent:true,opacity:0}));
    tetra.position.copy(p2); branchGroup.add(tetra);
    const lineMat=new THREE.LineBasicMaterial({color:0x88ccff,transparent:true,opacity:0});
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1,p2]),lineMat); branchGroup.add(line);
    branches.push({mesh,mat,line,tetra,p1,p2});
  };
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); mkBranch(p,p.clone().normalize().multiplyScalar(0.92)); });
  for(let i=0;i<12;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(0.62); const b=new THREE.Vector3().randomDirection().multiplyScalar(0.62); mkBranch(a,b); }
  const flowGeo=new THREE.BufferGeometry(); const flowCount=128; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0x88ccff,size:0.018,transparent:true,opacity:0}); branchGroup.add(new THREE.Points(flowGeo,flowMat));
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8); float c=0.32+uI*0.22; float g=0.12+f*0.22*uI; vec3 col=vec3(0.82,0.88,1.0)*(c+g); col+=vec3(0.14,0.22,0.42)*f*uI*0.4; col*=uE; gl_FragColor=vec4(col,0.72); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:0.62}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissiveIntensity:0.18,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.04,clearcoat:1.0,transparent:true,opacity:0.62});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0x88ccff,emissive:0x88ccff,emissiveIntensity:0.32,transmission:0.96,thickness:0.38,ior:2.15,roughness:0.03,clearcoat:1.0,transparent:true,opacity:0.68});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); coreGroup.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.06})); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32),new THREE.MeshBasicMaterial({color:0xaaccff,transparent:true,opacity:0.04})); coreGroup.add(glow2);
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const m=new THREE.Mesh(new THREE.SphereGeometry(0.042,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.82})); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satGroup.add(m); const l=new THREE.PointLight(0xffffff,42,2.5); l.position.copy(m.position); satGroup.add(l); }
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3);
  for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.75+Math.random()*0.7; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  const partMat=new THREE.PointsMaterial({color:0x88ccff,size:0.01,transparent:true,opacity:0.38}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);
  let ignited=false;
  const ignite=()=>{
    if(ignited) return; ignited=true; setOn(true);
    bloom.strength=0.52; bloom.radius=0.52;
    innerMat.emissiveIntensity=0.62; inner.scale.setScalar(0.92); middleMat.uniforms.uI.value=0.68;
    inner2.scale.setScalar(0.92); glow.scale.setScalar(1.05);
    coreLight.intensity=72; renderer.toneMappingExposure=0.68;
    branches.forEach((b:any)=>{ b.mat.opacity=0.82; b.mat.emissiveIntensity=1.15; b.line.material.opacity=0.52; if(b.tetra) b.tetra.material.opacity=0.88; });
    flowMat.opacity=0.78; partMat.opacity=0.68;
  };
  setTimeout(ignite,200);
  window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true});
  let t=0; let raf=0; const flowSpeeds=new Float32Array(128).map(()=>Math.random());
  const animate=()=>{
    raf=requestAnimationFrame(animate); t+=0.016;
    middleMat.uniforms.uT.value=t;
    middleMat.uniforms.uI.value=0.52+Math.sin(t*3)*0.12+(ignited?0.28:0);
    const dmx=dmxRef.current;
    const master=dmx.ch10/255;
    const prop=(dmx.ch1/255)*0.8*master;
    const bloomMod=(dmx.ch2/255)*0.3;
    bloom.strength=0.52+bloomMod*0.22;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<128;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.012+0.008; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    const rot=0.0008*(0.5+prop); coreGroup.rotation.y+=rot; branchGroup.rotation.y-=rot*0.32; cageGroup.rotation.y+=rot*0.18; middle.rotation.y+=rot*0.42; inner.rotation.y-=rot*0.42; inner2.rotation.y+=rot*0.58; satGroup.rotation.z+=rot*0.22;
    const breathe=0.5+Math.sin(t*2)*0.2; glow.scale.setScalar(1.02+breathe*0.08); glow2.scale.setScalar(1.0+breathe*0.12);
    particles.rotation.y+=0.0015; composer.render();
  }; animate();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); };
  window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ccff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.15em',zIndex:10}}>{on?'🌐 70% GLOBAL — Z10.2 FIXE — DMX '+(dmxOn?'ON':'OFF'):'⚡ IGNITION 70% Z10.2'}</div><div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:10,padding:12,display:'flex',flexDirection:'column',gap:8}}><button style={{padding:14,borderRadius:999,border:0,background:'#fff',color:'#000',fontSize:13,fontWeight:900,letterSpacing:'0.15em'}}>🌐 NOYAU 70% — GLOBAL — 30 BRANCHES DIAMANTS — 99.5% COHERENCE</button></div></div>);
}
