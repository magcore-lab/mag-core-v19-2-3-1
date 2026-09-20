
'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// V35 POWER ON 100% - DMX QUANTIFIE - MODULES PRINCIPAUX - BUILD FIX VERCEL OK
// CORE LOCK 0.62/0.78/0.92 R0.48 T0.995 IOR2.65 - ANALYSE FAIL 79:276 CORRIGE
// DMX MAP: CH1 PROP CH2 BLOOM CH3 FLOW CH4 RGB CH5 PART CH7 SAT CH8 INNER CH10 MAST

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:127,ch2:48,ch3:135,ch4:127,ch5:110,ch6:0,ch7:130,ch8:130,ch9:0,ch10:210});
 useEffect(()=>{
  const isMobile=/Mobi|Android/i.test(navigator.userAgent)||window.innerWidth<768;
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  const camera=new THREE.PerspectiveCamera(34, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,isMobile?11.4:9.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,isMobile?1.2:1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=isMobile?0.92:1.12;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.32,0.48,0.80);
  composer.addPass(bloomPass);
  scene.add(new THREE.AmbientLight(0xffffff,0.68));
  const keyLight=new THREE.PointLight(0xffffff,78,60);
  keyLight.position.set(4,4,6);
  scene.add(keyLight);
  const fillLight=new THREE.PointLight(0x88ccff,52,48);
  fillLight.position.set(-5,-3,5);
  scene.add(fillLight);
  const coreLight=new THREE.PointLight(0xaaddff,0,28);
  coreLight.position.set(0,0,0);
  scene.add(coreLight);
  const coreGroup=new THREE.Group();
  coreGroup.scale.setScalar(isMobile?0.78:0.94);
  scene.add(coreGroup);
  const cageGroup=new THREE.Group();
  coreGroup.add(cageGroup);
  const branchGroup=new THREE.Group();
  coreGroup.add(branchGroup);
  const droneGroup=new THREE.Group();
  coreGroup.add(droneGroup);
  const satGroup=new THREE.Group();
  coreGroup.add(satGroup);
  const shockGroup=new THREE.Group();
  scene.add(shockGroup);
  const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(0.62,4), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.28}));
  cageGroup.add(outer);
  const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.78,3), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.22}));
  cageGroup.add(outer2);
  const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(0.92,2), new THREE.MeshBasicMaterial({color:0xaaccff,wireframe:true,transparent:true,opacity:0.16}));
  cageGroup.add(outer3);
  const branches:any[]=[];
  const satPositions:THREE.Vector3[]=[];
  for(let i=0;i<6;i++){
    const ang=i*60*Math.PI/180;
    satPositions.push(new THREE.Vector3(Math.cos(ang)*0.62*1.15, Math.sin(ang)*0.62*1.15, 0));
  }
  const createBranch=(p1:THREE.Vector3,p2:THREE.Vector3,col:number)=>{
    const geo=new THREE.BufferGeometry().setFromPoints([p1,p2]);
    const mat=new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.12});
    const line=new THREE.Line(geo,mat);
    branchGroup.add(line);
    branches.push({line:line,p1:p1,p2:p2});
  };
  satPositions.forEach((p,i)=>{
    createBranch(new THREE.Vector3(0,0,0),p,0xffffff);
    createBranch(p,satPositions[(i+1)%6],0x88ccff);
    const dir=p.clone().normalize().multiplyScalar(0.92);
    createBranch(p,dir,0xaaccff);
  });
  const icoGeo=new THREE.IcosahedronGeometry(0.62,1);
  const icoPos=icoGeo.getAttribute('position');
  for(let i=0;i<12;i++){
    const idx=i*3;
    if(idx+3>=icoPos.count) continue;
    const a=new THREE.Vector3().fromBufferAttribute(icoPos,idx);
    const b=new THREE.Vector3().fromBufferAttribute(icoPos,idx+3);
    createBranch(a.multiplyScalar(0.62),b.multiplyScalar(0.62),0x445566);
  }
  const drones:any[]=[];
  const droneCfgs=[{r:0.78,speed:0.006,tilt:0.2,col:0x88ccff},{r:0.88,speed:-0.0045,tilt:-0.25,col:0xffffff},{r:0.98,speed:0.0035,tilt:0.4,col:0xaaccff}];
  droneCfgs.forEach((cfg)=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.046,1), new THREE.MeshStandardMaterial({color:cfg.col,emissive:cfg.col,emissiveIntensity:0.52}));
    const light=new THREE.PointLight(cfg.col,22,5.0);
    const tGeo=new THREE.BufferGeometry();
    const tPos=new Float32Array(16*3);
    tGeo.setAttribute('position',new THREE.BufferAttribute(tPos,3));
    const trail=new THREE.Points(tGeo,new THREE.PointsMaterial({color:cfg.col,size:0.020,transparent:true,opacity:0.0}));
    g.add(body); g.add(light); g.add(trail);
    droneGroup.add(g);
    drones.push({mesh:g,body:body,light:light,trail:trail,tPos:tPos,cfg:cfg,angle:Math.random()*6.28});
  });
  const flowGeo=new THREE.BufferGeometry();
  const flowCount=128;
  const flowPos=new Float32Array(flowCount*3);
  for(let i=0;i<flowCount;i++){
    const b=branches[i%branches.length];
    const t=Math.random();
    flowPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*t;
    flowPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*t;
    flowPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*t;
  }
  flowGeo.setAttribute('position',new THREE.BufferAttribute(flowPos,3));
  const flowMat=new THREE.PointsMaterial({color:0xaaddff,size:isMobile?0.036:0.042,transparent:true,opacity:0.0});
  const flowPoints=new THREE.Points(flowGeo,flowMat);
  branchGroup.add(flowPoints);
  const shockMat=new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.0});
  const shockMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,3),shockMat);
  shockGroup.add(shockMesh);
  const vertShader='varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fragShader='varying vec3 vN; varying vec3 vV; uniform float uT; uniform float uI; uniform float uE; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),2.0); float c=0.68+uI*0.72; float g=0.32+f*0.68*uI; vec3 base=vec3(0.94,0.96,1.0); vec3 col=base*(c+g); col+=vec3(0.24,0.36,0.58)*f*uI; col*=uE; float pulse=0.96+sin(uT*2.2)*0.10*uI; gl_FragColor=vec4(col*pulse, 0.94+uI*0.06); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0},uE:{value:isMobile?0.92:1.12}},vertexShader:vertShader,fragmentShader:fragShader,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(0.48,6),middleMat);
  coreGroup.add(middle);
  const innerMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.62,transparent:true,opacity:0.96});
  const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(0.22,4),innerMat);
  coreGroup.add(inner);
  const inner2Mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.92,transparent:true,opacity:0.99});
  const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(0.11,3),inner2Mat);
  coreGroup.add(inner2);
  const satMats:THREE.MeshStandardMaterial[]=[];
  const satLights:THREE.PointLight[]=[];
  for(let i=0;i<6;i++){
    const ang=i*60*Math.PI/180;
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xaaddff,emissiveIntensity:0.32});
    satMats.push(mat);
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.068,16,16),mat);
    m.position.set(Math.cos(ang)*0.62*1.15,Math.sin(ang)*0.62*1.15,0);
    satGroup.add(m);
    const l=new THREE.PointLight(0xaaddff,12,6.0);
    l.position.copy(m.position);
    satGroup.add(l);
    satLights.push(l);
  }
  const partGeo=new THREE.BufferGeometry();
  const partCount=156;
  const partPos=new Float32Array(partCount*3);
  const golden=2.399963;
  for(let i=0;i<partCount;i++){
    const th=i*golden;
    const ph=Math.acos(1-2*i/partCount);
    const r=0.74+Math.random()*0.88;
    partPos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    partPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    partPos[i*3+2]=Math.cos(ph)*r;
  }
  partGeo.setAttribute('position',new THREE.BufferAttribute(partPos,3));
  const partMat=new THREE.PointsMaterial({color:0x88ccff,size:isMobile?0.014:0.016,transparent:true,opacity:0.48});
  const particles=new THREE.Points(partGeo,partMat);
  scene.add(particles);
  // DMX SAFE - SANS TRY DANS OBJECT LITERAL - FIX BUILD VERCEL 79:276
  const initDMX=()=>{
    if(typeof window==='undefined') return;
    try{
      const wsProto=window.location.protocol==='https:'?'wss':'ws';
      const wsUrl=wsProto+'://localhost:8081';
      const ws=new WebSocket(wsUrl);
      ws.onmessage=(ev:MessageEvent)=>{
        try{
          const msg=JSON.parse(ev.data as string);
          if(msg.channels && Array.isArray(msg.channels)){
            dmxRef.current={
              ch1:msg.channels[0]||127,
              ch2:msg.channels[1]||48,
              ch3:msg.channels[2]||135,
              ch4:msg.channels[3]||127,
              ch5:msg.channels[4]||110,
              ch6:msg.channels[5]||0,
              ch7:msg.channels[6]||130,
              ch8:msg.channels[7]||130,
              ch9:msg.channels[8]||0,
              ch10:msg.channels[9]||210
            };
          }
        }catch{}
      };
      (ws as any).onerror=()=>{};
    }catch{}
  };
  initDMX();
  let ignition=0;
  const ignite=()=>{
    const start=performance.now();
    const phase1=500;
    const phase2=1000;
    const total=phase1+phase2;
    const loop=()=>{
      const elapsed=performance.now()-start;
      if(elapsed<phase1){
        const p=elapsed/phase1;
        const ease=1-Math.pow(1-p,3);
        ignition=ease*1.25;
        const scale=0.1+ease*1.15;
        coreGroup.scale.setScalar((isMobile?0.78:0.94)*scale);
        middleMat.uniforms.uI.value=ignition;
        bloomPass.strength=0.28+ease*0.58;
        innerMat.emissiveIntensity=0.62+ease*3.2;
        inner2Mat.emissiveIntensity=0.92+ease*4.2;
        coreLight.intensity=ease*520;
        satMats.forEach((m)=>{ m.emissiveIntensity=0.32+ease*2.2; });
        satLights.forEach((l)=>{ l.intensity=12+ease*52; });
        branches.forEach((b:any)=>{ b.line.material.opacity=0.12+ease*0.62; });
        flowMat.opacity=ease*0.96;
        shockMesh.scale.setScalar(0.5+ease*3.2);
        shockMat.opacity=(1-ease)*0.52;
        partMat.opacity=0.48+ease*0.42;
        drones.forEach((d:any)=>{ d.body.material.emissiveIntensity=0.52+ease*2.2; d.light.intensity=22+ease*52; d.trail.material.opacity=ease*0.72; });
        requestAnimationFrame(loop);
      } else if(elapsed<total){
        const p=(elapsed-phase1)/phase2;
        const ease=1-Math.pow(1-p,2.5);
        ignition=1.25-ease*0.25;
        const scale=1.25-ease*0.12;
        coreGroup.scale.setScalar((isMobile?0.78:0.94)*scale);
        middleMat.uniforms.uI.value=ignition;
        bloomPass.strength=0.86-ease*0.34;
        innerMat.emissiveIntensity=3.82-ease*1.95;
        inner2Mat.emissiveIntensity=5.12-ease*2.85;
        coreLight.intensity=520-ease*300;
        satMats.forEach((m)=>{ m.emissiveIntensity=2.52-ease*1.42; });
        satLights.forEach((l)=>{ l.intensity=64-ease*30; });
        branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; b.line.material.opacity=0.74-ease*(isR?0.16:0.26); });
        flowMat.opacity=0.96-ease*0.18;
        shockMesh.scale.setScalar(3.7+ease*1.5);
        shockMat.opacity=Math.max(0,0.18-ease*0.18);
        if(p>0.85 && typeof navigator!=='undefined' && (navigator as any).vibrate){ (navigator as any).vibrate([80,40,120]); }
        requestAnimationFrame(loop);
      } else {
        ignition=1.0;
        coreGroup.scale.setScalar((isMobile?0.78:0.94)*1.13);
        middleMat.uniforms.uI.value=1.0;
        bloomPass.strength=isMobile?0.42:0.52;
        innerMat.emissiveIntensity=1.87;
        inner2Mat.emissiveIntensity=2.27;
        coreLight.intensity=220;
        satMats.forEach((m)=>{ m.emissiveIntensity=1.10; });
        satLights.forEach((l)=>{ l.intensity=34; });
        branches.forEach((b:any)=>{ const isR=b.p1.length()<0.01; b.line.material.opacity=isR?0.58:0.48; });
        flowMat.opacity=0.78;
        shockMesh.visible=false;
      }
    };
    loop();
  };
  setTimeout(ignite,150);
  let t=0;
  let raf=0;
  const flowSpeeds=new Float32Array(128).map(()=>Math.random());
  const animate=()=>{
    raf=requestAnimationFrame(animate);
    t+=0.016;
    middleMat.uniforms.uT.value=t;
    const dmx=dmxRef.current;
    const prop=dmx.ch1/255;
    const bloomVal=dmx.ch2/255;
    const flow=dmx.ch3/255;
    const part=dmx.ch5/255;
    const sat=dmx.ch7/255;
    const innerVal=dmx.ch8/255;
    const mast=dmx.ch10/255;
    bloomPass.strength=(isMobile?0.42:0.52)*(0.6+bloomVal*0.8)*ignition;
    coreLight.intensity=220*(0.5+innerVal*0.8)*ignition;
    satMats.forEach((m,i)=>{ m.emissiveIntensity=(1.10+sat*0.6+Math.sin(t*2+i)*0.08)*ignition; });
    const fPos=flowGeo.attributes.position.array as Float32Array;
    for(let i=0;i<128;i++){
      const b=branches[i%branches.length];
      flowSpeeds[i]+=0.020+ignition*0.028+flow*0.018;
      if(flowSpeeds[i]>1) flowSpeeds[i]=0;
      const tt=flowSpeeds[i];
      fPos[i*3]=b.p1.x+(b.p2.x-b.p1.x)*tt;
      fPos[i*3+1]=b.p1.y+(b.p2.y-b.p1.y)*tt;
      fPos[i*3+2]=b.p1.z+(b.p2.z-b.p1.z)*tt;
    }
    flowGeo.attributes.position.needsUpdate=true;
    flowMat.opacity=(0.78+flow*0.22)*ignition;
    partMat.opacity=(0.48+part*0.42)*ignition;
    drones.forEach((d:any)=>{
      d.angle+=d.cfg.speed*(1+ignition*0.9+prop*0.5);
      const r=d.cfg.r*(1+Math.sin(t*0.5)*0.04*ignition);
      d.mesh.position.set(Math.cos(d.angle)*r, Math.sin(d.angle)*r*Math.cos(d.cfg.tilt), Math.sin(d.angle)*r*Math.sin(d.cfg.tilt));
      const tp=d.tPos;
      for(let j=15;j>0;j--){
        tp[j*3]=tp[(j-1)*3];
        tp[j*3+1]=tp[(j-1)*3+1];
        tp[j*3+2]=tp[(j-1)*3+2];
      }
      tp[0]=d.mesh.position.x;
      tp[1]=d.mesh.position.y;
      tp[2]=d.mesh.position.z;
      d.trail.geometry.attributes.position.needsUpdate=true;
    });
    const globalRot=0.0018*prop*(1+ignition*0.9)*mast;
    coreGroup.rotation.y+=globalRot;
    branchGroup.rotation.y-=globalRot*0.42;
    cageGroup.rotation.y+=globalRot*0.26;
    middle.rotation.y+=globalRot*0.62;
    middle.rotation.x=Math.sin(t*0.20)*0.06*ignition;
    inner.rotation.y-=globalRot*0.95;
    inner2.rotation.y+=globalRot*1.25;
    satGroup.rotation.z+=globalRot*0.52;
    particles.rotation.y+=globalRot*0.24*(1+flow);
    shockMesh.rotation.y+=0.003;
    composer.render();
  };
  animate();
  const onResize=()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    composer.setSize(window.innerWidth,window.innerHeight);
  };
  window.addEventListener('resize',onResize);
  return()=>{
    cancelAnimationFrame(raf);
    window.removeEventListener('resize',onResize);
    mount.removeChild(renderer.domElement);
    renderer.dispose();
  };
 },[]);
 return(
  <div style={{width:'100%',height:'100dvh',background:'#000',overflow:'hidden',touchAction:'none'}}>
    <div ref={ref} style={{position:'fixed',inset:0}} />
    <div style={{position:'fixed',inset:0,pointerEvents:'none',background:'radial-gradient(ellipse at center, transparent 36%, rgba(0,0,0,0.92) 97%)',zIndex:2}} />
    <div style={{position:'fixed',top:12,left:'50%',transform:'translateX(-50%)',background:'#3dd598',color:'#000',padding:'9px 20px',borderRadius:999,fontSize:11,fontWeight:900,zIndex:10,boxShadow:'0 0 20px rgba(61,213,152,0.5)'}}>MAG CORE V35 — POWER ON 100% — DMX QUANTIFIE — BUILD FIX VERCEL OK</div>
    <div style={{position:'fixed',bottom:8,left:8,right:8,display:'flex',justifyContent:'space-between',zIndex:10,fontSize:6,fontFamily:'monospace',color:'rgba(255,255,255,0.62)'}}>
      <span>0.62/0.78/0.92 R0.48 T0.995 IOR2.65 | 18+12 BRANCHES FLOW 128x0.042 | DRONE r0.78/0.88/0.98 | SHOCKWAVE | 156P GOLDEN 2.399963</span>
      <span>CH1 PROP CH2 BLOOM CH3 FLOW CH4 RGB CH5 PART CH7 SAT CH8 INNER CH10 MAST | CORE 0-520-220 | 100% ON | VERCEL BUILD OK</span>
    </div>
  </div>
 );
}
