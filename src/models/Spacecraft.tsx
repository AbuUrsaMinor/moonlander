import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useGameStore } from '../store/gameStore'

import type { FC } from 'react'

export const Spacecraft: FC = () => {
    const meshRef = useRef<Group>(null)
    const positionRef = useRef({ x: 0, z: 0 })
    const { rotation, thrust, velocity, altitude } = useGameStore()

    useFrame((_, delta) => {
        if (meshRef.current) {
            // Update rotation
            meshRef.current.rotation.z = (rotation * Math.PI) / 180

            // Update position based on velocity
            positionRef.current.x += velocity.x * delta
            meshRef.current.position.x = positionRef.current.x
            meshRef.current.position.y = altitude // Set Y position based on altitude
            meshRef.current.position.z = positionRef.current.z
        }
    })

    return (<group ref={meshRef}>            {/* Spacecraft body */}
        <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.8, 1.6, 16]} />
            <meshStandardMaterial color="#dddddd" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Landing legs */}
        <group position={[0, -0.7, 0]}>
            {[-1, 1].map((x) => (
                <mesh key={x} position={[x * 0.7, 0, 0]} castShadow>
                    <boxGeometry args={[0.1, 1.0, 0.1]} />
                    <meshStandardMaterial color="#aaaaaa" metalness={0.6} roughness={0.4} />
                </mesh>
            ))}
        </group>        {/* Thrust particles */}
        {thrust && (
            <>
                {/* Main thrust cone */}
                <mesh position={[0, -1.2, 0]}>
                    <coneGeometry args={[0.4, 1.0, 16]} />
                    <meshStandardMaterial color="#ff5500" emissive="#ff5500" emissiveIntensity={3} transparent opacity={0.7} />
                </mesh>

                {/* Inner brighter cone */}
                <mesh position={[0, -1.1, 0]}>
                    <coneGeometry args={[0.2, 0.7, 12]} />
                    <meshStandardMaterial color="#ffdd00" emissive="#ffdd00" emissiveIntensity={4} transparent opacity={0.8} />
                </mesh>

                {/* Enhanced light effect */}
                <pointLight position={[0, -1.2, 0]} color="#ff6600" intensity={5} distance={6} />
            </>
        )}
    </group>
    )
}
