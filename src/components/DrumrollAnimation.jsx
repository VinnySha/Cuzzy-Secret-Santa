import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function DrumrollAnimation({ names, targetName, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const intervalRef = useRef(null);
  const confettiTriggered = useRef(false);

  // Find the target index
  const targetIndex = names.findIndex((name) => name === targetName);

  useEffect(() => {
    if (!isSpinning) return;

    // Start spinning - cycle through names quickly
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % names.length);
    }, 100); // Fast rotation

    // After 2 seconds, slow down
    const slowDownTimer = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Slow rotation
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % names.length);
      }, 200);
    }, 2000);

    // After 3.5 seconds total, slow down even more
    const verySlowTimer = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Very slow rotation
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % names.length);
      }, 400);
    }, 3500);

    // After 5 seconds, stop on target
    const stopTimer = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsSpinning(false);
      // Ensure we land on the target
      setCurrentIndex(targetIndex >= 0 ? targetIndex : 0);

      // Trigger confetti after a brief delay
      setTimeout(() => {
        if (!confettiTriggered.current) {
          confettiTriggered.current = true;
          setShowConfetti(true);
          triggerConfetti();

          // Clear confetti and call onComplete after 3 seconds
          setTimeout(() => {
            setShowConfetti(false);
            setTimeout(() => {
              onComplete();
            }, 500);
          }, 3000);
        }
      }, 500);
    }, 5000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(slowDownTimer);
      clearTimeout(verySlowTimer);
      clearTimeout(stopTimer);
    };
  }, [isSpinning, names.length, targetIndex, onComplete]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 to-green-50 z-50 flex flex-col items-center justify-center">
      {/* Drumroll text */}
      <motion.div
        className="text-6xl font-bold mb-8"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🥁 Drumroll... 🥁
      </motion.div>

      {/* Rotating Wheel */}
      <div className="relative w-80 h-80 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Wheel container */}
          <div className="relative w-full h-full">
            {/* Center circle */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-32 h-32 bg-white rounded-full shadow-2xl border-4 border-red-500 flex items-center justify-center">
                <motion.div
                  key={currentIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-red-600"
                >
                  {names[currentIndex]}
                </motion.div>
              </div>
            </div>

            {/* Rotating name segments around the wheel */}
            <motion.div
              className="absolute inset-0"
              animate={{
                rotate: isSpinning
                  ? [0, 360]
                  : targetIndex >= 0
                  ? (360 / names.length) * targetIndex
                  : 0,
              }}
              transition={{
                duration: isSpinning ? 0.1 : 1,
                repeat: isSpinning ? Infinity : 0,
                ease: isSpinning ? "linear" : "easeOut",
              }}
            >
              {names.map((name, idx) => {
                const angle = (360 / names.length) * idx;
                const radius = 120;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <div
                    key={`${name}-${idx}`}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        name === targetName && !isSpinning
                          ? "bg-red-500 text-white scale-125"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {name}
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* Outer ring decoration */}
            <div className="absolute inset-0 border-8 border-red-300 rounded-full opacity-50"></div>
          </div>
        </div>
      </div>

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Confetti is handled by canvas-confetti */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
