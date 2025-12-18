import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, checkUserKey } from "../utils/api";

export default function Login() {
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get("name");
  const [name, setName] = useState(nameFromUrl || "");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingKey, setCheckingKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (nameFromUrl) {
      checkIfKeySet();
    } else {
      // If no name in URL, redirect to name selection
      navigate("/name");
    }
  }, [nameFromUrl, navigate]);

  const checkIfKeySet = async () => {
    if (!nameFromUrl) return;
    
    setCheckingKey(true);
    try {
      const keyData = await checkUserKey(nameFromUrl);
      if (!keyData.hasKey) {
        // No key set, redirect to /key page
        navigate(`/key?name=${encodeURIComponent(nameFromUrl)}`);
      }
    } catch (err) {
      setError(err.message || "Failed to check key status");
    } finally {
      setCheckingKey(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Name is required");
      return;
    }

    if (!secretKey) {
      setError("Secret key is required");
      return;
    }

    setLoading(true);

    try {
      const data = await login(name, secretKey);
      // Navigate to waiting page after successful login
      navigate("/waiting");
    } catch (err) {
      setError(err.message || "Invalid secret key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎁
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent text-center"
        >
          Enter Your Secret Key
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          {name && (
            <p className="text-center text-lg font-semibold mb-6 text-gray-700 dark:text-gray-300">
              Hello, {name}! 👋
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Your secret key..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading || !secretKey}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading && secretKey ? { scale: 1.02 } : {}}
              whileTap={!loading && secretKey ? { scale: 0.98 } : {}}
            >
              {loading ? "🔐 Checking..." : "🎁 Continue"}
            </motion.button>
          </form>

          <motion.button
            onClick={() => navigate("/name")}
            className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ← Back to Name Selection
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
