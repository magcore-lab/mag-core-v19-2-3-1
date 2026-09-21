
'use client';
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false); const [sel,setSel]=useState<number|null>(null);
 const [info,setInfo]=useState('156 MODULES - CLIQUE');
 useEffect(()=>{
  const mount=ref.current!; const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const isMob=innerWidth<768; const camZ=isMob?6.2:5.0;
  const camera=new THREE.PerspectiveCamera(isMob?34:32,innerWidth/innerHeight,0.1,100); camera.position.set(0,0,camZ);
  const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); (renderer as any).toneMapping=THREE.ACESFilmicToneMapping; (renderer as any).toneMappingExposure=0.82; mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer); composer.addPass(new RenderPass(scene,camera)); const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.62,0.38,0.68); composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,0.72)); const coreLight=new THREE.PointLight(0x88ffff,72,14); coreLight.position.set(0,0,2); scene.add(coreLight);
  const coreGroup=new THREE.Group(); scene.add(coreGroup);
  const fresV='varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}';
  const fresF='varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2);float c=0.30+uI*0.36+f*0.38*uI;vec3 col=vec3(0.44,0.92,0.88)*c;col*=uE;gl_FragColor=vec4(col,0.42);}';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},vertexShader:fresV,fragmentShader:fresF,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),middleMat); coreGroup.add(middle);
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.85} as any)); coreGroup.add(inner);
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.92} as any)); coreGroup.add(inner2);
  const diamMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vP;uniform float uT;void main(){float a=atan(vP.y,vP.x);float s=pow(abs(cos(a*4.0)),12.0);float c=1.0-smoothstep(0.0,0.22,length(vP)*3.0);vec3 col=mix(vec3(0.12,0.28,0.52),vec3(0.72,0.92,1.0),cos(a*8.0)*0.5+0.5);col+=vec3(1.0)*c*1.2+s*0.6;gl_FragColor=vec4(col,0.82);}',transparent:true});
  const diamHeart=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,3),diamMat); coreGroup.add(diamHeart);
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const colors=new Float32Array(156*3);
  for(let i=0;i<156;i++){const th=i*2.399963;const ph=Math.acos(1-2*i/156);const r=1.25+Math.random()*0.7;pos[i*3]=Math.sin(ph)*Math.cos(th)*r;pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;pos[i*3+2]=Math.cos(ph)*r;colors[i*3]=0.2;colors[i*3+1]=0.85;colors[i*3+2]=1.0;}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const cvs=document.createElement('canvas'); cvs.width=64; cvs.height=64; const ctx=cvs.getContext('2d')!; const g=ctx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'white'); g.addColorStop(0.4,'white'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,64,64); const tex=new THREE.CanvasTexture(cvs);
  const mat=new THREE.PointsMaterial({size:0.08,map:tex,vertexColors:true,transparent:true,opacity:0.85,depthWrite:false} as any); const particles=new THREE.Points(geo,mat); scene.add(particles);
  const haloGroup=new THREE.Group(); scene.add(haloGroup);
  const haloCore=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0} as any)); haloGroup.add(haloCore);
  const haloRing=new THREE.Mesh(new THREE.RingGeometry(0.08,0.14,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); haloGroup.add(haloRing);
  const haloGlow=new THREE.Mesh(new THREE.SphereGeometry(0.18,16,16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0} as any)); haloGroup.add(haloGlow);
  const haloLight=new THREE.PointLight(0x88ffff,0,2.5); haloGroup.add(haloLight); let haloT=0; let active=-1;
  const raycaster=new THREE.Raycaster(); (raycaster.params as any).Points={threshold:0.18}; const mouse=new THREE.Vector2();
  const onPointer=(e:PointerEvent)=>{mouse.x=(e.clientX/innerWidth)*2-1; mouse.y=-(e.clientY/innerHeight)*2+1; raycaster.setFromCamera(mouse,camera); const hits=raycaster.intersectObject(particles); if(hits.length>0){const idx=hits[0].index!; setSel(idx); active=idx; haloT=0; const p=new THREE.Vector3(pos[idx*3],pos[idx*3+1],pos[idx*3+2]); p.applyMatrix4(particles.matrixWorld); haloGroup.position.copy(p); (haloCore.material as any).opacity=1; (haloRing.material as any).opacity=0.85; (haloGlow.material as any).opacity=0.35; haloLight.intensity=85; setInfo(`HALO MODULE ${idx} CH${111+idx}`); const col=geo.attributes.color.array as Float32Array; col[idx*3]=1; col[idx*3+1]=1; col[idx*3+2]=1; geo.attributes.color.needsUpdate=true; setTimeout(()=>{col[idx*3]=0.2; col[idx*3+1]=0.85; col[idx*3+2]=1; geo.attributes.color.needsUpdate=true;},500);}};
  addEventListener('pointerdown',onPointer);
  let ign=false; const ignite=()=>{if(ign) return; ign=true; setOn(true); bloom.strength=0.62;}; setTimeout(ignite,300);
  let t=0,raf=0; const animate=()=>{raf=requestAnimationFrame(animate); t+=0.016; middleMat.uniforms.uT.value=t; (diamMat.uniforms as any).uT.value=t; middleMat.uniforms.uI.value=0.52+Math.sin(t*2.2)*0.06; coreGroup.rotation.y+=0.0012; diamHeart.rotation.y-=0.0009; particles.rotation.y+=0.0008; if(active>=0){haloT+=0.016; const pul=1+Math.sin(haloT*4)*0.15; haloCore.scale.setScalar(pul); haloRing.scale.setScalar(pul*1.2); haloGlow.scale.setScalar(1+Math.sin(haloT*3)*0.3); haloRing.rotation.z+=0.04; const p=new THREE.Vector3(pos[active*3],pos[active*3+1],pos[active*3+2]); p.applyMatrix4(particles.matrixWorld); haloGroup.position.copy(p);} composer.render();}; animate();
  const onR=()=>{const mob=innerWidth<768; camera.aspect=innerWidth/innerHeight; camera.fov=mob?34:32; camera.position.z=mob?6.2:5.0; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight);}; addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onPointer); mount.removeChild(renderer.domElement); renderer.dispose();};
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>{on?`V19.2.3.11 HALO • ${info}`:'⚡ IGNITION'}</div>{sel!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(0,255,255,0.14)',border:'1px solid #88ffff',padding:'12px',borderRadius:'14px',color:'#fff',fontSize:'10px',fontFamily:'monospace'}}>✨ HALO MODULE {sel} • CH{111+sel}</div>}</div>);
}
