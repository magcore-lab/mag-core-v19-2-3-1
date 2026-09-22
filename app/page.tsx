"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  Sparkles,
  PerspectiveCamera,
  Lightformer
} from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlendFunction } from "postprocessing";

function DiamondCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15;
    meshRef.current.rotation.z += delta * 0.05;
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.8}>
      {/* DIAMANT EXTERIEUR - ECLAT */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 4]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transmission={1}
          thickness={0.8}
          ior={2.4}
          roughness={0}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={3.5}
          dispersion={0.15}
          iridescence={0.3}
          iridescenceIOR={1.8}
        />
      </mesh>

      {/* NOYAU QUANTIQUE INTERIEUR */}
      <mesh ref={innerRef} scale={0.65}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#0088ff"
          emissive="#0044ff"
          emissiveIntensity={3}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* COEUR D'ENERGIE */}
      <mesh scale={0.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#aaccff" />
        <pointLight intensity={8} distance={5} color="#4488ff" />
      </mesh>
    </Float>
  );
}

function QuantumField() {
  return (
    <>
      <Sparkles
        count={400}
        scale={[12, 12, 12]}
        size={0.4}
        speed={0.3}
        noise={0.2}
        color="#88ccff"
      />
      <Sparkles
        count={150}
        scale={[4, 4, 4]}
        size={1.2}
        speed={0.6}
        noise={0.1}
        color="#ffffff"
      />
    </>
  );
}

function Drones() {
  const groupRef = useRef<THREE.Group>(null);

  const droneData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      pos: [
        Math.cos((i / 6) * Math.PI * 2) * (2.8 + Math.random()),
        (Math.random() - 0.5) * 2,
        Math.sin((i / 6) * Math.PI * 2) * (2.8 + Math.random())
      ] as [number, number, number],
      speed: 0.4 + Math.random() * 0.4,
      color: i % 2 === 0? "#00ddff" : "#8a2be2"
    })), []
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.08;
  });

  return (
    <group ref={groupRef}>
      {droneData.map((d, i) => (
        <Float key={i} speed={d.speed * 2} floatIntensity={0.5}>
          <group position={d.pos}>
            <mesh>
              <octahedronGeometry args={[0.08, 0]} />
              <meshStandardMaterial
                color={d.color}
                emissive={d.color}
                emissiveIntensity={5}
              />
            </mesh>
            <pointLight color={d.color} intensity={1.5} distance={2} />
          </group>
        </Float>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={45} />

      {/* ENVIRONNEMENT QUANTIQUE POUR REFLET DIAMANT */}
      <Environment resolution={512}>
        <group rotation={[0, 0, Math.PI / 4]}>
          <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 4, -9]} scale={[10, 10, 1]} color="#4a8bff" />
          <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} color="#ffffff" />
          <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 1, -1]} scale={[10, 2, 1]} color="#8a4dff" />
          <Lightformer intensity={1} position={[0, -5, -2]} scale={[10, 10, 1]} color="#001a4d" />
        </group>
      </Environment>

      <ambientLight intensity={0.15} />

      <QuantumField />
      <DiamondCore />
      <Drones />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
          mipmapBlur
          radius={0.6}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0003, 0.0003]}
        />
      </EffectComposer>
    </>
  );
}

export default function Page() {
  return (
    <main className="h-screen w-screen bg-[#020208] overflow-hidden">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <Scene />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex justify-between font-mono text-[9px] tracking-[0.35em] text-white/30">
          <span>MAGCORE • v19.3 QUANTUM-DIAMOND</span>
          <span className="text-cyan-300/60">● LIVE / PRODUCTION / READY</span>
        </div>
        <div className="text-center font-mono">
          <h1 className="text-white/90 text-xl tracking-[0.6em]">DIAMOND CORE</h1>
          <div className="mt-1 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          <p className="mt-2 text-cyan-200/40 text-[9px] tracking-[0.6em]">IOR 2.4 • DISPERSION 0.15 • QUANTUM FIELD ACTIVE</p>
        </div>
        <div className="h-4" />
      </div>
    </main>
  );
}
