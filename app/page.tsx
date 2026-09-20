
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [a,setA]=useState({low:0.3,mid:0.5,high:0.4,beat:false});
 useEffect(()=>{
  const q=new URLSearchParams(location.search);
  const col=parseInt(q.get('color')||'ffffff',16);
  const bloomQ=parseFloat(q.get('bloom')||'0');
  const zQ=parseFloat(q.get('z')||'0');
  const spd=parseFloat(q.get('speed')||'1');
  const isMob=/Android|iPhone/i.test(navigator.userAgent);
  const BLOOM=isMob?2.0:(bloomQ||2.0);
  let raf=0;
  let renderer:any=null;
  let composer:any;
  let bloom:any;
  let analyser:any;
  let data:[STRIPPED]
  try{
   const mount=ref.current!;
   const scene=new THREE.Scene();
   const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,0.1,100);
   camera.position.z=zQ||10.71;
   renderer=new THREE.WebGLRenderer({antialias:true});
   renderer.setSize(innerWidth,innerHeight);
   mount.appendChild(renderer.domElement);
   const outer=new THREE.Mesh(
    new THREE.SphereGeometry(0.92,32,32),
    new THREE.MeshBasicMaterial({
     color:col||0xffffff,wireframe:true,transparent:true,opacity:0.9
    })
   );
   scene.add(outer);
   const middle=new THREE.Mesh(
    new THREE.SphereGeometry(0.48,32,32),
    new THREE.MeshBasicMaterial({color:0xffffff})
   );
   scene.add(middle);
   const inner=new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.22,3),
    new THREE.MeshBasicMaterial({color:col||0xffffff})
   );
   scene.add(inner);
   const glow=new THREE.Mesh(
    new THREE.SphereGeometry(0.35,32,32),
    new THREE.MeshBasicMaterial({
     color:0xffffff,transparent:true,opacity:0.18
    })
   );
   scene.add(glow);
   const satG=new THREE.Group();
   scene.add(satG);
   for(let i=0;i<6;i++){
    const ang=i*60*Math.PI/180;
    const m=new THREE.Mesh(
     new THREE.SphereGeometry(0.055,16,16),
     new THREE.MeshBasicMaterial({color:0xffffff})
    );
    m.position.set(Math.cos(ang)*0.71,Math.sin(ang)*0.71,0);
    satG.add(m);
    const l=new THREE.PointLight(0xffffff,80,2);
    l.position.copy(m.position);
    satG.add(l);
   }
   const g=new THREE.BufferGeometry();
   const cnt=156;
   const pos=new Float32Array(cnt*3);
   const golden=2.399963;
   for(let i=0;i<cnt;i++){
    const th=i*golden;
    const ph=Math.acos(1-2*i/cnt);
    const r=0.75+Math.random()*0.6;
    pos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    pos[i*3+2]=Math.cos(ph)*r;
   }
   g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const parts=new THREE.Points(
    g,new THREE.PointsMaterial({color:0xffffff,size:0.03})
   );
   scene.add(parts);
   composer=new EffectComposer(renderer);
   composer.addPass(new RenderPass(scene,camera));
   bloom=new UnrealBloomPass(
    new THREE.Vector2(innerWidth,innerHeight),BLOOM,0.4,0.12
   );
   composer.addPass(bloom);
   try{
    const ctx=new (window.AudioContext||
     (window as any).webkitAudioContext)();
    analyser=ctx.createAnalyser();
    analyser.fftSize=256;
    data=new Uint8Array(128);
    navigator.mediaDevices?.getUserMedia({audio:true})
    .then((s:any)=>{
      ctx.createMediaStreamSource(s).connect(analyser);
     }).catch(()=>{});
   }catch{}
   const clock=new THREE.Clock();
   let t=0;
   const anim=()=>{
    raf=requestAnimationFrame(anim);
    const dt=clock.getDelta()*spd;
    t+=dt;
    let low=0.3,mid=0.5,high=0.4,beat=false;
    if(analyser&&data){
     analyser.getByteFrequencyData(data);
     low=data[2]/255;
     mid=data[30]/255;
     high=data[80]/255;
     beat=data[2]>150;
     setA({low,mid,high,beat});
    }
    outer.rotation.y+=0.008*spd+mid*0.01;
    middle.rotation.y+=0.012*spd;
    inner.rotation.y-=0.02*spd;
    satG.rotation.z+=0.015*spd+low*0.02;
    parts.rotation.y+=0.003*spd;
    glow.scale.setScalar(1.2+Math.sin(t*2)*0.2+low*0.5);
    bloom.strength=BLOOM+low*0.8+(beat?0.6:0);
    composer.render();
   };
   anim();
   const rs=()=>{
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer!.setSize(innerWidth,innerHeight);
    composer.setSize(innerWidth,innerHeight);
   };
   addEventListener('resize',rs);
   return()=>{
    cancelAnimationFrame(raf);
    removeEventListener('resize',rs);
    try{mount.removeChild(renderer!.domElement);}catch{}
   };
  }catch(e){ console.error(e); }
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{
    position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',
    background:'#3dd598',color:'#000',padding:'8px 18px',
    borderRadius:999,fontSize:10,fontWeight:900,zIndex:10
   }}>
    MAG CORE V19.2.3.2 AUDIO+URL — Z10.71 FOV34 BLOOM 2.0 FIX
   </div>
   <div style={{
    position:'fixed',bottom:10,left:10,fontSize:8,
    color:'#fff',opacity:0.6,fontFamily:'monospace'
   }}>
    AUDIO {a.low.toFixed(2)}/{a.mid.toFixed(2)}/{a.high.toFixed(2)}
    {a.beat?' BEAT':''} | URL?color=ff0000&bloom=2&z=10.71&speed=1
   </div>
  </div>
 );
}
