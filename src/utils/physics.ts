export const GRAVITY = -1.62 // Moon's gravity in m/s²
export const THRUST_FORCE = 3.0 // Thrust force in m/s²
export const ROTATION_SPEED = 3.0 // Degrees per frame when rotating
export const FUEL_CONSUMPTION_RATE = 0.5 // Percentage per second while thrusting
export const TERMINAL_VELOCITY = 20 // Maximum velocity in m/s
export const SAFE_LANDING_VELOCITY = 2 // Maximum safe landing velocity in m/s

export interface PhysicsUpdate {
    altitude: number
    velocity: {
        x: number
        y: number
    }
}

export interface LandingResult {
    landed: boolean
    success?: boolean
    score?: number
}

export const updatePhysics = (
    altitude: number,
    velocity: { x: number; y: number },
    rotation: number,
    thrust: boolean,
    deltaTime: number
) => {
    // Convert rotation to radians
    const rotationRad = (rotation * Math.PI) / 180

    // Calculate thrust vector (invert x to match left/right direction)
    const thrustVector = thrust
        ? {
            x: -Math.sin(rotationRad) * THRUST_FORCE, // negate for correct horizontal direction
            y: Math.cos(rotationRad) * THRUST_FORCE,
        }
        : { x: 0, y: 0 }

    // Update velocity with gravity and thrust
    const newVelocity = {
        x: velocity.x + thrustVector.x * deltaTime,
        y: velocity.y + (thrustVector.y + GRAVITY) * deltaTime,
    }

    // Apply terminal velocity
    newVelocity.x = Math.max(Math.min(newVelocity.x, TERMINAL_VELOCITY), -TERMINAL_VELOCITY)
    newVelocity.y = Math.max(Math.min(newVelocity.y, TERMINAL_VELOCITY), -TERMINAL_VELOCITY)

    // Update position
    const newAltitude = Math.max(0, altitude + newVelocity.y * deltaTime)

    return {
        altitude: newAltitude,
        velocity: newVelocity,
    }
}

export const checkLanding = (
    altitude: number,
    velocity: { x: number; y: number },
    rotation: number
) => {
    if (altitude > 0) return { landed: false }

    const verticalVelocity = Math.abs(velocity.y)
    const horizontalVelocity = Math.abs(velocity.x)
    const rotationDegrees = Math.abs(rotation)

    const isSafeLanding =
        verticalVelocity <= SAFE_LANDING_VELOCITY &&
        horizontalVelocity <= SAFE_LANDING_VELOCITY &&
        rotationDegrees <= 15

    return {
        landed: true,
        success: isSafeLanding,
        score: calculateScore(verticalVelocity, horizontalVelocity, rotationDegrees),
    }
}

const calculateScore = (
    verticalVelocity: number,
    horizontalVelocity: number,
    rotation: number
) => {
    if (verticalVelocity > SAFE_LANDING_VELOCITY ||
        horizontalVelocity > SAFE_LANDING_VELOCITY ||
        rotation > 15) {
        return 0
    }

    const maxScore = 1000
    const velocityScore = Math.max(0, 1 - (verticalVelocity + horizontalVelocity) / (SAFE_LANDING_VELOCITY * 2))
    const rotationScore = Math.max(0, 1 - rotation / 15)

    return Math.round(maxScore * velocityScore * rotationScore)
}
