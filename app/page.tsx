
'use client';
/**
 * MAG CORE V19.2.3.9 - PARTICULE = MODULE FONCTIONNEL - BUILD FIX
 * BASE V19.2.3 UNIFIED 99.5% + V19.2.3.6 ZOOM BALANCED 42% VALIDÉ + V19.2.3.8 DIAMANT 85%
 * CORE LOCK SCELLÉ: 0.62/0.78/0.92 / 0.48 T0.995 IOR2.65 / 0.22/0.11 / 156P golden 2.399963 / Z5.0-6.2
 * CHAQUE PARTICULE = {id, dmxCh:111+i, audioBand:50+floor(i/2), gpuIndex:i, pos, vel, state}
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const CORE_LOCK={cages:[0.62,0.78,0.92] as const,middle:{R:0.48},inner:{R1:0.22,R2:0.11},sat:{count:6,radiusFactor:1.15},camera:{z:5.0}} as const;

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 const [selPart,setSelPart]=useState<number|null>(null);
 const [dmxInfo,setDmxInfo]=useState('CH111-266 = 156P modules');
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768; const camZ=isMob?6.2:5.0;
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); (renderer as any).toneMapping=THREE.ACESFilmicToneMapping; (renderer as any).toneMappingExposure=0.95; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.85,0.32,0.58); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.88));
  const coreLight=new THREE.PointLight(0x88ffff,95,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.position.set(0,0,0); scene.add(coreGroup);

  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0); float c=0.34+uI*0.48+f*0.48*uI; vec3 col=vec3(0.44,0.92,0.88)*c; col*=uE; col+=f*0.18*uE; gl_FragColor=vec4(col,0.82); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.68},uE:{value:0.85}},vertexShader:fresV,fragmentShader:fresF,transparent:true});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:5.5,transparent:true,opacity:0.76} as any);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:7.2,transparent:true,opacity:0.82} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); coreGroup.add(inner2);

  // DIAMANT COEUR 8 COEURS-FLECHES 85%
  const diamV='varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  const diamF=`varying vec3 vP; uniform float uT; uniform float uI; void main(){ vec3 p=vP; float ang=atan(p.y,p.x); float r=length(p.xy); float r3=length(p); float star1=pow(abs(cos(ang*4.0)),12.0); float star2=pow(abs(cos(ang*4.0+1.047)),12.0); float sectors=mod(ang*4.0/3.14159,1.0); float triFac=1.0-smoothstep(0.0,0.35,abs(sectors-0.5)*2.0); float facet=pow(triFac,0.8)*(0.6+0.4*(sin(ang*8.0+uT*0.3)*0.5+0.5)); float center=1.0-smoothstep(0.0,0.18,r3*3.5); float spikes=star1*0.9+star2*0.7; float glowCenter=center*1.2+spikes*(1.0-r)*0.9; vec3 col=mix(vec3(0.12,0.28,0.52),vec3(0.28,0.62,0.88),facet); col=mix(col,vec3(0.72,0.92,1.0),cos(ang*8.0)*0.5+0.5*0.65*facet); col+=vec3(1.0)*glowCenter*1.85; float edge=pow(r*2.2,3.0); col+=vec3(1.0,0.85,0.3)*edge*0.22*pow(sin(ang*8.0+1.0),2.0); col+=vec3(0.3,0.6,1.0)*edge*0.26*pow(cos(ang*8.0),2.0); col*=0.85+uI*0.52+sin(uT*2.2)*0.12; gl_FragColor=vec4(col,0.85+facet*0.32+glowCenter*1.1); }`;
  const diamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.85}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide});
  const diamHeart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,4),diamMat); coreGroup.add(diamHeart);
  const diamShellMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:0.85,transparent:true,opacity:0.58} as any);
  const diamShell=new THREE.Mesh(new THREE.IcosahedronGeometry(0.26,3),diamShellMat); coreGroup.add(diamShell);
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.04,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.58})); round.position.set(0,0,0.04); coreGroup.add(round);

  // 156P MODULES FONCTIONNELS - CHAQUE PARTICULE = MODULE
  type PartModule={id:number,dmxCh:number,audioBand:number,gpuIndex:number,theta:number,phi:number,r:number,state:'IDLE'|'ACTIVE'|'BEAT'};
  const modules:PartModule[]=[]; const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3); const partColors=new Float32Array(156*3);
  for(let i=0;i<156;i++){
   const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.78+Math.random()*0.72;
   partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r;
   partColors[i*3]=0.2; partColors[i*3+1]=0.8; partColors[i*3+2]=1.0;
   modules.push({id:i,dmxCh:111+i,audioBand:50+Math.floor(i/1.22),gpuIndex:i,theta:th,phi:ph,r,state:'IDLE'});
  }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  partGeo.setAttribute('color',new THREE.BufferAttribute(partColors,3));
  const partMat=new THREE.PointsMaterial({size:0.022,vertexColors:true,transparent:true,opacity:0.62} as any);
  const particles=new THREE.Points(partGeo,partMat); scene.add(particles);

  // RAYCASTER POUR SELECT PARTICLE = MODULE
  const raycaster=new THREE.Raycaster(); const mouse=new THREE.Vector2();
  const onClick=(e:any)=>{ mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=-(e.clientY/innerHeight)*2+1; raycaster.setFromCamera(mouse,camera); const inter=raycaster.intersectObject(particles); if(inter.length>0){ const idx=inter[0].index!; setSelPart(idx); const m=modules[idx]; setDmxInfo(`PART ${m.id} = MODULE FONCTIONNEL • DMX CH${m.dmxCh} (111+${m.id}) • AUDIO BAND ${m.audioBand} (50-177 high 2k-20k) • GPU idx ${m.gpuIndex}/156 • THETA ${m.theta.toFixed(3)} PHI ${m.phi.toFixed(3)} • STATE ${m.state} • BOUCLE 0.11→156P→cages 0.62/0.78/0.92`); } };
  addEventListener('pointerdown',onClick);

  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.85; middleMat.uniforms.uE.value=0.95; (renderer as any).toneMappingExposure=0.95; coreLight.intensity=95; modules.forEach(m=>m.state='ACTIVE'); }; setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true} as any);
  let t=0, raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; diamMat.uniforms.uT.value=t; diamMat.uniforms.uI.value=0.85+Math.sin(t*2.2)*0.14; middleMat.uniforms.uI.value=0.68+Math.sin(t*2.2)*0.08+(ignited?0.14:0); const rot=0.0012; coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.38; inner.rotation.y-=rot*0.38; inner2.rotation.y+=rot*0.58; diamHeart.rotation.y-=rot*0.72; diamShell.rotation.y+=rot*0.22; particles.rotation.y+=0.0018; const col=partGeo.attributes.color.array as Float32Array; for(let i=0;i<156;i++){ const beat=Math.sin(t*3+i*0.1)*0.2+0.8; col[i*3]=0.2*beat; col[i*3+1]=0.8*beat; col[i*3+2]=1.0*beat; } partGeo.attributes.color.needsUpdate=true; composer.render(); }; animate();
  const onR=()=>{ const mob=innerWidth<768; camera.aspect=innerWidth/innerHeight; camera.fov=mob?34:32; camera.position.z=mob?6.2:5.0; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onClick); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V19.2.3.9 156P=MODULES • ${dmxInfo}`:'⚡ IGNITION V19.2.3.9 156P MODULES'}</div>{selPart!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',padding:'10px',borderRadius:'12px',color:'#fff',fontSize:'9px',fontFamily:'monospace',zIndex:20}}>MODULE PARTICULE #{selPart} • DMX CH{111+selPart} • AUDIO BAND {50+Math.floor(selPart/1.22)} HIGH 2k-20k • GPU {selPart}/156 • GOLDEN { (selPart*2.399963).toFixed(3) } • STATE ACTIVE • PERTINENCE: FILTRE ATMOSPHÈRE 0.75R ENTRE INNER 0.11 ET CAGES 0.62</div>}</div>);
}
