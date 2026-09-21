
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(true);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  // DEZOOM 25% : 4.0 -> 5.0 + FOV 32
  const cam=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.0); cam.lookAt(0,0,0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=1.0; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.92,0.32,0.42); comp.addPass(blo);
  // 100% NOYAU FIXE CENTRAL
  const cl=new THREE.PointLight(0x88ffff,120,14); cl.position.set(0,0,2); sc.add(cl);
  const g=new THREE.Group(); sc.add(g);
  const vV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0);float c=0.38+uI*0.62+f*0.58*uI;vec3 col=vec3(0.46,0.98,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.88);}';
  // 100% par défaut - plus de 0
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:1.0},uE:{value:1.0}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); core.position.set(0,0,0); g.add(core);
  // ROND BLANC 100% - point focal centre 0,0,0 - pas carré gris
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1.0});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.10,32,32),roundMat); round.position.set(0,0,0.03); g.add(round);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.68,depthWrite:false});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.20,32,32),glowMat); glow.position.set(0,0,0); g.add(glow);
  const outerMat=new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.28,depthWrite:false});
  const outer=new THREE.Mesh(new THREE.SphereGeometry(0.34,32,32),outerMat); outer.position.set(0,0,0); g.add(outer);
  blo.strength=0.92; ren.toneMappingExposure=1.0; cl.intensity=120;
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t;
    // 100% RESTE ALLUMÉ + RESPIRATION - jamais off
    const breath=Math.sin(t*2.2)*0.10;
    mM.uniforms.uI.value=1.0+breath*0.12; // 100% + 12% breath
    mM.uniforms.uE.value=1.0+breath*0.18;
    blo.strength=0.92+breath*0.12;
    ren.toneMappingExposure=1.0+breath*0.10;
    const hb=1+breath;
    core.scale.setScalar((1.0+Math.sin(t*2.2)*0.04)*hb);
    round.scale.setScalar(1.0+Math.sin(t*3.0)*0.14);
    glow.scale.setScalar(1.0+Math.sin(t*3.0)*0.22);
    outer.scale.setScalar(1.0+Math.sin(t*2.2)*0.08);
    cl.intensity=120+Math.sin(t*2.2)*12;
    comp.render();
  }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#ffffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V126 NOYAU 100% FIXE CENTRAL - ROND BLANC FOCAL - DEZOOM 25%':'V126'}</div></div>);
}
