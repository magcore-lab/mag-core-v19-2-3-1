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
  const cam=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,5.0);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.12; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.12,0.42,0.78); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,4,10); sc.add(cl);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8);float veins=sin(uT*1.8+vP.x*6.0)*0.18;float hb=sin(uT*2.2)*0.12;float c=0.10+uI*0.32+veins+hb+f*0.36*uI;vec3 col=vec3(0.44,0.96,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.58);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.0},uE:{value:0.1}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.42,64,64),mM); core.scale.setScalar(0.1); g.add(core);
  const sqM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0}); const square=new THREE.Mesh(new THREE.PlaneGeometry(0.08,0.08),sqM); square.position.set(0,0,0.44); square.scale.setScalar(0.1); g.add(square);
  const sqGlow=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,depthWrite:false})); sqGlow.position.set(0,0,0.435); g.add(sqGlow);
  const vG=new THREE.BufferGeometry(); const vC=32; const vP=new Float32Array(vC*3); for(let i=0;i<vC;i++){ const a=Math.random()*6.28, rr=0.08+Math.random()*0.10; vP[i*3]=Math.cos(a)*rr; vP[i*3+1]=Math.sin(a)*rr; vP[i*3+2]=(Math.random()-0.5)*0.04; } vG.setAttribute('position',new THREE.BufferAttribute(vP,3)); const vMt=new THREE.PointsMaterial({color:0xaaffff,size:0.016,transparent:true,opacity:0}); g.add(new THREE.Points(vG,vMt));
  let ign=false;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    // ALLUMAGE ADAPTÉ - flash puis settle
    const t0=performance.now();
    const flash=()=>{
      const dt=(performance.now()-t0)/1000;
      if(dt<0.12){ // FLASH 0-120ms
        const p=dt/0.12;
        core.scale.setScalar(0.1 + p*1.5); // 0.1 -> 1.6
        mM.uniforms.uI.value=p*1.8; mM.uniforms.uE.value=0.1+p*2.2;
        blo.strength=0.12+p*1.1; ren.toneMappingExposure=0.12+p*1.0;
        cl.intensity=4+p*120; square.scale.setScalar(0.1+p*1.8); sqM.opacity=p; sqGlow.material.opacity=p*0.6;
        requestAnimationFrame(flash);
      } else if(dt<0.45){ // SETTLE 120-450ms
        const p=(dt-0.12)/0.33;
        core.scale.setScalar(1.6 - p*0.6); // 1.6 -> 1.0
        mM.uniforms.uI.value=1.8 - p*1.44; // 1.8 -> 0.36
        mM.uniforms.uE.value=2.3 - p*1.72; // 2.3 -> 0.58
        blo.strength=1.22 - p*0.76; ren.toneMappingExposure=1.12 - p*0.54;
        cl.intensity=124 - p*72; square.scale.setScalar(1.9 - p*0.9); vMt.opacity=p*0.34;
        requestAnimationFrame(flash);
      } else {
        mM.uniforms.uI.value=0.36; mM.uniforms.uE.value=0.58; blo.strength=0.46; ren.toneMappingExposure=0.58; cl.intensity=52; vMt.opacity=0.34; sqM.opacity=0.92; sqGlow.material.opacity=0.32;
      }
    }; flash();
  };
  setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; if(!ign) { comp.render(); return; } mM.uniforms.uT.value=t; if(t>0.6){ mM.uniforms.uI.value=0.36+Math.sin(t*2.2)*0.06; cl.intensity=52+Math.sin(t*2.2)*4; const hb=1+Math.sin(t*2.2)*0.10; core.scale.setScalar((1.0+Math.sin(t*2.2)*0.04)*hb); square.scale.setScalar(1.0+Math.sin(t*3.2)*0.16); square.rotation.z+=0.008; g.rotation.y+=0.0003; } comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V120 IGNITION ADAPTÉE +20% - SINGLE CORE':'⚡ IGNITION V120'}</div></div>);
}
