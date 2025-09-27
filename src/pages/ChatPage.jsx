// src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  X,
  Play,
  Bot,
  User,
  BookOpen,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import QuickPrompt from "../components/QuickPrompt";
import { marked } from "marked";
import McqModal from "../components/McqsModal";

const INTRO = {
  title: "Hi — I'm your study tutor",
  subtitle:
    "I'll guide you through the book, explain concepts, give summaries and quizzes.",
  book: "Principles of Data Communication",
};

const STORAGE_KEY = "study_tutor_conversation_v1";

function nowISO() {
  return new Date().toISOString();
}

export default function ChatPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [mcqModal, setmcqModal] = useState(false);
  const [messages, setMessages] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : [
          {
            id: "sys-1",
            role: "assistant",
            text: `Welcome! I'm your tutor for "${INTRO.book}". Ask me anything about the material, request summaries, or take a quiz to test your knowledge.`,
            time: nowISO(),
          },
        ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  console.log(
    JSON.stringify(localStorage.getItem("study_tutor_conversation_v1"))
  );

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function addMessage(role, text) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role, text, time: nowISO() },
    ]);
  }

  async function sendMessageToAPI(userText) {
    try {
      const res = await axios.post("http://192.168.18.26:8000/chat", {
        session_id: localStorage.getItem("token"),
        student_input: userText,
      });

      // Example API response: { assessment: {...}, history: [...] }
      const { history, assessment } = res.data.current_state;
      localStorage.setItem("mcqs", JSON.stringify(assessment.mcqs));

      // Return only odd history messages
      if (history && Array.isArray(history)) {
        const oddMsgs = history.filter((_, i) => i % 2 === 1); // index 1,3,5,...
        const lastOdd = oddMsgs[oddMsgs.length - 1];
        return lastOdd?.content || "No reply received.";
      }

      return { type: "text", data: "No reply received." };
    } catch (err) {
      console.error("Chat API error:", err);
      throw new Error("Unable to reach tutor service.");
    }
  }

  async function handleSend(e) {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    addMessage("user", userText);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendMessageToAPI(userText);
      addMessage("assistant", reply);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPrompt(text) {
    setShowIntro(false);
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 100);
    setTimeout(() => handleSend(), 300);
  }

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([
        {
          id: "sys-1",
          role: "assistant",
          text: `Welcome! I'm your tutor for "${INTRO.book}". Ask me anything about the material, request summaries, or take a quiz to test your knowledge.`,
          time: nowISO(),
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ">
      <main className="w-full max-w-5xl overflow-hidden flex flex-col max-h-screen transform transition-all duration-300">
        {/* Chat header */}
        <header className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <BookOpen size={20} className="text-white" />
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Study Tutor</span>
                <span className="block text-xs text-gray-500">
                  {INTRO.book}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="text-xs px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Clear Chat
              </button>
              <button
                onClick={() => setShowIntro(true)}
                className="p-2 hover:bg-white rounded-xl transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat messages */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50"
        >
          <div className="max-w-5xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && <TypingIndicator />}
          </div>
        </div>

        {/* Chat input */}
        <form
          onSubmit={handleSend}
          className="border-t border-gray-100 p-4 bg-white"
        >
          <div className="max-w-5xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about data communication, summaries, quizzes..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all pr-24"
                disabled={loading}
              />

              <div className="absolute right-2 bottom-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => setmcqModal(true)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  Quiz
                </button>
                {/* <button
                  type="button"
                  onClick={() => handleQuickPrompt("Give me a chapter summary")}
                  className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                >
                  Summary
                </button> */}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Send size={16} />
              {loading ? "..." : "Send"}
            </button>
          </div>

          <div className="max-w-3xl mx-auto mt-3 flex justify-center">
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handleQuickPrompt("Explain packet switching")}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                Packet switching
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => handleQuickPrompt("OSI model layers")}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                OSI model
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => handleQuickPrompt("TCP vs UDP")}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                TCP vs UDP
              </button>
            </div>
          </div>
        </form>
      </main>

      <McqModal
        isOpen={mcqModal}
        onClose={() => {
          setmcqModal(false);
        }}
      />
    </div>
  );
}
