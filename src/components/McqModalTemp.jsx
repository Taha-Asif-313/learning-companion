import React, { useState, useEffect } from "react";
import { X, CheckCircle, Circle, Award, Clock, BarChart3, Send } from "lucide-react";

const McqModal = ({ isOpen, onClose }) => {
  const [mcqData, setMcqData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const data = JSON.parse(localStorage.getItem("mcqs") || "[]");
      setMcqData(data);
      setAnswers({});
      setCurrentQuestion(0);
      setShowResults(false);
      setScore(0);
      setTimeSpent(0);
      
      // Start timer
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleAnswerSelect = (questionIndex, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    mcqData.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);
  };

  const handleNext = () => {
    if (currentQuestion < mcqData.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setScore(0);
    setTimeSpent(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const currentMcq = mcqData[currentQuestion];
  const totalQuestions = mcqData.length;
  const answeredQuestions = Object.keys(answers).length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Award size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Knowledge Check</h2>
                <p className="text-blue-100 text-sm">Test your understanding</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{formatTime(timeSpent)}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {showResults ? (
            /* Results Screen */
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award size={40} className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed! 🎉</h3>
              <p className="text-gray-600 mb-6">You've completed the knowledge check</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{score}/{totalQuestions}</div>
                  <div className="text-sm text-blue-500">Score</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((score / totalQuestions) * 100)}%
                  </div>
                  <div className="text-sm text-green-500">Percentage</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-purple-500">Time</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Screen */
            <div className="space-y-6">
              {/* Question */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    Q{currentQuestion + 1}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Clock size={14} />
                    {formatTime(timeSpent)}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {currentMcq?.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentMcq?.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === option;
                  const isCorrect = option === currentMcq.correct_answer;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestion, option)}
                        className="hidden"
                      />
                      
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Circle size={12} className="text-white fill-current" />}
                      </div>
                      
                      <span className="flex-1 text-gray-800 font-medium">{option}</span>
                      
                      <div className="text-sm text-gray-400 font-mono">
                        {String.fromCharCode(65 + index)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showResults && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {answeredQuestions} of {totalQuestions} answered
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                  Previous
                </button>
                
                {currentQuestion === totalQuestions - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={answeredQuestions !== totalQuestions}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <Send size={16} />
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default McqModal;