import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setUserKey, login, getUsers } from "../utils/api";

export default function KeySetup() {
  const [searchParams] = useSearchParams();
  const nameFromUrl = searchParams.get("name");
  const [name, setName] = useState(nameFromUrl || "");
  const [users, setUsers] = useState([]);
  const [showNameSelection, setShowNameSelection] = useState(!nameFromUrl);
  const [loadingUsers, setLoadingUsers] = useState(!nameFromUrl);
  const [secretKey, setSecretKey] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!nameFromUrl) {
      // Load users if no name in URL
      loadUsers();
    }
  }, [nameFromUrl]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleNameSelect = (selectedName) => {
    setName(selectedName);
    setShowNameSelection(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("Please select your name first");
      return;
    }

    if (!secretKey) {
      setError("Secret key is required");
      return;
    }

    if (secretKey !== confirmKey) {
      setError("Secret keys do not match");
      return;
    }

    setLoading(true);

    try {
      // Set the secret key
      await setUserKey(name, secretKey);
      
      // Automatically log in after setting key
      const data = await login(name, secretKey);
      
      // Navigate to waiting page
      navigate("/waiting");
    } catch (err) {
      setError(err.message || "Failed to set secret key");
    } finally {
      setLoading(false);
    }
  };

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
          Set Your Secret Key
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          {showNameSelection ? (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                Choose Your Name
              </h2>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-4xl inline-block"
                  >
                    🎁
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {users.map((user, index) => (
                    <motion.button
                      key={user.name}
                      onClick={() => handleNameSelect(user.name)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-green-500 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {user.name}
                    </motion.button>
                  ))}
                </div>
              )}
              <motion.button
                onClick={() => navigate("/name")}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                ← Back to Name Selection
              </motion.button>
            </div>
          ) : (
            <>
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
                placeholder="Enter your secret key..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Secret Key
              </label>
              <input
                type="password"
                value={confirmKey}
                onChange={(e) => setConfirmKey(e.target.value)}
                placeholder="Confirm your secret key..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
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
              disabled={loading || !secretKey || !confirmKey}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-green-500 text-white text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!loading && secretKey && confirmKey ? { scale: 1.02 } : {}}
              whileTap={!loading && secretKey && confirmKey ? { scale: 0.98 } : {}}
            >
              {loading ? "🔐 Setting Key..." : "🎁 Set Key & Continue"}
            </motion.button>
          </form>

              <motion.button
                onClick={() => navigate("/name")}
                className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                ← Back to Name Selection
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

