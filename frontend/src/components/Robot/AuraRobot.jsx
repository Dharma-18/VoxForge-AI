import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, useCursor } from '@react-three/drei'
import { useStore } from '../../store/useStore'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIALS — clay / toon-style with subtle sheen
   ═══════════════════════════════════════════════════════════════════════════ */
const mat = {
  skin: () => new THREE.MeshPhysicalMaterial({ color: '#f5c5a3', roughness: 0.55, clearcoat: 0.3 }),
  hair: () => new THREE.MeshPhysicalMaterial({ color: '#1a1015', roughness: 0.85 }),
  shirt: () => new THREE.MeshPhysicalMaterial({ color: '#e63322', roughness: 0.65 }),
  headband: () => new THREE.MeshPhysicalMaterial({ color: '#e83525', roughness: 0.5 }),
  pants: () => new THREE.MeshPhysicalMaterial({ color: '#1a1e30', roughness: 0.7 }),
  shoe: () => new THREE.MeshPhysicalMaterial({ color: '#e8ddd0', roughness: 0.6 }),
  desk: () => new THREE.MeshPhysicalMaterial({ color: '#c08050', roughness: 0.5, clearcoat: 0.2 }),
  deskLeg: () => new THREE.MeshPhysicalMaterial({ color: '#2a2a2a', roughness: 0.4, metalness: 0.3 }),
  monitor: () => new THREE.MeshPhysicalMaterial({ color: '#1a1c20', roughness: 0.3 }),
  chair: () => new THREE.MeshPhysicalMaterial({ color: '#1a1a1a', roughness: 0.7 }),
  chairMetal: () => new THREE.MeshPhysicalMaterial({ color: '#333', metalness: 0.7, roughness: 0.3 }),
  keyboard: () => new THREE.MeshPhysicalMaterial({ color: '#111', roughness: 0.6 }),
  box: () => new THREE.MeshPhysicalMaterial({ color: '#d4c8bb', roughness: 0.7 }),
  eye: () => new THREE.MeshPhysicalMaterial({ color: '#fefefe', roughness: 0.2 }),
  pupil: () => new THREE.MeshBasicMaterial({ color: '#1a1008' }),
  nose: () => new THREE.MeshPhysicalMaterial({ color: '#e8b090', roughness: 0.5 }),
}

