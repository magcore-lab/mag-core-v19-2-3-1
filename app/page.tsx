'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const cur=useRef({c1:111,c8:131,c10:183});
 const tgt=useRef({c1:111,c8:131,c10:183});
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const cam=new THREE.PerspectiveCamera(26,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,6.5);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.4)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.48; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.38,0.32,0.68); comp.addPass(blo);
  // Lumières noyau seul
  const cl=new THREE.PointLight(0x88ffff,42,8); sc.add(cl); const cl2=new THREE.PointLight(0xaaffff,18,6); cl2.position.set(0,0,1.5); sc.add(cl2);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g);
  // SEUL NOYAU - plus de halo externe, plus de scanlines
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),3.0);float veins=sin(uT*1.4+vP.x*6.0)*0.14+sin(uT*1.1+vP.z*7.0)*0.10;float hb=sin(uT*2.2)*0.10;float c=0.18+uI*0.24+veins+hb+f*0.28*uI;vec3 b=vec3(0.42,0.92,1.0)*c;b*=uE;gl_FragColor=vec4(b,0.28);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.62},uE:{value:0.58}},vertexShader:vV,fragmentShader:fV,transparent:true,side:THREE.DoubleSide}); const core=new THREE.Mesh(new THREE.SphereGeometry(0.32,64,64),mM); g.add(core);
  const iM=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.68,transmission:1,thickness:0.06,ior:2.417,dispersion:0.68,roughness:0.06,transparent:true,opacity:0.38} as any); const inner=new THREE.Mesh(new THREE.SphereGeometry(0.18,32,32),iM); g.add(inner);
  // CARRÉ BLANC ÉNERGÉTIQUE - seul qui reste à l'intérieur
  const sqG=new THREE.PlaneGeometry(0.06,0.06); const sqM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.92}); const square=new THREE.Mesh(sqG,sqM); square.position.z=0.19; g.add(square);
  const sqGlowM=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.32}); const sqGlow=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.12),sqGlowM); sqGlow.position.z=0.185; g.add(sqGlow);
  const vG=new THREE.BufferGeometry(); const vC=64; const vP=new Float32Array(vC*3); for(let i=0;i<vC;i++){ const a=Math.random()*6.28, rr=0.12+Math.random()*0.14; vP[i*3]=Math.cos(a)*rr; vP[i*3+1]=Math.sin(a)*rr; vP[i*3+2]=(Math.random()-0.5)*0.10; } vG.setAttribute('position',new THREE.BufferAttribute(vP,3)); const vMt=new THREE.PointsMaterial({color:0xaaffff,size:0.018,transparent:true,opacity:0.32}); const vPts=new THREE.Points(vG,vMt); g.add(vPts);
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); blo.strength=0.38; mM.uniforms.uE.value=0.58; iM.emissiveIntensity=0.68; cl.intensity=42; }; setTimeout(ignite,80); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const fS=new Float32Array(vC).map(()=>Math.random()); const qL=(a:number,b:number,al:number)=>a+(b-a)*al;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; const tg=tgt.current, cr=cur.current, al=0.08; cr.c1=qL(cr.c1,tg.c1,al); cr.c8=qL(cr.c8,tg.c8,al); cr.c10=qL(cr.c10,tg.c10,al*0.5); const ma=cr.c10/255, pr=cr.c1/255, innC=cr.c8/255; mM.uniforms.uT.value=t; mM.uniforms.uI.value=0.62+Math.sin(t*2.2)*0.08+pr*0.08; ren.toneMappingExposure=0.48*ma+0.16; iM.emissiveIntensity=0.68+innC*0.16+Math.sin(t*1.2)*0.06; cl.intensity=42*ma+Math.sin(t*2.2)*3; const hb=1+Math.sin(t*2.2)*0.12; const rot=0.0004*(0.5+pr); g.rotation.y+=rot; core.rotation.y+=rot*0.32; inner.rotation.y-=rot*0.42; square.rotation.z+=0.01; const s=0.06+Math.sin(t*3.2)*0.01+innC*0.01; square.scale.setScalar(s*10); sqGlow.scale.setScalar((0.12+Math.sin(t*3.2)*0.02)*10); square.material.opacity=0.92+Math.sin(t*3.2)*0.08; const vPos=vG.attributes.position.array as Float32Array; for(let i=0;i<vC;i++){ fS[i]+=0.016; if(fS[i]>6.28) fS[i]=0; vPos[i*3+2]=Math.sin(fS[i]+i*0.1)*0.08; } vG.attributes.position.needsUpdate=true; inner.scale.setScalar((1.06+Math.sin(t*2.2)*0.06)*hb); core.scale.setScalar(1.0+Math.sin(t*2.2)*0.04); comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#88ffff',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V116 CLEAN CORE - CARRÉ BLANC SEUL':'IGNITION V116'}</div></div>);
}
