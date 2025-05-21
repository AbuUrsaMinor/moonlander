import { create } from 'zustand'

export interface GameState {
    gameStatus: 'start' | 'playing' | 'paused' | 'end'
    score: number
    fuel: number
    altitude: number
    velocity: {
        x: number
        y: number
    }
    rotation: number
    thrust: boolean
    controlScheme: 'tilt' | 'touch' | 'keyboard'
    tiltSensitivity: number

    // Actions
    setGameStatus: (status: GameState['gameStatus']) => void
    setScore: (score: number) => void
    setFuel: (fuel: number) => void
    setAltitude: (altitude: number) => void
    setVelocity: (velocity: { x: number; y: number }) => void
    setRotation: (rotation: number) => void
    setThrust: (thrust: boolean) => void
    setControlScheme: (scheme: GameState['controlScheme']) => void
    setTiltSensitivity: (sensitivity: number) => void
    resetGame: () => void
}

const initialState = {
    gameStatus: 'start',
    score: 0,
    fuel: 100,
    altitude: 100,
    velocity: { x: 0, y: 0 },
    rotation: 0,
    thrust: false,
    controlScheme: 'keyboard',
    tiltSensitivity: 1,
} as const

const createGameStore = create<GameState>((set) => ({
    ...initialState,

    setGameStatus: (status) => set({ gameStatus: status }),
    setScore: (score) => set({ score }),
    setFuel: (fuel) => set({ fuel }),
    setAltitude: (altitude) => set({ altitude }),
    setVelocity: (velocity) => set({ velocity }),
    setRotation: (rotation) => set({ rotation }),
    setThrust: (thrust) => set({ thrust }),
    setControlScheme: (scheme) => set({ controlScheme: scheme }),
    setTiltSensitivity: (sensitivity) => set({ tiltSensitivity: sensitivity }),
    resetGame: () => set(initialState),
}))

export const useGameStore = createGameStore
