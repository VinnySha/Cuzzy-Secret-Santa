import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function DrumrollAnimation({ names, targetName, onComplete }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const confettiTriggered = useRef(false);
  const timersRef = useRef([]);
  const confettiIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Find the target index
  const targetIndex = names.findIndex((name) => name === targetName);

  // Calculate target rotation
  // SVG is rotated -90deg, pointer is at 0deg (right side)
  // We want the center of the target segment to align with the pointer
  // Each segment is 360/names.length degrees wide
  const segmentAngle = 360 / names.length;
  const targetRotation =
    targetIndex >= 0 ? 90 - targetIndex * segmentAngle - segmentAngle / 2 : 0;

  const handleSkip = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
    }

    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];

    // Stop spinning and set to target rotation
    setIsSpinning(false);
    setRotation(targetRotation);

    // Immediately complete
    onCompleteRef.current();
  };

  useEffect(() => {
    if (!isSpinning) return;

    const startTime = Date.now();
    const duration = 5000; // 5 seconds total
    const totalSpins = 5; // Number of full rotations
    const startRotation = 0;

    const animate = () => {
      if (!isSpinning) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Calculate rotation: multiple spins + final target position
      const spinRotation = totalSpins * 360 * (1 - easedProgress);
      const finalRotation =
        startRotation + spinRotation + targetRotation * easedProgress;

      setRotation(finalRotation);

      if (progress >= 1) {
        // Animation complete
        setRotation(startRotation + totalSpins * 360 + targetRotation);
        setIsSpinning(false);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isSpinning, targetRotation]);

  // Handle confetti and fade when spinning stops
  useEffect(() => {
    if (isSpinning) return; // Only run when spinning stops

    // Trigger confetti immediately when wheel stops
    if (!confettiTriggered.current) {
      confettiTriggered.current = true;
      setShowConfetti(true);
      triggerConfetti();

      // After ~1 second, fade out and call onComplete
      const confettiClearTimer = setTimeout(() => {
        setFadeOut(true);
        // After fade completes, call onComplete
        const completeTimer = setTimeout(() => {
          onCompleteRef.current();
        }, 800); // Fade duration
        timersRef.current.push(completeTimer);
      }, 1000);
      timersRef.current.push(confettiClearTimer);
    }

    return () => {
      // Cleanup timers on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isSpinning]);

  const triggerConfetti = () => {
    // Multiple bursts of confetti for dramatic effect
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#22c55e", "#fbbf24", "#3b82f6", "#a855f7"],
    };

    // Main burst from center
    confetti({
      ...defaults,
      angle: 60,
      startVelocity: 45,
    });

    // Burst from left
    confetti({
      ...defaults,
      angle: 120,
      origin: { x: 0.2, y: 0.5 },
      startVelocity: 40,
    });

    // Burst from right
    confetti({
      ...defaults,
      angle: 60,
      origin: { x: 0.8, y: 0.5 },
      startVelocity: 40,
    });

    // Additional bursts after a short delay
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 50,
        angle: 90,
        origin: { x: 0.5, y: 0.3 },
        startVelocity: 35,
      });
    }, 250);
  };

  // Generate alternating red and green colors
  const getSegmentColor = (index) => {
    return index % 2 === 0 ? "#ef4444" : "#22c55e"; // Red and green alternating
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      {/* Skip button */}
      <motion.button
        onClick={handleSkip}
        className="absolute top-4 right-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-lg transition-colors z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Skip
      </motion.button>

      {/* Drumroll text */}
      <motion.div
        className="text-6xl font-bold mb-12 text-white"
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

      {/* Wheel Container */}
      <div className="relative w-[600px] h-[600px]">
        {/* Pointer Triangle - flipped to point towards wheel */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20">
          <div className="w-0 h-0 border-t-[25px] border-t-transparent border-b-[25px] border-b-transparent border-r-[35px] border-r-blue-500"></div>
        </div>

        {/* Rotating Wheel */}
        <motion.div
          className="relative w-full h-full"
          style={{
            rotate: `${rotation}deg`,
          }}
          transition={isSpinning ? {} : { duration: 0.5, ease: "easeOut" }}
        >
          {/* Segmented Wheel using SVG */}
          <svg
            className="w-full h-full"
            viewBox="0 0 400 400"
            style={{ transform: "rotate(-90deg)" }}
          >
            {names.map((name, idx) => {
              const segmentAngle = 360 / names.length;
              const startAngle = idx * segmentAngle;
              const endAngle = (idx + 1) * segmentAngle;

              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;

              const x1 = 200 + 180 * Math.cos(startAngleRad);
              const y1 = 200 + 180 * Math.sin(startAngleRad);
              const x2 = 200 + 180 * Math.cos(endAngleRad);
              const y2 = 200 + 180 * Math.sin(endAngleRad);

              const largeArc = segmentAngle > 180 ? 1 : 0;

              const pathData = [
                `M 200 200`,
                `L ${x1} ${y1}`,
                `A 180 180 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`,
              ].join(" ");

              const color = getSegmentColor(idx);
              const isTarget = name === targetName && !isSpinning;

              return (
                <g key={`segment-${idx}`}>
                  <path
                    d={pathData}
                    fill={isTarget ? "#ef4444" : color}
                    stroke="#1f2937"
                    strokeWidth="2"
                    className={isTarget ? "drop-shadow-lg" : ""}
                  />
                </g>
              );
            })}
          </svg>

          {/* Names on segments */}
          {names.map((name, idx) => {
            const segmentAngle = 360 / names.length;
            // Calculate angle for name position (0deg = right, 90deg = bottom)
            // Since SVG is rotated -90deg, we need to offset
            const baseAngle = idx * segmentAngle + segmentAngle / 2;
            const angle = baseAngle - 90; // Offset for SVG rotation
            const angleRad = (angle * Math.PI) / 180;
            const radius = 140;
            const x = 200 + radius * Math.cos(angleRad);
            const y = 200 + radius * Math.sin(angleRad);
            const isTarget = name === targetName && !isSpinning;

            return (
              <div
                key={`name-${idx}`}
                className="absolute"
                style={{
                  left: `${(x / 400) * 100}%`,
                  top: `${(y / 400) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${baseAngle}deg)`,
                  transformOrigin: "center",
                }}
              >
                <span
                  className={`text-white font-bold text-lg whitespace-nowrap ${
                    isTarget
                      ? "text-yellow-300 drop-shadow-lg font-extrabold"
                      : ""
                  }`}
                  style={{
                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  }}
                >
                  {name}
                </span>
              </div>
            );
          })}

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl z-10 border-4 border-gray-300"></div>
        </motion.div>
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
    </motion.div>
  );
}
