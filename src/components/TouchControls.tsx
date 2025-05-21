import { useGameStore } from '../store/gameStore'

export function TouchControls() {
    const { setRotation, setThrust, controlScheme } = useGameStore()

    // Only show and enable touch controls when in touch mode
    if (controlScheme !== 'touch') return null

    return (
        <div className="absolute bottom-0 left-0 right-0 h-32 flex justify-between items-center p-4 touch-none">
            {/* Rotation controls */}
            <div className="flex gap-4">
                <button
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center active:bg-opacity-40"
                    onTouchStart={() => setRotation(-90)}
                    onTouchEnd={() => setRotation(0)}
                >
                    ←
                </button>
                <button
                    className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center active:bg-opacity-40"
                    onTouchStart={() => setRotation(90)}
                    onTouchEnd={() => setRotation(0)}
                >
                    →
                </button>
            </div>

            {/* Thrust control */}
            <button
                className="w-24 h-24 bg-red-500 bg-opacity-50 rounded-full flex items-center justify-center active:bg-opacity-70"
                onTouchStart={() => setThrust(true)}
                onTouchEnd={() => setThrust(false)}
            >
                🔥
            </button>
        </div>
    )
}
