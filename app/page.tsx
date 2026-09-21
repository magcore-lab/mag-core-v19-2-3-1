
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const cur=useRef({c1:111,c2:143,c3:176,c8:131,c10:183});
 const tgt=useRef({c1:111,c2:143,c3:176,c8:131,c10:183});
 const [on,setOn]=useState(false); const [wsOk,setWsOk]=useState(false);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const cam=new THREE.PerspectiveCamera(26,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,8.2);
  const ren=new THREE.WebGLRenderer({antialias:true}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.4)); ren.toneMapping=THREE.ACESFilmicToneMapping; ren.toneMappingExposure=0.52; ren.outputColorSpace=THREE.SRGBColorSpace; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const blo=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.42,0.32,0.72); comp.addPass(blo);
  let ws:any=null; let rtry=0; const conn=()=>{ try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>{rtry=0; setWsOk(true);}; ws.onmessage=(e:any)=>{ try{ const j=JSON.parse(e.data); if(j.channels){ const c=j.channels; const cl=(v:number)=>Math.max(0,Math.min(255,v|0)); tgt.current={c1:cl(c[0]),c2:cl(c[1]),c3:cl(c[2]),c8:cl(c[7]||131),c10:cl(c[9])}; } }catch{} }; ws.onclose=()=>{ setWsOk(false); setTimeout(conn,Math.min(8000,300*Math.pow(2,rtry++))); }; }catch{} }; conn();
  // V115 BALANCED: on remonte de V114 éteint
  const cl=new THREE.PointLight(0x88ffff,58,14); sc.add(cl); const cl2=new THREE.PointLight(0xaaffff,28,10); cl2.position.set(0,0,1.2); sc.add(cl2); const ip=new THREE.PointLight(0x88ffff,22,8); sc.add(ip);
  const g=new THREE.Group(); (g as any).scale.setScalar(1.58); sc.add(g); const qg=new THREE.Group(); g.add(qg);
  const qGe=new THREE.BufferGeometry(); const qC=512; const qP=new Float32Array(qC*3); for(let i=0;i<qC;i++){ const th=i*2.399963, ph=Math.acos(1-2*i/qC), rr=2.0+Math.random()*3.0; qP[i*3]=Math.sin(ph)*Math.cos(th)*rr; qP[i*3+1]=Math.sin(ph)*Math.sin(th)*rr; qP[i*3+2]=Math.cos(ph)*rr; } qGe.setAttribute('position',new THREE.BufferAttribute(qP,3)); const qM=new THREE.PointsMaterial({color:0x88ffff,size:0.010,transparent:true,opacity:0.14}); const qPts=new THREE.Points(qGe,qM); qPts.frustumCulled=false; qg.add(qPts);
  const vV='varying vec3 vN,vV,vP;void main(){vN=normalize(normalMatrix*normal);vP=position;vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fV='varying vec3 vN,vV,vP;uniform float uT,uI,uE,uN;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),3.5);float veins=sin(uT*1.4+vP.x*6.0+vP.y*5.0)*0.16+sin(uT*1.1+vP.z*7.0)*0.10;float hb=sin(uT*2.2)*0.12;float c=0.12+uI*0.20+uN*0.16+veins+hb;vec3 b=vec3(0.42,0.88,0.96)*(c+f*0.42*uI)+vec3(0.58,1.0,1.0)*uN*0.18;b*=uE;gl_FragColor=vec4(b,0.24);}';
  const mM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.58},uE:{value:0.52},uN:{value:0.28}},vertexShader:vV,fragmentShader:fV,transparent:true,side:THREE.DoubleSide}); const mid=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),mM); g.add(mid);
  const iM=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.72,transmission:1,thickness:0.06,ior:2.417,dispersion:0.68,roughness:0.06,transparent:true,opacity:0.32} as any); const inn=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),iM); g.add(inn);
  const vG=new THREE.BufferGeometry(); const vC=128; const vP=new Float32Array(vC*3); for(let i=0;i<vC;i++){ const a=Math.random()*6.28, rr=0.22+Math.random()*0.24; vP[i*3]=Math.cos(a)*rr; vP[i*3+1]=Math.sin(a)*rr; vP[i*3+2]=(Math.random()-0.5)*0.20; } vG.setAttribute('position',new THREE.BufferAttribute(vP,3)); const vMt=new THREE.PointsMaterial({color:0xaaffff,size:0.022,transparent:true,opacity:0.38}); const vPts=new THREE.Points(vG,vMt); g.add(vPts);
  const glM=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.38,transparent:true,opacity:0.08,depthWrite:false} as any); const glo=new THREE.Mesh(new THREE.SphereGeometry(0.58,32,32),glM); g.add(glo);
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); blo.strength=0.42; mM.uniforms.uE.value=0.52; mM.uniforms.uN.value=0.28; iM.emissiveIntensity=0.72; cl.intensity=58; cl2.intensity=28; ip.intensity=22; ren.toneMappingExposure=0.52; }; setTimeout(ignite,80); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const fS=new Float32Array(vC).map(()=>Math.random()); const qL=(a:number,b:number,al:number)=>a+(b-a)*al;
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; const tg=tgt.current, cr=cur.current, al=0.08; cr.c1=qL(cr.c1,tg.c1,al); cr.c2=qL(cr.c2,tg.c2,al); cr.c3=qL(cr.c3,tg.c3,al); cr.c8=qL(cr.c8,tg.c8,al); cr.c10=qL(cr.c10,tg.c10,al*0.5); if(!ws||ws.readyState!==1){ const tt=t; tgt.current={c1:111+Math.sin(tt*0.6)*10,c2:143+Math.sin(tt*0.4)*6,c3:176+Math.sin(tt*0.8)*5,c8:131+Math.sin(tt*0.4)*8,c10:183}; } const ma=cr.c10/255, pr=cr.c1/255, bl=cr.c2/255, fl=cr.c3/255, innC=cr.c8/255; mM.uniforms.uT.value=t; mM.uniforms.uI.value=0.58+Math.sin(t*2.2)*0.08+pr*0.08; mM.uniforms.uN.value=0.28+innC*0.18+Math.sin(t*1.2)*0.05; blo.strength=0.42+bl*0.08; ren.toneMappingExposure=0.52*ma+0.18; iM.emissiveIntensity=0.72+innC*0.18+Math.sin(t*1.2)*0.06; cl.intensity=58*ma+innC*12+Math.sin(t*2.2)*4; const hb=1+Math.sin(t*2.2)*0.12; const rot=0.0004*(0.5+pr); g.rotation.y+=rot; mid.rotation.y+=rot*0.32; inn.rotation.y-=rot*0.42; qg.rotation.y+=0.0003+fl*0.0003; vPts.rotation.y+=0.001+fl*0.0006; const vPos=vG.attributes.position.array as Float32Array; for(let i=0;i<vC;i++){ fS[i]+=0.016+fl*0.008; if(fS[i]>6.28) fS[i]=0; vPos[i*3+2]=Math.sin(fS[i]+i*0.1)*0.14; } vG.attributes.position.needsUpdate=true; inn.scale.setScalar((1.06+innC*0.04+Math.sin(t*2.2)*0.06)*hb); glo.scale.setScalar(1.58+innC*0.04+Math.sin(t*2.2)*0.03); comp.render(); }; anim();
  const onR=()=>{ cam.aspect=innerWidth/innerHeight; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); try{m.removeChild(ren.domElement);}catch{}; ren.dispose(); if(ws) ws.close(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?(wsOk?'#88ffff':'#ffaa00'):'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V115 BALANCED ZOOM 1.58 ${wsOk?'WS OK':'SYNTH'}`:'IGNITION V115'}</div></div>);
}
