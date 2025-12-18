import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/name");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          🎁 Cuzzys Secret Santa 2025
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          SECRET SANTA TIMEEEEE WOOOOO! -vinny
        </motion.p>

        <motion.button
          onClick={handleGetStarted}
          className="px-8 py-4 bg-gradient-to-r from-red-500 to-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started 🎅
        </motion.button>
      </motion.div>
    </div>
  );
}
