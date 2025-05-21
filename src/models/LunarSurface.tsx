import { type FC, useMemo } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export const LunarSurface: FC = () => {
    const altitude = useGameStore(state => state.altitude)

    // Generate rocky terrain
    const terrain = useMemo(() => {
        const geometry = new THREE.PlaneGeometry(200, 200, 100, 100)
        const positions = geometry.attributes.position.array

        // Create landing zones (flat areas)
        const landingZones = [
            { x: 0, z: 0, radius: 10 }, // Center landing zone
            { x: -50, z: -30, radius: 8 }, // Left landing zone
            { x: 40, z: 20, radius: 8 }, // Right landing zone
        ]

        // Generate rocky terrain with perlin noise
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i]
            const z = positions[i + 2]

            // Check if point is in landing zone
            const inLandingZone = landingZones.some(zone => {
                const dx = x - zone.x
                const dz = z - zone.z
                return Math.sqrt(dx * dx + dz * dz) < zone.radius
            })

            if (!inLandingZone) {
                // Create rocky terrain using multiple frequencies of noise
                const height =
                    Math.sin(x * 0.2) * Math.cos(z * 0.2) * 2 +
                    Math.sin(x * 0.5) * Math.cos(z * 0.5) +
                    Math.sin(x * 1.0) * Math.cos(z * 1.0) * 0.5

                positions[i + 1] = height
            }
        }

        geometry.computeVertexNormals()
        return geometry
    }, [])

    return (
        <group position={[0, -altitude, 0]}>            {/* Rocky terrain */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={terrain}>
                <meshStandardMaterial
                    color="#666666"
                    roughness={1}
                    metalness={0.1}
                    emissive="#222222"
                />
            </mesh>

            {/* Grid for depth perception */}
            <gridHelper args={[200, 20, '#888888', '#444444']} />

            {/* Landing zone indicators */}
            {[
                { position: [0, 0.1, 0], size: 10 },
                { position: [-50, 0.1, -30], size: 8 },
                { position: [40, 0.1, 20], size: 8 },
            ].map((zone, index) => (
                <mesh
                    key={index}
                    position={[zone.position[0], zone.position[1], zone.position[2]]}
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[zone.size - 0.5, zone.size, 32]} />
                    <meshBasicMaterial color="#44ff44" opacity={0.5} transparent />
                </mesh>
            ))}
        </group>
    )
}
