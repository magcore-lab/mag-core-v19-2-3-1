'use client';
/**
 * MAG CORE V19.2.3.1 UNIFIED OPTIMIZED FIXED — NO WHITE PAGE
 * CORE LOCK SCELLÉ — 0.62/0.78/0.92 R0.48 T0.995 IOR2.65 thickness0.52 Z10.71 FOV34 DEZOOM 5% — 99.5%
 * FIX: artNetRef/sacnRef undefined → removed, WebSocket safe, mountRef guard, error boundary
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const CORE_LOCK = {
  cages: [0.62, 0.78, 0.92] as const,
  middle: { R: 0.48 },
  inner: { R1: 0.22, R2: 0.11 },
  sat: { radiusFactor: 1.15, count: 6 },
  camera: { fov: 34, z: 10.71 },
} as const;

type GPUState = 'BOOT' | 'READY' | 'ACTIVE' | 'DEGRADED' | 'GPU_UNAVAILABLE' | 'ERROR';
type SystemState = 'BOOT' | 'READY' | 'ACTIVE' | 'DEGRADED' | 'GPU_UNAVAILABLE' | 'NETWORK_UNAVAILABLE' | 'DMX_ACTIVE' | 'BLACKOUT';

class SecurityLayer {
  rateMap = new Map<string, number[]>();
  log(level: string, msg: string, data?: any) {
    const ts = new Date().toISOString();
    if (level === 'ERROR' || level === 'SECURITY') console.error(`[${ts}][${level}] ${msg}`, data||'');
    else console.log(`[${ts}][${level}] ${msg}`, data||'');
  }
  clampDMX(v: any){ const n=Number(v); if(!isFinite(n)||isNaN(n)) return 0; return Math.max(0,Math.min(255,Math.floor(n))); }
  validateChannel(i:any){ const n=Math.floor(Number(i)); if(!isFinite(n)||n<1||n>512) return null; return n; }
  validateUniverse(u:any){ const n=Math.floor(Number(u)); if(!isFinite(n)||n<0||n>63999) return null; return n; }
  checkRateLimit(k:string){ const now=Date.now(); const t=this.rateMap.get(k)||[]; const r=t.filter(x=>now-x<1000); r.push(now); this.rateMap.set(k,r); return r.length<=100; }
}

class DMXEngine {
  channels = new Uint8Array(513);
  security: SecurityLayer;
  universe=0;
  constructor(security:SecurityLayer, uni=0){ this.security=security; this.universe=uni; }
  getChannel(ch:number){ return this.channels[ch]||0; }
  setChannel(ch:number,val:number){ const c=this.security.validateChannel(ch); if(c===null) return; this.channels[c]=this.security.clampDMX(val); }
  setChannelsFromArray(arr:number[]){ for(let i=0;i<arr.length&&i<512;i++) this.setChannel(i+1,arr[i]); }
  getCoreMapping(){ const c=this.channels; return {
    propulsion: (c[1]||45)/255, bloom: (c[2]||200)/255, flow: (c[3]||200)/255,
    rgb: (c[4]||1)/1000, particles: (c[5]||150)/255, codeRain: (c[6]||200)/255,
    satRotation: (c[7]||38)/255, innerScale: 1+(c[8]||255)/512, pyramids: (c[9]||180)/255, master: (c[10]||115)/255,
    rgbVal: c[4]||0, particlesVal: c[5]||0, codeRainVal: c[6]||0
  };}
}

class AudioEngine {
  ctx: AudioContext|null=null; analyser: AnalyserNode|null=null; data: Uint8Array|null=null;
  low=0.3; mid=0.5; high=0.4; beat=false; bpm=120; lastBeat=0;
  async init(){ try{ this.ctx=new (window.AudioContext||(window as any).webkitAudioContext)(); this.analyser=this.ctx.createAnalyser(); this.analyser.fftSize=256; this.data=new Uint8Array(128); const osc=this.ctx.createOscillator(); osc.frequency.value=110; osc.connect(this.analyser); this.analyser.connect(this.ctx.destination); osc.start(); setTimeout(()=>{ try{osc.stop();}catch{} },100); return true; }catch{ return false; } }
  analyze(){ if(!this.analyser||!this.data){ return {low:0.3,mid:0.5,high:0.4,beat:false,bpm:120,freq:new Uint8Array(128)}; } this.analyser.getByteFrequencyData(this.data as any); let low=0,mid=0,high=0; for(let i=0;i<10;i++) low+=this.data[i]; for(let i=10;i<50;i++) mid+=this.data[i]; for(let i=50;i<128;i++) high+=this.data[i]; low/=10*255; mid/=40*255; high/=78*255; const lowEnergy=this.data[0]+this.data[1]+this.data[2]; const avg=(this.data[0]+this.data[1]+this.data[2]+this.data[3])/4; let beat=false; if(lowEnergy>avg*1.3 && lowEnergy>100 && Date.now()-this.lastBeat>200){ beat=true; this.lastBeat=Date.now(); } return {low,mid,high,beat,bpm:120,freq:this.data}; }
}

class MidiEngine {
  low=0; mid=0; high=0; velocity=0; cc1=0; cc7=0.45; cc10=0.5; cc74=0; activeCount=0;
  async init(){ try{ const access=await (navigator as any).requestMIDIAccess?.(); if(!access) return false; for(const input of access.inputs.values()){ input.onmidimessage=(e:any)=>{ const [status,note,vel]=e.data; if(status===144&&vel>0){ this.activeCount++; this.velocity=vel/127; if(note<24) this.low=note/23; else if(note>=60&&note<72) this.mid=(note-60)/11; else if(note>=96) this.high=(note-96)/31; } else if(status===128||(status===144&&vel===0)){ this.activeCount=Math.max(0,this.activeCount-1); } else if(status===176){ if(note===1) this.cc1=vel/127; if(note===7) this.cc7=vel/127; if(note===10) this.cc10=vel/127; if(note===74) this.cc74=vel/127; } }; } return true; }catch{ return false; } }
  getAverages(){ return {low:this.low,mid:this.mid,high:this.high,velocity:this.velocity,cc1:this.cc1,cc7:this.cc7,cc10:this.cc10,cc74:this.cc74,pitchBend:8192,aftertouch:0,activeCount:this.activeCount}; }
}

class OscEngine {
  values: Record<string,number>={ '/propulsion':0.45, '/bloom':0.8, '/flow':0.8, '/rgb':0.004, '/particles':0.6, '/code':0.8, '/sat':0.15, '/inner':1.0, '/pyramids':0.7, '/beat':0, '/bpm':120 };
  monitor: any[]=[];
  init(){ setInterval(()=>{ this.values['/propulsion']=0.45+Math.sin(Date.now()*0.001)*0.1; this.values['/flow']=0.8+Math.sin(Date.now()*0.0007)*0.1; },50); }
  getMapping(){ return { propulsion:this.values['/propulsion'], bloom:this.values['/bloom'], flow:this.values['/flow'], rgb:this.values['/rgb'], particles:this.values['/particles'], code:this.values['/code'], sat:this.values['/sat'], inner:this.values['/inner'], pyramids:this.values['/pyramids'], cc1:this.values['/cc1']||0, cc7:this.values['/cc7']||0.45, cc10:this.values['/cc10']||0.5, cc74:this.values['/cc74']||0, bpm:this.values['/bpm'], beat:this.values['/beat'], glitch:0 }; }
}

class ATLAS {
  state:SystemState='BOOT';
  constructor(private security:SecurityLayer, private dmx:DMXEngine){}
  setState(s:SystemState){ this.state=s; }
  computeUnified(input:any){
    const osc=input.osc||{propulsion:0.45,flow:0.8,particles:0.6}; const midi=input.midi||{low:0,mid:0,high:0,velocity:0}; const audio=input.audio||{low:0.3,mid:0.5,high:0.4}; const dmx=input.dmx||{propulsion:0.45,bloom:0.8,flow:0.8}; const beat=!!input.beat;
    const lowCombined=audio.low*0.25+midi.low*0.25+osc.propulsion*0.3+dmx.propulsion*0.2;
    const midCombined=audio.mid*0.25+midi.mid*0.25+osc.flow*0.3+dmx.flow*0.2;
    const highCombined=audio.high*0.25+midi.high*0.25+osc.particles*0.3+dmx.particles*0.2;
    return { propulsion:0.45+lowCombined*0.5, bloom:0.8+lowCombined*0.5, flow:0.8+midCombined*0.5, rgbShift:midCombined*0.012, codeRainSpeed:0.2+highCombined*1.4, particleSpeed:highCombined*2.0, innerScale:1.0+lowCombined*0.5+(beat?0.2:0), satRotation:midCombined*0.3, pyramidsScale:0.5+lowCombined*1.5, beatTrigger:beat?1:0, bpm:120 };
  }
}

class WebGPUEngine {
  state:GPUState='BOOT';
  async init():Promise<GPUState>{ if(typeof navigator==='undefined'||!(navigator as any).gpu) return 'GPU_UNAVAILABLE'; try{ const adapter=await (navigator as any).gpu.requestAdapter({powerPreference:'high-performance'}); if(!adapter) return 'GPU_UNAVAILABLE'; const device=await adapter.requestDevice(); device.lost.then(()=>{ this.state='DEGRADED'; }); this.state='READY'; return 'READY'; }catch{ return 'ERROR'; } }
}

export default function Page(){
  const mountRef = useRef<HTMLDivElement>(null);
  const [propulsionUI,setPropulsionUI]=useState(100);
  const [gpuState,setGpuState]=useState<GPUState>('BOOT');
  const [systemState,setSystemState]=useState<SystemState>('BOOT');
  const [dmxChannels,setDmxChannels]=useState<number[]>(Array(20).fill(0));
  const [audioBands,setAudioBands]=useState({low:0,mid:0,high:0,beat:false,bpm:120});
  const propulsionRef = useRef(45);
  const securityRef = useRef<SecurityLayer|null>(null);
  const dmxRef = useRef<DMXEngine|null>(null);
  const audioRef = useRef<AudioEngine|null>(null);
  const midiRef = useRef<MidiEngine|null>(null);
  const oscRef = useRef<OscEngine|null>(null);
  const atlasRef = useRef<ATLAS|null>(null);
  const webgpuRef = useRef<WebGPUEngine|null>(null);

  useEffect(()=>{ propulsionRef.current=propulsionUI; },[propulsionUI]);

  useEffect(()=>{
    const security=new SecurityLayer();
    const dmx=new DMXEngine(security,0);
    const audio=new AudioEngine();
    const midi=new MidiEngine();
    const osc=new OscEngine();
    const atlas=new ATLAS(security,dmx);
    const webgpu=new WebGPUEngine();
    securityRef.current=security; dmxRef.current=dmx; audioRef.current=audio; midiRef.current=midi; oscRef.current=osc; atlasRef.current=atlas; webgpuRef.current=webgpu;

    webgpu.init().then(s=>{ setGpuState(s); setSystemState(s==='GPU_UNAVAILABLE'?'GPU_UNAVAILABLE':'READY'); });
    audio.init().catch(()=>{});
    midi.init().catch(()=>{});
    osc.init();

    let dmxWs:WebSocket|null=null;
    try{
      dmxWs=new WebSocket(`ws://${window.location.hostname}:8081`);
      dmxWs.onopen=()=>{ security.log('NETWORK','DMX bridge connected'); atlas.setState('DMX_ACTIVE'); setSystemState('DMX_ACTIVE'); };
      dmxWs.onmessage=(e)=>{ try{ const data=JSON.parse(e.data); if(Array.isArray(data.channels)){ dmx.setChannelsFromArray(data.channels); setDmxChannels([...dmx.channels.slice(1,21)]); } }catch{} };
      dmxWs.onerror=()=>{ security.log('WARN','DMX bridge not available - synthetic fallback'); };
      dmxWs.onclose=()=>{ atlas.setState('NETWORK_UNAVAILABLE'); };
    }catch{ security.log('WARN','WS not available'); }

    const interval=setInterval(()=>{
      if(audioRef.current){ const a=audioRef.current.analyze(); setAudioBands({low:a.low,mid:a.mid,high:a.high,beat:a.beat,bpm:a.bpm}); }
    },100);

    return ()=>{ clearInterval(interval); try{ dmxWs?.close(); }catch{} };
  },[]);

  useEffect(()=>{
    if(!mountRef.current) return;
    const mount=mountRef.current;
    mount.innerHTML='';
    let raf=0;
    let renderer:THREE.WebGLRenderer|null=null;
    let composer:any=null;
    try{
      const scene=new THREE.Scene();
      scene.background=new THREE.Color(0x000000);
      const camera=new THREE.PerspectiveCamera(CORE_LOCK.camera.fov, window.innerWidth/window.innerHeight, CORE_LOCK.camera.z, 100);
      camera.position.set(0,0,CORE_LOCK.camera.z);
      renderer=new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=2.2;
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);
      composer=new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene,camera));
      const bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight), 2.5, 0.3, 0.15);
      composer.addPass(bloomPass);
      scene.add(new THREE.AmbientLight(0xffffff,2.0));
      const key=new THREE.PointLight(0xffffff,800,50); key.position.set(4,4,5); scene.add(key);
      const fill=new THREE.PointLight(0xaaccff,500,50); fill.position.set(-5,3,4); scene.add(fill);
      const rim=new THREE.PointLight(0xffffff,400,50); rim.position.set(0,-5,-5); scene.add(rim);
      const coreLight=new THREE.PointLight(0xffffff,1000,20); coreLight.position.set(0,0,0); scene.add(coreLight);
      const coreLight2=new THREE.PointLight(0xffffff,600,15); coreLight2.position.set(0,0,2); scene.add(coreLight2);
      const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[0],3), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.55})); scene.add(outer);
      const outer2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[1],2), new THREE.MeshBasicMaterial({color:0x88ccff,wireframe:true,transparent:true,opacity:0.35})); scene.add(outer2);
      const outer3=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.cages[2],1), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.18})); scene.add(outer3);
      const middleMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:12,roughness:0.05,metalness:0.1});
      const middle=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.middle.R,5), middleMat); scene.add(middle);
      const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R1,3), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(inner);
      const inner2=new THREE.Mesh(new THREE.IcosahedronGeometry(CORE_LOCK.inner.R2,3), new THREE.MeshBasicMaterial({color:0xffffff})); scene.add(inner2);
      const glow=new THREE.Mesh(new THREE.SphereGeometry(0.30,32,32), new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.25})); scene.add(glow);
      const glow2=new THREE.Mesh(new THREE.SphereGeometry(0.52,32,32), new THREE.MeshBasicMaterial({color:0xaaccff,transparent:true,opacity:0.15})); scene.add(glow2);
      const satGroup=new THREE.Group(); scene.add(satGroup);
      const sats:THREE.Mesh[]=[];
      for(let i=0;i<6;i++){
        const ang=i*60*Math.PI/180;
        const m=new THREE.Mesh(new THREE.SphereGeometry(0.05,16,16
