import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { checkLanding, FUEL_CONSUMPTION_RATE, updatePhysics } from '../utils/physics'

export const useGamePhysics = () => {
    const gameStatus = useGameStore(state => state.gameStatus)
    const lastUpdateTime = useRef<number>(performance.now())
    const frameId = useRef<number | undefined>(undefined)
    const isActive = useRef<boolean>(false)

    useEffect(() => {
        if (gameStatus !== 'playing') {
            isActive.current = false
            if (frameId.current !== undefined) {
                cancelAnimationFrame(frameId.current)
            }
            return
        }

        isActive.current = true
        lastUpdateTime.current = performance.now()

        const updateGame = () => {
            if (!isActive.current) return

            const currentTime = performance.now()
            const deltaTime = (currentTime - lastUpdateTime.current) / 1000 // Convert to seconds
            lastUpdateTime.current = currentTime

            // Get current state once
            const store = useGameStore.getState()

            // Skip update if we're out of fuel and not moving
            if (store.fuel <= 0 && store.velocity.x === 0 && store.velocity.y === 0) {
                frameId.current = requestAnimationFrame(updateGame)
                return
            }

            // Calculate new state
            const { altitude: newAltitude, velocity: newVelocity } = updatePhysics(
                store.altitude,
                store.velocity,
                store.rotation,
                store.thrust && store.fuel > 0,
                deltaTime
            )

            // Batch all state updates together
            useGameStore.setState(() => {
                // First check landing
                if (newAltitude === 0) {
                    const landingResult = checkLanding(newAltitude, newVelocity, store.rotation)
                    if (landingResult.landed) {
                        isActive.current = false
                        return {
                            gameStatus: 'end',
                            score: landingResult.score ?? 0,
                            altitude: newAltitude,
                            velocity: newVelocity
                        }
                    }
                }

                // Update fuel if thrusting (FUEL_CONSUMPTION_RATE is already in percent per second)
                const newFuel = store.thrust && store.fuel > 0
                    ? Math.max(0, store.fuel - FUEL_CONSUMPTION_RATE * deltaTime)
                    : store.fuel

                // Return all updates in one batch
                return {
                    altitude: newAltitude,
                    velocity: newVelocity,
                    fuel: newFuel
                }
            })

            frameId.current = requestAnimationFrame(updateGame)
        }

        frameId.current = requestAnimationFrame(updateGame)

        return () => {
            isActive.current = false
            if (frameId.current !== undefined) {
                cancelAnimationFrame(frameId.current)
            }
        }
    }, [gameStatus])
}
