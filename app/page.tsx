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
  const mob=innerWidth<768; const z=mob?6.2:5.0;
  const cam=new THREE.PerspectiveCamera(mob?34:32,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,z);
  const ren=new THREE.WebGLRenderer({antialias:true});
  ren.setSize(innerWidth,innerHeight); m.appendChild(ren.domElement);
  const comp=new EffectComposer(ren);
  comp.addPass(new RenderPass(sc,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.62,0.38,0.68);
  comp.addPass(bloom); sc.add(new THREE.AmbientLight(0xffffff,0.72));
  const cg=new THREE.Group(); sc.add(cg);
  const mMat=new THREE.ShaderMaterial({
   uniforms:{uT:{value:0},uI:{value:0.52},uE:{value:0.68}},
   vertexShader:'varying vec3 vN,vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',
   fragmentShader:'varying vec3 vN,vV;uniform float uT,uI,uE;void main(){float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2);float c=0.3+uI*0.36+f*0.38*uI;vec3 col=vec3(0.44,0.92,0.88)*c;col*=uE;gl_FragColor=vec4(col,0.42);}',
   transparent:true,side:THREE.DoubleSide
  });
  const mid=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5),mMat); cg.add(mid);
  const inn=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0.85} as any)); cg.add(inn);
  const inn2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),new THREE.MeshBasicMaterial({color:0xaaffff,transparent:true,opacity:0.92} as any)); cg.add(inn2);
  const geo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const col=new Float32Array(156*3);
  for(let i=0;i<156;i++){const th=i*2.399963;const ph=Math.acos(1-2*i/156);const r=1.25+Math.random()*0.7;pos[i*3]=Math.sin(ph)*Math.cos(th)*r;pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;pos[i*3+2]=Math.cos(ph)*r;col[i*3]=0.2;col[i*3+1]=0.85;col[i*3+2]=1;}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const cvs=document.createElement('canvas'); cvs.width=64; cvs.height=64; const ctx=cvs.getContext('2d')!; const g=ctx.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'white'); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.fillRect(0,0,64,64);
  const tex=new THREE.CanvasTexture(cvs); const mat=new THREE.PointsMaterial({size:0.08,map:tex,vertexColors:true,transparent:true,opacity:0.85} as any);
  const pts=new THREE.Points(geo,mat); sc.add(pts);
  const hg=new THREE.Group(); sc.add(hg);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,16),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0} as any)); hg.add(hc);
  const hr=new THREE.Mesh(new THREE.RingGeometry(0.08,0.14,32),new THREE.MeshBasicMaterial({color:0x88ffff,transparent:true,opacity:0,side:THREE.DoubleSide} as any)); hg.add(hr);
  const hl=new THREE.PointLight(0x88ffff,0,2.5); hg.add(hl); let ht=0; let act=-1;
  const ray=new THREE.Raycaster(); (ray.params as any).Points={threshold:0.18}; const mu=new THREE.Vector2();
  const onP=(e:PointerEvent)=>{mu.x=(e.clientX/innerWidth)*2-1; mu.y=-(e.clientY/innerHeight)*2+1; ray.setFromCamera(mu,cam); const h=ray.intersectObject(pts); if(h.length>0){const id=h[0].index!; setSel(id); act=id; ht=0; const p=new THREE.Vector3(pos[id*3],pos[id*3+1],pos[id*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p); (hc.material as any).opacity=1; (hr.material as any).opacity=0.85; hl.intensity=85;}};
  addEventListener('pointerdown',onP);
  let ig=false; const ign=()=>{if(ig) return; ig=true; setOn(true); bloom.strength=0.62;}; setTimeout(ign,300);
  let t=0,raf=0; const anim=()=>{raf=requestAnimationFrame(anim); t+=0.016; mMat.uniforms.uT.value=t; cg.rotation.y+=0.0012; pts.rotation.y+=0.0008; if(act>=0){ht+=0.016; const pu=1+Math.sin(ht*4)*0.15; hc.scale.setScalar(pu); hr.scale.setScalar(pu*1.2); hr.rotation.z+=0.04; const p=new THREE.Vector3(pos[act*3],pos[act*3+1],pos[act*3+2]); p.applyMatrix4(pts.matrixWorld); hg.position.copy(p);} comp.render();}; anim();
  const onR=()=>{const mo=innerWidth<768; cam.aspect=innerWidth/innerHeight; cam.fov=mo?34:32; cam.position.z=mo?6.2:5.0; cam.updateProjectionMatrix(); ren.setSize(innerWidth,innerHeight); comp.setSize(innerWidth,innerHeight);}; addEventListener('resize',onR);
  return()=>{cancelAnimationFrame(raf); removeEventListener('resize',onR); removeEventListener('pointerdown',onP); m.removeChild(ren.domElement); ren.dispose();};
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden'}}>
   <div ref={ref} style={{position:'fixed',inset:0}}/>
   <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:on?'#88ffff':'#3dd598',color:'#000',padding:'8px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10}}>
    {on?`V19.2.3.11 HALO • MODULE ${sel??'-'}`:'⚡ IGNITION'}
   </div>
   {sel!==null && <div style={{position:'fixed',bottom:12,left:12,right:12,background:'rgba(0,255,255,0.14)',border:'1px solid #88ffff',padding:12,borderRadius:14,color:'#fff',fontSize:10,fontFamily:'monospace'}}>✨ HALO MODULE {sel} CH{111+sel} • CLICK → LIGHT 85</div>}
  </div>
 );
}
