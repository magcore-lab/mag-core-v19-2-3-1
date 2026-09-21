
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
  const cam=new THREE.PerspectiveCamera(32,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.0); cam.lookAt(0,0,0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.73; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.58,0.36,0.72); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,65,14); cl.position.set(0,0,2); sc.add(cl);
  const g=new THREE.Group(); sc.add(g);
  const vV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2);float c=0.22+uI*0.38+f*0.42*uI;vec3 col=vec3(0.44,0.96,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.72);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.45},uE:{value:0.73}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); core.position.set(0,0,0); g.add(core);
  // ROND BLANC FIXE CENTRAL - reste allumé
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.98});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.09,32,32),roundMat); round.position.set(0,0,0); g.add(round);
  const glowMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.42,depthWrite:false});
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.18,32,32),glowMat); glow.position.set(0,0,0); g.add(glow);
  const outerMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.15,depthWrite:false});
  const outer=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),outerMat); outer.position.set(0,0,0); g.add(outer);
  let ign=false; let ignT=0;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true); ignT=performance.now();
    // FLASH unique - ne s'éteint plus après
    core.scale.setScalar(0.1); round.scale.setScalar(0.1); mM.uniforms.uI.value=0; mM.uniforms.uE.value=0.15; blo.strength=0.18; ren.toneMappingExposure=0.22; cl.intensity=10; roundMat.opacity=0;
  };
  setTimeout(ignite,180); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016;
    if(!ign){ comp.render(); return; }
    const dt=(performance.now()-ignT)/1000;
    mM.uniforms.uT.value=t;
    if(dt<0.20){ // 0-200ms FLASH IN
      const p=dt/0.20;
      core.scale.setScalar(0.1 + p*1.15); // 0.1->1.25
      mM.uniforms.uI.value=p*0.45; mM.uniforms.uE.value=0.15+p*0.58;
      blo.strength=0.18+p*0.40; ren.toneMappingExposure=0.22+p*0.51;
      round.scale.setScalar(0.1+p*0.9); roundMat.opacity=p*0.98;
    } else if(dt<0.60){ // 200-600ms SETTLE
      const p=(dt-0.20)/0.40;
      core.scale.setScalar(1.25 - p*0.25); // 1.25->1.0
      glowMat.opacity=0.42; outerMat.opacity=0.15; roundMat.opacity=0.98;
      blo.strength=0.58; ren.toneMappingExposure=0.73; cl.intensity=65;
    } else { // >600ms RESTE ALLUMÉ + RESPIRATION
      const breath=Math.sin(t*2.2)*0.06;
      const hb=1+breath;
      core.scale.setScalar((1.0+Math.sin(t*2.2)*0.04)*hb);
      mM.uniforms.uI.value=0.45+breath; // 0.45 reste allumé, pas 0
      mM.uniforms.uE.value=0.73+breath*0.2;
      blo.strength=0.58+breath*0.08;
      round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12);
      glow.scale.setScalar(1.0+Math.sin(t*3.0)*0.18);
      outer.scale.setScalar(1.0+Math.sin(t*2.2)*0.06);
      cl.intensity=65+Math.sin(t*2.2)*6;
    }
    comp.render();
  }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V124 RESTE ALLUMÉ + RESPIRATION - FIX ON/OFF':'⚡ IGNITION V124'}</div></div>);
}
