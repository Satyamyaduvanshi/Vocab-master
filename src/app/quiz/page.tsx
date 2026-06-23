"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Home, CheckCircle2, XCircle, Clock } from "lucide-react";
import vocabData from "@/data/vocab.json";

type WordData = { word: string; synonyms: string[] };
const vocabulary: WordData[] = vocabData as WordData[];

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

function QuizLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const mode = searchParams.get("mode");
  const letter = searchParams.get("letter");

  const [queue, setQueue] = useState<WordData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize Quiz & Record Activity
  useEffect(() => {
    // Record today's activity for the dashboard calendar
    const today = new Date().toISOString().split("T")[0];
    const acts = new Set(JSON.parse(localStorage.getItem("vocab_activity") || "[]"));
    acts.add(today);
    localStorage.setItem("vocab_activity", JSON.stringify(Array.from(acts)));

    let newQueue: WordData[] = [];
    switch (mode) {
      case "10": newQueue = shuffleArray(vocabulary).slice(0, 10); break;
      case "50": newQueue = shuffleArray(vocabulary).slice(0, 50); break;
      case "endless": newQueue = shuffleArray(vocabulary); break;
      case "letter":
        newQueue = shuffleArray(vocabulary.filter((w) => w.word.startsWith(letter || "A")));
        if (newQueue.length === 0) {
          router.push("/");
          return;
        }
        break;
      default: router.push("/"); return;
    }
    setQueue(newQueue);
    generateQuestion(0, newQueue);
  }, [mode, letter, router]);

  // Timer Effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, timerActive]);

  // Time Out Handler
  useEffect(() => {
    if (timeLeft === 0 && !userAnswer && !showFeedback) {
      handleOptionClick("TIME_OUT");
    }
  }, [timeLeft]);

  const generateQuestion = (wordIndex: number, currentQueue: WordData[]) => {
    const targetWord = currentQueue[wordIndex];
    if (!targetWord) return;

    // Track Visited Word for Profile Stats
    const visited = new Set(JSON.parse(localStorage.getItem("vocab_visited") || "[]"));
    visited.add(targetWord.word);
    localStorage.setItem("vocab_visited", JSON.stringify(Array.from(visited)));

    const correct = targetWord.synonyms[Math.floor(Math.random() * targetWord.synonyms.length)];
    setCorrectAnswer(correct);

    const distractors: string[] = [];
    const availableWords = vocabulary.filter(w => w.word !== targetWord.word && w.synonyms.length > 0);
    const shuffledAvailable = shuffleArray(availableWords);

    for (let i = 0; i < 3; i++) {
      if (shuffledAvailable[i]) {
        const distractorSynonyms = shuffledAvailable[i].synonyms;
        distractors.push(distractorSynonyms[Math.floor(Math.random() * distractorSynonyms.length)]);
      } else distractors.push("Unknown");
    }
    setOptions(shuffleArray([correct, ...distractors]));
    
    // Reset Timer
    setTimeLeft(15);
    setTimerActive(true);
  };

  const handleOptionClick = (option: string) => {
    if (showFeedback) return; 
    setTimerActive(false);
    setUserAnswer(option);
    
    if (option === correctAnswer) {
      setScore((s) => s + 1);
    }
    
    setTimeout(() => { setShowFeedback(true); }, 1500); // 1.5s to explicitly see red/green state
  };

  const handleNext = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer(null);
      setShowFeedback(false);
      generateQuestion(currentIndex + 1, queue);
    } else {
      setShowFeedback(true);
    }
  };

  if (queue.length === 0) return null;

  const currentWord = queue[currentIndex] || { word: "", synonyms: [] };
  const isFinished = currentIndex + 1 >= queue.length && showFeedback && userAnswer;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Top Navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 sm:mb-10 mt-2">
        <button 
          onClick={() => router.push("/")} 
          className="flex items-center gap-2 text-gray-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-[#121212] px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-all active:scale-95"
        >
          <Home size={18} /> <span className="hidden sm:inline font-bold text-sm">Quit Session</span>
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          {!showFeedback && !isFinished && (
            <div className={`flex items-center gap-1.5 sm:gap-2 font-mono font-bold text-base sm:text-lg px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-[#121212] transition-colors ${timeLeft <= 5 ? 'text-red-500 animate-pulse border-red-200 dark:border-red-900/50' : 'text-[#fc4c02]'}`}>
              <Clock size={18} /> 00:{timeLeft.toString().padStart(2, '0')}
            </div>
          )}
          <div className="bg-white dark:bg-[#121212] px-4 sm:px-5 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 font-black shadow-sm text-sm sm:text-base">
            Score: <span className="text-[#fc4c02]">{score}</span>
          </div>
        </div>
      </div>

      {isFinished ? (
        // -------------------------
        // FINISHED STATE
        // -------------------------
        <div className="w-full max-w-xl bg-white dark:bg-[#121212] p-8 sm:p-12 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-xl text-center mt-10 animate-in zoom-in-95 duration-500">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Session Complete!</h2>
          <p className="text-lg sm:text-xl text-gray-500 dark:text-neutral-400 mb-8">
            You scored <span className="font-black text-[#fc4c02] text-2xl sm:text-3xl">{score}</span> out of {queue.length}.
          </p>
          <button 
            onClick={() => router.push("/")} 
            className="w-full bg-[#fc4c02] hover:bg-[#fc4c02]/90 text-white py-4 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-[#fc4c02]/20"
          >
            Return to Dashboard
          </button>
        </div>
      ) : showFeedback ? (
        // -------------------------
        // FEEDBACK STATE
        // -------------------------
        <div className="w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-500 mt-2 sm:mt-8">
          <div className={`flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl font-black mb-6 sm:mb-8 ${userAnswer === correctAnswer ? "text-green-500" : "text-red-500"}`}>
            {userAnswer === correctAnswer ? (
              <><CheckCircle2 size={36} /> Correct!</>
            ) : userAnswer === "TIME_OUT" ? (
              <><Clock size={36} /> Time's Up!</>
            ) : (
              <><XCircle size={36} /> Incorrect</>
            )}
          </div>

          <div className="bg-white dark:bg-[#121212] p-6 sm:p-10 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-xl mb-6 sm:mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-900"></div>
            
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-center mb-8 uppercase tracking-widest text-neutral-900 dark:text-white break-all">
              {currentWord.word}
            </h3>
            
            <div className="mb-8">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-neutral-500 uppercase tracking-widest font-bold mb-4 text-center">All Accepted Synonyms</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {currentWord.synonyms.map((syn, idx) => (
                  <span 
                    key={idx} 
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm ${
                      syn === correctAnswer 
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800'
                    }`}
                  >
                    {syn}
                  </span>
                ))}
              </div>
            </div>

            <a 
              href={`https://www.google.com/search?q=define+${currentWord.word}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-[#fc4c02] hover:bg-[#fc4c02]/10 transition-colors bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 py-3 sm:py-4 rounded-xl"
            >
              <Search size={16} /> Deep dive on Google
            </a>
          </div>

          <button 
            onClick={handleNext} 
            className="w-full bg-[#fc4c02] hover:bg-[#fc4c02]/90 text-white py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl flex justify-center items-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-[#fc4c02]/20"
          >
             Next Word <ArrowRight size={22} />
          </button>
        </div>
      ) : (
        // -------------------------
        // QUIZ STATE
        // -------------------------
        <div className="w-full max-w-3xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-300 mt-4 sm:mt-10">
          <div className="w-full flex justify-center items-center mb-6 sm:mb-8">
            <span className="px-4 py-1.5 rounded-full bg-gray-200 dark:bg-neutral-800 text-[10px] sm:text-xs font-bold text-gray-600 dark:text-neutral-400 tracking-widest uppercase">
              Word {currentIndex + 1} of {queue.length}
            </span>
          </div>

          <div className="bg-white dark:bg-[#121212] w-full py-12 sm:py-20 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-sm mb-6 sm:mb-10 flex justify-center items-center px-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#fc4c02]/20"></div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-widest uppercase text-center break-all leading-tight">
              {currentWord.word}
            </h2>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {options.map((option, idx) => {
              // STRICT COLOR LOGIC FOR PROFESSIONAL LOOK
              let btnClass = "p-5 sm:p-6 rounded-2xl border-2 text-base sm:text-lg font-bold transition-all text-center focus:outline-none flex items-center justify-center min-h-[5rem] sm:min-h-[6rem] ";
              
              if (!userAnswer) {
                // Default State
                btnClass += "border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121212] text-neutral-700 dark:text-neutral-300 hover:border-[#fc4c02] dark:hover:border-[#fc4c02] hover:bg-[#fc4c02]/5 hover:-translate-y-1 hover:shadow-md active:scale-95";
              } else {
                // Answered State
                if (option === correctAnswer) {
                  // Explicit Green for correct
                  btnClass += "border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/25 scale-[1.02] z-10";
                } else if (option === userAnswer && userAnswer !== "TIME_OUT") {
                  // Explicit Red for wrong choice
                  btnClass += "border-red-500 bg-red-500 text-white shadow-lg shadow-red-500/25 scale-[1.02] z-10";
                } else {
                  // Mute the unselected wrong distractors
                  btnClass += "border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-[#121212] text-gray-400 dark:text-neutral-600 opacity-40 scale-95";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={!!userAnswer}
                  onClick={() => handleOptionClick(option)}
                  className={btnClass}
                >
                  <span className="line-clamp-2">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center font-bold text-gray-500 dark:text-neutral-500">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-[#fc4c02] border-t-transparent rounded-full animate-spin"></div>
          Loading Engine...
        </div>
      </div>
    }>
      <QuizLogic />
    </Suspense>
  );
}