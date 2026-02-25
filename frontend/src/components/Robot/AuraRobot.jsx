import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'

// ─── Helper Mesh Components ─────────────────────────────────────────────────
function Box({ args, position, rotation, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} rotation={rotation} castShadow receiveShadow {...props}>
      <boxGeometry args={args} />
      {children}
    </mesh>
  )
}
function Sphere({ args, position, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} castShadow receiveShadow {...props}>
      <sphereGeometry args={args} />
      {children}
    </mesh>
  )
}

// ─── State Colors ────────────────────────────────────────────────────────────
function getColors(state) {
  switch (state) {
    case 'listening': return { eye: '#00ff88', aura: '#00ff88', intensity: 3.5 }
    case 'thinking': return { eye: '#bf5fff', aura: '#9933ff', intensity: 3 }
    case 'talking': return { eye: '#00cfff', aura: '#00aaff', intensity: 4 }
    case 'executing': return { eye: '#ffee00', aura: '#ff8800', intensity: 3.5 }
    default: return { eye: '#00cfff', aura: '#5599ff', intensity: 2 }
  }
}

// ─── Live Code Display ────────────────────────────────────────────────────────
function MonitorScreen({ state }) {
  const screenRef = useRef()
  const cols = getColors(state)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const active = state !== 'idle'
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = active
        ? 1.2 + Math.sin(t * 8) * 0.4
        : 0.4 + Math.sin(t * 1.2) * 0.1
    }
  })
  return (
    <group>
      {/* Monitor frame - beveled look with physical material */}
      <Box args={[2.22, 1.48, 0.1]} position={[0, 0.72, -0.2]}>
        <meshPhysicalMaterial
          color="#05050a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Box>
      {/* Screen area with slight bulge for realism */}
      <mesh ref={screenRef} position={[0, 0.72, -0.14]}>
        <boxGeometry args={[2.05, 1.32, 0.02]} />
        <meshStandardMaterial
          color="#010410"
          emissive={cols.eye}
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Monitor stand */}
      <Box args={[0.08, 0.6, 0.08]} position={[0, 0.05, -0.2]}>
        <meshPhysicalMaterial color="#111120" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.7, 0.05, 0.45]} position={[0, -0.25, -0.2]}>
        <meshPhysicalMaterial color="#0d0d1a" metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  )
}

// ─── Desk ────────────────────────────────────────────────────────────────────
function Desk() {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Surface with clearcoat reflection */}
      <Box args={[3.6, 0.1, 1.5]} position={[0, 0, 0.1]}>
        <meshPhysicalMaterial
          color="#0a0a14"
          metalness={0.7}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </Box>
      {/* Legs */}
      {[[-1.65, -0.55, 0.65], [1.65, -0.55, 0.65], [-1.65, -0.55, -0.45], [1.65, -0.55, -0.45]].map((p, i) => (
        <Box key={i} args={[0.08, 1.1, 0.08]} position={p}>
          <meshPhysicalMaterial color="#050510" metalness={0.9} roughness={0.1} />
        </Box>
      ))}
    </group>
  )
}

// ─── Chair ────────────────────────────────────────────────────────────────────
function Chair() {
  return (
    <group position={[0, -1.6, 1.0]}>
      {/* Seat */}
      <Box args={[1.2, 0.15, 1.1]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#08080f" roughness={0.8} />
      </Box>
      {/* Backrest */}
      <Box args={[1.2, 1.3, 0.12]} position={[0, 0.7, -0.52]}>
        <meshPhysicalMaterial color="#08080f" roughness={0.8} />
      </Box>
      {/* Arm rests */}
      <Box args={[0.1, 0.45, 0.75]} position={[-0.6, 0.3, 0.1]}>
        <meshPhysicalMaterial color="#05050c" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.1, 0.45, 0.75]} position={[0.6, 0.3, 0.1]}>
        <meshPhysicalMaterial color="#05050c" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Central Pedestal */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.7, 12]} />
        <meshPhysicalMaterial color="#05050c" metalness={1} roughness={0.1} />
      </mesh>
      {/* Base spokes */}
      <Box args={[0.8, 0.08, 0.08]} position={[0, -0.75, 0]}>
        <meshPhysicalMaterial color="#05050c" metalness={1} roughness={0.1} />
      </Box>
      <Box args={[0.08, 0.08, 0.8]} position={[0, -0.75, 0]}>
        <meshPhysicalMaterial color="#05050c" metalness={1} roughness={0.1} />
      </Box>
    </group>
  )
}

