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
  const cam=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.2);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.58; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.46,0.36,0.72); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,52,12); sc.add(cl);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  // SINGLE CORE - plus de double sphère
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6);float veins=sin(uT*1.8+vP.x*5.0)*0.16+sin(uT*1.2+vP.z*6.0)*0.10;float hb=sin(uT*2.2)*0.10;float c=0.24+uI*0.28+veins+hb+f*0.32*uI;vec3 col=vec3(0.44,0.94,1.0)*c;gl_FragColor=vec4(col,0.52);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.36}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.42,64,64),mM); g.add(core);
  // SEUL CARRÉ BLANC - 1 seul, pas 2
  const sqM=new THREE.MeshBasicMaterial({color:0xffffff}); const square=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.07),sqM); square.position.set(0,0,0.43); square.lookAt(0,0,0); g.add(square);
  const sqGlow=new THREE.Mesh(new THREE.PlaneGeometry(0.14,0.14),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.32,depthWrite:false})); sqGlow.position.set(0,0,0.425); sqGlow.lookAt(0,0,0); g.add(sqGlow);
  // Veines légères 48
  const vG=new THREE.BufferGeometry(); const vC=48; const vP=new Float32Array(vC*3); for(let i=0;i<vC;i++){ const a=Math.random()*6.28, rr=0.12+Math.random()*0.12; vP[i*3]=Math.cos(a)*rr; vP[i*3+1]=Math.sin(a)*rr; vP[i*3+2]=(Math.random()-0.5)*0.06; } vG.setAttribute('position',new THREE.BufferAttribute(vP,3)); const vMt=new THREE.PointsMaterial({color:0xaaffff,size:0.018,transparent:true,opacity:0.34}); g.add(new THREE.Points(vG,vMt));
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); blo.strength=0.46; mM.uniforms.uI.value=0.36; cl.intensity=52; ren.toneMappingExposure=0.58; }; setTimeout(ignite,80); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t; mM.uniforms.uI.value=0.36+Math.sin(t*2.2)*0.06; cl.intensity=52+Math.sin(t*2.2)*4; const hb=1+Math.sin(t*2.2)*0.10; core.scale.setScalar(1.0+Math.sin(t*2.2)*0.04); square.scale.setScalar(1.0+Math.sin(t*3.2)*0.16); square.rotation.z+=0.01; g.rotation.y+=0.0003; comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V119 SINGLE CORE +20% - 1 SPHERE + 1 CARRÉ':'IGNITION V119'}</div></div>);
}
