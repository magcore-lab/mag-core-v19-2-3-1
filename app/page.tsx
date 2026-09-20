'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?14.2:11.8);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.0:1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?0.70:0.86;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),isMobile?0.14:0.18,isMobile?0.80:0.70,isMobile?0.97:0.93);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,isMobile?0.40:0.52));
  const key=new THREE.PointLight(0xffffff,isMobile?30:48,50); key.position.set(4,4,5); scene.add(key);
  const coreLight=new THREE.PointLight(0x88ccff,0,14); coreLight.position.set(0,0,0); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(isMobile?0.68:0.82); scene.add(coreGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.15})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,2), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.10})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,1), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.06})); coreGroup.add(outer3);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const makeBranch=(p1:THREE.Vector3,p2:THREE.Vector3,color:number)=>{
    const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]);
    const mat=new THREE.LineBasicMaterial({color, transparent:true, opacity:0.0});
    const line=new THREE.Line(geo, mat); branchGroup.add(line); branches.push({line, p1, p2});
  };
  satPos.forEach((p,i)=>{
    makeBranch(new THREE.Vector3(0,0,0), p, 0xffffff);
    makeBranch(p, satPos[(i+1)%6], 0x88ccff);
    const dir=p.clone().normalize().multiplyScalar(0.92); makeBranch(p, dir, 0xaaccff);
  });
  const flowGeo=new THREE.BufferGeometry(); const flowCount=48; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos,3));
  const flowMats=new THREE.PointsMaterial({color:0x88ccff, size:isMobile?0.016:0.020, transparent:true, opacity:0.0});
  const flowPoints=new THREE.Points(flowGeo, flowMats); branchGroup.add(flowPoints);
  const fresnel={vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8); float c=0.40+uI*0.35; float g=0.12+f*0.28*uI; vec3 col=vec3(0.92+g*0.05,0.93+g*0.04,0.97+g*0.02); col*=c+g*0.6; col*=uE; gl_FragColor=vec4(col*(0.95+sin(uT*1.2)*0.03*uI), 0.78+uI*0.10); }`};
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:isMobile?0.70:0.86}},vertexShader:fresnel.vertexShader,fragmentShader:fresnel.fragmentShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xd8d8d8,emissive:0xffffff,emissiveIntensity:0.14,transparent:true,opacity:0.78});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ccff,emissiveIntensity:0.20,transparent:true,opacity:0.86});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2), inner2Mat); coreGroup.add(inner2);
  const satG=new THREE.Group(); coreGroup.add(satG); const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaccff,emissiveIntensity:0.06}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.045,12,12), mat); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satG.add(m); const l=new THREE.PointLight(0xaaccff,4,3.2); l.position.copy(m.position); satG.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.74+Math.random()*0.88; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0x88ccff,size:isMobile?0.008:0.010,transparent:true,opacity:0.28})); scene.add(particles);
  let ignition=0; const TARGET=0.50;
  const ignite=()=>{ if(ignition>=TARGET) return; const start=performance.now(); const dur=2200; const loop=()=>{ const e=Math.min(TARGET,(performance.now()-start)/dur * TARGET); ignition=e; middleMat.uniforms.uI.value=e; bloom.strength=(isMobile?0.14:0.18)+e*0.08; innerMat.emissiveIntensity=0.14+e*0.22; inner2Mat.emissiveIntensity=0.20+e*0.28; coreLight.intensity=e*(isMobile?55:85); satMats.forEach(m=>m.emissiveIntensity=0.06+e*0.14); satLights.forEach(l=>l.intensity=4+e*8); middle.scale.setScalar(1+e*0.03); branches.forEach((b:any)=>b.line.material.opacity=e*0.14); flowMats.opacity=e*0.42; particles.material.opacity=0.28+e*0.12; if(ignition<TARGET-0.01) requestAnimationFrame(loop); else if(navigator.vibrate) navigator.vibrate([40]); }; loop(); };
  setTimeout(ignite,500); window.addEventListener('pointerdown',()=>{ if(ignition<TARGET) ignite(); },{once:true}); window.addEventListener('touchstart',()=>{ if(ignition<TARGET) ignite(); },{once:true,passive:true} as any);
  let t=0, raf=0; const flowSpeeds=new Float32Array(48).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<48;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.010+ignition*0.012; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    const globalRot=0.0008*(1+ignition*0.4);
    coreGroup.rotation.y+=globalRot; branchGroup.rotation.y-=globalRot*0.30;
    outer.rotation.y+=globalRot*0.25; middle.rotation.y+=globalRot*0.40;
    inner.rotation.y-=globalRot*0.60; inner2.rotation.y+=globalRot*0.90;
    satG.rotation.z+=globalRot*0.30; particles.rotation.y+=globalRot*0.15;
    composer.render();
  }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,0.84) 96%)',zIndex:2}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V29 — NOYAU 50% ON CANALISE — Z14.2 FLOW</div></div>);
}
