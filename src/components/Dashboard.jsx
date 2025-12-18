import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyAssignment, getUsers, markAssignmentSeen } from "../utils/api";
import DrumrollAnimation from "./DrumrollAnimation";

export default function Dashboard({ user, onLogout }) {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [allNames, setAllNames] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isReplay, setIsReplay] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentData, usersData] = await Promise.all([
        getMyAssignment(),
        getUsers(),
      ]);

      setAssignment(assignmentData);

      // Extract names from users data
      const names = (usersData.users || []).map((u) => u.name);
      setAllNames(names);

      // Show animation if assignment exists and user hasn't seen it yet
      if (
        assignmentData?.assigned &&
        assignmentData?.assignedTo?.name &&
        !assignmentData?.seenAssignment
      ) {
        setShowAnimation(true);
      } else {
        setAnimationComplete(true);
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
      setAnimationComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = async () => {
    setShowAnimation(false);
    setAnimationComplete(true);

    // Mark assignment as seen on the server (only if not a replay)
    if (!isReplay) {
      try {
        await markAssignmentSeen();
      } catch (err) {
        console.error("Failed to mark assignment as seen:", err);
        // Don't show error to user, this is a background operation
      }
    }
    setIsReplay(false); // Reset replay flag
  };

  const handleReplayAnimation = () => {
    if (
      assignment?.assigned &&
      assignment?.assignedTo?.name &&
      allNames.length > 0
    ) {
      setIsReplay(true);
      setShowAnimation(true);
      setAnimationComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
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

  // Show animation if assignment exists and animation hasn't completed
  if (
    showAnimation &&
    assignment?.assigned &&
    assignment?.assignedTo?.name &&
    allNames.length > 0
  ) {
    return (
      <AnimatePresence>
        <DrumrollAnimation
          key="drumroll"
          names={allNames}
          targetName={assignment.assignedTo.name}
          onComplete={handleAnimationComplete}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-red-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Welcome, {user.name}! 🎅
          </motion.h1>
          <motion.button
            onClick={onLogout}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Assignment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            🎁 Your Assignment
          </h2>

          {assignment?.assigned ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-4">You got:</p>
              <motion.p
                className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {assignment.assignedTo.name} 🎉
              </motion.p>

              {/* Replay Animation Button */}
              <motion.button
                onClick={handleReplayAnimation}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-green-600 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                🎬 Replay Animation
              </motion.button>
            </motion.div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {assignment?.message ||
                "No assignment yet. Wait for admin to shuffle!"}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
