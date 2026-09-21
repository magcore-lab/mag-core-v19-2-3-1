
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
  const cam=new THREE.PerspectiveCamera(26,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,4.0); cam.lookAt(0,0,0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.22; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.22,0.42,0.78); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,8,8); cl.position.set(0,0,2); sc.add(cl);
  // GROUPE CENTRÉ - scale 1.0 pas 1.58 qui décale
  const g=new THREE.Group(); sc.add(g);
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2);float c=0.16+uI*0.28+f*0.32*uI;vec3 col=vec3(0.44,0.96,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.62);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.0},uE:{value:0.12}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.52,64,64),mM); core.position.set(0,0,0); g.add(core);
  // ROND BLANC CENTRÉ - Sphere pas Circle, position 0,0,0 pile centre
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.08,32,32),roundMat); round.position.set(0,0,0); g.add(round);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,depthWrite:false});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.16,32,32),glowMat); glow.position.set(0,0,0); g.add(glow);
  const outerMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,depthWrite:false});
  const outer=new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32),outerMat); outer.position.set(0,0,0); g.add(outer);
  let ign=false;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    const t0=performance.now();
    const flash=()=>{
      const dt=(performance.now()-t0)/1000;
      if(dt<0.16){
        const p=dt/0.16;
        core.scale.setScalar(p*1.1); mM.uniforms.uI.value=p*1.4; mM.uniforms.uE.value=0.12+p*1.8;
        blo.strength=0.22+p*0.9; ren.toneMappingExposure=0.22+p*0.6; cl.intensity=8+p*60;
        round.scale.setScalar(p); roundMat.opacity=p; glowMat.opacity=p*0.5; outerMat.opacity=p*0.15;
        requestAnimationFrame(flash);
      } else if(dt<0.58){
        const p=(dt-0.16)/0.42;
        core.scale.setScalar(1.1 - p*0.1); mM.uniforms.uI.value=1.4 - p*1.04; mM.uniforms.uE.value=1.92 - p*1.34;
        blo.strength=1.12 - p*0.66; ren.toneMappingExposure=0.82 - p*0.24; cl.intensity=68 - p*16;
        requestAnimationFrame(flash);
      } else { mM.uniforms.uI.value=0.36; mM.uniforms.uE.value=0.58; blo.strength=0.46; ren.toneMappingExposure=0.58; cl.intensity=52; }
    }; flash();
  };
  setTimeout(ignite,180); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; if(!ign){ comp.render(); return; } mM.uniforms.uT.value=t; if(t>0.8){ mM.uniforms.uI.value=0.36+Math.sin(t*2.2)*0.05; const hb=1+Math.sin(t*2.2)*0.08; core.scale.setScalar((1.0+Math.sin(t*2.2)*0.03)*hb); round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12); } comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V122 CENTRÉ - SINGLE CORE ROND BLANC 0,0,0':'⚡ IGNITION V122'}</div></div>);
}
