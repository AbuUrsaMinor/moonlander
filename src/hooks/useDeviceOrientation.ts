import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

// Extend the DeviceOrientationEvent interface to include requestPermission
interface DeviceOrientationEvtWithPermission extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied' | 'prompt'>
}

interface DeviceOrientationEvtWithPermissionStatic extends Omit<typeof DeviceOrientationEvent, 'new'> {
    requestPermission?: () => Promise<'granted' | 'denied' | 'prompt'>
}

export interface UseDeviceOrientationResult {
    isAvailable: boolean
    hasPermission: boolean
    orientation: { beta: number; gamma: number }
    requestPermission: () => Promise<boolean>
}

export const useDeviceOrientation = (): UseDeviceOrientationResult => {
    const [isAvailable, setIsAvailable] = useState(false)
    const [hasPermission, setHasPermission] = useState(false)
    const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
    const { controlScheme, tiltSensitivity, setRotation } = useGameStore()

    const requestPermission = async () => {
        const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as DeviceOrientationEvtWithPermissionStatic

        if (typeof DeviceOrientationEventWithPermission.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEventWithPermission.requestPermission()
                const granted = permission === 'granted'
                setHasPermission(granted)
                return granted
            } catch (err) {
                console.error('Error requesting device orientation permission:', err)
                return false
            }
        }

        // For devices that don't require permission
        setHasPermission(true)
        return true
    }

    useEffect(() => {
        // Check if device orientation is available and set initial permission state
        const isOrientationAvailable = 'DeviceOrientationEvent' in window
        setIsAvailable(isOrientationAvailable)

        // Set initial permission state
        if (isOrientationAvailable) {
            const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as DeviceOrientationEvtWithPermissionStatic
            setHasPermission(typeof DeviceOrientationEventWithPermission.requestPermission !== 'function')
        }
    }, [])

    useEffect(() => {
        if (!isAvailable || !hasPermission || controlScheme !== 'tilt') return

        const handleOrientation = (event: DeviceOrientationEvtWithPermission) => {
            // Ensure values are numbers and within expected ranges
            const gamma = Math.max(-90, Math.min(90, event.gamma || 0)) // Left/Right tilt
            const beta = Math.max(-90, Math.min(90, event.beta || 0)) // Forward/Backward tilt

            setOrientation({ beta, gamma })

            // Convert gamma (-90 to 90 degrees) to rotation (-180 to 180 degrees)
            // Apply sensitivity with bounds checking
            const rotation = Math.max(-180, Math.min(180, gamma * tiltSensitivity * 2))
            setRotation(rotation)
        }

        window.addEventListener('deviceorientation', handleOrientation as EventListener)
        return () => window.removeEventListener('deviceorientation', handleOrientation as EventListener)
    }, [isAvailable, hasPermission, controlScheme, tiltSensitivity, setRotation])

    return {
        isAvailable,
        hasPermission,
        orientation,
        requestPermission,
    }
}
