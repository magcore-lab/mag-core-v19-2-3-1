'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const q=new URLSearchParams(location.search);
  const col=parseInt(q.get('color')||'ffffff',16);
  const z=parseFloat(q.get('z')||'10.71');
  const spd=parseFloat(q.get('speed')||'1');
  const isMob=/Android|iPhone/i.test(navigator.userAgent);
  const BLOOM=isMob?2.0:2;
  let raf=0;let R:any=null;let C:any;let B:any;
  let A:any;let D:Uint8Array;
  const mount=ref.current!;
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
  cam.position.z=z;
  R=new THREE.WebGLRenderer({antialias:true});
  R.setSize(innerWidth,innerHeight);
  mount.appendChild(R.domElement);
  const out=new THREE.Mesh(
   new THREE.SphereGeometry(0.92,32,32),
   new THREE.MeshBasicMaterial({color:col,wireframe:true,opacity:0.9,transparent:true})
  );
  scene.add(out);
  const mid=new THREE.Mesh(
   new THREE.SphereGeometry(0.48,32,32),
   new THREE.MeshBasicMaterial({color:0xffffff})
  );
  scene.add(mid);
  const inn=new THREE.Mesh(
   new THREE.IcosahedronGeometry(0.22,3),
   new THREE.MeshBasicMaterial({color:col})
  );
  scene.add(inn);
  const sat=new THREE.Group();
  scene.add(sat);
  for(let i=0;i<6;i++){
   const ang=i*60*Math.PI/180;
   const m=new THREE.Mesh(
    new THREE.SphereGeometry(0.055,16,16),
    new THREE.MeshBasicMaterial({color:0xffffff})
   );
   m.position.set(Math.cos(ang)*0.71,Math.sin(ang)*0.71,0);
   sat.add(m);
  }
  const g=new THREE.BufferGeometry();
  const pos=new Float32Array(156*3);
  for(let i=0;i<156;i++){
   const th=i*2.399963;
   const ph=Math.acos(1-2*i/156);
   const r=0.75+Math.random()*0.6;
   pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
   pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
   pos[i*3+2]=Math.cos(ph)*r;
  }
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:0.03}));
  scene.add(pts);
  C=new EffectComposer(R);
  C.addPass(new RenderPass(scene,cam));
  B=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),BLOOM,0.4,0.12);
  C.addPass(B);
  try{
   const ctx=new (window.AudioContext||(window as any).webkitAudioContext)();
   A=ctx.createAnalyser();
   A.fftSize=256;D=new Uint8Array(128);
   navigator.mediaDevices?.getUserMedia({audio:true}).then((s:any)=>{
    ctx.createMediaStreamSource(s).connect(A);
   }).catch(()=>{});
  }catch{}
  let t=0;
  const anim=()=>{
   raf=requestAnimationFrame(anim);
   t+=0.016*spd;
   let low=0.3;
   if(A&&D){A.getByteFrequencyData(D);low=D[2]/255;}
   out.rotation.y+=0.008*spd;
   mid.rotation.y+=0.012*spd;
   inn.rotation.y-=0.02*spd;
   sat.rotation.z+=0.015*spd;
   pts.rotation.y+=0.003*spd;
   B.strength=BLOOM+low*0.8;
   C.render();
  };
  anim();
  const rs=()=>{
   cam.aspect=innerWidth/innerHeight;
   cam.updateProjectionMatrix();
   R.setSize(innerWidth,innerHeight);
   C.setSize(innerWidth,innerHeight);
  };
  addEventListener('resize',rs);
  return()=>{
   cancelAnimationFrame(raf);
   removeEventListener('resize',rs);
   try{mount.removeChild(R.domElement);}catch{}
  };
 },[]);
 return<div style={{width:'100%',height:'100dvh',background:'#000'}}>
  <div ref={ref} style={{position:'fixed',inset:0}}/>
  <div style={{position:'fixed',top:10,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'6px 14px',borderRadius:999,fontSize:10,fontWeight:900}}>MAG CORE V19.2.3.2 — LIVE</div>
 </div>;
}
