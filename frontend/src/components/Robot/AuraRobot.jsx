import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Ring } from '@react-three/drei'
import { useStore } from '../../store/useStore'

function HolographicAura({ state }) {
  const ringRef = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const time = clock.elapsedTime
      
      // Rotating holographic rings
      ringRef.current.rotation.z = time * 0.5
      ring2Ref.current.rotation.z = -time * 0.3
      ring3Ref.current.rotation.z = time * 0.7
      
      // Pulse based on state
      const pulse = state === 'listening' ? 1 + Math.sin(time * 4) * 0.2 :
                    state === 'thinking' ? 1 + Math.sin(time * 2) * 0.15 :
                    state === 'talking' ? 1 + Math.sin(time * 5) * 0.1 :
                    state === 'executing' ? 1 + Math.sin(time * 3) * 0.25 : 1
      
      ringRef.current.scale.setScalar(pulse)
      ring2Ref.current.scale.setScalar(pulse * 0.8)
      ring3Ref.current.scale.setScalar(pulse * 0.6)
    }
  })
  
  const auraColor = state === 'listening' ? '#00ff88' :
                    state === 'thinking' ? '#ff00aa' :
                    state === 'talking' ? '#00f5ff' :
                    state === 'executing' ? '#ffff00' : '#00f5ff'
  
  return (
    <group>
      {/* Holographic rings */}
      <Ring ref={ringRef} args={[1.5, 1.6, 32]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={0.8} transparent opacity={0.3} />
      </Ring>
      <Ring ref={ring2Ref} args={[1.2, 1.3, 32]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={0.6} transparent opacity={0.2} />
      </Ring>
      <Ring ref={ring3Ref} args={[1.8, 1.9, 32]} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={0.4} transparent opacity={0.15} />
      </Ring>
    </group>
  )
}

function DeskSetup({ state, screenState }) {
  const deskRef = useRef()
  const monitorRef = useRef()
  const keyboardRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const active =
      screenState === 'coding' ||
      state === 'thinking' ||
      state === 'executing' ||
      state === 'talking'

    if (monitorRef.current) {
      const intensity = active ? 1.2 + Math.sin(time * 4) * 0.3 : 0.4
      monitorRef.current.material.emissiveIntensity = intensity
    }

    if (keyboardRef.current && active) {
      keyboardRef.current.position.y = -0.55 + Math.sin(time * 12) * 0.01
    }

    if (deskRef.current) {
      deskRef.current.rotation.z = Math.sin(time * 0.1) * 0.01
    }
  })

  const screenColor = '#00f5ff'

  return (
    <group position={[0, -0.6, 0]}>
      {/* Desk surface */}
      <Box ref={deskRef} args={[3, 0.08, 1.2]} position={[0, -0.1, 0.2]}>
        <meshStandardMaterial
          color="#020617"
          metalness={0.4}
          roughness={0.4}
        />
      </Box>

      {/* Desk legs */}
      <Box args={[0.08, 0.8, 0.08]} position={[-1.3, -0.6, 0.6]}>
        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.3} />
      </Box>
      <Box args={[0.08, 0.8, 0.08]} position={[1.3, -0.6, 0.6]}>
        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.3} />
      </Box>

      {/* Monitor stand */}
      <Box args={[0.08, 0.4, 0.08]} position={[0, 0.1, -0.2]}>
        <meshStandardMaterial color="#020617" metalness={0.7} roughness={0.2} />
      </Box>

      {/* Monitor */}
      <mesh ref={monitorRef} position={[0, 0.6, -0.2]}>
        <boxGeometry args={[1.8, 1.1, 0.1]} />
        <meshStandardMaterial
          color="#020617"
          emissive={screenColor}
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Keyboard */}
      <mesh ref={keyboardRef} position={[0, -0.5, 0.6]}>
        <boxGeometry args={[1.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#020617" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Chair base */}
      <mesh position={[0, -0.7, 0.6]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 16]} />
        <meshStandardMaterial color="#020617" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function RobotBody({ state, screenState }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const bodyRef = useRef()
  const chestPanelRef = useRef()
  const antennaRef = useRef()
  
  // Animation based on state
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const time = clock.elapsedTime
      
      // Idle animation - breathing effect + subtle blink
      if (state === 'idle') {
        groupRef.current.position.y = Math.sin(time * 0.8) * 0.08
        groupRef.current.rotation.y = Math.sin(time * 0.4) * 0.05
        // Breathing chest
        if (bodyRef.current) {
          bodyRef.current.scale.y = 1 + Math.sin(time * 1.2) * 0.02
        }
        // Simple blink effect
        const blink = Math.abs(Math.sin(time * 2.5))
        const eyeScaleY = 0.4 + blink * 0.6
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = eyeScaleY
          rightEyeRef.current.scale.y = eyeScaleY
        }
      }
      
      // Listening animation - active pulsing
      if (state === 'listening') {
        const pulse = Math.sin(time * 4) * 0.08
        headRef.current?.scale.setScalar(1 + pulse * 0.3)
        leftEyeRef.current?.scale.setScalar(1 + pulse * 3)
        rightEyeRef.current?.scale.setScalar(1 + pulse * 3)
        groupRef.current.position.y = Math.sin(time * 2) * 0.05
      }
      
      // Thinking animation - head tilt and rotation
      if (state === 'thinking') {
        headRef.current.rotation.x = Math.sin(time * 1.5) * 0.15
        headRef.current.rotation.z = Math.sin(time * 2) * 0.1
        if (chestPanelRef.current) {
          chestPanelRef.current.rotation.z = Math.sin(time * 3) * 0.05
        }
      }
      
      // Talking animation - nodding and mouth sync
      if (state === 'talking') {
        headRef.current.rotation.x = Math.sin(time * 5) * 0.2
        headRef.current.position.y = Math.sin(time * 6) * 0.03
        // Mouth animation simulation
        if (chestPanelRef.current) {
          chestPanelRef.current.scale.y = 1 + Math.sin(time * 8) * 0.1
        }
      }
      
      // Executing animation - quick movements + typing arms
      if (state === 'executing') {
        groupRef.current.rotation.y = Math.sin(time * 6) * 0.1
        if (chestPanelRef.current) {
          chestPanelRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.15)
        }
      }
      
      // Antenna pulse
      if (antennaRef.current) {
        antennaRef.current.scale.y = 1 + Math.sin(time * 2) * 0.1
      }
    }
  })
  
  const eyeColor = state === 'listening' ? '#00ff88' :
                  state === 'thinking' ? '#ff00aa' :
                  state === 'talking' ? '#00f5ff' :
                  state === 'executing' ? '#ffff00' : '#00f5ff'
  
  const eyeIntensity = state === 'listening' ? 3 :
                       state === 'thinking' ? 2.5 :
                       state === 'talking' ? 4 :
                       state === 'executing' ? 3.5 : 2
  
  return (
    <group ref={groupRef} position={[0, -0.1, 0.2]}>
      {/* Holographic Aura */}
      <HolographicAura state={state} />

      {/* Desk / workspace */}
      <DeskSetup state={state} screenState={screenState} />
      
      {/* Head */}
      <group ref={headRef}>
        <Box args={[0.8, 0.8, 0.8]} position={[0, 1.2, 0]}>
          <meshStandardMaterial 
            color="#1a1a24" 
            metalness={0.9} 
            roughness={0.1}
            emissive="#0a0a0f"
            emissiveIntensity={0.2}
          />
        </Box>
        
        {/* Eyes - More prominent */}
        <Sphere ref={leftEyeRef} args={[0.18, 16, 16]} position={[-0.25, 1.3, 0.5]}>
          <meshStandardMaterial 
            color={eyeColor} 
            emissive={eyeColor} 
            emissiveIntensity={eyeIntensity}
          />
        </Sphere>
        <Sphere ref={rightEyeRef} args={[0.18, 16, 16]} position={[0.25, 1.3, 0.5]}>
          <meshStandardMaterial 
            color={eyeColor} 
            emissive={eyeColor} 
            emissiveIntensity={eyeIntensity}
          />
        </Sphere>
        
        {/* Antenna with glow */}
        <group ref={antennaRef}>
          <Box args={[0.05, 0.3, 0.05]} position={[0, 1.7, 0]}>
            <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1.5} />
          </Box>
          <Sphere args={[0.1, 16, 16]} position={[0, 1.85, 0]}>
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={4} />
          </Sphere>
        </group>
      </group>
      
      {/* Body - Sleek metallic */}
      <Box ref={bodyRef} args={[1, 1.2, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#12121a" 
          metalness={0.85} 
          roughness={0.15}
          emissive="#0a0a0f"
          emissiveIntensity={0.1}
        />
      </Box>
      
      {/* Chest Panel - Interactive display */}
      <Box ref={chestPanelRef} args={[0.6, 0.4, 0.1]} position={[0, 0.2, 0.35]}>
        <meshStandardMaterial 
          color="#0a0a0f" 
          emissive={eyeColor} 
          emissiveIntensity={state !== 'idle' ? 1.2 : 0.5}
        />
      </Box>
      
      {/* Arms - More detailed */}
      <Box args={[0.2, 0.8, 0.2]} position={[-0.7, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.85} roughness={0.15} />
      </Box>
      <Box args={[0.2, 0.8, 0.2]} position={[0.7, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.85} roughness={0.15} />
      </Box>
      
      {/* Legs */}
      <Box args={[0.25, 0.6, 0.25]} position={[-0.3, -0.7, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.85} roughness={0.15} />
      </Box>
      <Box args={[0.25, 0.6, 0.25]} position={[0.3, -0.7, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.85} roughness={0.15} />
      </Box>
    </group>
  )
}

// Helper component for Box
function Box({ args, position, children, ...props }) {
  return (
    <mesh position={position} {...props}>
      <boxGeometry args={args} />
      {children}
    </mesh>
  )
}

// Helper component for Sphere
function Sphere({ args, position, children, ...props }) {
  return (
    <mesh position={position} {...props}>
      <sphereGeometry args={args} />
      {children}
    </mesh>
  )
}

export default function AuraRobot() {
  const robotState = useStore((state) => state.robotState)
  
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="bg-transparent"
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ff00aa" />
        <pointLight position={[0, 3, 3]} intensity={0.5} color="#00f5ff" />
        <directionalLight position={[0, 5, 0]} intensity={0.4} />
        
        <RobotBody state={robotState} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
