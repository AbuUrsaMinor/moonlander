import alea from 'alea'
import { type FC, useMemo } from 'react'
import { createNoise2D } from 'simplex-noise'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export const LunarSurface: FC = () => {
    const altitude = useGameStore(state => state.altitude)

    // Generate rocky terrain with fractal noise
    const terrain = useMemo(() => {
        // Higher resolution geometry for more detailed terrain
        const geometry = new THREE.PlaneGeometry(200, 200, 150, 150) // Increased segments from 100x100 to 150x150
        const positions = geometry.attributes.position.array as Float32Array

        // Create seeded random number generator
        const prng = alea('moonlander')
        // Create noise generator with seed
        const noise2D = createNoise2D(prng)

        // Create landing zones (flat areas)
        const landingZones = [
            { x: 0, z: 0, radius: 10 }, // Center landing zone
            { x: -50, z: -30, radius: 8 }, // Left landing zone
            { x: 40, z: 20, radius: 8 }, // Right landing zone
        ]

        // Generate rocky terrain with fractal (simplex) noise
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
                // Fractal noise: sum of multiple octaves for rocky effect
                let height = 0
                let amplitude = 35  // Increased for more visibility
                let frequency = 0.03 // Lower frequency for larger features
                for (let o = 0; o < 5; o++) {
                    height += noise2D(x * frequency, z * frequency) * amplitude
                    amplitude *= 0.65
                    frequency *= 2
                }
                // Add more dramatic sharpness
                height += Math.abs(noise2D(x * 0.8, z * 0.8)) * 15
                positions[i + 1] = height  // Y is height/altitude in THREE.js
                // Don't modify the z coordinate - it's the depth
            } else {
                positions[i + 1] = -0.5
                // Don't modify the z coordinate
            }
        }

        // Mark position attribute as needing update
        geometry.attributes.position.needsUpdate = true

        // Log some position values to verify
        console.log('Position values:',
            positions[0], positions[1], positions[2],  // First vertex
            positions[3], positions[4], positions[5]   // Second vertex
        )

        // Recompute normals and mark them for update
        geometry.computeVertexNormals()
        geometry.attributes.normal.needsUpdate = true

        // Update bounding sphere and box
        geometry.computeBoundingSphere()
        geometry.computeBoundingBox()

        return geometry
    }, [])

    const landingZones = [
        { position: [0, 0.1, 0], size: 10 },
        { position: [-50, 0.1, -30], size: 8 },
        { position: [40, 0.1, 20], size: 8 }
    ]

    return (
        <group position={[0, -altitude, 0]}>
            {/* Main terrain with 3D extrusions */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow geometry={terrain}>
                <meshStandardMaterial
                    color="#888888"
                    roughness={0.9}
                    metalness={0.1}
                    side={2} // THREE.DoubleSide = 2
                    flatShading={true}
                />
            </mesh>

            {/* Edge highlight wireframe */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={terrain} position={[0, 0.1, 0]}>
                <meshBasicMaterial
                    color="#ff5533"
                    wireframe={true}
                    wireframeLinewidth={1}
                />
            </mesh>

            {/* Add another wireframe layer with different color for depth perception */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={terrain} position={[0, 0.3, 0]}>
                <meshBasicMaterial
                    color="#ffff00"
                    wireframe={true}
                    opacity={0.3}
                    transparent={true}
                />
            </mesh>

            {/* Landing zone indicators */}
            {landingZones.map((zone, index) => (
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
