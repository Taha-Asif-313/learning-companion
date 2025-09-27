import { useState } from "react";
import { Bot, Sparkles, User, Volume2, Square } from "lucide-react";
import { marked } from "marked";
import axios from "axios";

const rtlLanguages = ["ur", "hi"];

const MessageBubble = ({ message }) => {
  const isUser = message.role === "user";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [selectedLang, setSelectedLang] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState("");

  // 🔊 Start speaking
  const handleSpeak = () => {
    if (!message.text || isSpeaking) return;
    const newUtterance = new SpeechSynthesisUtterance(message.text);
    newUtterance.lang = "en-US";
    newUtterance.onend = () => setIsSpeaking(false);

    setUtterance(newUtterance);
    setIsSpeaking(true);
    speechSynthesis.speak(newUtterance);
  };

  // ⏹ Stop speaking
  const handleStop = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // 🌍 Translate API call
  const handleTranslate = async (lang) => {
    if (!lang || !message.text) return;

    setTranslating(true);
    setTranslateError("");
    setTranslatedText("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/translate`, {
        content: message.text,
        target_language: lang,
      });

      if (res.data.translated_content) {
        setTranslatedText(res.data.translated_content);
      } else {
        setTranslateError("❌ Translation failed");
      }
    } catch (err) {
      console.error(err);
      setTranslateError("❌ Error translating");
    } finally {
      setTranslating(false);
    }
  };

  const isRtl = rtlLanguages.includes(selectedLang);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex items-start gap-3 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-blue-600"
              : "bg-blue-600"
          }`}
        >
          {isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Bot size={20} className="text-white" />
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

          {/* ✅ Translated text / Loading / Error */}
          {!isUser && (
            <div className="mt-2">
              {translating && (
                <p className="text-xs text-gray-500 italic">Translating...</p>
              )}
              {translateError && (
                <p className="text-xs text-red-600 italic">{translateError}</p>
              )}
              {translatedText && (
                <p
                  style={{
                    direction: isRtl ? "rtl" : "ltr",
                  }}
                  className={`leading-relaxed prose text-green-600`}
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(translatedText),
                  }}
                />
              )}
            </div>
          )}

          {/* 🔊 Voice + 🌍 Translate Controls */}
          {!isUser && (
            <div className="mt-2 flex items-center gap-3 flex-wrap">
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

              {/* 🌍 Translate Dropdown */}
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  handleTranslate(e.target.value);
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="">🌍 Translate</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ur">Urdu</option>
                <option value="hi">Hindi</option>
              </select>
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
