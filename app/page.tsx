'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const cam=new THREE.PerspectiveCamera(28,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,7.2);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.4)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.42; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.32,0.28,0.72); comp.addPass(blo);
  // Lumières -30% énergie noyau
  const cl=new THREE.PointLight(0x88ffff,28,10); sc.add(cl); const cl2=new THREE.PointLight(0xaaffff,14,8); cl2.position.set(0,0,2); sc.add(cl2);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  const branchGroup=new THREE.Group(); g.add(branchGroup);
  const coreGroup=new THREE.Group(); g.add(coreGroup);
  // NOYAU 30% ÉNERGIE - plus de Skyline noire
  const vV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV;uniform float uT,uI;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8);float hb=sin(uT*2.2)*0.06;float c=0.18+uI*0.18+hb+f*0.22*uI;vec3 col=vec3(0.42,0.92,1.0)*c;gl_FragColor=vec4(col,0.42);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.30}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(0.32,3),mM); coreGroup.add(core);
  const iM=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.30,transmission:0.98,thickness:0.32,ior:2.417,roughness:0.12,transparent:true,opacity:0.42});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,2),iM); coreGroup.add(inner);
  // CARRÉ BLANC ÉNERGÉTIQUE À L'INTÉRIEUR - gardé
  const sqM=new THREE.MeshBasicMaterial({color:0xffffff}); const square=new THREE.Mesh(new THREE.PlaneGeometry(0.06,0.06),sqM); square.position.z=0.19; coreGroup.add(square);
  const sqGlow=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.12),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.22})); sqGlow.position.z=0.185; coreGroup.add(sqGlow);
  // BRANCHES DE DIAMANT - 66 branches comme V55 mais énergie 30%
  const branches:any[]=[];
  const mkBranch=(p1:THREE.Vector3,p2:THREE.Vector3)=>{
    const dir=p2.clone().sub(p1); const len=dir.length();
    const cyl=new THREE.CylinderGeometry(0.003,0.003,len,6);
    const mat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.30,transparent:true,opacity:0.18});
    const mesh=new THREE.Mesh(cyl,mat); mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize()); branchGroup.add(mesh);
    const octa=new THREE.Mesh(new THREE.OctahedronGeometry(0.022,0),new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:0.30,transparent:true,opacity:0.42}));
    octa.position.copy(p2); branchGroup.add(octa);
    branches.push({mesh,mat,octa,p1,p2});
  };
  const satPos:THREE.Vector3[]=[]; for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*1.2,Math.sin(a)*1.2,0)); }
  satPos.forEach((p,i)=>{ mkBranch(new THREE.Vector3(0,0,0),p); mkBranch(p,satPos[(i+1)%6]); });
  for(let i=0;i<54;i++){ const a=new THREE.Vector3().randomDirection().multiplyScalar(1.2+Math.random()*0.6); const b=new THREE.Vector3().randomDirection().multiplyScalar(1.2+Math.random()*0.6); mkBranch(a,b); }
  // Flow 30%
  const flowGeo=new THREE.BufferGeometry(); const fC=128; const fP=new Float32Array(fC*3);
  for(let i=0;i<fC;i++){ const b=branches[i%branches.length]; const t=Math.random(); fP[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t; fP[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t; fP[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(fP,3)); const flowMat=new THREE.PointsMaterial({color:0x88ffff,size:0.018,transparent:true,opacity:0.22}); branchGroup.add(new THREE.Points(flowGeo,flowMat));
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); blo.strength=0.32; mM.uniforms.uI.value=0.30; iM.emissiveIntensity=0.30; cl.intensity=28; }; setTimeout(ignite,80); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const fS=new Float32Array(fC).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t; mM.uniforms.uI.value=0.30+Math.sin(t*2.2)*0.04; iM.emissiveIntensity=0.30+Math.sin(t*2.2)*0.04; cl.intensity=28+Math.sin(t*2.2)*2; const hb=1+Math.sin(t*2.2)*0.06; core.scale.setScalar(1.0+Math.sin(t*2.2)*0.03); inner.scale.setScalar((1.0+Math.sin(t*2.2)*0.04)*hb); square.scale.setScalar(1.0+Math.sin(t*3.2)*0.12); const rot=0.0005; g.rotation.y+=rot; coreGroup.rotation.y+=rot*0.3; branchGroup.rotation.y-=rot*0.2; const fp=flowGeo.attributes.position.array as Float32Array; for(let i=0;i<fC;i++){ fS[i]+=0.012; if(fS[i]>1) fS[i]=0; const b=branches[i%branches.length]; fp[i*3]=b.p1.x+(b.p2.x-b.p1.x)*fS[i]; fp[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*fS[i]; fp[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*fS[i]; } flowGeo.attributes.position.needsUpdate=true; comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V117 DIAMANT 66 BRANCHES NOYAU 30% ZOOM 1.58':'IGNITION V117'}</div></div>);
}