// ─── Keyboard ────────────────────────────────────────────────────────────────
function Keyboard({ state }) {
  const kbRef = useRef()
  const cols = getColors(state)
  useFrame(({ clock }) => {
    if (!kbRef.current) return
    const t = clock.elapsedTime
    if (state === 'executing') {
      kbRef.current.position.y = -1.0 + Math.sin(t * 18) * 0.012
    } else {
      kbRef.current.position.y = THREE.MathUtils.lerp(kbRef.current.position.y, -1.0, 0.1)
    }
  })
  return (
    <group position={[0, -1.0, 0.5]}>
      <mesh ref={kbRef}>
        <boxGeometry args={[1.6, 0.06, 0.55]} />
        <meshPhysicalMaterial color="#05050f" metalness={0.8} roughness={0.15} />
      </mesh>
      {/* Keyboard Backlight */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.45]} />
        <meshStandardMaterial color={cols.eye} emissive={cols.eye} emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ─── Main Robot Body ─────────────────────────────────────────────────────────
function AuraBody({ state }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftEye = useRef()
  const rightEye = useRef()
  const chestRef = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  const mouthRef = useRef()
  const antennaOrb = useRef()
  const [blinkOpen, setBlinkOpen] = useState(true)
  const cols = getColors(state)

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#0a0a1a',
    metalness: 1.0,
    roughness: 0.02,
    clearcoat: 1.0,
    clearcoatRoughness: 0.01,
    envMapIntensity: 1.5,
  }), [])

  useEffect(() => {
    const blink = () => {
      setBlinkOpen(false)
      setTimeout(() => setBlinkOpen(true), 140)
    }
    const id = setInterval(blink, 4000 + Math.random() * 2500)
    return () => clearInterval(id)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // ── Organic Idle: micro-twitches + breathing
    if (groupRef.current) {
      const breathe = Math.sin(t * 0.8) * 0.03
      groupRef.current.position.y = breathe
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.02
      if (chestRef.current) chestRef.current.scale.y = 1 + Math.sin(t * 1.2) * 0.015
    }

    // ── Listening: curious tilt + vibrant eyes
    if (state === 'listening' && headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 3) * 0.08
      headRef.current.rotation.x = -0.1
      if (leftEye.current) leftEye.current.scale.setScalar(1 + Math.sin(t * 10) * 0.2)
      if (rightEye.current) rightEye.current.scale.setScalar(1 + Math.sin(t * 10) * 0.2)
    }

    // ── Thinking: organic gaze shift
    if (state === 'thinking' && headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.5) * 0.25
      headRef.current.rotation.z = Math.sin(t * 1.8) * 0.1
      headRef.current.rotation.x = Math.sin(t * 1.2) * 0.1
    }

    // ── Talking: articulated mouth system
    if (state === 'talking' && headRef.current) {
      headRef.current.rotation.x = -0.05 + Math.sin(t * 8) * 0.08
      if (mouthRef.current) {
        mouthRef.current.scale.y = 1 + Math.abs(Math.sin(t * 12)) * 2.5
        mouthRef.current.material.emissiveIntensity = 1.5 + Math.abs(Math.sin(t * 12)) * 2
      }
    }

    // ── Executing: intense typing
    if (state === 'executing') {
      if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 18) * 0.3
      if (rightArm.current) rightArm.current.rotation.x = Math.sin(t * 18 + 0.8) * 0.3
      // Subtle shoulder shrug
      if (chestRef.current) chestRef.current.position.y = 0.05 + Math.sin(t * 10) * 0.01
    } else {
      if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -0.4, 0.1)
      if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -0.4, 0.1)
    }

    // ── Reset head lerp back
    if (state === 'idle' && headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.04)
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.04)
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.04)
    }

    // ── Antenna pulse
    if (antennaOrb.current) {
      antennaOrb.current.material.emissiveIntensity = cols.intensity * (1.2 + Math.sin(t * 5) * 0.5)
    }

    // ── Eye blink logic
    if (leftEye.current && rightEye.current && state !== 'listening') {
      const targetY = blinkOpen ? 1 : 0.05
      leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, targetY, 0.3)
      rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, targetY, 0.3)
    }
  })

  const eyeColor = cols.eye

  return (
    <group ref={groupRef} position={[0, -0.2, 0.2]}>
      {/* ── HEAD ── */}
      <group ref={headRef} position={[0, 1.15, 0]}>
        {/* Main Head Casting */}
        <Box args={[0.82, 0.78, 0.8]} position={[0, 0, 0]}>
          <primitive object={bodyMat} attach="material" />
        </Box>

        {/* Visual Gaskets / Trim */}
        <Box args={[0.86, 0.04, 0.84]} position={[0, 0.39, 0]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.8} />
        </Box>
        <Box args={[0.86, 0.04, 0.84]} position={[0, -0.39, 0]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
        </Box>

        {/* Eyes - Dynamic scale handles blinking/pupil pulse */}
        <group position={[0, 0.08, 0.41]}>
          <mesh ref={leftEye} position={[-0.24, 0, 0]}>
            <boxGeometry args={[0.2, 0.14, 0.02]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
          </mesh>
          <mesh ref={rightEye} position={[0.24, 0, 0]}>
            <boxGeometry args={[0.2, 0.14, 0.02]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
          </mesh>
          {/* Glass Faceplate effect */}
          <Box args={[0.76, 0.68, 0.01]} position={[0, -0.08, -0.02]}>
            <meshPhysicalMaterial
              color="#000"
              transparent
              opacity={0.4}
              roughness={0}
              metalness={1}
              transmission={1}
              thickness={0.5}
            />
          </Box>
        </group>

        {/* Mouth Panel */}
        <mesh ref={mouthRef} position={[0, -0.18, 0.41]}>
          <boxGeometry args={[0.35, 0.05, 0.01]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={1} transparent opacity={0.8} />
        </mesh>

        {/* Antenna System */}
        <group position={[0, 0.4, 0]}>
          <mesh rotation={[0, 0, 0]} position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
          </mesh>
          <mesh ref={antennaOrb} position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.09, 24, 24]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
          </mesh>
        </group>
      </group>

      {/* ── NECK JOINT ── */}
      <mesh position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial color="#050510" metalness={1} roughness={0.05} />
      </mesh>

      {/* ── BODY ── */}
      <mesh ref={chestRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.15, 1.05, 0.65]} />
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Chest Core / Heart */}
      <group position={[0, 0.15, 0.33]}>
        <Box args={[0.6, 0.4, 0.05]}>
          <meshPhysicalMaterial color="#000" metalness={1} roughness={0} />
        </Box>
        {/* Horizontal Detail Lines */}
        {[0.12, 0, -0.12].map((y, i) => (
          <Box key={i} args={[0.55, 0.03, 0.06]} position={[0, y, 0.01]}>
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={state !== 'idle' ? 1.5 : 0.4} />
          </Box>
        ))}
      </group>

      {/* Shoulder Articulation */}
      <group position={[-0.68, 0.28, 0]}>
        <Sphere args={[0.22, 16, 16]}>
          <meshPhysicalMaterial color="#08081a" metalness={1} roughness={0.1} />
        </Sphere>
      </group>
      <group position={[0.68, 0.28, 0]}>
        <Sphere args={[0.22, 16, 16]}>
          <meshPhysicalMaterial color="#08081a" metalness={1} roughness={0.1} />
        </Sphere>
      </group>

      {/* ── ARMS ── */}
      {/* Left */}
      <group ref={leftArm} position={[-0.8, 0.1, 0]}>
        <Box args={[0.28, 0.8, 0.28]} position={[0, -0.4, 0]}>
          <primitive object={bodyMat} attach="material" />
        </Box>
        <Sphere args={[0.16, 12, 12]} position={[0, -0.85, 0]}>
          <meshPhysicalMaterial color="#050510" metalness={1} roughness={0.05} />
        </Sphere>
        <Box args={[0.24, 0.6, 0.24]} position={[0, -1.2, 0.1]}>
          <primitive object={bodyMat} attach="material" />
        </Box>
        {/* Hand */}
        <Box args={[0.28, 0.2, 0.3]} position={[0, -1.55, 0.15]}>
          <meshPhysicalMaterial color="#050510" metalness={0.9} roughness={0.2} />
        </Box>
      </group>

      {/* Right */}
      <group ref={rightArm} position={[0.8, 0.1, 0]}>
        <Box args={[0.28, 0.8, 0.28]} position={[0, -0.4, 0]}>
          <primitive object={bodyMat} attach="material" />
        </Box>
        <Sphere args={[0.16, 12, 12]} position={[0, -0.85, 0]}>
          <meshPhysicalMaterial color="#050510" metalness={1} roughness={0.05} />
        </Sphere>
        <Box args={[0.24, 0.6, 0.24]} position={[0, -1.2, 0.1]}>
          <primitive object={bodyMat} attach="material" />
        </Box>
        <Box args={[0.28, 0.2, 0.3]} position={[0, -1.55, 0.15]}>
          <meshPhysicalMaterial color="#050510" metalness={0.9} roughness={0.2} />
        </Box>
      </group>
    </group>
  )
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ state }) {
  const cols = getColors(state)
  return (
    <>
      <Environment preset="city" />

      {/* Main Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[2, 4, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Cinematic Glow Lights */}
      <pointLight position={[-3, 2, 2]} intensity={2} color={cols.aura} distance={10} />
      <pointLight position={[3, 2, -1]} intensity={1.5} color="#bf5fff" distance={10} />
      <pointLight position={[0, 5, 2]} intensity={0.8} color="#fff" distance={8} />

      {/* Objects */}
      <Desk />
      <Chair />
      <MonitorScreen state={state} />
      <Keyboard state={state} />

      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <AuraBody state={state} />
      </Float>

      {/* Ground Shadows for Realism */}
      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.65}
        scale={10}
        blur={2.5}
        far={4.5}
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
        camera={{ position: [0, 1.2, 4.5], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ReinhardToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <color attach="background" args={['#050508']} />
        <Scene state={robotState} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
