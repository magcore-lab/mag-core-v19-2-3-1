'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V33 EXPLOSION MAITRISEE - NOYAU 50% ON - DIFFUSION INTERCONNEXION GLOBALE - CORE ALLUME
// CORE LOCK 0.62/0.78/0.92 R0.48 T0.995 IOR2.65
 export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?12.2:10.0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.0:1.2));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?0.88:1.05;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),isMobile?0.24:0.32,isMobile?0.60:0.50,isMobile?0.86:0.80);
  composer.addPass(bloom);
  scene.add(new THREE.AmbientLight(0xffffff,isMobile?0.58:0.68));
  const key=new THREE.PointLight(0xffffff,isMobile?52:78,60); key.position.set(4,4,6); scene.add(key);
  const fill=new THREE.PointLight(0x88ccff,42,48); fill.position.set(-5,-3,5); scene.add(fill);
  const coreLight=new THREE.PointLight(0xaaddff,0,28); coreLight.position.set(0,0,0); scene.add(coreLight);
  const coreGroup=new THREE.Group(); coreGroup.scale.setScalar(0.1); scene.add(coreGroup);
  const cageGroup=new THREE.Group(); coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group(); coreGroup.add(branchGroup);
  const droneGroup=new THREE.Group(); coreGroup.add(droneGroup);
  const satGroup=new THREE.Group(); coreGroup.add(satGroup);
  const shockGroup=new THREE.Group(); scene.add(shockGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.24})); cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.20})); cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.14})); cageGroup.add(outer3);
  const branches:any[]=[]; const satPos:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){ const a=i*60*Math.PI/180; satPos.push(new THREE.Vector3(Math.cos(a)*0.62*1.15, Math.sin(a)*0.62*1.15, 0)); }
  const makeBranch=(p1:THREE.Vector3,p2:THREE.Vector3,color:number)=>{ const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]); const mat=new THREE.LineBasicMaterial({color, transparent:true, opacity:0.05}); const line=new THREE.Line(geo, mat); branchGroup.add(line); branches.push({line, p1, p2}); };
  satPos.forEach((p,i)=>{ makeBranch(new THREE.Vector3(0,0,0), p, 0xffffff); makeBranch(p, satPos[(i+1)%6], 0x88ccff); const dir=p.clone().normalize().multiplyScalar(0.92); makeBranch(p, dir, 0xaaccff); });
  const ico1=new THREE.IcosahedronGeometry(0.62,1); const pos1=ico1.getAttribute('position');
  for(let i=0;i<8;i++){ const a=new THREE.Vector3().fromBufferAttribute(pos1,i*3); const b=new THREE.Vector3().fromBufferAttribute(pos1,(i*3+3)%pos1.count); makeBranch(a.multiplyScalar(0.62), b.multiplyScalar(0.62), 0x445566); }
  const drones:any[]=[];
  const cfgs=[{r:0.78,speed:0.006,tilt:0.2,color:0x88ccff},{r:0.88,speed:-0.0045,tilt:-0.25,color:0xffffff},{r:0.98,speed:0.0035,tilt:0.4,color:0xaaccff}];
  cfgs.forEach(cfg=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.042,1), new THREE.MeshStandardMaterial({color:cfg.color, emissive:cfg.color, emissiveIntensity:0.42}));
    const light=new THREE.PointLight(cfg.color,18,4.5);
    const tGeo=new THREE.BufferGeometry(); const tPos=new Float32Array(12*3); tGeo.setAttribute('position', new THREE.BufferAttribute(tPos,3));
    const trail=new THREE.Points(tGeo, new THREE.PointsMaterial({color:cfg.color,size:0.018,transparent:true,opacity:0.0}));
    g.add(body); g.add(light); g.add(trail); droneGroup.add(g);
    drones.push({mesh:g, body, light, trail, tPos, cfg, angle:Math.random()*6.28});
  });
  const flowGeo=new THREE.BufferGeometry(); const flowCount=96; const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){ const b=branches[i%branches.length]; const t=Math.random(); flowPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*t; flowPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*t; flowPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*t; }
  flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0xaaddff,size:isMobile?0.032:0.038,transparent:true,opacity:0.0});
  const flowPoints=new THREE.Points(flowGeo, flowMat); branchGroup.add(flowPoints);
  const shockMat=new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.0});
  const shock=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,2), shockMat); shockGroup.add(shock);
  const fresnel={vertexShader:`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.2); float c=0.62+uI*0.65; float g=0.28+f*0.58*uI; vec3 base=vec3(0.92,0.94,1.0); vec3 col=base*(c+g); col+=vec3(0.22,0.32,0.52)*f*uI*0.8; col*=uE; float pulse=0.96+sin(uT*1.8)*0.08*uI; gl_FragColor=vec4(col*pulse, 0.92+uI*0.08); }`};
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.0},uE:{value:isMobile?0.88:1.05}},vertexShader:fresnel.vertexShader,fragmentShader:fresnel.fragmentShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,5), middleMat); coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.52,transparent:true,opacity:0.94});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4), innerMat); coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.78,transparent:true,opacity:0.98});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3), inner2Mat); coreGroup.add(inner2);
  const satMats:any[]=[]; const satLights:any[]=[];
  for(let i=0;i<6;i++){ const ang=i*60*Math.PI/180; const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.24}); satMats.push(mat); const m=new THREE.Mesh(new THREE.SphereGeometry(0.062,16,16), mat); m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0); satGroup.add(m); const l=new THREE.PointLight(0xaaddff,10,5.5); l.position.copy(m.position); satGroup.add(l); satLights.push(l); }
  const partGeo=new THREE.BufferGeometry(); const pos=new Float32Array(156*3); const orig=new Float32Array(156*3); const phases=new Float32Array(156); const golden=2.399963;
  for(let i=0;i<156;i++){ const th=i*golden, ph=Math.acos(1-2*i/156), r=0.74+Math.random()*0.88; pos[i*3]=Math.sin(ph)*Math.cos(th)*r; pos[i*3+1]=Math.sin(ph)*Math.sin(th)*r; pos[i*3+2]=Math.cos(ph)*r; orig[i*3]=pos[i*3]; orig[i*3+1]=pos[i*3+1]; orig[i*3+2]=pos[i*3+2]; phases[i]=Math.random()*6.28; }
  partGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const particles=new THREE.Points(partGeo,new THREE.PointsMaterial({color:0x88ccff,size:isMobile?0.012:0.014,transparent:true,opacity:0.42})); scene.add(particles);
  let dmx={ch1:127,ch2:48,ch3:135,ch4:127,ch5:110,ch10:210}; let ws:any=null;
  try{ const proto=location.protocol==='https:'?'wss':'ws'; ws=new WebSocket(`${proto}://localhost:8081`); ws.onmessage=(e:any)=>{ try{ const m=JSON.parse(e.data); if(m.channels){ dmx={ch1:m.channels[0],ch2:m.channels[1],ch3:m.channels[2],ch4:m.channels[3],ch5:m.channels[4],ch6:m.channels[5],ch7:m.channels[6],ch8:m.channels[7],ch9:m.channels[8],ch10:m.channels[9]}; } }catch{} }; ws.onerror=()=>{ ws=null; }; }catch{ ws=null; }
  let ignition=0;
  const ignite=()=>{
    const start=performance.now();
    const phase1=600; const phase2=1200; const total=phase1+phase2;
    const loop=()=>{
      const elapsed=performance.now()-start;
      if(elapsed<phase1){
        const p=elapsed/phase1; const ease=1-Math.pow(1-p,3);
        ignition=ease*1.25; const scale=0.1 + ease*1.15;
        coreGroup.scale.setScalar((isMobile?0.78:0.94)*scale);
        middleMat.uniforms.uI.value=ignition; bloom.strength=0.24 + ease*0.52;
        innerMat.emissiveIntensity=0.52 + ease*2.8; inner2Mat.emissiveIntensity=0.78 + ease*3.5;
        coreLight.intensity=ease*400; satMats.forEach(m=>m.emissiveIntensity=0.24 + ease*1.8);
        satLights.forEach(l=>l.intensity=10 + ease*42); branches.forEach((b:any)=>b.line.material.opacity=0.05 + ease*0.55);
        flowMat.opacity=ease*0.92; shock.scale.setScalar(0.5 + ease*2.8); shockMat.opacity=(1-ease)*0.45;
        particles.material.opacity=0.42 + ease*0.38; drones.forEach((d:any)=>{ d.body.material.emissiveIntensity=0.42 + ease*1.8; d.light.intensity=18 + ease*42; d.trail.material.opacity=ease*0.65; });
        requestAnimationFrame(loop);
      } else if(elapsed<total){
        const p=(elapsed-phase1)/phase2; const ease=1-Math.pow(1-p,2);
        ignition=1.25 - ease*0.75; const scale=1.25 - ease*0.20;
        coreGroup.scale.setScalar((isMobile?0.78:0.94)*scale); middleMat.uniforms.uI.value=ignition;
        bloom.strength=0.76 - ease*0.38; innerMat.emissiveIntensity=3.32 - ease*2.20;
        inner2Mat.emissiveIntensity=4.28 - ease*2.85; coreLight.intensity=400 - ease*290;
        satMats.forEach(m=>m.emissiveIntensity=2.04 - ease*1.42); satLights.forEach(l=>l.intensity=52 - ease*32);
        branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; b.line.material.opacity=0.60 - ease*(isR?0.18:0.28); });
        flowMat.opacity=0.92 - ease*0.24; shock.scale.setScalar(3.3 + ease*1.2); shockMat.opacity=0.0;
        if(p>0.8 && navigator.vibrate) navigator.vibrate([80,40,120]);
        requestAnimationFrame(loop);
      } else {
        ignition=0.50; coreGroup.scale.setScalar((isMobile?0.78:0.94)*1.05);
        middleMat.uniforms.uI.value=0.50; bloom.strength=isMobile?0.32:0.38;
        innerMat.emissiveIntensity=1.12; inner2Mat.emissiveIntensity=1.43; coreLight.intensity=110;
        satMats.forEach(m=>m.emissiveIntensity=0.62); satLights.forEach(l=>l.intensity=20);
        branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; b.line.material.opacity=isR?0.42:0.32; });
        flowMat.opacity=0.68; shock.visible=false;
      }
    }; loop();
  };
  setTimeout(ignite,200);
  let t=0, raf=0; const flowSpeeds=new Float32Array(96).map(()=>Math.random());
  const anim=()=>{ raf=requestAnimationFrame(anim); t+=0.016; middleMat.uniforms.uT.value=t;
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<96;i++){ const b=branches[i%branches.length]; flowSpeeds[i]+=0.018+ignition*0.024; if(flowSpeeds[i]>1) flowSpeeds[i]=0; const tt=flowSpeeds[i]; fPos[i*3]=b.p1.x + (b.p2.x-b.p1.x)*tt; fPos[i*3+1]=b.p1.y + (b.p2.y-b.p1.y)*tt; fPos[i*3+2]=b.p1.z + (b.p2.z-b.p1.z)*tt; }
    flowGeo.attributes.position.needsUpdate=true;
    drones.forEach((d:any)=>{ d.angle+=d.cfg.speed*(1+ignition*0.9+ (dmx.ch1/255)*0.4); const r=d.cfg.r*(1+Math.sin(t*0.5)*0.04*ignition); d.mesh.position.set(Math.cos(d.angle)*r, Math.sin(d.angle)*r*Math.cos(d.cfg.tilt), Math.sin(d.angle)*r*Math.sin(d.cfg.tilt)); const tp=d.tPos; for(let j=11;j>0;j--){ tp[j*3]=tp[(j-1)*3]; tp[j*3+1]=tp[(j-1)*3+1]; tp[j*3+2]=tp[(j-1)*3+2]; } tp[0]=d.mesh.position.x; tp[1]=d.mesh.position.y; tp[2]=d.mesh.position.z; d.trail.geometry.attributes.position.needsUpdate=true; });
    const prop=(dmx.ch1/255)||0.5; const mast=(dmx.ch10/255)||0.82; const flow=(dmx.ch3/255)||0.55;
    const globalRot=0.0016*prop*(1+ignition*0.9)*mast;
    coreGroup.rotation.y+=globalRot; branchGroup.rotation.y-=globalRot*0.42; cageGroup.rotation.y+=globalRot*0.26; middle.rotation.y+=globalRot*0.62; middle.rotation.x=Math.sin(t*0.20)*0.05*ignition; inner.rotation.y-=globalRot*0.95; inner2.rotation.y+=globalRot*1.25; satGroup.rotation.z+=globalRot*0.52; particles.rotation.y+=globalRot*0.24*(1+flow); shock.rotation.y+=0.002;
    composer.render();
  }; anim();
  const onResize=()=>{ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); composer.setSize(window.innerWidth,window.innerHeight); }; window.addEventListener('resize',onResize);
  return()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); try{ ws?.close(); }catch{} mount.removeChild(renderer.domElement); renderer.dispose(); };
 },[]);
 return(<div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}><div ref={ref} style={{position:'fixed',inset:0}}/><div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.90) 96%)',zIndex:2}}/><div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'8px 18px',borderRadius:999,fontSize:10,fontWeight:900,zIndex:10}}>MAG CORE V33 — EXPLOSION MAITRISEE — 50% ON — NOYAU ALLUME — FUSION GLOBALE</div><div style={{position:'fixed',bottom:8,left:8,right:8,display:'flex',justifyContent:'space-between',zIndex:10,fontSize:6,fontFamily:'monospace',color:'rgba(255,255,255,0.58)'}}><span>0.62/0.78/0.92 R0.48 IOR2.65 | 18+12 BRANCHES FLOW 96x0.038 | DRONE r0.78/0.88/0.98 | SHOCKWAVE</span><span>BLOOM 0.24-0.76-0.38 THRESH 0.86 | CORE 0-400-110 | EXPLOSION 0.6s+1.2s | 50% CANALISE</span></div></div>);
}
