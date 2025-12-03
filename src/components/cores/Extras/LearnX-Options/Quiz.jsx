"use client";

import { useState, useEffect } from "react";
import { apiService } from "@/lib/apiService";

export default function Quiz({ language }) {
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!language) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiService.getQuiz({
          language,
          difficulty: "beginner"
        });
        setQuiz(result.questions?.[0] || null);
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [language]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
    setShowResult(true);
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400 text-sm">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500 text-sm">No quiz available</div>
      </div>
    );
  }
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-zinc-100 mb-2">
          {language} Quiz
        </h3>
        <p className="text-sm text-zinc-400">
          Test your knowledge with this interactive quiz
        </p>
      </div>

      <div className="space-y-6">
        {/* Question */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h4 className="font-medium text-zinc-100 mb-4">
            {quiz.question}
          </h4>
          
          {/* Options */}
          <div className="space-y-3">
            {quiz.options?.map((option, index) => (
              <div
                key={index}
                onClick={() => !showResult && handleAnswerSelect(index)}
                className={`p-3 rounded-md border transition-all cursor-pointer ${
                  showResult
                    ? index === quiz.correct_answer
                      ? "bg-green-900/30 border-green-600"
                      : index === selectedAnswer
                      ? "bg-red-900/30 border-red-600"
                      : "bg-zinc-800 border-zinc-700"
                    : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-100">{option}</span>
                  {showResult && index === quiz.correct_answer && (
                    <span className="text-green-400 text-sm">✓ Correct</span>
                  )}
                  {showResult && index === selectedAnswer && index !== quiz.correct_answer && (
                    <span className="text-red-400 text-sm">✗ Incorrect</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result feedback */}
        {showResult && (
          <div className={`rounded-lg p-4 border ${
            selectedAnswer === quiz.correct_answer
              ? "bg-green-900/30 border-green-600"
              : "bg-red-900/30 border-red-600"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h5 className={`font-medium ${
                  selectedAnswer === quiz.correct_answer
                    ? "text-green-400"
                    : "text-red-400"
                }`}>
                  {selectedAnswer === quiz.correct_answer ? "Correct!" : "Incorrect"}
                </h5>
                <p className="text-sm text-zinc-300 mt-1">
                  {selectedAnswer === quiz.correct_answer
                    ? "Great job! You got it right."
                    : "Keep practicing!"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action button */}
        {showResult && (
          <button
            onClick={resetQuiz}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 rounded-md transition-colors text-sm"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );

}