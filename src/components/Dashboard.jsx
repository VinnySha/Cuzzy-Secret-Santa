import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyAssignment,
  getMyWishlist,
  updateMyWishlist,
  getUsers,
  markAssignmentSeen,
} from "../utils/api";
import DrumrollAnimation from "./DrumrollAnimation";

export default function Dashboard({ user, onLogout }) {
  const [assignment, setAssignment] = useState(null);
  const [myWishlist, setMyWishlist] = useState([]);
  const [wishlistInput, setWishlistInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWishlistEdit, setShowWishlistEdit] = useState(false);
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
      const [assignmentData, wishlistData, usersData] = await Promise.all([
        getMyAssignment(),
        getMyWishlist(),
        getUsers(),
      ]);

      setAssignment(assignmentData);
      setMyWishlist(wishlistData.wishlist || []);

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

  const handleAddWishlistItem = () => {
    const trimmed = wishlistInput.trim();
    if (trimmed && !myWishlist.includes(trimmed)) {
      const newWishlist = [...myWishlist, trimmed];
      setMyWishlist(newWishlist);
      setWishlistInput("");
      handleSaveWishlist(newWishlist);
    }
  };

  const handleRemoveWishlistItem = (item) => {
    const newWishlist = myWishlist.filter((i) => i !== item);
    setMyWishlist(newWishlist);
    handleSaveWishlist(newWishlist);
  };

  const handleSaveWishlist = async (wishlist) => {
    try {
      await updateMyWishlist(wishlist);
    } catch (err) {
      setError(err.message || "Failed to save wishlist");
    }
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-red-50 to-green-50">
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
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assignment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
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
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You got:
                </p>
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
                  className="mb-6 px-4 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg font-semibold shadow-lg hover:from-red-600 hover:to-green-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  🎬 Replay Animation
                </motion.button>

                {/* Assignment's Wishlist - Always visible when assignment exists */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                    <span>🎯</span>
                    <span>Their Wishlist</span>
                  </h3>
                  {assignment.assignedTo.wishlist &&
                  assignment.assignedTo.wishlist.length > 0 ? (
                    <ul className="list-none space-y-2 text-left">
                      <AnimatePresence>
                        {assignment.assignedTo.wishlist.map((item, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-2 p-2 bg-gradient-to-r from-red-50 to-green-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
                          >
                            <span className="text-green-600 dark:text-green-400 mt-1">
                              ✓
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 flex-1">
                              {item}
                            </span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 italic text-sm py-2">
                      No wishlist items yet. They haven't added anything to
                      their wishlist.
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {assignment?.message ||
                  "No assignment yet. Wait for admin to shuffle!"}
              </p>
            )}
          </motion.div>

          {/* My Wishlist Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                📝 My Wishlist
              </h2>
              <button
                onClick={() => setShowWishlistEdit(!showWishlistEdit)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showWishlistEdit ? "Done" : "Edit"}
              </button>
            </div>

            {showWishlistEdit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wishlistInput}
                    onChange={(e) => setWishlistInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleAddWishlistItem();
                    }}
                    placeholder="Add wishlist item..."
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleAddWishlistItem}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}

            {myWishlist.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {myWishlist.map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                      {showWishlistEdit && (
                        <button
                          onClick={() => handleRemoveWishlistItem(item)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {showWishlistEdit
                  ? "Add items to your wishlist!"
                  : "No wishlist items yet. Click Edit to add some!"}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
