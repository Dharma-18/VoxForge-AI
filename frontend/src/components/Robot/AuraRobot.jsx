import { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, useCursor } from '@react-three/drei'
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
function Capsule({ args, position, rotation, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} rotation={rotation} castShadow receiveShadow {...props}>
      <capsuleGeometry args={args} />
      {children}
    </mesh>
  )
}
function Cylinder({ args, position, rotation, children, refProp, ...props }) {
  return (
    <mesh ref={refProp} position={position} rotation={rotation} castShadow receiveShadow {...props}>
      <cylinderGeometry args={args} />
      {children}
    </mesh>
  )
}

// ─── Screen Colors ────────────────────────────────────────────────────────────
function getColors(state) {
  switch (state) {
    case 'listening': return { glow: '#00ff88', intensity: 2 }
    case 'thinking': return { glow: '#bf5fff', intensity: 1.5 }
    case 'talking': return { glow: '#00cfff', intensity: 2.5 }
    case 'executing': return { glow: '#ffee00', intensity: 2 }
    default: return { glow: '#cae6ff', intensity: 1 } // idle
  }
}

// ─── Desk & PC Setup ─────────────────────────────────────────────────────────
function Workspace({ state }) {
  const screenRef = useRef()
  const cols = getColors(state)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (screenRef.current) {
      // Screen flickers slightly when active
      const flicker = state !== 'idle' ? Math.sin(t * 15) * 0.1 : 0
      screenRef.current.material.emissiveIntensity = cols.intensity + flicker
    }
  })

  return (
    <group position={[0, -1.2, 0]}>
      {/* Desk Surface */}
      <Box args={[3.2, 0.1, 1.6]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#3a2f26" roughness={0.7} metalness={0.1} />
      </Box>
      {/* Desk Legs */}
      {[[-1.4, -0.6, 0.6], [1.4, -0.6, 0.6], [-1.4, -0.6, -0.6], [1.4, -0.6, -0.6]].map((p, i) => (
        <Box key={i} args={[0.1, 1.2, 0.1]} position={p}>
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
        </Box>
      ))}

      {/* PC Monitor Base */}
      <Box args={[0.6, 0.05, 0.4]} position={[0, 0.05, -0.3]}>
        <meshPhysicalMaterial color="#1f2326" roughness={0.4} />
      </Box>
      <Box args={[0.08, 0.5, 0.08]} position={[0, 0.3, -0.3]}>
        <meshPhysicalMaterial color="#1f2326" roughness={0.4} />
      </Box>

      {/* PC Monitor Screen */}
      <group position={[0, 0.8, -0.2]} rotation={[-0.05, 0, 0]}>
        <Box args={[2.0, 1.2, 0.1]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="#101214" roughness={0.3} />
        </Box>
        {/* Glowing Screen Face */}
        <mesh ref={screenRef} position={[0, 0, 0.06]}>
          <planeGeometry args={[1.9, 1.1]} />
          <meshStandardMaterial color="#000" emissive={cols.glow} emissiveIntensity={cols.intensity} />
        </mesh>
      </group>

      {/* Keyboard */}
      <Box args={[1.2, 0.04, 0.4]} position={[0, 0.07, 0.4]}>
        <meshPhysicalMaterial color="#1a1c1e" roughness={0.6} />
      </Box>
      {/* Mouse */}
      <Box args={[0.15, 0.06, 0.25]} position={[0.8, 0.08, 0.4]}>
        <meshPhysicalMaterial color="#2a2c2e" roughness={0.5} />
      </Box>

      {/* Chair */}
      <group position={[0, -0.2, 1.1]}>
        <Box args={[1.0, 0.15, 0.9]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color="#111" roughness={0.8} />
        </Box>
        <Box args={[1.0, 1.2, 0.15]} position={[0, 0.6, 0.4]}>
          <meshPhysicalMaterial color="#111" roughness={0.8} />
        </Box>
        <Cylinder args={[0.1, 0.1, 0.6]} position={[0, -0.3, 0]}>
          <meshPhysicalMaterial color="#222" metalness={0.8} roughness={0.2} />
        </Cylinder>
        <Box args={[0.8, 0.05, 0.05]} position={[0, -0.6, 0]}>
          <meshPhysicalMaterial color="#222" metalness={0.8} />
        </Box>
        <Box args={[0.05, 0.05, 0.8]} position={[0, -0.6, 0]}>
          <meshPhysicalMaterial color="#222" metalness={0.8} />
        </Box>
      </group>
    </group>
  )
}

// ─── The Boy Character ───────────────────────────────────────────────────────
function BoyCharacter({ state }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftArm = useRef()
  const rightArm = useRef()

  // Materials
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffcdb2', roughness: 0.6 }), [])
  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ff4d4d', roughness: 0.8 }), [])
  const hairMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3d2314', roughness: 0.9 }), [])
  const pantsMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3366cc', roughness: 0.9 }), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Idle Breathing
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.02
    }

    // Head Animations based on state
    if (headRef.current) {
      if (state === 'thinking') {
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.15
        headRef.current.rotation.x = Math.sin(t * 2) * 0.1
      } else if (state === 'listening') {
        headRef.current.rotation.x = -0.15 // lean in
        headRef.current.rotation.z = Math.sin(t * 3) * 0.05
      } else if (state === 'talking') {
        headRef.current.rotation.x = Math.sin(t * 6) * 0.1
      }
      else {
        // Return to neutral looking at screen
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.1, 0.1)
        headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, 0, 0.1)
      }
    }

    // Typing Animation
    if (state === 'executing') {
      if (leftArm.current) leftArm.current.rotation.x = -1.0 + Math.sin(t * 25) * 0.15
      if (rightArm.current) rightArm.current.rotation.x = -1.0 + Math.sin(t * 25 + Math.PI) * 0.15
    } else {
      // Hands resting on keyboard
      if (leftArm.current) leftArm.current.rotation.x = THREE.MathUtils.lerp(leftArm.current.rotation.x, -1.0, 0.1)
      if (rightArm.current) rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, -1.0, 0.1)
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.1, 0.8]}>
      {/* Head */}
      <group ref={headRef} position={[0, 0.7, 0]}>
        {/* Face */}
        <Sphere args={[0.35, 32, 32]} position={[0, 0, 0]}>
          <primitive object={skinMat} attach="material" />
        </Sphere>
        {/* Hair Blob */}
        <Sphere args={[0.38, 16, 16]} position={[0, 0.15, -0.05]}>
          <primitive object={hairMat} attach="material" />
        </Sphere>
        {/* Messy Hair Tufts */}
        <Sphere args={[0.15, 8, 8]} position={[-0.2, 0.3, 0]}><primitive object={hairMat} attach="material" /></Sphere>
        <Sphere args={[0.18, 8, 8]} position={[0.15, 0.35, 0]}><primitive object={hairMat} attach="material" /></Sphere>
        {/* Eyes */}
        <Sphere args={[0.04, 16, 16]} position={[-0.12, 0.05, 0.32]}>
          <meshBasicMaterial color="#111" />
        </Sphere>
        <Sphere args={[0.04, 16, 16]} position={[0.12, 0.05, 0.32]}>
          <meshBasicMaterial color="#111" />
        </Sphere>
      </group>

      {/* Torso */}
      <Capsule args={[0.3, 0.5, 16, 16]} position={[0, 0.1, 0]}>
        <primitive object={shirtMat} attach="material" />
      </Capsule>

      {/* Arms */}
      <group position={[-0.4, 0.4, 0]}>
        <group ref={leftArm}>
          <Capsule args={[0.08, 0.5, 8, 8]} position={[0, -0.3, 0.1]} rotation={[0.4, 0, 0]}>
            <primitive object={shirtMat} attach="material" />
          </Capsule>
          <Sphere args={[0.1, 16, 16]} position={[0, -0.65, 0.25]}>
            <primitive object={skinMat} attach="material" />
          </Sphere>
        </group>
      </group>
      <group position={[0.4, 0.4, 0]}>
        <group ref={rightArm}>
          <Capsule args={[0.08, 0.5, 8, 8]} position={[0, -0.3, 0.1]} rotation={[0.4, 0, 0]}>
            <primitive object={shirtMat} attach="material" />
          </Capsule>
          <Sphere args={[0.1, 16, 16]} position={[0, -0.65, 0.25]}>
            <primitive object={skinMat} attach="material" />
          </Sphere>
        </group>
      </group>

      {/* Legs (Sitting) */}
      <Capsule args={[0.12, 0.4, 8, 8]} position={[-0.18, -0.4, 0.2]} rotation={[1.57, 0, 0]}>
        <primitive object={pantsMat} attach="material" />
      </Capsule>
      <Capsule args={[0.12, 0.4, 8, 8]} position={[0.18, -0.4, 0.2]} rotation={[1.57, 0, 0]}>
        <primitive object={pantsMat} attach="material" />
      </Capsule>
      {/* Lower Legs */}
      <Capsule args={[0.1, 0.4, 8, 8]} position={[-0.18, -0.8, 0.4]}>
        <primitive object={pantsMat} attach="material" />
      </Capsule>
      <Capsule args={[0.1, 0.4, 8, 8]} position={[0.18, -0.8, 0.4]}>
        <primitive object={pantsMat} attach="material" />
      </Capsule>
      {/* Shoes */}
      <Box args={[0.16, 0.1, 0.25]} position={[-0.18, -1.05, 0.45]}>
        <meshPhysicalMaterial color="#eee" roughness={0.8} />
      </Box>
      <Box args={[0.16, 0.1, 0.25]} position={[0.18, -1.05, 0.45]}>
        <meshPhysicalMaterial color="#eee" roughness={0.8} />
      </Box>
    </group>
  )
}

