import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'

function RobotBody({ state }) {
  const groupRef = useRef()
  const headRef = useRef()
  const leftEyeRef = useRef()
  const rightEyeRef = useRef()
  const bodyRef = useRef()
  
  // Animation based on state
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Idle animation - gentle floating
      if (state === 'idle') {
        groupRef.current.position.y = Math.sin(clock.elapsedTime) * 0.1
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
      }
      
      // Listening animation - pulsing
      if (state === 'listening') {
        const pulse = Math.sin(clock.elapsedTime * 3) * 0.05
        headRef.current?.scale.setScalar(1 + pulse)
        leftEyeRef.current?.scale.setScalar(1 + pulse * 2)
        rightEyeRef.current?.scale.setScalar(1 + pulse * 2)
      }
      
      // Talking animation - nodding
      if (state === 'talking') {
        headRef.current.rotation.x = Math.sin(clock.elapsedTime * 4) * 0.2
      }
    }
  })
  
  const eyeColor = state === 'listening' ? '#00ff88' : state === 'talking' ? '#00f5ff' : '#00f5ff'
  
  return (
    <group ref={groupRef}>
      {/* Head */}
      <group ref={headRef}>
        <Box args={[0.8, 0.8, 0.8]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Eyes */}
        <Sphere ref={leftEyeRef} args={[0.15, 16, 16]} position={[-0.25, 1.3, 0.5]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
        </Sphere>
        <Sphere ref={rightEyeRef} args={[0.15, 16, 16]} position={[0.25, 1.3, 0.5]}>
          <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
        </Sphere>
        
        {/* Antenna */}
        <Box args={[0.05, 0.3, 0.05]} position={[0, 1.7, 0]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={1} />
        </Box>
        <Sphere args={[0.08, 16, 16]} position={[0, 1.85, 0]}>
          <meshStandardMaterial color="#00f5ff" emissive="#00f5ff" emissiveIntensity={3} />
        </Sphere>
      </group>
      
      {/* Body */}
      <Box ref={bodyRef} args={[1, 1.2, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#12121a" metalness={0.7} roughness={0.3} />
      </Box>
      
      {/* Chest Panel */}
      <Box args={[0.6, 0.4, 0.1]} position={[0, 0.2, 0.35]}>
        <meshStandardMaterial color="#0a0a0f" emissive="#00f5ff" emissiveIntensity={0.5} />
      </Box>
      
      {/* Arms */}
      <Box args={[0.2, 0.8, 0.2]} position={[-0.7, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.2, 0.8, 0.2]} position={[0.7, 0.2, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
      </Box>
      
      {/* Legs */}
      <Box args={[0.25, 0.6, 0.25]} position={[-0.3, -0.7, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.25, 0.6, 0.25]} position={[0.3, -0.7, 0]}>
        <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  )
}

export default function AuraRobot() {
  const robotState = useStore((state) => state.robotState)
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        gl={{ antialias: true }}
        className="bg-transparent"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#00f5ff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff00aa" />
        <directionalLight position={[0, 5, 0]} intensity={0.3} />
        
        <RobotBody state={robotState} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={false}
        />
      </Canvas>
    </div>
  )
}
