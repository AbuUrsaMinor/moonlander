import { OrthographicCamera, Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { type FC, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { TouchControls } from '../components/TouchControls'
import { useDeviceOrientation } from '../hooks/useDeviceOrientation'
import { useGamePhysics } from '../hooks/useGamePhysics'
import { useKeyboardControls } from '../hooks/useKeyboardControls'
import { LunarSurface } from '../models/LunarSurface'
import { Spacecraft } from '../models/Spacecraft'
import { useGameStore } from '../store/gameStore'

export const GameScene: FC = () => {
    const {
        gameStatus,
        setControlScheme,
        setGameStatus,
        altitude,
        fuel,
        velocity,
        score,
        resetGame
    } = useGameStore()
    const { isAvailable, hasPermission, requestPermission } = useDeviceOrientation()
    const [permissionError, setPermissionError] = useState<string | null>(null)

    // Initialize physics engine
    useGamePhysics()

    // Initialize keyboard controls
    useKeyboardControls()

    // Request device orientation permission on mobile when game starts
    const handleStartGame = async () => {
        try {
            if (isMobile && isAvailable && !hasPermission) {
                setPermissionError(null)
                const granted = await requestPermission()
                if (granted) {
                    setControlScheme('tilt')
                } else {
                    setPermissionError('Permission denied. Using touch controls.')
                    setControlScheme('touch')
                }
            } else if (!isMobile) {
                setControlScheme('keyboard')
            }
            setGameStatus('playing')
        } catch (error) {
            console.error('Error starting game:', error)
            setPermissionError('Failed to setup controls. Using touch controls.')
            setControlScheme('touch')
            setGameStatus('playing')
        }
    }

    return (
        <div className="w-full h-full relative">            <Canvas className="touch-none" shadows>                <OrthographicCamera makeDefault position={[0, 50, 70]} zoom={8} rotation={[-0.6, 0, 0]} />
            <color attach="background" args={['#000000']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 5, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <hemisphereLight
                args={['#ffffff', '#333333', 0.5]}
                position={[0, 50, 0]}
            />

            {/* Scene */}
            <Spacecraft />            {/* Lunar Surface */}
            <LunarSurface />

            {/* Environment */}
            <fog attach="fog" args={['#000000', 50, 150]} />
        </Canvas>

            {/* UI Overlays */}
            {gameStatus === 'start' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
                    <h1 className="text-4xl font-bold mb-8">Moonlander</h1>
                    <button
                        className="px-8 py-4 bg-blue-600 rounded-lg text-xl hover:bg-blue-700 active:bg-blue-800"
                        onClick={handleStartGame}
                    >
                        Start Game
                    </button>
                    {isMobile && isAvailable && (
                        <p className="mt-4 text-sm text-gray-300">
                            Tilt your device to control the spacecraft!
                        </p>
                    )}
                    {permissionError && (
                        <p className="mt-2 text-sm text-yellow-400">
                            {permissionError}
                        </p>
                    )}
                </div>
            )}

            {gameStatus === 'playing' && (
                <>                    <div className="absolute top-4 left-4 text-white text-lg font-bold bg-black bg-opacity-50 p-4 rounded-lg backdrop-blur-sm">
                    <p className="mb-2">Altitude: <span className="text-blue-400">{Math.round(altitude)}m</span></p>
                    <p className="mb-2">Fuel: <span className={`${fuel < 20 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(fuel)}%</span></p>
                    <p>Velocity: <span className={`${Math.abs(velocity.y) > 2 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(velocity.y)}m/s</span></p>
                </div>

                    <TouchControls />
                </>
            )}

            {gameStatus === 'end' && (<div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
                <div className="p-8 bg-black bg-opacity-75 rounded-lg backdrop-blur-sm flex flex-col items-center">
                    <h2 className="text-3xl font-bold mb-4">
                        {score > 0 ? 'Successful Landing!' : 'Crash!'}
                    </h2>
                    <p className="text-xl mb-8">Score: {score}</p>
                    <button
                        className="px-6 py-3 bg-blue-600 rounded-lg text-lg text-white hover:bg-blue-700 active:bg-blue-800"
                        onClick={() => {
                            resetGame()
                            handleStartGame()
                        }}
                    >
                        Play Again
                    </button>
                </div>
            </div>
            )}
        </div>
    )
}