function getScreenColor(state) {
  switch (state) {
    case 'listening': return { glow: '#00ff88', intensity: 2 }
    case 'thinking': return { glow: '#bf5fff', intensity: 1.5 }
    case 'talking': return { glow: '#00cfff', intensity: 2.5 }
    case 'executing': return { glow: '#4488ff', intensity: 2 }
    default: return { glow: '#88bbff', intensity: 1 }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CURLY HAIR — multiple deformed spheres for volume
   ═══════════════════════════════════════════════════════════════════════════ */
function CurlyHair() {
  const hairMat = useMemo(mat.hair, [])
  // Positions for hair clumps to give a voluminous curly look
  const clumps = [
    // Top crown
    { p: [0, 0.28, -0.02], r: 0.22 }, { p: [-0.15, 0.32, 0], r: 0.18 },
    { p: [0.15, 0.34, 0], r: 0.19 }, { p: [0, 0.38, -0.08], r: 0.16 },
    // Back
    { p: [0, 0.15, -0.22], r: 0.2 }, { p: [-0.12, 0.2, -0.2], r: 0.17 },
    { p: [0.12, 0.22, -0.18], r: 0.18 },
    // Sides
    { p: [-0.25, 0.15, -0.05], r: 0.15 }, { p: [0.25, 0.18, -0.04], r: 0.16 },
    { p: [-0.22, 0.28, -0.06], r: 0.14 }, { p: [0.22, 0.3, -0.04], r: 0.15 },
    // Extra volume top
    { p: [-0.08, 0.4, 0.05], r: 0.13 }, { p: [0.1, 0.42, 0.03], r: 0.12 },
    { p: [0, 0.42, -0.12], r: 0.14 },
    // Wild tufts sticking out
    { p: [-0.28, 0.3, 0.05], r: 0.1 }, { p: [0.3, 0.32, 0.03], r: 0.11 },
    { p: [-0.1, 0.44, 0.08], r: 0.09 }, { p: [0.05, 0.46, -0.05], r: 0.1 },
  ]
  return (
    <group>
      {clumps.map((c, i) => (
        <mesh key={i} position={c.p} castShadow>
          <sphereGeometry args={[c.r, 12, 12]} />
          <primitive object={hairMat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOY CHARACTER — detailed chibi proportions
   ═══════════════════════════════════════════════════════════════════════════ */
function BoyCharacter({ state }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftArmRef = useRef()
  const rightArmRef = useRef()

  const skinMat = useMemo(mat.skin, [])
  const shirtMat = useMemo(mat.shirt, [])
  const headbandMat = useMemo(mat.headband, [])
  const pantsMat = useMemo(mat.pants, [])
  const shoeMat = useMemo(mat.shoe, [])
  const eyeMat = useMemo(mat.eye, [])
  const pupilMat = useMemo(mat.pupil, [])
  const noseMat = useMemo(mat.nose, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Idle breathing
    if (groupRef.current) groupRef.current.position.y = Math.sin(t * 2) * 0.015

    // Head animation per state
    if (headRef.current) {
      if (state === 'thinking') {
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.12
        headRef.current.rotation.x = Math.sin(t * 2) * 0.08
      } else if (state === 'listening') {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.12, 0.05)
        headRef.current.rotation.z = Math.sin(t * 3) * 0.04
      } else if (state === 'talking') {
        headRef.current.rotation.x = Math.sin(t * 6) * 0.08
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.05, 0.08)
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.08)
      }
    }

    // Typing animation
    if (state === 'executing') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = -0.6 + Math.sin(t * 22) * 0.12
      if (rightArmRef.current) rightArmRef.current.rotation.x = -0.6 + Math.sin(t * 22 + Math.PI) * 0.12
    } else {
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.6, 0.08)
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.6, 0.08)
    }
  })

  return (
    <group ref={groupRef} position={[0.05, 0.05, 0.65]} rotation={[0, Math.PI, 0]}>

      {/* ── HEAD ── */}
      <group ref={headRef} position={[0, 0.72, 0]}>
        {/* Face sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.32, 32, 32]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <primitive object={skinMat} attach="material" />
        </mesh>
        <mesh position={[0.3, 0, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Eyes — white + pupil */}
        {[[-0.11, 0.04, 0.27], [0.11, 0.04, 0.27]].map((p, i) => (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.065, 24, 24]} />
              <primitive object={eyeMat} attach="material" />
            </mesh>
            {/* Pupil */}
            <mesh position={[i === 0 ? -0.01 : 0.01, -0.01, 0.04]}>
              <sphereGeometry args={[0.04, 16, 16]} />
              <primitive object={pupilMat} attach="material" />
            </mesh>
            {/* Pupil highlight */}
            <mesh position={[i === 0 ? 0.015 : 0.025, 0.02, 0.055]}>
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshBasicMaterial color="#fff" />
            </mesh>
          </group>
        ))}

        {/* Nose */}
        <mesh position={[0, -0.06, 0.3]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <primitive object={noseMat} attach="material" />
        </mesh>

        {/* Smile — thin torus arc */}
        <mesh position={[0, -0.12, 0.28]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.04, 0.008, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#a06050" />
        </mesh>

        {/* Curly Hair */}
        <CurlyHair />

        {/* Red Headband */}
        <mesh position={[0, 0.18, 0]} rotation={[0.1, 0, 0]}>
          <torusGeometry args={[0.33, 0.035, 12, 32]} />
          <primitive object={headbandMat} attach="material" />
        </mesh>
      </group>

      {/* ── TORSO ── */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.4, 16, 16]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>

      {/* Short sleeves (shoulder caps) */}
      <mesh position={[-0.3, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>
      <mesh position={[0.3, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <primitive object={shirtMat} attach="material" />
      </mesh>

      {/* ── ARMS ── */}
      {/* Left arm */}
      <group position={[-0.34, 0.28, 0]}>
        <group ref={leftArmRef}>
          {/* Upper arm */}
          <mesh position={[0, -0.18, 0.05]} rotation={[0.3, 0, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.25, 8, 8]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
          {/* Forearm */}
          <mesh position={[-0.02, -0.38, 0.2]} rotation={[0.8, 0, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.22, 8, 8]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.02, -0.48, 0.35]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
        </group>
      </group>
      {/* Right arm */}
      <group position={[0.34, 0.28, 0]}>
        <group ref={rightArmRef}>
          <mesh position={[0, -0.18, 0.05]} rotation={[0.3, 0, 0]} castShadow>
            <capsuleGeometry args={[0.065, 0.25, 8, 8]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
          <mesh position={[0.02, -0.38, 0.2]} rotation={[0.8, 0, 0]} castShadow>
            <capsuleGeometry args={[0.06, 0.22, 8, 8]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
          <mesh position={[0.02, -0.48, 0.35]} castShadow>
            <sphereGeometry args={[0.07, 12, 12]} />
            <primitive object={skinMat} attach="material" />
          </mesh>
        </group>
      </group>

      {/* ── LEGS (sitting) ── */}
      {/* Upper legs — horizontal */}
      <mesh position={[-0.12, -0.28, 0.18]} rotation={[1.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.3, 8, 8]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>
      <mesh position={[0.12, -0.28, 0.18]} rotation={[1.4, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.3, 8, 8]} />
        <primitive object={pantsMat} attach="material" />
      </mesh>
      {/* Lower legs — vertical */}
      <mesh position={[-0.12, -0.65, 0.38]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 8, 8]} />
        <primitive object={skinMat} attach="material" />
      </mesh>
      <mesh position={[0.12, -0.65, 0.38]} castShadow>
        <capsuleGeometry args={[0.08, 0.3, 8, 8]} />
        <primitive object={skinMat} attach="material" />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.12, -0.88, 0.42]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <primitive object={shoeMat} attach="material" />
      </mesh>
      <mesh position={[0.12, -0.88, 0.42]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <primitive object={shoeMat} attach="material" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   OFFICE CHAIR — with armrests and wheels
   ═══════════════════════════════════════════════════════════════════════════ */
function OfficeChair() {
  const chairM = useMemo(mat.chair, [])
  const metalM = useMemo(mat.chairMetal, [])
  return (
    <group position={[0.05, -1.2, 1.0]}>
      {/* Seat */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.75, 0.1, 0.65]} />
        <primitive object={chairM} attach="material" />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.55, 0.3]} castShadow>
        <boxGeometry args={[0.72, 0.9, 0.08]} />
        <primitive object={chairM} attach="material" />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.38, 0.2, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.5]} />
        <primitive object={metalM} attach="material" />
      </mesh>
      <mesh position={[0.38, 0.2, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.5]} />
        <primitive object={metalM} attach="material" />
      </mesh>
      {/* Armrest supports */}
      <mesh position={[-0.38, 0.05, 0.15]} castShadow>
        <boxGeometry args={[0.04, 0.25, 0.04]} />
        <primitive object={metalM} attach="material" />
      </mesh>
      <mesh position={[0.38, 0.05, 0.15]} castShadow>
        <boxGeometry args={[0.04, 0.25, 0.04]} />
        <primitive object={metalM} attach="material" />
      </mesh>
      {/* Central pole */}
      <mesh position={[0, -0.35, 0.0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 12]} />
        <primitive object={metalM} attach="material" />
      </mesh>
      {/* Star base */}
      {[0, 1.26, 2.51, 3.77, 5.03].map((a, i) => (
        <mesh key={i} position={[Math.sin(a) * 0.3, -0.68, Math.cos(a) * 0.3]} rotation={[0, a, 0]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.35]} />
          <primitive object={metalM} attach="material" />
        </mesh>
      ))}
      {/* Wheels */}
      {[0, 1.26, 2.51, 3.77, 5.03].map((a, i) => (
        <mesh key={`w${i}`} position={[Math.sin(a) * 0.42, -0.72, Math.cos(a) * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
          <primitive object={metalM} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESK + MONITOR + KEYBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
function Workspace({ state }) {
  const screenRef = useRef()
  const deskM = useMemo(mat.desk, [])
  const legM = useMemo(mat.deskLeg, [])
  const monM = useMemo(mat.monitor, [])
  const kbM = useMemo(mat.keyboard, [])
  const cols = getScreenColor(state)

  useFrame(({ clock }) => {
    if (!screenRef.current) return
    const t = clock.elapsedTime
    const flicker = state !== 'idle' ? Math.sin(t * 12) * 0.08 : 0
    screenRef.current.material.emissiveIntensity = cols.intensity + flicker
  })

  return (
    <group position={[0, -1.2, 0]}>
      {/* Desk surface — thick rounded slab */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.12, 1.2]} />
        <primitive object={deskM} attach="material" />
      </mesh>
      {/* Desk front panel */}
      <mesh position={[0, -0.25, -0.55]} castShadow>
        <boxGeometry args={[2.7, 0.4, 0.05]} />
        <primitive object={deskM} attach="material" />
      </mesh>
      {/* Left leg */}
      <mesh position={[-1.2, -0.55, 0]} castShadow>
        <boxGeometry args={[0.08, 1.0, 1.1]} />
        <primitive object={legM} attach="material" />
      </mesh>
      {/* Right leg */}
      <mesh position={[1.2, -0.55, 0]} castShadow>
        <boxGeometry args={[0.08, 1.0, 1.1]} />
        <primitive object={legM} attach="material" />
      </mesh>

      {/* Monitor stand base */}
      <mesh position={[0, 0.06, -0.15]} castShadow>
        <boxGeometry args={[0.4, 0.03, 0.25]} />
        <primitive object={monM} attach="material" />
      </mesh>
      {/* Monitor stand pole */}
      <mesh position={[0, 0.25, -0.15]} castShadow>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <primitive object={monM} attach="material" />
      </mesh>
      {/* Monitor body */}
      <group position={[0, 0.7, -0.15]} rotation={[-0.08, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.0, 0.08]} />
          <primitive object={monM} attach="material" />
        </mesh>
        {/* Bezel accent */}
        <mesh position={[0, -0.48, 0]}>
          <boxGeometry args={[1.6, 0.03, 0.09]} />
          <primitive object={monM} attach="material" />
        </mesh>
        {/* Glowing screen */}
        <mesh ref={screenRef} position={[0, 0, 0.045]}>
          <planeGeometry args={[1.5, 0.9]} />
          <meshStandardMaterial color="#0a0e1a" emissive={cols.glow} emissiveIntensity={cols.intensity} />
        </mesh>
        {/* Fake code lines on screen */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-0.4 + (i % 3) * 0.1, 0.3 - i * 0.08, 0.048]}>
            <planeGeometry args={[0.3 + Math.random() * 0.5, 0.02]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#66ccff' : i % 3 === 1 ? '#88ff88' : '#ffcc44'} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Keyboard */}
      <mesh position={[0, 0.07, 0.25]} castShadow>
        <boxGeometry args={[0.9, 0.025, 0.3]} />
        <primitive object={kbM} attach="material" />
      </mesh>
      {/* Mouse */}
      <mesh position={[0.6, 0.07, 0.25]} castShadow>
        <capsuleGeometry args={[0.04, 0.06, 8, 8]} />
        <primitive object={monM} attach="material" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DESK LIGHT BULB — small desk lamp with interactive toggle
   ═══════════════════════════════════════════════════════════════════════════ */
function DeskLamp({ isLightOn, setIsLightOn }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  return (
    <group position={[-0.95, -1.1, -0.2]}>
      {/* Lamp base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.06, 16]} />
        <meshPhysicalMaterial color="#555" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Lamp pole */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshPhysicalMaterial color="#666" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bulb */}
      <mesh
        position={[0, 0.35, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); setIsLightOn(!isLightOn) }}
      >
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial
          color={isLightOn ? '#fffbe6' : '#444'}
          emissive={isLightOn ? '#ffe566' : '#000'}
          emissiveIntensity={isLightOn ? 5 : 0}
          toneMapped={false}
        />
      </mesh>
      {/* Warm glow */}
      {isLightOn && (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#ffe566" emissive="#ffcc44" emissiveIntensity={1.5} transparent opacity={0.12} toneMapped={false} />
        </mesh>
      )}
      {/* Light source */}
      <pointLight
        position={[0, 0.4, 0]}
        intensity={isLightOn ? 2.5 : 0}
        color="#fff5e0"
        distance={4}
        castShadow
      />
      {/* Wire on desk */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
        <meshBasicMaterial color="#888" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE BOX — under the desk
   ═══════════════════════════════════════════════════════════════════════════ */
function StorageBox() {
  const boxM = useMemo(mat.box, [])
  return (
    <group position={[-0.8, -1.95, -0.1]}>
      {/* Box body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.35, 0.4]} />
        <primitive object={boxM} attach="material" />
      </mesh>
      {/* Drawer handle */}
      <mesh position={[0, 0, 0.21]}>
        <boxGeometry args={[0.15, 0.04, 0.02]} />
        <meshPhysicalMaterial color="#999" metalness={0.5} />
      </mesh>
      {/* Drawer line */}
      <mesh position={[0, 0.05, 0.201]}>
        <planeGeometry args={[0.48, 0.005]} />
        <meshBasicMaterial color="#b0a090" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLOOR
   ═══════════════════════════════════════════════════════════════════════════ */
function Floor() {
  return (
    <mesh receiveShadow position={[0, -2.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#2a2a30" roughness={0.9} />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE — assembles everything
   ═══════════════════════════════════════════════════════════════════════════ */
function Scene({ state, isLightOn, setIsLightOn }) {
  const cols = getScreenColor(state)
  return (
    <>
      <color attach="background" args={['#3a3a44']} />
      <Environment preset="apartment" />

      {/* Key light */}
      <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.001} />
      {/* Fill light */}
      <directionalLight position={[-3, 3, 4]} intensity={0.4} />
      {/* Rim light */}
      <directionalLight position={[0, 2, -4]} intensity={0.3} color="#8888ff" />
      {/* Ambient */}
      <ambientLight intensity={isLightOn ? 0.35 : 0.15} />

      {/* Screen glow on face */}
      <spotLight
        position={[0, -0.5, -0.3]}
        target-position={[0, 0, 1]}
        intensity={isLightOn ? cols.intensity * 0.8 : cols.intensity * 3}
        color={cols.glow}
        distance={3}
        angle={Math.PI / 3}
        penumbra={0.6}
      />

      <Workspace state={state} />
      <BoyCharacter state={state} />
      <OfficeChair />
      <DeskLamp isLightOn={isLightOn} setIsLightOn={setIsLightOn} />
      <StorageBox />
      <Floor />

      <ContactShadows position={[0, -2.24, 0]} opacity={0.5} scale={10} blur={2.5} far={3} />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORT — full 360° orbit
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AuraRobot() {
  const robotState = useStore((s) => s.robotState)
  const [isLightOn, setIsLightOn] = useState(true)

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [3, 1.5, 4], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <Scene state={robotState} isLightOn={isLightOn} setIsLightOn={setIsLightOn} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  )
}
