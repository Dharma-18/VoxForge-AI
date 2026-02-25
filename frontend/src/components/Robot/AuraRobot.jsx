import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'

// ─── Helper Mesh Components ─────────────────────────────────────────────────
function Box({ args, position, rotation, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} rotation={rotation} {...props}>
      <boxGeometry args={args} />
      {children}
    </mesh>
  )
}
function Sphere({ args, position, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} {...props}>
      <sphereGeometry args={args} />
      {children}
    </mesh>
  )
}
function Cylinder({ args, position, children, ...props }) {
  return (
    <mesh position={position} {...props}>
      <cylinderGeometry args={args} />
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
        ? 0.8 + Math.sin(t * 8) * 0.2
        : 0.3 + Math.sin(t * 1.2) * 0.05
    }
  })
  return (
    <group>
      {/* Monitor frame */}
      <Box args={[2.2, 1.45, 0.08]} position={[0, 0.72, -0.2]}>
        <meshStandardMaterial color="#0a0a14" metalness={0.8} roughness={0.2} />
      </Box>
      {/* Screen glow */}
      <mesh ref={screenRef} position={[0, 0.72, -0.15]}>
        <boxGeometry args={[2.0, 1.28, 0.01]} />
        <meshStandardMaterial
          color="#020820"
          emissive={cols.eye}
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Monitor stand */}
      <Box args={[0.1, 0.5, 0.1]} position={[0, 0.02, -0.2]}>
        <meshStandardMaterial color="#111120" metalness={0.7} roughness={0.3} />
      </Box>
      <Box args={[0.6, 0.04, 0.4]} position={[0, -0.21, -0.2]}>
        <meshStandardMaterial color="#0d0d1a" metalness={0.7} roughness={0.3} />
      </Box>
    </group>
  )
}

// ─── Desk ────────────────────────────────────────────────────────────────────
function Desk() {
  return (
    <group position={[0, -1.05, 0]}>
      {/* Surface */}
      <Box args={[3.4, 0.07, 1.4]} position={[0, 0, 0.1]}>
        <meshStandardMaterial color="#0d0d1a" metalness={0.5} roughness={0.4} />
      </Box>
      {/* Legs */}
      {[[-1.55, -0.55, 0.65], [1.55, -0.55, 0.65], [-1.55, -0.55, -0.55], [1.55, -0.55, -0.55]].map((p, i) => (
        <Box key={i} args={[0.07, 1.1, 0.07]} position={p}>
          <meshStandardMaterial color="#070710" metalness={0.6} roughness={0.3} />
        </Box>
      ))}
    </group>
  )
}

// ─── Chair ────────────────────────────────────────────────────────────────────
function Chair() {
  return (
    <group position={[0, -1.55, 0.75]}>
      {/* Seat */}
      <Box args={[1.1, 0.1, 1.05]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0a0a14" metalness={0.3} roughness={0.6} />
      </Box>
      {/* Back */}
      <Box args={[1.1, 1.2, 0.1]} position={[0, 0.65, -0.47]}>
        <meshStandardMaterial color="#0a0a14" metalness={0.3} roughness={0.6} />
      </Box>
      {/* Arm rests */}
      <Box args={[0.08, 0.4, 0.7]} position={[-0.54, 0.25, 0.1]}>
        <meshStandardMaterial color="#060610" metalness={0.5} roughness={0.4} />
      </Box>
      <Box args={[0.08, 0.4, 0.7]} position={[0.54, 0.25, 0.1]}>
        <meshStandardMaterial color="#060610" metalness={0.5} roughness={0.4} />
      </Box>
      {/* Pedestal */}
      <Cylinder args={[0.08, 0.08, 0.6, 8]} position={[0, -0.4, 0]}>
        <meshStandardMaterial color="#060610" metalness={0.7} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.45, 0.45, 0.06, 16]} position={[0, -0.72, 0]}>
        <meshStandardMaterial color="#060610" metalness={0.6} roughness={0.3} />
      </Cylinder>
    </group>
  )
}

