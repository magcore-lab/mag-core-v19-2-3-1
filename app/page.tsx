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
  const cam=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.0); cam.lookAt(0,0,0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.62; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.42,0.38,0.68); comp.addPass(blo);
  // -50% vs 100% cramé
  const cl=new THREE.PointLight(0x88ffff,58,12); cl.position.set(0,0,2); sc.add(cl);
  const g=new THREE.Group(); sc.add(g);
  const vV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.4);float c=0.24+uI*0.32+f*0.36*uI;vec3 col=vec3(0.44,0.96,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.68);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.50},uE:{value:0.62}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); core.position.set(0,0,0); g.add(core);
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.88});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.10,32,32),roundMat); round.position.set(0,0,0.03); g.add(round);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.32,depthWrite:false});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.20,32,32),glowMat); glow.position.set(0,0,0); g.add(glow);
  const outerMat=new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.14,depthWrite:false});
  const outer=new THREE.Mesh(new THREE.SphereGeometry(0.34,32,32),outerMat); outer.position.set(0,0,0); g.add(outer);
  blo.strength=0.42; ren.toneMappingExposure=0.62; cl.intensity=58;
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; mM.uniforms.uT.value=t;
    const breath=Math.sin(t*2.2)*0.06;
    mM.uniforms.uI.value=0.50+breath*0.08; // -50% vs 1.0
    mM.uniforms.uE.value=0.62+breath*0.12;
    blo.strength=0.42+breath*0.06;
    ren.toneMappingExposure=0.62+breath*0.06;
    const hb=1+breath;
    core.scale.setScalar((1.0+Math.sin(t*2.2)*0.03)*hb);
    round.scale.setScalar(1.0+Math.sin(t*3.0)*0.10);
    glow.scale.setScalar(1.0+Math.sin(t*3.0)*0.16);
    cl.intensity=58+Math.sin(t*2.2)*6;
    comp.render();
  }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>V127 NOYAU -50% DECRAMÉ - 0.50 FIXE + RESPIRATION</div></div>);
}
