
'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// V111 FINAL LIVING — ZOOM 1.32 TRANS 0.18 NOYAU 1.32 + QUANTUM DMX 0.08 + MATRICIEL INSTANCED 512 + VEINS 128 HEARTBEAT ORGANIC
export default function Page(){
 const ref=useRef<HTMLDivElement>(null);
 // QUANTUM DMX MATRIX 10CH
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
  if(typeof navigator!=='undefined' && (navigator as any).gpu){
    (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}).then((a:any)=>{ if(a) setMods(m=>({...m,webgpu:true})); });
  }
  let ws:any=null; let retry=0;
  const connectWS=()=>{
    try{
      ws=new WebSocket('ws://localhost:8081');
      ws.onopen=()=>{ retry=0; setDmxOn(true); setMods(m=>({...m,osc:true,dmx:true,artnet:true,sacn:true})); };
      ws.onmessage=(e:any)=>{
        try{
          const msg=JSON.parse(e.data);
          if(msg.channels){
            const c=msg.channels; const cl=(v:number)=>Math.max(0,Math.min(255,Math.floor(v)));
            dmxTargetRef.current={ch1:cl(c[0]),ch2:cl(c[1]),ch3:cl(c[2]),ch4:cl(c[3]??139),ch5:cl(c[4]??136),ch6:cl(c[5]??43),ch7:cl(c[6]??179),ch8:cl(c[7]??131),ch9:cl(c[8]??62),ch10:cl(c[9])};
          }
        }catch{}
      };
      ws.onclose=()=>{ setDmxOn(false); setTimeout(connectWS,Math.min(8000,300*Math.pow(2,retry++))); };
      ws.onerror=()=>{ try{ws.close();}catch{} };
    }catch{}
  }; connectWS();
  try{
    const AudioCtx=(window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx=new AudioCtx(); const analyser=ctx.createAnalyser(); analyser.fftSize=512;
    const data=new Uint8Array(256);
    const loop=()=>{ analyser.getByteFrequencyData(data); const low=data.slice(0,20).reduce((a,b)=>a+b,0)/20/255; const mid=data.slice(20,80).reduce((a,b)=>a+b,0)/60/255; const high=data.slice(80,200).reduce((a,b)=>a+b,0)/120/255; audioRef.current={low,mid,high}; requestAnimationFrame(loop); }; loop();
  }catch{}
  scene.add(new THREE.AmbientLight(0x88ccff,0.06));
  const coreLight=new THREE.PointLight(0x88ffff,124,16); coreLight.decay=2; scene.add(coreLight);
  const coreLight2=new THREE.PointLight(0xaaffff,68,12); coreLight2.position.set(0,0,1.2); coreLight2.decay=2; scene.add(coreLight2);
  const innerPoint=new THREE.PointLight(0x88ffff,32,8); innerPoint.decay=2; scene.add(innerPoint);
  const coreGroup=new THREE.Group(); (coreGroup as any).scale.setScalar(1.32); scene.add(coreGroup);
  const quantumGroup=new THREE.Group(); coreGroup.add(quantumGroup);
  const qGeo
