'use client';
import { useEffect,useRef,useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const [on,setOn]=useState(false);
 const [sel,setSel]=useState<number|null>(null);
 useEffect(()=>{
  const m=ref.current!; const sc=new THREE.Scene();
  sc.background=new THREE.Color(0x000000);
  const mob=innerWidth<768;
  // DEZOOM 20% : 5.0->6.0 / 6.2->7.44
  const z=mob?7.44:6.0; const fov=mob?38:36;
  const cam=new THREE.PerspectiveCamera(fov,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,z);
  const ren=new THREE.WebGLRenderer({antialias:true});
  ren.setSize(innerWidth,innerHeight);
  (ren as any).toneMapping=THREE.ACESFilmicToneMapping;
  (ren as any).toneMappingExposure=1.15; // ECLAT DIAMANT 100%
  m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  // BLOOM + FORT POUR ECLAT DIAMANT
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.85,0.32,0.42);
  comp.addPass(bloom);
  sc.add(new THREE.AmbientLight(0xffffff,0.92));
  const cg=new THREE.Group(); sc.add(cg);
  // MIDDLE DIAMANT ECLAT 100%
  const mMat=new THREE.ShaderMaterial({
   uniforms:{uT:{value:0},uI:{value:0.92},uE:{value:1.25}},
   vertexShader:'varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
   fragmentShader:'varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),1.8);float c=0.55+uI*0.52+f*0.65*uI;vec3 col=vec3(0.72,0.96,1.0)*c+vec3(1.0)*f*0.45;col*=uE;gl_FragColor=vec4(col,0.58);}',
   transparent:true,side:THREE.DoubleSide
  });
  const mid=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),mMat); cg.add(mid);
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:false} as any)); cg.add(inn);
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),new THREE.MeshBasicMaterial({color:0xffffff,transparent:false} as any)); cg.add(inn2);
  // DIAMANT COEUR ECLAT 100%
  const dMat=new THREE.ShaderMaterial({
   uniforms:{uT:{value:0}},
   vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'varying vec3 vP;uniform float uT;void main(){float a=atan(vP.y,vP.x);float s=pow(abs(cos(a*4.0)),18.0)+pow(abs(cos(a*4.0+0.785)),18.0);float c=1.0-smoothstep(0.0,0.18,length(vP)*3.0);vec3 col=mix(vec3(0.15,0.35,0.65),vec3(0.92,0.98,1.0),cos(a*8.0+uT)*0.5+0.5);col+=vec3(1.0)*c*1.8+s*1.2;gl_FragColor=vec4(col,0.92);}',
   transparent:true
  });
  const diam=new THREE.Mesh(new THREE.IcosahedronGeometry(0.18,4),dMat); cg.add(diam);
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const colA=new Float32Array(156*3);
  for(let i=0;i<156;i++){const th=i*2.399963;const ph=Math.acos(1-2*i/156);const r=1.35+Math.random()*0.8;pos[i*3]=Math.sin(ph)*Math.cos(th)*r;pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;pos[i*3+2]=Math.cos(ph)*r;colA[i*3]=0.2;colA[i*3+1]=0.85;colA[i*3+2]=1;}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(colA,3));
  const cvs=document.createElement('canvas'); cvs.width=64; cvs.height=64; const ctx=cvs.getContext('2d')!; const g=ctx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'white'); g.addColorStop(0.3,'white'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
  const tex=new THREE.CanvasTexture(cvs); const mat=new THREE.PointsMaterial({size:0.07,map:tex,vertexColors:true,transparent:true,opacity:0.82} as any);
  const pts=new THREE.Points(geo,mat); sc.add(pts);
  // HALO TRANSPARENCE SIGNATURE
  const hg=new THREE.Group(); sc.add(hg);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.055,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0} as any)); hg.add(hc);
  const hr=new THREE.Mesh(new THREE.RingGeometry(0.09,0.18,40),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); hg.add(hr);
  const hr2=new THREE.Mesh(new THREE.RingGeometry(0.20,0.28,40),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); hg.add(hr2);
  const hgGlow=new THREE.Mesh(new THREE.SphereGeometry(0.32,16,16),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0} as any)); hg.add(hgGlow);
  const hl=new THREE.PointLight(0x88ffff,0,3.2); hg.add(hl); let ht=0; let act=-1;
  const ray=new THREE.Raycaster(); (ray.params as any).Points={threshold:0.22}; const mu=new THREE.Vector2();
  const onP=(e:PointerEvent)=>{mu.x=(e.clientX/innerWidth)*2-1; mu.y=-(e.clientY/innerHeight)*2+1; ray.setFromCamera(mu,cam); const h=ray.intersectObject(pts); if(h.length>0){const id=h[0].index!; setSel(id); act=id; ht=0; const p=new THREE.Vector3(pos[id*3],pos[id*3+1],pos[id*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p); (hc.material as any).opacity=0.72; (hr.material as any).opacity=0.42; (hr2.material as any).opacity=0.22; (hgGlow.material as any).opacity=0.12; hl.intensity=120;}};
  addEventListener('pointerdown',onP);
  let ig=false; const ign=()=>{if(ig) return; ig=true; setOn(true); bloom.strength=0.85; (ren as any).toneMappingExposure=1.15;}; setTimeout(ign,300);
  let t=0,raf=0; const anim=()=>{raf=requestAnimationFrame(anim); t+=0.016; mMat.uniforms.uT.value=t; (dMat.uniforms as any).uT.value=t; mMat.uniforms.uI.value=0.92+Math.sin(t*2.2)*0.08; cg.rotation.y+=0.0011; diam.rotation.y-=0.001; pts.rotation.y+=0.0007; if(act>=0){ht+=0.016; const pu=1+Math.sin(ht*5)*0.18; hc.scale.setScalar(pu); hr.scale.setScalar(pu*1.15); hr2.scale.setScalar(pu*1.25); hgGlow.scale.setScalar(1+Math.sin(ht*2.5)*0.35); hr.rotation.z+=0.05; hr2.rotation.z-=0.03; const p=new THREE.Vector3(pos[act*3],pos[act*3+1],pos[act*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p);} comp.render();}; anim();
  const onR=()=>{const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?38:36; cam.position.z=mo?7.44:6.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight);}; addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onP); m.removeChild(ren.domElement); ren.dispose();};
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
    {on?`V19.2.3.12 DEZOOM 20% HALO TRANS 100% • M${sel??'-'}`:'⚡ IGNITION 20%'}
   </div>
   {sel!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(0,255,255,0.12)',border:'1px solid rgba(136,255,255,0.5)',padding:12,borderRadius:14,color:'#fff',fontSize:10,fontFamily:'monospace'}}>✨ HALO TRANS MODULE {sel} CH{111+sel} • ECLAT DIAMANT 100% • DEZOOM Z6.0/Z7.44</div>}
  </div>
 );
}
