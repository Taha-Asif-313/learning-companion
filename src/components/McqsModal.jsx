import React, { useState } from "react";
import axios from "axios";
import {
  BookOpen,
  Loader2,
  X,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { marked } from "marked";

const McqModal = ({ isOpen, onClose }) => {
  const mcqData = JSON.parse(localStorage.getItem("mcqs")) || [];
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (questionIndex, option) => {
    if (showResults) return; // prevent changing answers after submit
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        content: JSON.stringify(
          localStorage.getItem("study_tutor_conversation_v1")
        ),
        quiz_results: JSON.stringify(answers),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/feedback`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setFeedback(res.data.feedback);
      console.log("API Response:", res.data);

      // ✅ Show results after submit
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Quiz Modal */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-40 p-4">
        <div className="bg-white max-h-screen overflow-y-auto w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b bg-gray-50">
            <h2 className="text-xl flex items-center gap-2 font-bold text-gray-800">
              <BookOpen className="text-blue-600" /> MCQ Quiz
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {mcqData.map((mcq, index) => {
              const userAnswer = answers[index];

              return (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-gray-200 hover:shadow-md transition bg-white"
                >
                  {/* Progress */}
                  <p className="text-xs text-gray-400 mb-1">
                    Question {index + 1} of {mcqData.length}
                  </p>

                  {/* Question */}
                  <p className="font-medium text-gray-800 mb-4">
                    {mcq.question}
                  </p>

                  {/* Options */}
                  <div className="space-y-3">
                    {mcq.options.map((opt, i) => {
                      let optionStyle =
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ";

                      if (showResults) {
                        if (opt === mcq.correct_answer) {
                          optionStyle +=
                            "border-green-500 bg-green-50 text-green-700";
                        } else if (
                          opt === userAnswer &&
                          userAnswer !== mcq.correct_answer
                        ) {
                          optionStyle +=
                            "border-red-500 bg-red-50 text-red-700";
                        } else {
                          optionStyle += "border-gray-200";
                        }
                      } else {
                        optionStyle +=
                          userAnswer === opt
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50";
                      }

                      return (
                        <label key={i} className={optionStyle}>
                          <input
                            type="radio"
                            name={`q-${index}`}
                            value={opt}
                            checked={userAnswer === opt}
                            disabled={showResults}
                            onChange={() => handleChange(index, opt)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="flex-1">{opt}</span>

                          {showResults && opt === mcq.correct_answer && (
                            <CheckCircle2 className="text-green-600 w-5 h-5" />
                          )}
                          {showResults &&
                            userAnswer === opt &&
                            userAnswer !== mcq.correct_answer && (
                              <XCircle className="text-red-600 w-5 h-5" />
                            )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t bg-gray-50">
            {showResults ? (
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Close
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className="bg-white max-h-screen overflow-y-auto w-full max-w-xl rounded-2xl shadow-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setFeedback(null)}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="text-blue-600" />
              <h3 className="text-lg font-bold text-gray-800">Feedback</h3>
            </div>

            {/* Feedback Content */}
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{
                __html: marked.parse(feedback || ""),
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default McqModal;
