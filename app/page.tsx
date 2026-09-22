
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Trail } from "@react-three/drei";
import * as THREE from "three";

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.2;
    ref.current.rotation.x += delta * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#0a4bff"
          emissive="#002aff"
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial color="#0015ff" transparent opacity={0.15} wireframe />
      </mesh>
    </Float>
  );
}

function Drone({ pos, color = "#00aaff" }: { pos: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const t = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.elapsedTime + t;
    ref.current.position.x = pos[0] + Math.sin(time * 0.6) * 1.2;
    ref.current.position.z = pos[2] + Math.cos(time * 0.5) * 1.2;
    ref.current.position.y = pos[1] + Math.sin(time * 0.8) * 0.3;
  });

  return (
    <group ref={ref} position={pos}>
      <Trail width={1.5} length={8} color={color} attenuation={(w) => w}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
        </mesh>
      </Trail>
      <pointLight color={color} intensity={2} distance={3} />
    </group>
  );
}

function Scene() {
  const drones = useMemo<[number, number, number][]>(
    () => [
      [3, 0.5, 1],
      [-3, -0.8, -1.5],
      [1.5, 1.8, -2.5],
      [-2, 1.2, 2.2],
      [0, -2, 0.5],
    ],
    []
  );

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#2a5bff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#0011ff" />
      <Core />
      {drones.map((p, i) => (
        <Drone key={i} pos={p} color={i % 2 === 0? "#00aaff" : "#4a00ff"} />
      ))}
    </>
  );
}

export default function Page() {
  return (
    <main className="relative h-screen w-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={["#000000"]} />
          <Scene />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-between p-6">
        <div className="w-full flex justify-between text-[10px] tracking-[0.3em] text-blue-400/60 uppercase">
          <span>v19.2.3.1 / MAGCORE-LAB</span>
          <span>SYSTEM READY • PRODUCTION</span>
        </div>
        <div className="text-center">
          <h1 className="text-white text-2xl tracking-[0.4em] font-mono">MAG-CORE</h1>
          <p className="text-blue-400/50 text-[10px] tracking-[0.5em] mt-2">QUANTUM INTELLIGENT NETWORK</p>
        </div>
        <div className="h-4" />
      </div>
    </main>
  );
}
