"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight, Home, CheckCircle2, XCircle } from "lucide-react";

import importedMathData from "@/data/percentage.json"; 

type MathQuestion = {
  id: number;
  question: string;
  options: { a: string; b: string; c: string; d: string };
  correctAnswer: "a" | "b" | "c" | "d";
};

const mathData = importedMathData as MathQuestion[];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function MathQuizLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode");

  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Record Activity for Streak
    const today = new Date().toISOString().split("T")[0];
    const acts = new Set(JSON.parse(localStorage.getItem("math_activity") || "[]"));
    acts.add(today);
    localStorage.setItem("math_activity", JSON.stringify(Array.from(acts)));

    // Load mastery data
    const correctIds = JSON.parse(localStorage.getItem("math_correct") || "[]");
    
    let queue: MathQuestion[] = [];
    
    if (mode === "practice") {
      queue = mathData.filter(q => !correctIds.includes(q.id));
      queue = shuffleArray(queue);
    } else if (mode === "10") {
      queue = shuffleArray([...mathData]).slice(0, 10);
    } else {
      queue = shuffleArray([...mathData]);
    }

    if (queue.length === 0) {
      router.push("/percentage");
      return;
    }
    
    setQuestions(queue);
  }, [mode, router]);

  const handleOptionClick = (selectedKey: string) => {
    if (showFeedback) return; 
    setUserAnswer(selectedKey);
    
    const currentQ = questions[currentIndex];
    const isCorrect = selectedKey === currentQ.correctAnswer;
    
    if (isCorrect) setScore((s) => s + 1);

    let correct = JSON.parse(localStorage.getItem("math_correct") || "[]");
    let wrong = JSON.parse(localStorage.getItem("math_wrong") || "[]");
    let visited = JSON.parse(localStorage.getItem("math_visited") || "[]");

    if (!visited.includes(currentQ.id)) visited.push(currentQ.id);

    if (isCorrect) {
       if (!correct.includes(currentQ.id)) correct.push(currentQ.id);
       wrong = wrong.filter((id: number) => id !== currentQ.id);
    } else {
       if (!wrong.includes(currentQ.id)) wrong.push(currentQ.id);
       correct = correct.filter((id: number) => id !== currentQ.id);
    }

    localStorage.setItem("math_correct", JSON.stringify(correct));
    localStorage.setItem("math_wrong", JSON.stringify(wrong));
    localStorage.setItem("math_visited", JSON.stringify(visited));

    setTimeout(() => { setShowFeedback(true); }, 1500);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer(null);
      setShowFeedback(false);
    } else {
      setShowFeedback(true);
    }
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const optionsList = Object.entries(currentQ.options); 
  const isFinished = currentIndex + 1 >= questions.length && showFeedback && userAnswer;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col items-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Top Nav */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 sm:mb-10 mt-2 gap-4">
        <button onClick={() => router.push("/percentage")} className="flex items-center gap-2 text-gray-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-[#121212] px-3 sm:px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-all active:scale-95 shrink-0">
          <Home size={16} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline font-bold text-sm">Exit to Dashboard</span>
        </button>
        <div className="bg-white dark:bg-[#121212] px-4 sm:px-5 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 font-black shadow-sm text-sm sm:text-base whitespace-nowrap">
          Score: <span className="text-blue-500">{score}</span>
        </div>
      </div>

      {isFinished ? (
        // FINISHED STATE
        <div className="w-full max-w-xl bg-white dark:bg-[#121212] p-8 sm:p-12 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-xl text-center mt-6 sm:mt-10 animate-in zoom-in-95 duration-500">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3">Session Complete!</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-neutral-400 mb-6 sm:mb-8">
            You scored <span className="font-black text-blue-500 text-xl sm:text-2xl md:text-3xl">{score}</span> out of {questions.length}.
          </p>
          <button onClick={() => router.push("/percentage")} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all active:scale-95 shadow-lg shadow-blue-500/20">
            Return to Dashboard
          </button>
        </div>
      ) : (
        // QUIZ / FEEDBACK STATE
        <div className="w-full max-w-3xl animate-in fade-in duration-300">
          <div className="w-full flex justify-center items-center mb-6 sm:mb-8">
            <span className="px-3 sm:px-4 py-1.5 rounded-full bg-gray-200 dark:bg-neutral-800 text-[10px] sm:text-xs font-bold text-gray-600 dark:text-neutral-400 tracking-widest uppercase">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121212] w-full p-6 sm:p-8 md:p-10 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-sm mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20"></div>
            {/* Math questions can be long, so text-lg on mobile, text-2xl on desktop handles paragraphs beautifully */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
              {currentQ.question}
            </h2>
          </div>

          {/* Feedback Display */}
          {showFeedback && (
            <div className={`flex items-center justify-center gap-2 mb-6 text-xl sm:text-2xl font-black ${userAnswer === currentQ.correctAnswer ? "text-green-500" : "text-red-500"} animate-in zoom-in-95`}>
              {userAnswer === currentQ.correctAnswer ? <><CheckCircle2 size={28} className="sm:w-8 sm:h-8" /> Correct!</> : <><XCircle size={28} className="sm:w-8 sm:h-8" /> Incorrect</>}
            </div>
          )}

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {optionsList.map(([key, value]) => {
              // items-start ensures the A/B/C/D label stays at the top if the math option wraps to multiple lines on mobile
              let btnClass = "p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base font-bold transition-all text-left focus:outline-none flex items-start sm:items-center gap-3 sm:gap-4 min-h-[4rem] sm:min-h-[5rem] ";
              
              if (!userAnswer) {
                btnClass += "border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] hover:border-blue-500 hover:bg-blue-500/5 active:scale-95 text-neutral-700 dark:text-neutral-300";
              } else {
                if (key === currentQ.correctAnswer) {
                  btnClass += "border-green-500 bg-green-500 text-white shadow-lg scale-[1.02] z-10";
                } else if (key === userAnswer) {
                  btnClass += "border-red-500 bg-red-500 text-white shadow-lg scale-[1.02] z-10";
                } else {
                  btnClass += "border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-[#121212] text-gray-400 dark:text-neutral-600 opacity-40 scale-95";
                }
              }

              return (
                <button key={key} disabled={!!userAnswer} onClick={() => handleOptionClick(key)} className={btnClass}>
                  <span className={`uppercase px-2.5 sm:px-3 py-1 rounded-md sm:rounded-lg text-xs sm:text-sm shrink-0 mt-0.5 sm:mt-0 ${userAnswer ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'}`}>{key}</span>
                  <span className="flex-1 leading-snug break-words">{value}</span>
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <button onClick={handleNext} className="w-full mt-6 sm:mt-8 bg-blue-500 hover:bg-blue-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 animate-in slide-in-from-bottom-4">
              Next Question <ArrowRight size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export default function QuizWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center font-bold text-gray-500 text-sm sm:text-base">Loading Engine...</div>}>
      <MathQuizLogic />
    </Suspense>
  );
}