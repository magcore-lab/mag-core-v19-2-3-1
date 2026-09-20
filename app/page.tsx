'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V30 DRONE ADAPTE - INTERPOLATION QUANTIQUE
// CORE LOCK 0.62/0.78/0.92 R0.48
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
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const droneGroup=new THREE.Group(); coreGroup.add(droneGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.15})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,2), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.10})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,1), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.06})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const makeBranch=(p1:THREE.Vector3,p2:THREE.Vector3,color:number)=>{ const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]); const mat=new THREE.LineBasicMaterial({color, transparent:true, opacity:0.0}); const line=new THREE.Line(geo, mat); branchGroup.add(line); branches.push({line, p1, p2}); };
  satPos.forEach((p,i)=>{ makeBranch(new THREE.Vector3(0,0,0), p, 0xffffff); makeBranch(p, satPos[(i+1)%6], 0x88ccff); const dir=p.clone().normalize().multiplyScalar(0.92); makeBranch(p, dir, 0xaaccff); });
  const drones:any[]=[];
  const cfgs=[{r:0.95,speed:0.004,tilt:0.3,color:0x88ccff},{r:1.25,speed:-0.0025,tilt:-0.5,color:0xffffff},{r:1.55,speed:0.0018,tilt:0.8,color:0xaaccff}];
  cfgs.forEach(cfg=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.035,1), new THREE.MeshStandardMaterial({color:cfg.color, emissive:cfg.color, emissiveIntensity:0.15}));
    const light=new THREE.PointLight(cfg.color,12,4);
    const tGeo=new THREE.BufferGeometry(); const tPos=new Float32Array(24*3); tGeo.setAttribute('position', new THREE.BufferAttribute(tPos,3));
    const trail=new THREE.Points(tGeo, new THREE.PointsMaterial({color:cfg.color,size:0.012,transparent:true,opacity:0.0}));
    g.add(body); g.add(light); g.add(trail); droneGroup.add(g);
    drones.push({mesh:g, body, light, trail, tPos, cfg, angle:Math.random()*6.28});
  });
  const flowGeo=new THREE.BufferGeometry(); const flowCount=64; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0x88ccff,size:isMobile?0.016:0.020,transparent:true,opacity:0.0});
  const flowPoints=new THREE.Points(flowGeo, flowMat); branchGroup.add(flowPoints);
  const fresnel={vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uD; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.8); float c=0.40+uI*0.35+uD*0.08; float g=0.12+f*(0.28*uI+0.12*uD); vec3 col=vec3(0.92+g*0.05,0.93+g*0.04,0.97+g*0.02); col*=c+g*0.6; col*=uE; float dp=sin(uT*2.2+uD*6.28)*0.04*uD; gl_FragColor=vec4(col*(0.95+sin(uT*1.2)*0.03*uI+dp), 0.78+uI*0.10); }`};
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:isMobile?0.70:0.86},uD:{value:0}},vertexShader:fresnel.vertexShader,fragmentShader:fresnel.fragmentShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,4), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xd8d8d8,emissive:0xffffff,emissiveIntensity:0.14,transparent:true,opacity:0.78});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,3), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x88ccff,emissiveIntensity:0.20,transparent:true,opacity:0.86});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,2), inner2Mat); coreGroup.add(inner2);
  const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaccff,emissiveIntensity:0.06}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.045,12,12), mat); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satGroup.add(m); const l=new THREE.PointLight(0xaaccff,4,3.2); l.position.copy(m.position); satGroup.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.74+Math.random()*0.88; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0x88ccff,size:isMobile?0.008:0.010,transparent:true,opacity:0.28})); scene.add(particles);
  let ignition=0; const TARGET=0.50;
  const ignite=()=>{ if(ignition>=TARGET) return; const start=performance.now(); const dur=2400; const loop=()=>{ const e=Math.min(TARGET,(performance.now()-start)/dur * TARGET); ignition=e; middleMat.uniforms.uI.value=e; bloom.strength=(isMobile?0.14:0.18)+e*0.08; innerMat.emissiveIntensity=0.14+e*0.22; inner2Mat.emissiveIntensity=0.20+e*0.28; coreLight.intensity=e*(isMobile?55:85); satMats.forEach(m=>m.emissiveIntensity=0.06+e*0.14); satLights.forEach(l=>l.intensity=4+e*8); middle.scale.setScalar(1+e*0.03); branches.forEach((b:any)=>b.line.material.opacity=e*0.14); flowMat.opacity=e*0.42; particles.material.opacity=0.28+e*0.12; drones.forEach((d:any)=>{ d.body.material.emissiveIntensity=0.15+e*0.45; d.light.intensity=12+e*18; d.trail.material.opacity=e*0.28; }); if(ignition<TARGET-0.01) requestAnimationFrame(loop); else if(navigator.vibrate) navigator.vibrate([40,20,60]); }; loop(); };
  setTimeout(ignite,600); window.addEventListener('pointerdown',()=>{ if(ignition<TARGET) ignite(); },{once:true}); window.addEventListener('touchstart',()=>{ if(ignition<TARGET) ignite(); },{once:true,passive:true} as any);
  let t=0, raf=0; const flowSpeeds=new Float32Array(64).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<64;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.011+ignition*0.014; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    drones.forEach((d:any,i)=>{ d.angle+=d.cfg.speed*(1+ignition*0.8); const r=d.cfg.r*(1+Math.sin(t*0.3+i)*0.04*ignition); d.mesh.position.set(Math.cos(d.angle)*r, Math.sin(d.angle)*r*Math.cos(d.cfg.tilt), Math.sin(d.angle)*r*Math.sin(d.cfg.tilt)); const tp=d.tPos; for(let j=23;j>0;j--){ tp[j*3]=tp[(j-1)*3]; tp[j*3+1]=tp[(j-1)*3+1]; tp[j*3+2]=tp[(j-1)*3+2]; } tp[0]=d.mesh.position.x; tp[1]=d.mesh.position.y; tp[2]=d.mesh.position.z; d.trail.geometry.attributes.position.needsUpdate=true; });
    middleMat.uniforms.uD.value=Math.sin(t*0.8)*0.1*ignition;
    const globalRot=0.0009*(1+ignition*0.5);
    coreGroup.rotation.y+=globalRot; branchGroup.rotation.y-=globalRot*0.32; cageGroup.rotation.y+=globalRot*0.18; middle.rotation.y+=globalRot*0.45; inner.rotation.y-=globalRot*0.65; inner2.rotation.y+=globalRot*0.95; satGroup.rotation.z+=globalRot*0.35; particles.rotation.y+=globalRot*0.16;
    composer.render();
  }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 46%, rgba(0,0,0,0.84) 96%)',zIndex:2}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V30 DRONE ADAPTE — 50% ON — INTERPOLATION QUANTIQUE</div><div style={{position:'fixed',bottom:8,left:8,right:8,display:'flex',justifyContent:'space-between',zIndex:10,fontSize:6,fontFamily:'monospace',color:'rgba(255,255,255,0.48)'}}><span>DRONE ALPHA BETA GAMMA r0.95/1.25/1.55 | 18 BRANCHES 64 FLOW | WEIGHTED OSC MIDI AUDIO DMX</span><span>Z14.2 CORE 0.68 • 50% CANALISE • OS COMPLET</span></div></div>);
}
