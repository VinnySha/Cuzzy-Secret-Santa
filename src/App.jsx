import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "./components/Landing";
import NameInput from "./components/NameInput";
import Reveal from "./components/Reveal";
import ThemeToggle from "./components/ThemeToggle";
import { shuffleAssignments } from "./utils/shuffle";
import { saveToStorage, loadFromStorage, clearStorage } from "./utils/storage";

const PHASES = {
  LANDING: "landing",
  INPUT: "input",
  REVEAL: "reveal",
};

function App() {
  const [phase, setPhase] = useState(PHASES.LANDING);
  const [names, setNames] = useState([]);
  const [assignments, setAssignments] = useState(null);
  const [theme, setTheme] = useState("christmas");

  useEffect(() => {
    // Load saved state
    const saved = loadFromStorage();
    if (saved) {
      if (saved.names) setNames(saved.names);
      if (saved.assignments) setAssignments(saved.assignments);
      if (saved.theme) setTheme(saved.theme);
      if (saved.phase) setPhase(saved.phase);
    }
  }, []);

  const handleStart = () => {
    setPhase(PHASES.INPUT);
    saveToStorage({ phase: PHASES.INPUT, theme });
  };

  const handleFinalize = (finalNames) => {
    setNames(finalNames);
    const shuffled = shuffleAssignments(finalNames);
    setAssignments(shuffled);
    setPhase(PHASES.REVEAL);
    saveToStorage({
      phase: PHASES.REVEAL,
      names: finalNames,
      assignments: shuffled,
      theme,
    });
  };

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to start over? This will clear all assignments."
      )
    ) {
      clearStorage();
      setPhase(PHASES.LANDING);
      setNames([]);
      setAssignments(null);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    const current = loadFromStorage();
    saveToStorage({ ...current, theme: newTheme });
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {phase === PHASES.LANDING && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Landing onStart={handleStart} />
          </motion.div>
        )}

        {phase === PHASES.INPUT && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <ThemeToggle
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
            <NameInput onFinalize={handleFinalize} theme={theme} />
          </motion.div>
        )}

        {phase === PHASES.REVEAL && assignments && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ThemeToggle
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
            <Reveal
              names={names}
              assignments={assignments}
              theme={theme}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
