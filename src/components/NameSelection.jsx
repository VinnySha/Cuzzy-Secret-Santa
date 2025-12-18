import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getUsers, checkUserKey } from "../utils/api";

export default function NameSelection() {
  const [users, setUsers] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const [userKeyStatus, setUserKeyStatus] = useState({});

  useEffect(() => {
    // Check key status for all users
    const checkAllKeys = async () => {
      const status = {};
      for (const user of users) {
        try {
          const keyData = await checkUserKey(user.name);
          status[user.name] = keyData.hasKey;
        } catch (err) {
          status[user.name] = false;
        }
      }
      setUserKeyStatus(status);
    };

    if (users.length > 0) {
      checkAllKeys();
    }
  }, [users]);

  const handleNameSelect = async (name) => {
    setSelectedName(name);
    setError("");

    try {
      // Check if user has a secret key set
      const keyData = await checkUserKey(name);
      
      if (!keyData.hasKey) {
        // No key set - don't show error, just navigate to key setup
        navigate(`/key?name=${encodeURIComponent(name)}`);
      } else {
        // Key is set, proceed to login
        navigate(`/login?name=${encodeURIComponent(name)}`);
      }
    } catch (err) {
      setError(err.message || "Failed to check key status");
    }
  };

  const handleGoToKeySetup = (name) => {
    navigate(`/key?name=${encodeURIComponent(name)}`);
  };

  if (loading) {
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
          Pick Your Name
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-3">
            {users.map((user, index) => {
              const hasKey = userKeyStatus[user.name] === true;
              return (
                <div key={user.name} className="flex gap-2">
                  <motion.button
                    onClick={() => handleNameSelect(user.name)}
                    className={`flex-1 px-6 py-4 ${
                      hasKey
                        ? "bg-gradient-to-r from-red-500 to-green-500 text-white"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                    } text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {user.name}
                    {!hasKey && (
                      <span className="ml-2 text-sm">(No key set)</span>
                    )}
                  </motion.button>
                  {!hasKey && (
                    <motion.button
                      onClick={() => handleGoToKeySetup(user.name)}
                      className="px-4 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index + 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title="Set your secret key"
                    >
                      🔑
                    </motion.button>
                  )}
                </div>
              );
            })}
          </div>

          <motion.button
            onClick={() => navigate("/")}
            className="w-full mt-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            ← Back
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

