
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
  camera.position.set(0,0,isMobile?13.2:11.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.0:1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?0.78:0.92;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),isMobile?0.22:0.28,isMobile?0.75:0.65,isMobile?0.94:0.88);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,isMobile?0.42:0.55));
  const key=new THREE.PointLight(0xffffff,isMobile?38:60,50); key.position.set(4,4,5); scene.add(key);
  const fill=new THREE.PointLight(0x88ccff,22,30); fill.position.set(-4,-2,3); scene.add(fill);
  const coreLight=new THREE.PointLight(0xffffff,0,14); coreLight.position.set(0,0,0); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(isMobile?0.70:0.85); scene.add(coreGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.18})); coreGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.12})); coreGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.07})); coreGroup.add(outer3);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const branchMat=new THREE.LineBasicMaterial({color:0x88ccff, transparent:true, opacity:0.0});
  const branches:any[]=[]; const satPositions:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; satPositions.push(new THREE.Vector3(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0)); }
  satPositions.forEach((p, idx)=>{
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), p]);
    const line=new THREE.Line(geo, branchMat.clone()); branchGroup.add(line); branches.push(line);
    const next=satPositions[(idx+1)%6];
    const geo2=new THREE.BufferGeometry().setFromPoints([p, next]);
    const line2=new THREE.Line(geo2, branchMat.clone()); branchGroup.add(line2); branches.push(line2);
    const dir=p.clone().normalize().multiplyScalar(0.92);
    const geo3=new THREE.BufferGeometry().setFromPoints([p, dir]);
    const line3=new THREE.Line(geo3, branchMat.clone()); branchGroup.add(line3); branches.push(line3);
  });
  const fresnel={vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; uniform float uDiamond; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)), 2.8); float c=0.42+uI*0.58; float g=0.18+f*0.55*uI; vec3 diamond=vec3(0.85,0.92,1.0) + vec3(0.15,0.08,0.0)*f; vec3 col=diamond*(c+g*0.9); col*=uE; float sparkle=sin(uT*2.5 + f*8.0)*0.04*uI*uDiamond; float pulse=0.93+sin(uT*1.4)*0.07*uI; gl_FragColor=vec4(col*(pulse+sparkle), 0.82+uI*0.18); }`};
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:isMobile?0.78:0.92},uDiamond:{value:0}},vertexShader:fresnel.vertexShader,fragmentShader:fresnel.fragmentShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshPhysicalMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.22, roughness:0.15, metalness:0.1, transmission:0.25, thickness:0.45, ior:2.42, transparent:true, opacity:0.85});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.35, roughness:0.08, metalness:0.0, transmission:0.45, thickness:0.35, ior:2.42, clearcoat:1.0, transparent:true, opacity:0.92});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), inner2Mat); coreGroup.add(inner2);
  const satG=new THREE.Group(); coreGroup.add(satG); const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshPhysicalMaterial({color:0xffffff, emissive:0xffffff, emissiveIntensity:0.10, transmission:0.3, ior:2.42}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.055,14,14), mat); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satG.add(m); const l=new THREE.PointLight(0xaaccff,8,4); l.position.copy(m.position); satG.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.72+Math.random()*0.95; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0xaaccff,size:isMobile?0.010:0.013,transparent:true,opacity:0.38})); scene.add(particles);
  let ignition=0;
  const ignite=()=>{ if(ignition>=1) return; const start=performance.now(); const dur=3200; const loop=()=>{ const elapsed=(performance.now()-start)/dur; ignition=Math.min(1,elapsed); const e=ignition<0.5?2*ignition*ignition:-1+(4-2*ignition)*ignition; middleMat.uniforms.uI.value=e; middleMat.uniforms.uDiamond.value=e; bloom.strength=(isMobile?0.22:0.28)+e*(isMobile?0.18:0.28); innerMat.emissiveIntensity=0.22+e*0.68; inner2Mat.emissiveIntensity=0.35+e*1.15; coreLight.intensity=e*(isMobile?120:200); satMats.forEach(m=>m.emissiveIntensity=0.10+e*0.75); satLights.forEach(l=>l.intensity=8+e*28); middle.scale.setScalar(1+e*0.06); inner.scale.setScalar(1+e*0.16); inner2.scale.setScalar(1+e*0.12); branches.forEach((b:any)=>{ b.material.opacity=0.18*e; }); particles.material.opacity=0.38+e*0.22; if(ignition<1) requestAnimationFrame(loop); else if(navigator.vibrate) navigator.vibrate([60,30,120]); }; loop(); };
  setTimeout(ignite,700); window.addEventListener('pointerdown',ignite,{once:true}); window.addEventListener('touchstart',ignite,{once:true,passive:true} as any);
  let t=0, raf=0; const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t; const p=partGeo.attributes.position.array as Float32Array; for(let i=0;i<156;i++){ const ph=phases[i]+t*0.38; const a=0.009*(0.7+ignition*0.6)*Math.sin(ph); p[i*3]=orig[i*3]+Math.sin(ph)*a; p[i*3+1]=orig[i*3+1]+Math.cos(ph)*a; p[i*3+2]=orig[i*3+2]+Math.sin(ph*0.7)*a; } partGeo.attributes.position.needsUpdate=true; coreGroup.rotation.y+=0.001*(1+ignition*0.4); outer.rotation.y+=0.0012; outer2.rotation.y-=0.0009; middle.rotation.y+=0.0018; inner.rotation.y-=0.003; inner2.rotation.y+=0.005; satG.rotation.z+=0.0012*(1+ignition*0.3); particles.rotation.y+=0.0004; composer.render(); }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.84) 96%)',zIndex:2}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V27 DIAMANTIC LIVING — Z13.2 BRANCHES ON — ENTITE LUMINEUSE</div></div>);
}
