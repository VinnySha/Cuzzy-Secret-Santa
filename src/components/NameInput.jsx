import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveToStorage, loadFromStorage } from "../utils/storage";

const DEFAULT_NAMES = ["Charvi", "Rohan", "Vinny", "Isha", "Praneil", "Rohil"];

export default function NameInput({ onFinalize, theme }) {
  const [names, setNames] = useState([]);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    // Load from storage or use defaults
    const saved = loadFromStorage();
    if (saved && saved.names) {
      setNames(saved.names);
    } else {
      setNames(DEFAULT_NAMES);
    }
  }, []);

  const addName = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !names.includes(trimmed)) {
      const newNames = [...names, trimmed];
      setNames(newNames);
      setInputValue("");
      saveToStorage({ names: newNames });
    }
  };

  const removeName = (nameToRemove) => {
    const newNames = names.filter((n) => n !== nameToRemove);
    setNames(newNames);
    saveToStorage({ names: newNames });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addName();
    }
  };

  const handleFinalize = () => {
    if (names.length >= 2) {
      saveToStorage({ names });
      onFinalize(names);
    } else {
      alert("You need at least 2 cousins to play!");
    }
  };

  const themeClasses = {
    christmas: "bg-gradient-to-br from-red-50 to-green-50",
    winter: "bg-gradient-to-br from-blue-50 to-cyan-50",
    chaos: "bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50",
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        themeClasses[theme] || themeClasses.christmas
      }`}
    >
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Add Your Cousins 🎅
        </motion.h2>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter cousin name..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <motion.button
              onClick={addName}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add
            </motion.button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {names.map((name, index) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    {name}
                  </span>
                  <button
                    onClick={() => removeName(name)}
                    className="text-red-500 hover:text-red-700 font-bold text-xl"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {names.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              No cousins added yet. Start adding names!
            </p>
          )}
        </div>

        <motion.button
          onClick={handleFinalize}
          disabled={names.length < 2}
          className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${
            names.length >= 2
              ? "bg-gradient-to-r from-red-500 to-green-500 text-white hover:shadow-xl transform hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          whileHover={names.length >= 2 ? { scale: 1.02 } : {}}
          whileTap={names.length >= 2 ? { scale: 0.98 } : {}}
        >
          {names.length >= 2
            ? "🎁 Finalize & Shuffle!"
            : `Need ${2 - names.length} more cousin${
                2 - names.length === 1 ? "" : "s"
              }`}
        </motion.button>
      </div>
    </div>
  );
}
