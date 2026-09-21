'use client';
// V19.2.3.10 REACTION FIX - CHAQUE PARTICULE REAGIT - BUILD SAFE
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 const [sel,setSel]=useState<number|null>(null);
 const [info,setInfo]=useState('156P MODULES - CLIQUE UNE PARTICULE');
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768; const camZ=isMob?6.2:5.0;
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ); camera.lookAt(0,0,0);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); (renderer as any).toneMapping=THREE.ACESFilmicToneMapping; (renderer as any).toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.52,0.38,0.68); composer.addPass(bloom); // 0.85→0.52 pour éviter plat blanc
  scene.add(new THREE.AmbientLight(0xffffff,0.72));
  const coreLight=new THREE.PointLight(0x88ffff,72,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); scene.add(coreGroup);

  // MIDDLE 0.48 - TRANSPARENT POUR LAISSER VOIR INNER + DIAMANT
  const fresV='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float c=0.30+uI*0.36+f*0.38*uI; vec3 col=vec3(0.44,0.92,0.88)*c; col*=uE; gl_FragColor=vec4(col,0.38); }'; // alpha 0.76→0.38 pour voir inner
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},vertexShader:fresV,fragmentShader:fresF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.85} as any); // Basic pour éviter occlusion
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.92} as any);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat); coreGroup.add(inner2);

  // DIAMANT COEUR 8 BRANCHES - VISIBLE DANS COEUR
  const diamV='varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }';
  const diamF=`varying vec3 vP; uniform float uT; void main(){ float ang=atan(vP.y,vP.x); float r=length(vP.xy); float star=pow(abs(cos(ang*4.0)),12.0)+pow(abs(cos(ang*4.0+0.785)),12.0); float center=1.0-smoothstep(0.0,0.22,length(vP)*3.0); vec3 col=mix(vec3(0.12,0.28,0.52),vec3(0.72,0.92,1.0),cos(ang*8.0)*0.5+0.5); col+=vec3(1.0)*center*1.2+star*0.6; gl_FragColor=vec4(col,0.82); }`;
  const diamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:diamV,fragmentShader:diamF,transparent:true});
  const diamHeart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,3),diamMat); coreGroup.add(diamHeart);

  // 156P MODULES - RONDS + REACTIFS
  const modules=Array.from({length:156},(_,i)=>({id:i,dmxCh:111+i,audio:50+Math.floor(i/1.22)}));
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const colors=new Float32Array(156*3); const sizes=new Float32Array(156);
  for(let i=0;i<156;i++){ const th=i*2.399963; const ph=Math.acos(1-2*i/156); const r=1.2+Math.random()*0.8; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; colors[i*3]=0.2; colors[i*3+1]=0.8; colors[i*3+2]=1.0; sizes[i]=0.04; }
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  // Texture ronde pour particules
  const canvas=document.createElement('canvas'); canvas.width=64; canvas.height=64; const ctx=canvas.getContext('2d')!; const grad=ctx.createRadialGradient(32,32,0,32,32,32); grad.addColorStop(0,'white'); grad.addColorStop(0.4,'white'); grad.addColorStop(1,'transparent'); ctx.fillStyle=grad; ctx.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(canvas);
  const mat=new THREE.PointsMaterial({size:0.06,map:tex,vertexColors:true,transparent:true,opacity:0.85,depthWrite:false} as any);
  const particles=new THREE.Points(geo,mat); scene.add(particles);

  const raycaster=new THREE.Raycaster(); (raycaster.params as any).Points={threshold:0.15}; const mouse=new THREE.Vector2();
  const onPointer=(e:PointerEvent)=>{ mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=-(e.clientY/innerHeight)*2+1; raycaster.setFromCamera(mouse,camera); const hits=raycaster.intersectObject(particles); if(hits.length>0){ const idx=hits[0].index!; setSel(idx); const m=modules[idx]; setInfo(`MODULE ${m.id} ACTIF • DMX CH${m.dmxCh} • AUDIO BAND ${m.audio} HIGH 2k-20k • THETA ${(idx*2.399963).toFixed(2)} • CLICK REAGIT`); // feedback visuel
   const c=geo.attributes.color.array as Float32Array; c[idx*3]=1; c[idx*3+1]=1; c[idx*3+2]=1; geo.attributes.color.needsUpdate=true; setTimeout(()=>{ c[idx*3]=0.2; c[idx*3+1]=0.8; c[idx*3+2]=1; geo.attributes.color.needsUpdate=true; },400); } };
  addEventListener('pointerdown',onPointer);

  let ignited=false; const ignite=()=>{ if(ignited) return; ignited=true; setOn(true); bloom.strength=0.62; (renderer as any).toneMappingExposure=0.88; setInfo('NOYAU ALLUMÉ - CLIQUE UNE PARTICULE POUR ACTIVER SON MODULE'); }; setTimeout(ignite,300);
  let t=0,raf=0; const animate=()=>{ raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; (diamMat.uniforms as any).uT.value=t; middleMat.uniforms.uI.value=0.52+Math.sin(t*2.2)*0.06+(ignited?0.1:0); coreGroup.rotation.y+=0.0012; middle.rotation.y+=0.0005; diamHeart.rotation.y-=0.0009; particles.rotation.y+=0.001; composer.render(); }; animate();
  const onR=()=>{ const mob=innerWidth<768; camera.aspect=innerWidth/innerHeight; camera.fov=mob?34:32; camera.position.z=mob?6.2:5.0; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); }; addEventListener('resize',onR);
  return()=>{ cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onPointer); mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V19.2.3.10 REACTION FIX • ${info}`:'⚡ IGNITION V19.2.3.10'}</div>{sel!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(0,255,255,0.12)',border:'1px solid #88ffff',padding:'12px',borderRadius:'12px',color:'#fff',fontSize:'10px',fontFamily:'monospace'}}>MODULE {sel} • DMX CH{111+sel} → {sel} • AUDIO BAND {50+Math.floor(sel/1.22)} • GOLDEN {(sel*2.399963).toFixed(3)} • FONCTION: FILTRE ATMOSPHÈRE 0.75R-1.45R • STATUS: ACTIVE ON CLICK</div>}</div>);
}
