'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const cam=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.0); cam.lookAt(0,0,0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.82; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.52,0.34,0.58); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,82,12); cl.position.set(0,0,2); sc.add(cl);
  const g=new THREE.Group(); sc.add(g);
  const vV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  // Shader corrigé - pas cramé, pas plat : fresnel + core
  const fV='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.6);float c=0.28+uI*0.42+f*0.48*uI;vec3 teal=vec3(0.42,0.86,0.88);vec3 col=teal*c;col*=uE;col+=f*0.18*uE;gl_FragColor=vec4(col,0.78);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.72},uE:{value:0.82}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); core.position.set(0,0,0); g.add(core);
  // ROND BLANC FOCAL - visible mais pas cramé
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.09,32,32),roundMat); round.position.set(0,0,0.04); g.add(round);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.48,depthWrite:false});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.19,32,32),glowMat); glow.position.set(0,0,0); g.add(glow);
  const outerMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.18,depthWrite:false});
  const outer=new THREE.Mesh(new THREE.SphereGeometry(0.36,32,32),outerMat); outer.position.set(0,0,0); g.add(outer);
  blo.strength=0.52; ren.toneMappingExposure=0.82; cl.intensity=82;
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t;
    const breath=Math.sin(t*2.2)*0.07;
    mM.uniforms.uI.value=0.72+breath*0.08;
    mM.uniforms.uE.value=0.82+breath*0.12;
    blo.strength=0.52+breath*0.08;
    core.scale.setScalar(1.0+breath*0.05);
    round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12);
    glow.scale.setScalar(1.0+Math.sin(t*3.0)*0.18);
    cl.intensity=82+breath*8;
    comp.render();
  }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>V128 70% BALANCED - PAS CRAMÉ PAS PLAT - ROND BLANC 0,0,0</div></div>);
}
