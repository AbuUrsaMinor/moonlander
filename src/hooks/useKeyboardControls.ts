import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { ROTATION_SPEED } from '../utils/physics'

export const useKeyboardControls = () => {
    const { setRotation, setThrust, controlScheme } = useGameStore()
    const rotationRef = useRef(0)
    const keysPressed = useRef(new Set<string>())

    useEffect(() => {
        if (controlScheme !== 'keyboard') return

        const updateRotation = () => {
            if (keysPressed.current.has('ArrowLeft')) {
                rotationRef.current = Math.max(rotationRef.current - ROTATION_SPEED, -90)
                setRotation(rotationRef.current)
            }
            if (keysPressed.current.has('ArrowRight')) {
                rotationRef.current = Math.min(rotationRef.current + ROTATION_SPEED, 90)
                setRotation(rotationRef.current)
            }
            if (!keysPressed.current.has('ArrowLeft') && !keysPressed.current.has('ArrowRight')) {
                // Gradually return to center
                if (Math.abs(rotationRef.current) < ROTATION_SPEED) {
                    rotationRef.current = 0
                } else {
                    rotationRef.current += rotationRef.current > 0 ? -ROTATION_SPEED : ROTATION_SPEED
                }
                setRotation(rotationRef.current)
            }
            frameRef.current = requestAnimationFrame(updateRotation)
        }

        const frameRef = { current: requestAnimationFrame(updateRotation) }

        const handleKeyDown = (event: KeyboardEvent) => {
            keysPressed.current.add(event.code)
            if (event.code === 'ArrowUp' || event.code === 'Space') {
                setThrust(true)
            }
        }

        const handleKeyUp = (event: KeyboardEvent) => {
            keysPressed.current.delete(event.code)
            if (event.code === 'ArrowUp' || event.code === 'Space') {
                setThrust(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            cancelAnimationFrame(frameRef.current)
        }
    }, [controlScheme, setRotation, setThrust])
}
