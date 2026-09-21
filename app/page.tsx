 'use client';
// V19.2.3.27 RESTORE V19.2.3.14 CONFORME DIAMANT + RESP + DMX SYNTH - VALIDE 22:40
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:110,ch2:62,ch3:142,ch10:178});
 const [on,setOn]=useState(false); const [dmxOn,setDmxOn]=useState(false); const [sel,setSel]=useState<number|null>(null);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene(); sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768; const cam=new THREE.PerspectiveCamera(mob?38:36,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,mob?7.44:6.0);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.2));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.88; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const bloom=new (UnrealBloomPass as any)(new THREE.Vector2(innerWidth,innerHeight),0.48,0.38,0.72); comp.addPass(bloom);
  let ws:any=null; try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>setDmxOn(true); ws.onmessage=(e:any)=>{ try{ const j=JSON.parse(e.data); if(j.channels){ const c=j.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; }catch{}
  sc.add(new THREE.AmbientLight(0xffffff,0.72));
  const kL=new THREE.PointLight(0xffffff,85,12); kL.position.set(4,4,5); sc.add(kL);
  const fL=new THREE.PointLight(0xaaccff,42,12); fL.position.set(-4,2,4); sc.add(fL);
  const cg=new THREE.Group(); sc.add(cg);
  // CONFORME DIAMANT 22:40 - Icosa facetté rond - 0.52 - transmission 0.995 ior 2.65 = facettes visibles comme sur ton screen
  const diamantMat=new (THREE as any).MeshPhysicalMaterial({color:0xd0d8de,emissive:0x88aabb,emissiveIntensity:0.08,transmission:0.96,thickness:0.58,ior:2.417,dispersion:0.18,roughness:0.08,metalness:0.02,clearcoat:1.0,clearcoatRoughness:0.08,transparent:true,opacity:0.92});
  const diamant=new THREE.Mesh(new THREE.IcosahedronGeometry(0.52,3),diamantMat); cg.add(diamant);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.28,32,32),new (THREE as any).MeshPhysicalMaterial({color:0xa0b8c8,emissive:0x88aabb,emissiveIntensity:0.12,transmission:0.82,thickness:0.32,roughness:0.18,transparent:true,opacity:0.42})); cg.add(inner);
  // 156P CYAN RONDES - comme sur ton screen 22:40
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=2.2+Math.random()*3.8; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.045+Math.random()*0.02; } geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (360.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.36,0.88,0.92),a*0.72);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  // DMX SYNTH + RESP
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); (bloom as any).strength=0.48; diamantMat.emissiveIntensity=0.18; }; setTimeout(ignite,200);
  let t=0,raf=0; const synth=(tt:number)=>{ if(!ws||ws.readyState!==1){ dmxRef.current={ch1:127+Math.sin(tt*0.6)*42, ch2:62+Math.sin(tt*0.4)*28, ch3:142+Math.sin(tt*0.8)*32, ch10:178+Math.sin(tt*0.3)*22}; } };
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; synth(t); const master=dmxRef.current.ch10/255; const prop=(dmxRef.current.ch1/255)*0.6*master; const breath=1.0+Math.sin(t*1.2)*0.025+prop*0.02; (cg as any).scale.setScalar(breath); cg.rotation.y+=0.0007*(0.5+prop); cg.rotation.x+=0.0002; pts.rotation.y+=0.0003; (bloom as any).strength=0.48+(dmxRef.current.ch2/255)*0.22; comp.render(); }; anim();
  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); m.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?(dmxOn?'#88ffff':'#3dd598'):'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
    {on?`V19.2.3.14 CONFORME DIAMANT • RESP • DMX SYNTH • M${sel??'-'}`:'⚡ CONFORME DIAMANT'}
   </div>
  </div>
 );
}
