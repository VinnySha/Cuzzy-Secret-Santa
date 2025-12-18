import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Animation constants
const ANIMATION_DURATION = 5000;
const TOTAL_SPINS = 5;
const CONFETTI_DELAY = 1000;
const FADE_DURATION = 800;

export default function DrumrollAnimation({ names, targetName, onComplete }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const confettiTriggered = useRef(false);
  const timersRef = useRef([]);
  const animationFrameRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Calculate target rotation to align target segment with pointer
  const { targetRotation, segmentAngle } = useMemo(() => {
    const targetIndex = names.findIndex((name) => name === targetName);
    const angle = 360 / names.length;
    const rotation =
      targetIndex >= 0 ? 90 - targetIndex * angle - angle / 2 : 0;
    return { targetRotation: rotation, segmentAngle: angle };
  }, [names, targetName]);

  // Cleanup helper
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const handleSkip = () => {
    cleanup();
    setIsSpinning(false);
    setRotation(targetRotation);
    onCompleteRef.current();
  };

  useEffect(() => {
    if (!isSpinning) return;

    const startTime = Date.now();

    const animate = () => {
      if (!isSpinning) return;

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const spinRotation = TOTAL_SPINS * 360 * (1 - easedProgress);
      const finalRotation = spinRotation + targetRotation * easedProgress;

      setRotation(finalRotation);

      if (progress >= 1) {
        setRotation(TOTAL_SPINS * 360 + targetRotation);
        setIsSpinning(false);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return cleanup;
  }, [isSpinning, targetRotation]);

  // Handle confetti and fade when spinning stops
  useEffect(() => {
    if (isSpinning || confettiTriggered.current) return;

    confettiTriggered.current = true;
    setShowConfetti(true);
    triggerConfetti();

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      const completeTimer = setTimeout(() => {
        onCompleteRef.current();
      }, FADE_DURATION);
      timersRef.current.push(completeTimer);
    }, CONFETTI_DELAY);
    timersRef.current.push(fadeTimer);

    return cleanup;
  }, [isSpinning]);

  const triggerConfetti = () => {
    const defaults = {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#22c55e", "#fbbf24", "#3b82f6", "#a855f7"],
    };

    confetti({ ...defaults, angle: 60, startVelocity: 45 });
    confetti({
      ...defaults,
      angle: 120,
      origin: { x: 0.2, y: 0.5 },
      startVelocity: 40,
    });
    confetti({
      ...defaults,
      angle: 60,
      origin: { x: 0.8, y: 0.5 },
      startVelocity: 40,
    });

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

  // Helper: Generate segment path data
  const getSegmentPath = (index, segmentAngle) => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    const radius = 180;
    const center = 200;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);
    const largeArc = segmentAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Helper: Get name position on wheel
  const getNamePosition = (index, segmentAngle) => {
    const baseAngle = index * segmentAngle + segmentAngle / 2;
    const angle = baseAngle - 90; // Offset for SVG rotation
    const angleRad = (angle * Math.PI) / 180;
    const radius = 140;
    const center = 200;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);

    return {
      left: `${(x / 400) * 100}%`,
      top: `${(y / 400) * 100}%`,
      transform: `translate(-50%, -50%) rotate(${baseAngle}deg)`,
    };
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: FADE_DURATION / 1000, ease: "easeInOut" }}
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
              const isTarget = name === targetName && !isSpinning;
              const color = idx % 2 === 0 ? "#ef4444" : "#22c55e";

              return (
                <g key={`segment-${idx}`}>
                  <path
                    d={getSegmentPath(idx, segmentAngle)}
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
            const isTarget = name === targetName && !isSpinning;
            const position = getNamePosition(idx, segmentAngle);

            return (
              <div
                key={`name-${idx}`}
                className="absolute"
                style={{ ...position, transformOrigin: "center" }}
              >
                <span
                  className={`text-white font-bold text-lg whitespace-nowrap ${
                    isTarget
                      ? "text-yellow-300 drop-shadow-lg font-extrabold"
                      : ""
                  }`}
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
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