// ─── Interactive Light Rope ────────────────────────────────────────────────
function CeilingLight({ isLightOn, setIsLightOn }) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const ropeRef = useRef()
  const bulbRef = useRef()

  // Swing animation for the rope and bulb when clicked
  const [swingTime, setSwingTime] = useState(0)

  useEffect(() => {
    setSwingTime(Math.PI / 2) // Reset swing on click
  }, [isLightOn])

  useFrame(({ clock }, delta) => {
    if (swingTime > 0) {
      const decay = Math.max(0, swingTime - delta * 2)
      setSwingTime(decay)
      const angle = Math.sin(clock.elapsedTime * 8) * decay * 0.1
      if (ropeRef.current) ropeRef.current.rotation.z = angle
      if (bulbRef.current) bulbRef.current.position.x = Math.sin(clock.elapsedTime * 8) * decay * 0.1
    }
  })

  return (
    <group position={[1.5, 2.5, 0]}>
      {/* Light fixture base */}
      <Cylinder args={[0.3, 0.3, 0.1, 16]} position={[0, 0, 0]}>
        <meshPhysicalMaterial color="#333" metalness={0.8} />
      </Cylinder>

      {/* Light Bulb */}
      <mesh ref={bulbRef} position={[0, -0.15, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={isLightOn ? "#fff" : "#444"}
          emissive={isLightOn ? "#ffea99" : "#000"}
          emissiveIntensity={isLightOn ? 2 : 0}
        />
      </mesh>

      {/* Main ambient room light - toggled by bulb */}
      <pointLight
        position={[0, -0.5, 0]}
        intensity={isLightOn ? 3 : 0}
        color="#fff5e6"
        distance={8}
        castShadow
      />

      {/* The Interactive Rope */}
      <group
        ref={ropeRef}
        position={[0.2, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation()
          setIsLightOn(!isLightOn)
        }}
      >
        {/* Invisible hit box for easier clicking */}
        <Cylinder args={[0.1, 0.1, 1.5]} position={[0, -0.75, 0]} visible={false} />
        {/* Visible thin string */}
        <Cylinder args={[0.005, 0.005, 1.5]} position={[0, -0.75, 0]}>
          <meshBasicMaterial color="#999" />
        </Cylinder>
        {/* Pull Tab */}
        <Cylinder args={[0.02, 0.02, 0.1]} position={[0, -1.5, 0]}>
          <meshStandardMaterial color={hovered ? "#ff0066" : "#444"} />
        </Cylinder>
      </group>
    </group>
  )
}

// ─── Scene Root ───────────────────────────────────────────────────────────────
function Scene({ state, isLightOn, setIsLightOn }) {
  const cols = getColors(state)
  return (
    <>
      <color attach="background" args={[isLightOn ? '#1a1a24' : '#030306']} />

      {/* Minimal ambient light so darkness isn't pitch black */}
      <ambientLight intensity={isLightOn ? 0.3 : 0.02} />

      <CeilingLight isLightOn={isLightOn} setIsLightOn={setIsLightOn} />

      {/* PC Screen light illuminates the boy's face in the dark */}
      <spotLight
        position={[0, -0.2, -0.1]}
        target-position={[0, -0.2, 1]}
        intensity={isLightOn ? cols.intensity * 0.5 : cols.intensity * 4}
        color={cols.glow}
        distance={4}
        angle={Math.PI / 3}
        penumbra={0.5}
        castShadow
      />

      <Workspace state={state} />
      <BoyCharacter state={state} />

      {/* Ground Shadows */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={isLightOn ? 0.6 : 0.2}
        scale={8}
        blur={2}
        far={1.5}
        color="#000000"
      />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function AuraRobot() {
  const robotState = useStore((state) => state.robotState)
  // Manage local light state
  const [isLightOn, setIsLightOn] = useState(true)

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [2.5, 0.5, 3.5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ReinhardToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <Scene state={robotState} isLightOn={isLightOn} setIsLightOn={setIsLightOn} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.0}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
