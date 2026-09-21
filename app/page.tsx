
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V19.2.3.7 DIAMANT CŒUR ÉNERGÉTIQUE - SYMBOLIQUE 8 CŒURS-FLÈCHES DANS CŒUR NOYAU - BASÉ SUR V19.2.3.6 VALIDÉ
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768;
  const camZ=isMob?6.2:5.0; // ZOOM BALANCED 42% VALIDÉ
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.15)); renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.52,0.38,0.68); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.72));
  const coreLight=new THREE.PointLight(0x88ffff,72,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xffffff,42,8); coreLight2.position.set(0,0,0); scene.add(coreLight2);
  const coreGroup=new THREE.Group(); coreGroup.position.set(0,0,0); scene.add(coreGroup);

  // FRESNEL MIDDLE 0.48 - GARDÉ IDENTIQUE V19.2.3.6
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float c=0.30+uI*0.36+f*0.38*uI; vec3 col=vec3(0.44,0.92,0.88)*c; col*=uE; gl_FragColor=vec4(col,0.76); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},vertexShader:fresV,fragmentShader:fresF,transparent:true});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); middle.position.set(0,0,0); coreGroup.add(middle);

  // INNER 0.22 / 0.11 - GARDÉ
  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:3.8,transmission:0.995,thickness:0.52,ior:2.65,roughness:0.02,clearcoat:1.0,transparent:true,opacity:0.68});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); inner.position.set(0,0,0); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshPhysicalMaterial({color:0xaaffff,emissive:0xaaffff,emissiveIntensity:5.2,transmission:0.99,thickness:0.42,ior:2.65,roughness:0.01,clearcoat:1.0,transparent:true,opacity:0.74});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); inner2.position.set(0,0,0); coreGroup.add(inner2);

  // DIAMANT CŒUR ÉNERGÉTIQUE - SYMBOLIQUE DE TON IMAGE - DANS CŒUR 0,0,0
  const diamV='varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  const diamF=`
    varying vec3 vN; varying vec3 vP; uniform float uT; uniform float uI;
    void main(){
      vec3 p=vP;
      float ang=atan(p.y,p.x);
      float r=length(p.xy);
      float r3=length(p);
      // 8 branches étoile - comme ton diamant image
      float star1=pow(abs(cos(ang*4.0)), 12.0);
      float star2=pow(abs(cos(ang*4.0+3.14159/4.0)), 12.0);
      float sectors=mod(ang*4.0/3.14159,1.0);
      float triFac=1.0-smoothstep(0.0,0.35,abs(sectors-0.5)*2.0);
      // Cœurs-flèches 8x - sombre / clair alterné comme diamant brillant
      float heart=sin(ang*8.0+uT*0.3)*0.5+0.5;
      float arrow=cos(ang*8.0)*0.5+0.5;
      float facet=pow(triFac,0.8)*(0.6+0.4*heart);
      // Centre blanc pur - étoile 8 branches
      float center=1.0-smoothstep(0.0,0.18,r3*3.5);
      float spikes=star1*0.8+star2*0.6;
      float glowCenter=center*0.9+spikes*(1.0-r)*0.7;
      // Bleu énergétique - comme ton image bleu clair / blanc
      vec3 darkBlue=vec3(0.12,0.28,0.52);
      vec3 midBlue=vec3(0.28,0.62,0.88);
      vec3 lightBlue=vec3(0.72,0.92,1.0);
      vec3 white=vec3(1.0);
      vec3 col=mix(darkBlue,midBlue,facet);
      col=mix(col,lightBlue,arrow*0.5*facet);
      col+=white*glowCenter*1.4;
      // Dispersion arc-en-ciel sur bords - comme reflets diamant
      float edge=pow(r*2.2,3.0);
      col+=vec3(1.0,0.85,0.3)*edge*0.12*pow(sin(ang*8.0+1.0),2.0);
      col+=vec3(0.3,0.6,1.0)*edge*0.15*pow(cos(ang*8.0),2.0);
      // Pulsation énergétique
      col*=0.72+uI*0.38+sin(uT*2.2)*0.08;
      float alpha=0.72+facet*0.28+glowCenter*0.9;
      gl_FragColor=vec4(col,alpha);
    }
  `;
  const diamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.72}},vertexShader:diamV,fragmentShader:diamF,transparent:true,side:THREE.DoubleSide});
  const diamHeart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,4),diamMat); diamHeart.position.set(0,0,0); coreGroup.add(diamHeart);

  // Diamant physique transmission 2.417 - enveloppe
  const diamShellMat=new THREE.MeshPhysicalMaterial({color:0xffffff,emissive:0x88ffff,emissiveIntensity:0.42,transmission:0.998,thickness:0.32,ior:2.417,dispersion:0.35,roughness:0.01,clearcoat:1.0,clearcoatRoughness:0.02,transparent:true,opacity:0.42});
  const diamShell=new THREE.Mesh(new THREE.IcosahedronGeometry(0.26,3),diamShellMat); diamShell.position.set(0,0,0); coreGroup.add(diamShell);

  // Rond blanc focal 0,0,0 - gardé mais réduit pour laisser voir diamant
  const roundMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.42});
  const round=new THREE.Mesh(new THREE.SphereGeometry(0.04,32,32),roundMat); round.position.set(0,0,0.04); coreGroup.add(round);

  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.26,32,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.08})); glow.position.set(0,0,0); coreGroup.add(glow);
  const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.38,32,32),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.06})); glow2.position.set(0,0,0); coreGroup.add(glow2);

  const partGeo=new THREE.BufferGeometry(); const partPos=new Float32Array(156*3); for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=0.78+Math.random()*0.72; partPos[i*3]=Math.sin(ph)*Math.cos(th)*r; partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; partPos[i*3+2]=Math.cos(ph)*r; } partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3)); const partMat=new THREE.PointsMaterial({color:0x88ffff,size:0.016,transparent:true,opacity:0.42}); const particles=new THREE.Points(partGeo,partMat); scene.add(particles);

  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.52; middleMat.uniforms.uE.value=0.82; innerMat.emissiveIntensity=3.8; inner2Mat.emissiveIntensity=5.2; renderer.toneMappingExposure=0.82; coreLight.intensity=72; }; setTimeout(ignite,200); addEventListener('pointerdown',ignite,{once:true});
  let t=0, raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; diamMat.uniforms.uT.value=t; diamMat.uniforms.uI.value=0.72+Math.sin(t*2.2)*0.12; middleMat.uniforms.uI.value=0.52+Math.sin(t*2.2)*0.06+(ignited?0.10:0); const rot=0.0012; coreGroup.rotation.y+=rot; middle.rotation.y+=rot*0.38; inner.rotation.y-=rot*0.38; inner2.rotation.y+=rot*0.58; diamHeart.rotation.y-=rot*0.72; diamHeart.rotation.x=Math.sin(t*0.4)*0.08; diamShell.rotation.y+=rot*0.22; particles.rotation.y+=0.0018; round.scale.setScalar(1.0+Math.sin(t*3.0)*0.12); if(ignited){ const b=Math.sin(t*2.2)*0.05; middle.scale.setScalar(1.0+b*0.03); diamHeart.scale.setScalar(1.0+b*0.08); } composer.render(); }; animate();
  const onR=()=>{ const mob=innerWidth<768; camera.aspect=innerWidth/innerHeight; camera.fov=mob?34:32; camera.position.z=mob?6.2:5.0; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?'V19.2.3.7 DIAMANT CŒUR 8 CŒURS-FLÈCHES - SYMBOLIQUE ÉNERGÉTIQUE - 42% ZOOM':'⚡ IGNITION V19.2.3.7 DIAMANT CŒUR'}</div></div>);
}
