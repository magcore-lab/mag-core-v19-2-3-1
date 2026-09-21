'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 const dmxRef=useRef({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});
 const dmxTargetRef=useRef({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});
 const audioRef=useRef({low:0,mid:0,high:0});
 const [on,setOn]=useState(false);
 const [dmxOn,setDmxOn]=useState(false);
 const [mods,setMods]=useState({webgpu:false,audio:false,midi:false,osc:false,artnet:false,sacn:false,dmx:false});
 const [dmxDisplay,setDmxDisplay]=useState({ch1:111,ch2:143,ch3:176,ch4:139,ch5:136,ch6:43,ch7:179,ch8:131,ch9:62,ch10:183});

 useEffect(()=>{
  const mount=ref.current!;
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x000000);
  scene.fog=new THREE.FogExp2(0x001419,0.01);
  const camera=new THREE.PerspectiveCamera(28,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,0,10.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.72;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.68,0.42,0.68);
  composer.addPass(bloom);

  let ws:any=null; let retry=0;
  const connectWS=()=>{
    try{
      ws=new WebSocket('ws://localhost:8081');
      ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true,artnet:true,sacn:true})); };
      ws.onmessage=(e:any)=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.channels){
            const c=msg.channels;
            const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
            dmxTargetRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??139),ch5:cl(c[4]??136),ch6:cl(c[5]??43),ch7:cl(c[6]??179),ch8:cl(c[7]??131),ch9:cl(c[8]??62),ch10:cl(c[9])};
          }
        }catch{}
      };
      ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(8000,300*Math.pow(2,retry++))); };
      ws.onerror=()=>{ try{ws.close();}catch{} };
    }catch{}
  };
  connectWS();

  const coreLight=new THREE.PointLight(0x88ffff,124,16); coreLight.decay=2; scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,68,12); coreLight2.position.set(0,0,1.2); coreLight2.decay=2; scene.add(coreLight2);
  const innerPoint=new THREE.PointLight(0x88ffff,32,8); innerPoint.decay=2; scene.add(innerPoint);

  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.32); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);

  const qGeo=new THREE.BufferGeometry();
  const qCount=512;
  const qPos=new Float32Array(qCount*3);
  for(let i=0;i<qCount;i++){
    const th=i*2.399963;
    const ph=Math.acos(1-2*i/qCount);
    const r=2.0+Math.random()*3.2;
    qPos[i*3]=Math.sin(ph)*Math.cos(th)*r;
    qPos[i*3+1]=Math.sin(ph)*Math.sin(th)*r;
    qPos[i*3+2]=Math.cos(ph)*r;
  }
  qGeo.setAttribute('position',new THREE.BufferAttribute(qPos,3));
  const qMat=new THREE.PointsMaterial({color:0x88ffff,size:0.011,transparent:true,opacity:0.16,sizeAttenuation:true});
  const qPoints=new THREE.Points(qGeo,qMat);
  qPoints.frustumCulled=false;
  quantumGroup.add(qPoints);

  const fresV='varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vP=position; vec4 mv=modelViewMatrix*vec4(position,1.0); vV=-mv.xyz; gl_Position=projectionMatrix*mv; }';
  const fresF='varying vec3 vN; varying vec3 vV; varying vec3 vP; uniform float uT; uniform float uI; uniform float uE; uniform float uInner; uniform float uLow; void main(){ float f=pow(1.0-dot(normalize(vN),normalize(vV)),5.0); float veins=sin(uT*1.2+vP.x*6.0+vP.y*4.0)*0.12 + sin(uT*0.8+vP.z*8.0)*0.08; float heartbeat=sin(uT*2.2)*0.08; float c=0.04+uI*0.22+uInner*0.18+veins+heartbeat+uLow*0.08; float g=f*0.58*uI; vec3 base=vec3(0.38,0.86,0.96)*(c+g); base+=vec3(0.52,0.98,1.0)*uInner*0.22; base*=uE; gl_FragColor=vec4(base,0.18); }';
  const middleMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uI:{value:0.72},uE:{value:0.58},uInner:{value:0.32},uLow:{value:0}},vertexShader:fresV,fragmentShader:fresF,transparent:true,side:THREE.DoubleSide});
  const middle=new THREE.Mesh(new THREE.SphereGeometry(0.48,64,64),middleMat);
  coreGroup.add(middle);

  const innerMat=new THREE.MeshPhysicalMaterial({color:0x88ffff,emissive:0x88ffff,emissiveIntensity:1.32,transmission:1.0,thickness:0.12,ior:2.417,dispersion:0.72,roughness:0.0,metalness:0.0,clearcoat:1.0,sheen:0.3,sheenColor:0x88ffff,transparent:true,opacity:0.28} as any);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.22,32,32),innerMat);
  coreGroup.add(inner);

  const veinGeo=new THREE.BufferGeometry();
  const veinCount=128;
  const veinPos=new Float32Array(veinCount*3);
  for(let i=0;i<veinCount;i++){
    const a=Math.random()*Math.PI*2;
    const r=0.22+Math.random()*0.26;
    veinPos[i*3]=Math.cos(a)*r;
    veinPos[i*3+1]=Math.sin(a)*r;
    veinPos
