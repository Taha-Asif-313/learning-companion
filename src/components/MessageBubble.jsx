import { useState } from "react";
import { Bot, Sparkles, User, Volume2, Square } from "lucide-react";
import { marked } from "marked";

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);

  // 🔊 Function to start speaking
  const handleSpeak = () => {
    if (!message.text || isSpeaking) return;

    const newUtterance = new SpeechSynthesisUtterance(message.text);
    newUtterance.lang = "en-US";
    newUtterance.onend = () => setIsSpeaking(false);

    setUtterance(newUtterance);
    setIsSpeaking(true);
    speechSynthesis.speak(newUtterance);
  };

  // ⏹ Function to stop speaking
  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex items-start gap-3 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-blue-600"
              : "bg-gradient-to-br from-purple-500 to-blue-600"
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>

        {/* Message */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md"
              : "bg-white border border-gray-100 rounded-bl-md shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {!isUser && <Sparkles size={12} className="text-yellow-500" />}
            <span
              className={`text-xs font-medium ${
                isUser ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {isUser ? "You" : "Study Tutor"}
            </span>
          </div>

          {/* Message text */}
          <p
            className="leading-relaxed prose"
            dangerouslySetInnerHTML={{
              __html: marked.parse(message.text || ""),
            }}
          />

          {/* 🔊 Voice Controls for Assistant */}
          {!isUser && (
            <div className="mt-2 flex items-center gap-2">
              {!isSpeaking ? (
                <button
                  onClick={handleSpeak}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition"
                >
                  <Volume2 size={14} /> Listen
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition"
                >
                  <Square size={14} /> Stop
                </button>
              )}
            </div>
          )}

          {/* Message time */}
          <div
            className={`text-xs mt-2 ${
              isUser ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {new Date(message.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
