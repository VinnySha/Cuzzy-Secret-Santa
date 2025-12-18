import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMyAssignment,
  getUsers,
  markAssignmentSeen,
  getAssignmentConversation,
  getSantaConversation,
  sendMessageToAssignment,
  sendMessageToSanta,
} from "../utils/api";
import DrumrollAnimation from "./DrumrollAnimation";

export default function Dashboard({ user, onLogout }) {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const [allNames, setAllNames] = useState([]);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isReplay, setIsReplay] = useState(false);

  // Chat state
  const [assignmentMessages, setAssignmentMessages] = useState([]);
  const [santaMessages, setSantaMessages] = useState([]);
  const [assignmentMessageInput, setAssignmentMessageInput] = useState("");
  const [santaMessageInput, setSantaMessageInput] = useState("");
  const [sendingAssignmentMessage, setSendingAssignmentMessage] =
    useState(false);
  const [sendingSantaMessage, setSendingSantaMessage] = useState(false);
  const assignmentChatRef = useRef(null);
  const santaChatRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Load chat messages when assignment is available
  useEffect(() => {
    if (assignment?.assigned && animationComplete) {
      loadChatMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [assignment?.assigned, animationComplete]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (assignmentChatRef.current) {
      assignmentChatRef.current.scrollTop =
        assignmentChatRef.current.scrollHeight;
    }
  }, [assignmentMessages]);

  useEffect(() => {
    if (santaChatRef.current) {
      santaChatRef.current.scrollTop = santaChatRef.current.scrollHeight;
    }
  }, [santaMessages]);

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

  const loadChatMessages = async () => {
    try {
      if (assignment?.assigned) {
        const [assignmentConv, santaConv] = await Promise.all([
          getAssignmentConversation(),
          getSantaConversation(),
        ]);
        setAssignmentMessages(assignmentConv.messages || []);
        setSantaMessages(santaConv.messages || []);
      }
    } catch (err) {
      // Silently fail - don't show errors for chat polling
      console.error("Failed to load chat messages:", err);
    }
  };

  const handleSendAssignmentMessage = async () => {
    const trimmed = assignmentMessageInput.trim();
    if (!trimmed || sendingAssignmentMessage) return;

    try {
      setSendingAssignmentMessage(true);
      const result = await sendMessageToAssignment(trimmed);
      setAssignmentMessages((prev) => [...prev, result.message]);
      setAssignmentMessageInput("");
      // Reload to get updated conversation
      await loadChatMessages();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSendingAssignmentMessage(false);
    }
  };

  const handleSendSantaMessage = async () => {
    const trimmed = santaMessageInput.trim();
    if (!trimmed || sendingSantaMessage) return;

    try {
      setSendingSantaMessage(true);
      const result = await sendMessageToSanta(trimmed);
      setSantaMessages((prev) => [...prev, result.message]);
      setSantaMessageInput("");
      // Reload to get updated conversation
      await loadChatMessages();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSendingSantaMessage(false);
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto mb-6"
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

        {/* Chat Interfaces - Only show if assignment exists */}
        {assignment?.assigned && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Chat with Assignment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col"
              style={{ height: "500px" }}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                💬 Chat with {assignment.assignedTo.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Messages are anonymous
              </p>

              {/* Messages */}
              <div
                ref={assignmentChatRef}
                className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2"
              >
                {assignmentMessages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  <AnimatePresence>
                    {assignmentMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex ${
                          msg.isFromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.isFromMe
                              ? "bg-gradient-to-r from-red-500 to-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isFromMe
                                ? "text-white/70"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={assignmentMessageInput}
                  onChange={(e) => setAssignmentMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendAssignmentMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  disabled={sendingAssignmentMessage}
                />
                <motion.button
                  onClick={handleSendAssignmentMessage}
                  disabled={
                    sendingAssignmentMessage || !assignmentMessageInput.trim()
                  }
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: sendingAssignmentMessage ? 1 : 1.05 }}
                  whileTap={{ scale: sendingAssignmentMessage ? 1 : 0.95 }}
                >
                  {sendingAssignmentMessage ? "..." : "Send"}
                </motion.button>
              </div>
            </motion.div>

            {/* Chat with Secret Santa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col"
              style={{ height: "500px" }}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                🎅 Chat with Your Secret Santa
              </h3>

              {/* Messages */}
              <div
                ref={santaChatRef}
                className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2"
              >
                {santaMessages.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                    No messages yet. Your Secret Santa might message you here!
                  </p>
                ) : (
                  <AnimatePresence>
                    {santaMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex ${
                          msg.isFromMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            msg.isFromMe
                              ? "bg-gradient-to-r from-red-500 to-green-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.isFromMe
                                ? "text-white/70"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={santaMessageInput}
                  onChange={(e) => setSantaMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendSantaMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-red-500 dark:bg-gray-700 dark:text-white"
                  disabled={sendingSantaMessage}
                />
                <motion.button
                  onClick={handleSendSantaMessage}
                  disabled={sendingSantaMessage || !santaMessageInput.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: sendingSantaMessage ? 1 : 1.05 }}
                  whileTap={{ scale: sendingSantaMessage ? 1 : 0.95 }}
                >
                  {sendingSantaMessage ? "..." : "Send"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
