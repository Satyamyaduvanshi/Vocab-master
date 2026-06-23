"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Calculator, Zap, Target, BookOpen, Moon, Sun, Home, RotateCcw, Flame, CheckCircle2 } from "lucide-react";
import mathData from "@/data/percentage.json";

export default function PercentageDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const { theme, setTheme } = useTheme();
  
  const [visitedCount, setVisitedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const totalQuestions = mathData.length;

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem("vocab_user_name") || "Student";
    setUserName(storedName);

    const visited = JSON.parse(localStorage.getItem("math_visited") || "[]");
    const correct = JSON.parse(localStorage.getItem("math_correct") || "[]");
    const wrong = JSON.parse(localStorage.getItem("math_wrong") || "[]");
    const acts = JSON.parse(localStorage.getItem("math_activity") || "[]");
    
    setVisitedCount(visited.length);
    setCorrectCount(correct.length);
    setWrongCount(wrong.length);
    setStreak(calculateStreak(acts));
  }, []);

  const calculateStreak = (activityList: string[]) => {
    if (!activityList || activityList.length === 0) return 0;
    const acts = new Set(activityList);
    let currentStreak = 0;
    const getDStr = (d: Date) => d.toISOString().split("T")[0];
    
    let checkDate = new Date();
    const todayStr = getDStr(checkDate);
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDStr(yesterday);

    if (!acts.has(todayStr) && !acts.has(yesterdayStr)) return 0;

    let loopDate = new Date();
    if (!acts.has(todayStr) && acts.has(yesterdayStr)) {
      loopDate.setDate(loopDate.getDate() - 1);
    }

    while (acts.has(getDStr(loopDate))) {
      currentStreak++;
      loopDate.setDate(loopDate.getDate() - 1);
    }
    return currentStreak;
  };

  const resetProgress = () => {
    if (window.confirm("Reset all Percentage progress? This cannot be undone.")) {
      localStorage.removeItem("math_visited");
      localStorage.removeItem("math_correct");
      localStorage.removeItem("math_wrong");
      localStorage.removeItem("math_activity");
      setVisitedCount(0);
      setCorrectCount(0);
      setWrongCount(0);
      setStreak(0);
    }
  };

  if (!isMounted) return null;

  const remainingPractice = totalQuestions - correctCount;

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
        
        {/* Top Navigation - Mobile Optimized */}
        <div className="flex flex-wrap justify-between items-center w-full gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-[#121212] px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm transition-all text-sm font-bold active:scale-95">
            <Home size={16} /> Global Hub
          </Link>
          <div className="flex gap-2">
             <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-sm hover:text-blue-500 transition-colors">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
             <button onClick={resetProgress} className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Header Dashboard - Stacks gracefully on mobile */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white dark:bg-[#121212] p-5 sm:p-6 lg:p-8 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
              <Calculator size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-none text-neutral-900 dark:text-white">Percentage Math</h1>
              <p className="text-blue-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs mt-1 sm:mt-2">Hello, {userName}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-inner flex-1 md:flex-none">
              <CheckCircle2 size={20} className="text-green-500 sm:w-6 sm:h-6" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mastered</span>
                <span className="text-base sm:text-lg font-black">{correctCount} <span className="text-xs sm:text-sm font-medium text-gray-400">/ {totalQuestions}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-800 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-inner flex-1 md:flex-none">
              <Flame size={20} className={`sm:w-6 sm:h-6 ${streak > 0 ? "text-orange-500" : "text-gray-400"}`} />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider">Streak</span>
                <span className="text-base sm:text-lg font-black">{streak} Days</span>
              </div>
            </div>
          </div>
        </header>

        {/* Modes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Smart Practice */}
          <Link href="/percentage/quiz?mode=practice" className={`md:col-span-2 group text-white p-6 sm:p-8 rounded-3xl shadow-lg transition-all duration-300 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative gap-4 sm:gap-6 ${remainingPractice === 0 ? 'bg-green-500 pointer-events-none' : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:-translate-y-1 hover:shadow-xl'}`}>
            <Target className="absolute -right-4 -top-4 w-40 h-40 sm:w-64 sm:h-64 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 flex-1 text-center sm:text-left">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 mx-auto sm:mx-0 backdrop-blur-sm">
                {remainingPractice === 0 ? <CheckCircle2 size={24} className="text-white sm:w-7 sm:h-7" /> : <Target size={24} className="text-white sm:w-7 sm:h-7" />}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-1 sm:mb-2">{remainingPractice === 0 ? "Fully Mastered!" : "Smart Practice"}</h2>
              <p className="text-blue-100 text-xs sm:text-sm leading-snug">
                {remainingPractice === 0 
                  ? "You have answered every percentage question correctly." 
                  : `Focus only on the ${remainingPractice} questions you haven't mastered yet (unvisited & incorrect).`}
              </p>
            </div>
            {remainingPractice > 0 && (
              <div className="relative z-10 w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:scale-105 transition-transform whitespace-nowrap text-center mt-2 sm:mt-0">
                Start Session
              </div>
            )}
          </Link>

          {/* Quick 10 */}
          <Link href="/percentage/quiz?mode=10" className="group bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[12rem]">
            <div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <Zap size={20} className="sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Quick 10</h2>
              <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm leading-snug">Test yourself with 10 random questions from the database.</p>
            </div>
            <div className="w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-neutral-400 py-3 mt-4 rounded-xl text-sm sm:text-base font-bold flex justify-center items-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
              Start Quick 10
            </div>
          </Link>

          {/* Marathon All */}
          <Link href="/percentage/quiz?mode=all" className="md:col-span-3 group bg-white dark:bg-[#121212] p-5 sm:p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
               <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold mb-1">Full Marathon ({totalQuestions} Qs)</h2>
                <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">Attempt the entire database in random order.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-neutral-400 py-3 px-6 sm:px-8 rounded-xl text-sm sm:text-base font-bold flex justify-center items-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
              Start Marathon
            </div>
          </Link>

        </div>
      </div>
    </main>
  );
}