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
  const cam=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.8);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.58; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.46,0.32,0.68); comp.addPass(blo);
  // NOYAU +20% vs V117 (0.30 -> 0.36)
  const cl=new THREE.PointLight(0x88ffff,52,12); sc.add(cl); const cl2=new THREE.PointLight(0xaaffff,24,8); cl2.position.set(0,0,2); sc.add(cl2);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8);float veins=sin(uT*1.6+vP.x*6.0+vP.y*5.0)*0.18+sin(uT*1.2+vP.z*7.0)*0.12;float hb=sin(uT*2.2)*0.10;float c=0.22+uI*0.26+veins+hb+f*0.28*uI;vec3 col=vec3(0.42,0.94,1.0)*c;gl_FragColor=vec4(col,0.46);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.36}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.38,64,64),mM); g.add(core);
  const iM=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.36,transmission:0.98,thickness:0.18,ior:2.417,dispersion:0.68,roughness:0.08,transparent:true,opacity:0.48} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.20,32,32),iM); g.add(inner);
  // CARRÉ BLANC ÉNERGÉTIQUE SEUL À L'INTÉRIEUR - pas 2 carrés
  const sqM=new THREE.MeshBasicMaterial({color:0xffffff}); const square=new THREE.Mesh(new THREE.PlaneGeometry(0.06,0.06),sqM); square.position.z=0.21; g.add(square);
  const sqGlow=new THREE.Mesh(new THREE.PlaneGeometry(0.14,0.14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.28})); sqGlow.position.z=0.205; g.add(sqGlow);
  // Veines 64 sans branches
  const vG=new THREE.BufferGeometry(); const vC=64; const vP=new Float32Array(vC*3); for(let i=0;i<vC;i++){ const a=Math.random()*6.28, rr=0.10+Math.random()*0.14; vP[i*3]=Math.cos(a)*rr; vP[i*3+1]=Math.sin(a)*rr; vP[i*3+2]=(Math.random()-0.5)*0.08; } vG.setAttribute('position',new THREE.BufferAttribute(vP,3)); const vMt=new THREE.PointsMaterial({color:0xaaffff,size:0.020,transparent:true,opacity:0.38}); const vPts=new THREE.Points(vG,vMt); g.add(vPts);
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); blo.strength=0.46; mM.uniforms.uI.value=0.36; iM.emissiveIntensity=0.36; cl.intensity=52; ren.toneMappingExposure=0.58; }; setTimeout(ignite,80); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const fS=new Float32Array(vC).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t; mM.uniforms.uI.value=0.36+Math.sin(t*2.2)*0.06; iM.emissiveIntensity=0.36+Math.sin(t*2.2)*0.06; cl.intensity=52+Math.sin(t*2.2)*4; const hb=1+Math.sin(t*2.2)*0.10; core.scale.setScalar(1.0+Math.sin(t*2.2)*0.04); inner.scale.setScalar((1.0+Math.sin(t*2.2)*0.05)*hb); square.scale.setScalar(1.0+Math.sin(t*3.2)*0.14); square.rotation.z+=0.008; g.rotation.y+=0.0004; const vPos=vG.attributes.position.array as Float32Array; for(let i=0;i<vC;i++){ fS[i]+=0.018; if(fS[i]>6.28) fS[i]=0; vPos[i*3+2]=Math.sin(fS[i]+i*0.1)*0.06; } vG.attributes.position.needsUpdate=true; comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V118 CLEAN +20% NO BRANCHES - CARRÉ BLANC SEUL':'IGNITION V118'}</div></div>);
}
