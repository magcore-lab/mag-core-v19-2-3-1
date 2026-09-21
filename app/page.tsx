'use client';
// V19.2.3.22 FIX SCANLINES - NOYAU 15% VRAI DIAMANT ROND - 0 BRANCHE - SUPER PROD
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
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const bloom=new (UnrealBloomPass as any)(new THREE.Vector2(innerWidth,innerHeight),0.52,0.38,0.72); comp.addPass(bloom);
  let ws:any=null; try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>setDmxOn(true); ws.onmessage=(e:any)=>{ try{ const j=JSON.parse(e.data); if(j.channels){ const c=j.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; }catch{}
  sc.add(new THREE.AmbientLight(0xffffff,0.68));
  const coreLight=new THREE.PointLight(0x88ffff,32,8); coreLight.position.set(0,0,1.2); sc.add(coreLight);
  const cg=new THREE.Group(); (cg as any).scale.setScalar(1.0); sc.add(cg);
  // FIX - VRAI DIAMANT - PAS DE SHADER CUSTOM - 1 SEUL PHYSICAL MAT
  const innerMat=new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.18,transmission:0.996,thickness:0.56,ior:2.417,dispersion:0.32,roughness:0.04,clearcoat:1.0,clearcoatRoughness:0.06,transparent:true,opacity:0.42} as any);
  const mid=new THREE.Mesh(new THREE.SphereGeometry(0.52,64,64),innerMat); cg.add(mid);
  const inner2=new THREE.Mesh(new THREE.SphereGeometry(0.24,32,32),new (THREE as any).MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:0.22,transmission:0.992,thickness:0.48,ior:2.417,roughness:0.06,clearcoat:0.8,transparent:true,opacity:0.38} as any)); cg.add(inner2);
  const coreDot=new THREE.Mesh(new THREE.SphereGeometry(0.08,24,24),new (THREE as any).MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.72} as any)); cg.add(coreDot);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.68,24,24),new (THREE as any).MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.03} as any)); cg.add(glow);
  // 256P FOND SUBTIL
  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(256*3); for(let i=0;i<256;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/256); const r=1.9+Math.random()*2.6; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); sc.add(new THREE.Points(partGeo,new (THREE as any).PointsMaterial({color:0x88ffff,size:0.01,transparent:true,opacity:0.22} as any)));
  // 156P RONDES PARFAITES - PAS DE CARRE
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const sz=new Float32Array(156); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=1.44+Math.random()*0.42; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; sz[i]=0.052+Math.random()*0.014; } geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('size',new THREE.BufferAttribute(sz,1));
  const pV='attribute float size; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=size* (360.0 / -mv.z); gl_Position=projectionMatrix*mv;}';
  const pF='void main(){ float d=distance(gl_PointCoord,vec2(0.5)); if(d>0.5) discard; float a=1.0-smoothstep(0.2,0.5,d); gl_FragColor=vec4(vec3(0.18,0.78,0.98),a*0.72);}';
  const pMat=new (THREE as any).ShaderMaterial({vertexShader:pV,fragmentShader:pF,transparent:true}); const pts=new THREE.Points(geo,pMat); sc.add(pts);
  const hg=new THREE.Group(); sc.add(hg);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.045,20,20),new (THREE as any).MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0})); hg.add(hc);
  const hr=new THREE.Mesh(new THREE.RingGeometry(0.07,0.12,40),new (THREE as any).MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide})); hg.add(hr);
  const hr2=new THREE.Mesh(new THREE.RingGeometry(0.16,0.21,40),new (THREE as any).MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0,side:THREE.DoubleSide})); hg.add(hr2);
  const hl=new THREE.PointLight(0x88ffff,1.4,2.4); hg.add(hl); let ht=0; let act=-1;
  const ray=new THREE.Raycaster(); (ray.params as any).Points={threshold:0.16}; const mu=new THREE.Vector2();
  const onP=(e:PointerEvent)=>{ mu.x=(e.clientX/innerWidth)*2-1; mu.y=-(e.clientY/innerHeight)*2+1; ray.setFromCamera(mu,cam); const h=ray.intersectObject(pts); if(h.length>0){ const id=h[0].index!; setSel(id); act=id; ht=0; const p=new THREE.Vector3(pos[id*3],pos[id*3+1],pos[id*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p); (hc.material as any).opacity=0.52; (hr.material as any).opacity=0.38; (hr2.material as any).opacity=0.18; hl.intensity=48; }};
  addEventListener('pointerdown',onP);
  let ign=false; const ignite=()=>{ if(ign) return; ign=true; setOn(true); (bloom as any).strength=0.52; innerMat.emissiveIntensity=0.28; }; setTimeout(ignite,180);
  let t=0,raf=0; const synth=(tt:number)=>{ if(!ws||ws.readyState!==1){ dmxRef.current={ch1:127+Math.sin(tt*0.6)*42, ch2:62+Math.sin(tt*0.4)*28, ch3:142+Math.sin(tt*0.8)*32, ch10:178+Math.sin(tt*0.3)*22}; } };
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; synth(t); const prop=(dmxRef.current.ch1/255)*0.55*(dmxRef.current.ch10/255); const breath=1.0+Math.sin(t*1.1)*0.018+prop*0.01; (cg as any).scale.setScalar(breath); cg.rotation.y+=0.0006*(0.5+prop); pts.rotation.y+=0.0005; mid.rotation.y+=0.0004; if(act>=0){ ht+=0.016; const pu=1+Math.sin(ht*3.0)*0.05; (hc as any).scale.setScalar(pu); (hr as any).scale.setScalar(pu*1.03); (hr2 as any).scale.setScalar(pu*1.06); const p=new THREE.Vector3(pos[act*3],pos[act*3+1],pos[act*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p);} comp.render(); }; anim();
  const onR=()=>{ const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onP); m.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close(); };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?(dmxOn?'#88ffff':'#3dd598'):'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,letterSpacing:'0.1em',zIndex:10}}>
    {on?`V19.2.3.22 FIX PLANETE • NOYAU 15% ROND DIAMANT • 0 BRANCHE • M${sel??'-'}`:'⚡ IGNITION FIX'}
   </div>
  </div>
 );
}
