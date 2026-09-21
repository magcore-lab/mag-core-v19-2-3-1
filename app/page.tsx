'use client';
// V19.2.3.13 PROD FIX TS - RESPIRATION + MATRICE + DMX ACTIF - BUILD OK
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
  const mob=innerWidth<768; const z=mob?7.44:6.0; const fov=mob?38:36;
  const cam=new THREE.PerspectiveCamera(fov,innerWidth/innerHeight,0.1,100); cam.position.set(0,0,z);
  const ren=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); ren.setSize(innerWidth,innerHeight); ren.setPixelRatio(Math.min(devicePixelRatio,1.25));
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping; (ren as any).toneMappingExposure=0.88; m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren); comp.addPass(new RenderPass(sc,cam)); const bloom=new (UnrealBloomPass as any)(new THREE.Vector2(innerWidth,innerHeight),0.68,0.42,0.78); comp.addPass(bloom);
  let ws:any=null; try{ ws=new WebSocket('ws://localhost:8081'); ws.onopen=()=>setDmxOn(true); ws.onmessage=(e:any)=>{ try{ const msg=JSON.parse(e.data); if(msg.channels){ const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v))); dmxRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch10:cl(c[9])}; } }catch{} }; ws.onclose=()=>setDmxOn(false); ws.onerror=()=>setDmxOn(false);}catch{ setDmxOn(false); }
  sc.add(new THREE.AmbientLight(0xffffff,0.82));
  const cg=new THREE.Group(); (cg as any).scale.setScalar(1.04); sc.add(cg);
  const fresV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fresF='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2);float q=sin(uT*2.8+length(vN)*6.0)*0.14+cos(uT*1.3+vN.x*4.0)*0.10;float c=0.42+uI*0.32+q;float g=0.18+f*0.36*uI;vec3 col=vec3(0.88,0.96,1.0)*(c+g);col+=vec3(0.18,0.32,0.52)*f*uI*0.62;col+=vec3(0.42,0.88,1.0)*q*0.42;col*=uE;gl_FragColor=vec4(col,0.84);}';
  const mMat=new (THREE as any).ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.58},uE:{value:0.88}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const mid=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),mMat); cg.add(mid);
  const innerMat=new (THREE as any).MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:0.38,transmission:0.998,thickness:0.68,ior:2.417,dispersion:0.28,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.72} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); cg.add(inner);
  const inner2Mat=new (THREE as any).MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:0.52,transmission:0.99,thickness:0.58,ior:2.417,dispersion:0.22,roughness:0.01,clearcoat:1.0,transparent:true,opacity:0.78} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); cg.add(inner2);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.12} as any)); cg.add(glow);
  const dMat=new (THREE as any).ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vP;uniform float uT;void main(){float a=atan(vP.y,vP.x);float s=pow(abs(cos(a*4.0)),12.0);float c=1.0-smoothstep(0.0,0.22,length(vP)*3.0);vec3 col=mix(vec3(0.12,0.28,0.52),vec3(0.72,0.92,1.0),cos(a*8.0+uT)*0.5+0.5);col+=vec3(1.0)*c*0.85+s*0.45;gl_FragColor=vec4(col,0.82);}',transparent:true});
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,3),dMat); cg.add(diam);
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const colA=new Float32Array(156*3);
  for(let i=0;i<156;i++){const th=i*2.399963;const ph=Math.acos(1-2*i/156);const r=1.35+Math.random()*0.7;pos[i*3]=Math.sin(ph)*Math.cos(th)*r;pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;pos[i*3+2]=Math.cos(ph)*r;colA[i*3]=0.2;colA[i*3+1]=0.85;colA[i*3+2]=1;}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(colA,3));
  const cvs=document.createElement('canvas'); cvs.width=64; cvs.height=64; const ctx=cvs.getContext('2d')!; const g=ctx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'white'); g.addColorStop(0.4,'white'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(cvs);
  const mat=new (THREE as any).PointsMaterial({size:0.065,map:tex,vertexColors:true,transparent:true,opacity:0.78} as any); const pts=new THREE.Points(geo,mat); sc.add(pts);
  const hg=new THREE.Group(); sc.add(hg);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.055,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0} as any)); hg.add(hc);
  const hr=new THREE.Mesh(new THREE.RingGeometry(0.09,0.16,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); hg.add(hr);
  const hr2=new THREE.Mesh(new THREE.RingGeometry(0.19,0.26,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); hg.add(hr2);
  const hl=new THREE.PointLight(0x88ffff,0,2.8); hg.add(hl); let ht=0; let act=-1;
  const ray=new THREE.Raycaster(); (ray.params as any).Points={threshold:0.22}; const mu=new THREE.Vector2();
  const onP=(e:PointerEvent)=>{mu.x=(e.clientX/innerWidth)*2-1; mu.y=-(e.clientY/innerHeight)*2+1; ray.setFromCamera(mu,cam); const h=ray.intersectObject(pts); if(h.length>0){const id=h[0].index!; setSel(id); act=id; ht=0; const p=new THREE.Vector3(pos[id*3],pos[id*3+1],pos[id*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p); (hc.material as any).opacity=0.65; (hr.material as any).opacity=0.42; (hr2.material as any).opacity=0.18; hl.intensity=72;}};
  addEventListener('pointerdown',onP);
  let ign=false; const ignite=()=>{if(ign) return; ign=true; setOn(true); (bloom as any).strength=0.68; (bloom as any).radius=0.42; (innerMat as any).emissiveIntensity=1.15; (inner2Mat as any).emissiveIntensity=1.25; (mMat as any).uniforms.uE.value=0.92;}; setTimeout(ignite,200);
  let t=0,raf=0; const synth=(tt:number)=>{ if(!ws||ws.readyState!==1){ dmxRef.current={ch1:127+Math.sin(tt*0.6)*42, ch2:62+Math.sin(tt*0.4)*28, ch3:142+Math.sin(tt*0.8)*32, ch10:178+Math.sin(tt*0.3)*22}; } };
  const anim=()=>{raf=requestAnimationFrame(anim); t+=0.016; synth(t); (mMat as any).uniforms.uT.value=t; (dMat as any).uniforms.uT.value=t; (mMat as any).uniforms.uI.value=0.58+Math.sin(t*2.8)*0.22+Math.sin(t*1.3)*0.10+(ign?0.18:0); const dmx=dmxRef.current; const master=dmx.ch10/255; const prop=(dmx.ch1/255)*0.8*master; const bloomMod=(dmx.ch2/255)*0.38; (bloom as any).strength=0.68+bloomMod*0.28; const breath=1.0+Math.sin(t*1.2)*0.04*master; (cg as any).scale.setScalar(breath); (mid as any).scale.setScalar(1.0+Math.sin(t*2.2)*0.06); (inner as any).scale.setScalar(1.0+Math.sin(t*1.8)*0.04); (inner2 as any).scale.setScalar(1.08+Math.sin(t*2.5)*0.05); (glow as any).scale.setScalar(1.0+Math.sin(t*1.1)*0.12); const rot=0.0011*(0.5+prop); cg.rotation.y+=rot; mid.rotation.y+=rot*0.52; inner.rotation.y-=rot*0.52; diam.rotation.y-=rot*0.4; pts.rotation.y+=0.0018; if(act>=0){ht+=0.016; const pu=1+Math.sin(ht*4.5)*0.14; (hc as any).scale.setScalar(pu); (hr as any).scale.setScalar(pu*1.1); (hr2 as any).scale.setScalar(pu*1.2); hr.rotation.z+=0.04; hr2.rotation.z-=0.03; const p=new THREE.Vector3(pos[act*3],pos[act*3+1],pos[act*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p);} comp.render();}; anim();
  const onR=()=>{const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight);}; addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onP); m.removeChild(ren.domElement); ren.dispose(); if(ws) ws.close();};
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?(dmxOn?'#88ffff':'#3dd598'):'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
    {on?`V19.2.3.13 PROD RESPIRATION + DMX ${dmxOn?'WS':'SYNTH'} • M${sel??'-'} • Z6.0/7.44`:'⚡ IGNITION RESPIRATION'}
   </div>
   {sel!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(0,255,255,0.10)',border:'1px solid rgba(136,255,255,0.42)',padding:12,borderRadius:14,color:'#fff',fontSize:10,fontFamily:'monospace'}}>✨ HALO MODULE {sel} CH{111+sel} • RESPIRATION MATRICE • DMX CH1/2/3/10 • ECLAT EQUILIBRE • DEZOOM 20%</div>}
  </div>
 );
}
