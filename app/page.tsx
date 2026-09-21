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
  const cam=new THREE.PerspectiveCamera(24,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,4.8);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.5)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.18; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.18,0.42,0.78); comp.addPass(blo);
  const cl=new THREE.PointLight(0x88ffff,6,12); sc.add(cl);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  // SINGLE CORE - pas de double sphère, pas de skyline
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.4);float hb=sin(uT*2.2)*0.08;float c=0.14+uI*0.24+hb+f*0.28*uI;vec3 col=vec3(0.44,0.96,1.0)*c;col*=uE;gl_FragColor=vec4(col,0.56);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.0},uE:{value:0.12}},vertexShader:vV,fragmentShader:fV,transparent:true});
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); core.scale.setScalar(0.08); g.add(core);
  // ROND BLANC FIXE AU CENTRE - point focal, pas carré gris, pas incliné
  const roundGeo=new THREE.CircleGeometry(0.06,64);
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0});
  const round=new THREE.Mesh(roundGeo,roundMat); round.position.set(0,0,0.49); g.add(round);
  const roundGlow=new THREE.Mesh(new THREE.CircleGeometry(0.14,64),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,depthWrite:false})); roundGlow.position.set(0,0,0.485); g.add(roundGlow);
  const roundOuter=new THREE.Mesh(new THREE.CircleGeometry(0.24,64),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,depthWrite:false})); roundOuter.position.set(0,0,0.48); g.add(roundOuter);
  let ign=false;
  const ignite=()=>{
    if(ign) return; ign=true; setOn(true);
    const t0=performance.now();
    const flash=()=>{
      const dt=(performance.now()-t0)/1000;
      if(dt<0.14){
        const p=dt/0.14;
        core.scale.setScalar(0.08 + p*1.2); // 0.08 -> 1.28 flash
        mM.uniforms.uI.value=p*1.6; mM.uniforms.uE.value=0.12+p*2.0;
        blo.strength=0.18+p*1.0; ren.toneMappingExposure=0.18+p*0.9; cl.intensity=6+p*80;
        round.scale.setScalar(p*1.6); roundMat.opacity=p; roundGlow.material.opacity=p*0.5; roundOuter.material.opacity=p*0.18;
        requestAnimationFrame(flash);
      } else if(dt<0.52){
        const p=(dt-0.14)/0.38;
        core.scale.setScalar(1.28 - p*0.28); // 1.28 -> 1.0 settle
        mM.uniforms.uI.value=1.6 - p*1.24; mM.uniforms.uE.value=2.12 - p*1.54;
        blo.strength=1.18 - p*0.72; ren.toneMappingExposure=1.08 - p*0.50; cl.intensity=86 - p*34;
        round.scale.setScalar(1.6 - p*0.6); roundMat.opacity=1.0; 
        requestAnimationFrame(flash);
      } else {
        mM.uniforms.uI.value=0.36; mM.uniforms.uE.value=0.58; blo.strength=0.46; ren.toneMappingExposure=0.58; cl.intensity=52;
        roundMat.opacity=0.98; roundGlow.material.opacity=0.42; roundOuter.material.opacity=0.12;
      }
    }; flash();
  };
  setTimeout(ignite,150); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; if(!ign){ comp.render(); return; } mM.uniforms.uT.value=t; if(t>0.7){ mM.uniforms.uI.value=0.36+Math.sin(t*2.2)*0.05; cl.intensity=52+Math.sin(t*2.2)*4; const hb=1+Math.sin(t*2.2)*0.08; core.scale.setScalar((1.0+Math.sin(t*2.2)*0.03)*hb); round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12); roundGlow.scale.setScalar(1.0+Math.sin(t*3.0)*0.18); } g.rotation.y+=0.0002; comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V121 ROND BLANC FOCAL CENTRE - CARRÉ GRIS SUPPRIMÉ':'⚡ IGNITION V121'}</div></div>);
}
