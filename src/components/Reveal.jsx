import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveToStorage, loadFromStorage } from "../utils/storage";

const REVEAL_MESSAGES = [
  "Ho ho ho… calculating your fate 🎄",
  "Santa is checking his list... ✨",
  "The magic is happening... 🎁",
  "Almost there... 🎅",
  "One moment please... ⛄",
];

export default function Reveal({ names, assignments, theme, onReset }) {
  const [selectedName, setSelectedName] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [locked, setLocked] = useState({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealMessage, setRevealMessage] = useState("");

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved && saved.revealed) {
      setRevealed(saved.revealed);
    }
    if (saved && saved.locked) {
      setLocked(saved.locked);
    }
  }, []);

  const handleReveal = (name) => {
    if (locked[name]) {
      const passcode = prompt("Enter passcode to view again:");
      if (passcode !== "cousins2025") {
        alert("Wrong passcode!");
        return;
      }
      // Unlock if passcode is correct
      setLocked((prev) => {
        const newLocked = { ...prev };
        delete newLocked[name];
        saveToStorage({ ...loadFromStorage(), locked: newLocked });
        return newLocked;
      });
    }

    setSelectedName(name);
    setIsRevealing(true);
    setRevealMessage(
      REVEAL_MESSAGES[Math.floor(Math.random() * REVEAL_MESSAGES.length)]
    );

    setTimeout(() => {
      setIsRevealing(false);
      setRevealed((prev) => {
        const newRevealed = { ...prev, [name]: true };
        saveToStorage({ ...loadFromStorage(), revealed: newRevealed });
        return newRevealed;
      });
    }, 3000);

    // Lock after 10 seconds
    setTimeout(() => {
      setLocked((prev) => {
        const newLocked = { ...prev, [name]: true };
        saveToStorage({ ...loadFromStorage(), locked: newLocked });
        return newLocked;
      });
    }, 13000);
  };

  const themeClasses = {
    christmas: {
      bg: "bg-gradient-to-br from-red-50 to-green-50",
      card: "bg-white dark:bg-gray-800",
      button: "bg-gradient-to-r from-red-500 to-green-500",
      text: "text-gray-800 dark:text-gray-200",
    },
    winter: {
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
      card: "bg-white dark:bg-gray-800",
      button: "bg-gradient-to-r from-blue-500 to-cyan-500",
      text: "text-gray-800 dark:text-gray-200",
    },
    chaos: {
      bg: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50",
      card: "bg-white dark:bg-gray-800",
      button: "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500",
      text: "text-gray-800 dark:text-gray-200",
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.christmas;

  return (
    <div className={`min-h-screen p-6 ${currentTheme.bg}`}>
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          🎁 Time to Reveal! 🎁
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {names.map((name) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: names.indexOf(name) * 0.1 }}
              className={`${currentTheme.card} rounded-xl shadow-lg p-6`}
            >
              <h3 className={`text-xl font-bold mb-4 ${currentTheme.text}`}>
                {name}
              </h3>

              {revealed[name] && !isRevealing ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: locked[name] ? 0.3 : 1, scale: 1 }}
                  className={`text-center ${locked[name] ? "blur-sm" : ""}`}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    You got:
                  </p>
                  <motion.p
                    className={`text-3xl font-bold ${
                      locked[name]
                        ? "text-gray-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                    animate={
                      locked[name]
                        ? {}
                        : {
                            scale: [1, 1.2, 1],
                          }
                    }
                    transition={{ duration: 0.5 }}
                  >
                    {assignments[name]} 🎉
                  </motion.p>
                  {locked[name] && (
                    <p className="text-xs text-gray-500 mt-2">
                      Locked - Enter passcode to view again
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => handleReveal(name)}
                  disabled={isRevealing}
                  className={`w-full py-3 ${
                    currentTheme.button
                  } text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all ${
                    isRevealing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  whileHover={!isRevealing ? { scale: 1.02 } : {}}
                  whileTap={!isRevealing ? { scale: 0.98 } : {}}
                >
                  {revealed[name]
                    ? "🔓 View Again (Passcode)"
                    : "🎁 Reveal My Assignment"}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isRevealing && selectedName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => {}}
            >
              <motion.div
                className={`${currentTheme.card} rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                {theme === "chaos" && (
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          background: [
                            "#ff00ff",
                            "#00ffff",
                            "#ffff00",
                            "#ff00ff",
                          ][i % 4],
                        }}
                        animate={{
                          y: [0, -100, 0],
                          x: [0, Math.random() * 100 - 50, 0],
                          opacity: [1, 0, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {theme === "winter" && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-2xl"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, 100],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: Math.random() * 3,
                        }}
                      >
                        ❄️
                      </motion.div>
                    ))}
                  </div>
                )}

                {theme === "christmas" && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-xl"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, 100],
                          rotate: [0, 360],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          delay: Math.random() * 4,
                        }}
                      >
                        🎄
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.p
                  className={`text-2xl font-bold mb-4 relative z-10 ${currentTheme.text}`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                >
                  {revealMessage}
                </motion.p>

                <motion.div
                  className="text-6xl relative z-10"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                  }}
                >
                  🎁
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-8">
          <motion.button
            onClick={onReset}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 Start Over
          </motion.button>
        </div>
      </div>
    </div>
  );
}