// ─── Keyboard ────────────────────────────────────────────────────────────────
function Keyboard({ state }) {
  const kbRef = useRef()
  useFrame(({ clock }) => {
    if (!kbRef.current) return
    if (state === 'executing') {
      kbRef.current.position.y = -1.02 + Math.sin(clock.elapsedTime * 14) * 0.008
    } else {
      kbRef.current.position.y = -1.02
    }
  })
  return (
    <mesh ref={kbRef} position={[0, -1.02, 0.5]}>
      <boxGeometry args={[1.5, 0.05, 0.5]} />
      <meshStandardMaterial color="#080816" metalness={0.6} roughness={0.35} />
    </mesh>
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

  // Blink effect timer
  useEffect(() => {
    const blink = () => {
      setBlinkOpen(false)
      setTimeout(() => setBlinkOpen(true), 120)
    }
    const id = setInterval(blink, 3200 + Math.random() * 2000)
    return () => clearInterval(id)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // ── Idle: breathing + gentle sway
    if (state === 'idle' && groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.05
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04
      if (chestRef.current) chestRef.current.scale.y = 1 + Math.sin(t * 1.1) * 0.025
    }

    // ── Listening: head tilt + eye pulse
    if (state === 'listening' && headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 2.5) * 0.1
      headRef.current.rotation.x = -0.08
      if (leftEye.current) leftEye.current.scale.setScalar(1 + Math.sin(t * 6) * 0.3)
      if (rightEye.current) rightEye.current.scale.setScalar(1 + Math.sin(t * 6) * 0.3)
    }

    // ── Thinking: slow head tilt left-right + antenna spin
    if (state === 'thinking' && headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 1.4) * 0.18
      headRef.current.rotation.x = Math.sin(t * 2.2) * 0.08
    }

    // ── Talking: nod + mouth open/close
    if (state === 'talking' && headRef.current) {
      headRef.current.rotation.x = Math.sin(t * 6) * 0.12
      if (mouthRef.current) {
        mouthRef.current.scale.y = 1 + Math.abs(Math.sin(t * 10)) * 1.5
        mouthRef.current.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 10)) * 1.5
      }
    }

    // ── Executing: arm typing motion
    if (state === 'executing') {
      if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 14) * 0.2
      if (rightArm.current) rightArm.current.rotation.x = Math.sin(t * 14 + Math.PI) * 0.2
      if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 5) * 0.04
    } else {
      if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, 0, 0.1)
      if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, 0.1)
    }

    // ── Reset head if not in active state (lerp back)
    if (state === 'idle' && headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0, 0.05)
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.05)
    }

    // ── Antenna orb pulse
    if (antennaOrb.current) {
      antennaOrb.current.material.emissiveIntensity = cols.intensity * (0.7 + Math.sin(t * 3) * 0.3)
    }

    // ── Eye blink
    if (leftEye.current && rightEye.current && state !== 'listening') {
      const eyeSY = blinkOpen ? 1 : 0.1
      leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, eyeSY, 0.25)
      rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, eyeSY, 0.25)
    }
  })

  const eyeColor = cols.eye

  return (
    <group ref={groupRef} position={[0, -0.2, 0.1]}>
      {/* ── HEAD ── */}
      <group ref={headRef} position={[0, 1.05, 0]}>
        {/* Head box */}
        <Box args={[0.78, 0.72, 0.72]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#101022" metalness={0.92} roughness={0.08} envMapIntensity={1} />
        </Box>
        {/* Head edge trim */}
        <Box args={[0.82, 0.04, 0.76]} position={[0, -0.36, 0]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.6} />
        </Box>
        <Box args={[0.82, 0.04, 0.76]} position={[0, 0.36, 0]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.4} />
        </Box>

        {/* Left eye */}
        <mesh ref={leftEye} position={[-0.22, 0.06, 0.37]}>
          <boxGeometry args={[0.18, 0.12, 0.04]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
        </mesh>
        {/* Left eye socket */}
        <Box args={[0.22, 0.16, 0.03]} position={[-0.22, 0.06, 0.36]}>
          <meshStandardMaterial color="#040414" metalness={0.5} roughness={0.5} />
        </Box>

        {/* Right eye */}
        <mesh ref={rightEye} position={[0.22, 0.06, 0.37]}>
          <boxGeometry args={[0.18, 0.12, 0.04]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
        </mesh>
        {/* Right eye socket */}
        <Box args={[0.22, 0.16, 0.03]} position={[0.22, 0.06, 0.36]}>
          <meshStandardMaterial color="#040414" metalness={0.5} roughness={0.5} />
        </Box>

        {/* Mouth / speaker grille */}
        <mesh ref={mouthRef} position={[0, -0.17, 0.37]}>
          <boxGeometry args={[0.32, 0.06, 0.02]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} transparent opacity={0.9} />
        </mesh>
        <Box args={[0.32, 0.02, 0.02]} position={[0, -0.13, 0.37]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.3} />
        </Box>
        <Box args={[0.32, 0.02, 0.02]} position={[0, -0.21, 0.37]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.3} />
        </Box>

        {/* Antenna */}
        <Box args={[0.04, 0.28, 0.04]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#00cfff" emissive="#00cfff" emissiveIntensity={1.2} />
        </Box>
        <mesh ref={antennaOrb} position={[0, 0.66, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={cols.intensity} />
        </mesh>

        {/* Side vents */}
        <Box args={[0.04, 0.35, 0.55]} position={[-0.41, 0, 0]}>
          <meshStandardMaterial color="#080818" metalness={0.9} roughness={0.15} />
        </Box>
        <Box args={[0.04, 0.35, 0.55]} position={[0.41, 0, 0]}>
          <meshStandardMaterial color="#080818" metalness={0.9} roughness={0.15} />
        </Box>
      </group>

      {/* ── NECK ── */}
      <Cylinder args={[0.12, 0.18, 0.2, 12]} position={[0, 0.65, 0]}>
        <meshStandardMaterial color="#0c0c1e" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* ── BODY ── */}
      <mesh ref={chestRef} position={[0, 0.05, 0]}>
        <boxGeometry args={[1.0, 0.95, 0.62]} />
        <meshStandardMaterial color="#0d0d22" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Chest panel */}
      <Box args={[0.55, 0.38, 0.06]} position={[0, 0.12, 0.32]}>
        <meshStandardMaterial color="#060614" emissive={eyeColor} emissiveIntensity={state !== 'idle' ? 0.8 : 0.25} metalness={0.5} roughness={0.3} />
      </Box>
      {/* Chest panel lines */}
      <Box args={[0.55, 0.02, 0.07]} position={[0, 0.22, 0.31]}>
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.7} />
      </Box>
      <Box args={[0.55, 0.02, 0.07]} position={[0, 0.02, 0.31]}>
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
      </Box>
      {/* Shoulder pads */}
      <Box args={[0.22, 0.25, 0.68]} position={[-0.61, 0.25, 0]}>
        <meshStandardMaterial color="#0c0c20" metalness={0.9} roughness={0.1} />
      </Box>
      <Box args={[0.22, 0.25, 0.68]} position={[0.61, 0.25, 0]}>
        <meshStandardMaterial color="#0c0c20" metalness={0.9} roughness={0.1} />
      </Box>
      {/* Body bottom trim */}
      <Box args={[1.04, 0.04, 0.66]} position={[0, -0.42, 0]}>
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.35} />
      </Box>

      {/* ── LEFT ARM ── */}
      <group ref={leftArm} position={[-0.72, 0.08, 0]}>
        <Box args={[0.22, 0.75, 0.22]} position={[0, -0.35, 0]}>
          <meshStandardMaterial color="#0c0c20" metalness={0.88} roughness={0.14} />
        </Box>
        {/* Elbow joint */}
        <mesh position={[0, -0.74, 0]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#080818" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Forearm */}
        <Box args={[0.19, 0.55, 0.19]} position={[0, -1.08, 0.12]}>
          <meshStandardMaterial color="#0d0d24" metalness={0.85} roughness={0.18} />
        </Box>
        {/* Hand */}
        <Box args={[0.22, 0.18, 0.26]} position={[0, -1.4, 0.14]}>
          <meshStandardMaterial color="#0a0a1c" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Knuckle line */}
        <Box args={[0.22, 0.02, 0.27]} position={[0, -1.3, 0.14]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
        </Box>
      </group>

      {/* ── RIGHT ARM ── */}
      <group ref={rightArm} position={[0.72, 0.08, 0]}>
        <Box args={[0.22, 0.75, 0.22]} position={[0, -0.35, 0]}>
          <meshStandardMaterial color="#0c0c20" metalness={0.88} roughness={0.14} />
        </Box>
        <mesh position={[0, -0.74, 0]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#080818" metalness={0.9} roughness={0.1} />
        </mesh>
        <Box args={[0.19, 0.55, 0.19]} position={[0, -1.08, 0.12]}>
          <meshStandardMaterial color="#0d0d24" metalness={0.85} roughness={0.18} />
        </Box>
        <Box args={[0.22, 0.18, 0.26]} position={[0, -1.4, 0.14]}>
          <meshStandardMaterial color="#0a0a1c" metalness={0.8} roughness={0.2} />
        </Box>
        <Box args={[0.22, 0.02, 0.27]} position={[0, -1.3, 0.14]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.5} />
        </Box>
      </group>

      {/* ── TORSO LOWER ── */}
      <Box args={[0.82, 0.32, 0.56]} position={[0, -0.58, 0]}>
        <meshStandardMaterial color="#0a0a1c" metalness={0.85} roughness={0.18} />
      </Box>
    </group>
  )
}

// ─── Soft Aura Light Ring ────────────────────────────────────────────────────
function AuraRing({ state }) {
  const ringRef = useRef()
  const cols = getColors(state)
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.elapsedTime
      const s = state === 'idle' ? 1 + Math.sin(t * 0.8) * 0.04
        : 1 + Math.sin(t * 3) * 0.08
      ringRef.current.scale.setScalar(s)
      ringRef.current.material.emissiveIntensity = 0.15 + Math.sin(t * 2) * 0.07
    }
  })
  return (
    <mesh ref={ringRef} position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2.0, 64]} />
      <meshStandardMaterial
        color={cols.aura}
        emissive={cols.aura}
        emissiveIntensity={0.15}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ state }) {
  const cols = getColors(state)
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 4]} intensity={0.7} color="#ffffff" />
      {/* Colored aura lights */}
      <pointLight position={[-3, 2, 2]} intensity={1.5} color={cols.aura} distance={8} />
      <pointLight position={[3, 2, 2]} intensity={1.0} color="#5500cc" distance={8} />
      <pointLight position={[0, 4, 3]} intensity={0.5} color={cols.eye} distance={6} />
      {/* Floor glow */}
      <pointLight position={[0, -2, 0]} intensity={0.4} color={cols.aura} distance={5} />

      {/* Scene objects */}
      <Desk />
      <Chair />
      <MonitorScreen state={state} />
      <Keyboard state={state} />
      <AuraBody state={state} />
      <AuraRing state={state} />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AuraRobot() {
  const robotState = useStore((state) => state.robotState)

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.8, 4.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
      >
        <Scene state={robotState} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
          enableDamping
          dampingFactor={0.06}
          minAzimuthAngle={-Math.PI / 5}
          maxAzimuthAngle={Math.PI / 5}
        />
      </Canvas>
    </div>
  )
}
