import { motion } from "framer-motion";

const themes = [
  { id: "christmas", name: "🎄 Classic Christmas", emoji: "🎄" },
  { id: "winter", name: "❄️ Winter Snow", emoji: "❄️" },
  { id: "chaos", name: "🎉 Chaos Mode", emoji: "🎉" },
];

export default function ThemeToggle({ currentTheme, onThemeChange }) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-2">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTheme === theme.id
                ? "bg-gradient-to-r from-red-500 to-green-500 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={theme.name}
          >
            <span className="text-lg">{theme.emoji}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
