import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'

// ─── State Colors ────────────────────────────────────────────────────────────
function getColors(state) {
  switch (state) {
    case 'listening': return { eye: '#00ff88', aura: '#00ff88', intensity: 3.5 }
    case 'thinking': return { eye: '#bf5fff', aura: '#9933ff', intensity: 3 }
    case 'talking': return { eye: '#00cfff', aura: '#00aaff', intensity: 4 }
    case 'executing': return { eye: '#ffee00', aura: '#ff8800', intensity: 3.5 }
    default: return { eye: '#00cfff', aura: '#5599ff', intensity: 2 } // idle
  }
}

// ─── Drone Core Segmented Orb ──────────────────────────────────────────────
function DroneCore({ state }) {
  const coreRef = useRef()
  const eyeRef = useRef()
  const cols = getColors(state)

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#080812',
    metalness: 1.0,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.0,
    flatShading: true // Gives it the segmented, high-tech poly look
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (coreRef.current) {
      // Core gently breathes and rotates
      coreRef.current.rotation.y = t * 0.2
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.05
    }

    if (eyeRef.current) {
      // Eye pulses based on state
      const pulseSpeed = state === 'thinking' || state === 'executing' ? 5 : 2
      eyeRef.current.material.emissiveIntensity = cols.intensity * (0.8 + Math.sin(t * pulseSpeed) * 0.2)

      if (state === 'listening') {
        eyeRef.current.scale.setScalar(1 + Math.sin(t * 8) * 0.15)
      } else if (state === 'talking') {
        eyeRef.current.scale.y = 1 + Math.abs(Math.sin(t * 15)) * 0.4
      } else {
        eyeRef.current.scale.setScalar(THREE.MathUtils.lerp(eyeRef.current.scale.x, 1, 0.1))
      }
    }
  })

  return (
    <group ref={coreRef}>
      {/* Outer segmented shell */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[0.8, 2]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Inner glowing eye core */}
      <mesh ref={eyeRef} position={[0, 0, 0.65]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#fff"
          emissive={cols.eye}
          emissiveIntensity={cols.intensity}
          toneMapped={false}
        />
      </mesh>

      {/* Glass Lens over the eye */}
      <mesh position={[0, 0, 0.7]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshPhysicalMaterial
          color="#000"
          transparent
          opacity={0.4}
          roughness={0}
          metalness={1}
          transmission={1}
          thickness={0.5}
        />
      </mesh>
    </group>
  )
}

// ─── Spinning Outer Rings ──────────────────────────────────────────────────
function DroneRings({ state }) {
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()
  const cols = getColors(state)

  const ringMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#050508',
    metalness: 0.9,
    roughness: 0.2,
    clearcoat: 1.0,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    let speedMult = 1

    if (state === 'thinking') speedMult = 2.5
    else if (state === 'executing') speedMult = 4
    else if (state === 'talking') speedMult = 1.5

    if (ring1.current) {
      ring1.current.rotation.x = t * 0.5 * speedMult
      ring1.current.rotation.y = t * 0.3 * speedMult
    }
    if (ring2.current) {
      ring2.current.rotation.x = -t * 0.4 * speedMult
      ring2.current.rotation.z = t * 0.6 * speedMult
    }
    if (ring3.current) {
      // Glow ring rotates differently
      ring3.current.rotation.y = t * 0.8 * speedMult
      ring3.current.rotation.z = Math.sin(t) * 0.2
    }
  })

  return (
    <group>
      {/* Structural Ring 1 */}
      <mesh ref={ring1} castShadow receiveShadow>
        <torusGeometry args={[1.2, 0.04, 16, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* Structural Ring 2 */}
      <mesh ref={ring2} castShadow receiveShadow>
        <torusGeometry args={[1.4, 0.03, 16, 64]} />
        <primitive object={ringMat} attach="material" />
      </mesh>

      {/* Energy/Glow Ring 3 */}
      <mesh ref={ring3}>
        <torusGeometry args={[1.6, 0.015, 16, 100]} />
        <meshStandardMaterial
          color={cols.aura}
          emissive={cols.aura}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

// ─── Holographic Projection Base ───────────────────────────────────────────
function ProjectionBase({ state }) {
  const baseRef = useRef()
  const cols = getColors(state)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (baseRef.current) {
      baseRef.current.rotation.y = t * 0.2
    }
  })

  return (
    <group position={[0, -2.0, 0]}>
      {/* Physical Base Plate */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.4, 0.2, 32]} />
        <meshPhysicalMaterial color="#050508" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Base Inner Glow Ring */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshStandardMaterial
          color={cols.aura}
          emissive={cols.aura}
          emissiveIntensity={1.5}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Holographic Upward Beam */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.0, 0.8, 2.4, 32, 1, true]} />
        <meshStandardMaterial
          color={cols.aura}
          emissive={cols.aura}
          emissiveIntensity={1}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ─── Dynamic Background Particles ──────────────────────────────────────────
function EnergyParticles({ state }) {
  const particlesRef = useRef()
  const cols = getColors(state)
  const particleCount = 40

  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return pos
  })

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.02) * 0.2
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={cols.eye}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}


// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ state }) {
  const cols = getColors(state)
  return (
    <>
      <Environment preset="city" />

      {/* Main Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[4, 6, 2]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.5} />

      {/* Drone Core Lights */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color={cols.aura} distance={6} />

      {/* Cinematic Glow Lights */}
      <pointLight position={[-3, 2, 2]} intensity={1.5} color={cols.eye} distance={10} />
      <pointLight position={[3, -2, -1]} intensity={1.0} color="#bf5fff" distance={10} />

      {/* Drone Objects */}
      <ProjectionBase state={state} />
      <EnergyParticles state={state} />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 0.5, 0]}>
          <DroneCore state={state} />
          <DroneRings state={state} />
        </group>
      </Float>

      {/* Ground Shadows for Realism */}
      <ContactShadows
        position={[0, -2.0, 0]}
        opacity={0.8}
        scale={8}
        blur={2}
        far={2.5}
        color="#000000"
      />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AuraRobot() {
  const robotState = useStore((state) => state.robotState)

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [0, 0.5, 5.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ReinhardToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <color attach="background" args={['#030306']} />
        <Scene state={robotState} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}
