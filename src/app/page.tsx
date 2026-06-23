"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Zap, Infinity as InfinityIcon, Moon, Sun, Coffee, RotateCcw, User, Hash, ArrowRight, Flame, ChevronLeft, ChevronRight, Library } from "lucide-react";
import vocabData from "@/data/vocab.json";

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [userName, setUserName] = useState("");
  const { theme, setTheme } = useTheme();
  
  const [visitedCount, setVisitedCount] = useState(0);
  const [activity, setActivity] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [viewDate, setViewDate] = useState(new Date());

  const totalWords = vocabData.length;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem("vocab_user_name");
    if (storedName) setUserName(storedName);

    const visited = JSON.parse(localStorage.getItem("vocab_visited") || "[]");
    setVisitedCount(visited.length);

    const acts = JSON.parse(localStorage.getItem("vocab_activity") || "[]");
    setActivity(acts);
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

    while (true) {
      if (acts.has(getDStr(loopDate))) {
        currentStreak++;
        loopDate.setDate(loopDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameInput = (document.getElementById("nameInput") as HTMLInputElement).value;
    if (nameInput.trim()) {
      localStorage.setItem("vocab_user_name", nameInput.trim());
      setUserName(nameInput.trim());
    }
  };

  const resetProgress = () => {
    if (window.confirm("Reset all progress and activity? This cannot be undone.")) {
      localStorage.removeItem("vocab_visited");
      localStorage.removeItem("vocab_activity");
      setVisitedCount(0);
      setActivity([]);
      setStreak(0);
    }
  };

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getDayString = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  if (!isMounted) return null;

  // -------------------------
  // ONBOARDING
  // -------------------------
  if (!userName) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 p-4">
        <div className="w-full max-w-sm bg-white dark:bg-[#121212] p-6 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-xl">
          <div className="flex justify-center mb-4 text-[#fc4c02]">
             <Library size={48} />
          </div>
          <h1 className="text-2xl font-black text-center mb-1">Welcome</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-center text-xs mb-6">Enter your name to start tracking.</p>
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
            <input 
              id="nameInput"
              type="text" 
              placeholder="Your Name" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 focus:ring-1 focus:ring-[#fc4c02] focus:border-[#fc4c02] outline-none transition-all text-sm font-medium"
              autoFocus
            />
            <button type="submit" className="w-full bg-[#fc4c02] hover:bg-[#fc4c02]/90 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-[#fc4c02]/20">
              Start Practice
            </button>
          </form>
        </div>
      </main>
    );
  }

  // -------------------------
  // COMPACT DASHBOARD
  // -------------------------
  return (
    <main className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 p-4 transition-colors duration-300">
      
      {/* max-w-5xl restricts the width perfectly for a tight, high-density UI */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-4">
        
        {/* LEFT COLUMN: Main Content */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Header */}
          <header className="flex justify-between items-center bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-[#fc4c02]">
                <Library size={32} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-neutral-900 dark:text-white">Vocab Master</h1>
                <p className="text-[#fc4c02] text-[10px] font-bold uppercase tracking-wider mt-1">Interactive Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl">
              <Flame size={16} className={streak > 0 ? "text-[#fc4c02]" : "text-gray-400 dark:text-neutral-600"} />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] text-gray-500 dark:text-neutral-500 font-bold uppercase tracking-wider">Streak</span>
                <span className="text-xs font-black">{streak} Days</span>
              </div>
            </div>
          </header>

          {/* Core Modes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <Link href="/quiz?mode=10" className="group bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-[#fc4c02] dark:hover:border-[#fc4c02] transition-all flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#fc4c02]/10 text-[#fc4c02] rounded-lg flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <h2 className="text-sm font-bold">Quick 10</h2>
                </div>
                <p className="text-gray-500 dark:text-neutral-400 text-[11px] leading-tight">A fast 10-word sprint for daily review.</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-[#fc4c02] transition-colors mt-2">
                Start Sprint <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/quiz?mode=50" className="group bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-[#fc4c02] dark:hover:border-[#fc4c02] transition-all flex flex-col justify-between h-32">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#fc4c02]/10 text-[#fc4c02] rounded-lg flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <h2 className="text-sm font-bold">Marathon 50</h2>
                </div>
                <p className="text-gray-500 dark:text-neutral-400 text-[11px] leading-tight">A deep endurance test to lock in retention.</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-[#fc4c02] transition-colors mt-2">
                Start Marathon <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link href="/quiz?mode=endless" className="group bg-[#fc4c02] text-white p-4 rounded-2xl shadow-md hover:shadow-[#fc4c02]/30 transition-all flex flex-col justify-between h-32 relative overflow-hidden">
              <InfinityIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <InfinityIcon size={16} className="text-white" />
                  </div>
                  <h2 className="text-sm font-black">Endless Survival</h2>
                </div>
                <p className="text-white/80 text-[11px] leading-tight">Keep going until you run out of words.</p>
              </div>
              <div className="relative z-10 flex items-center gap-1 text-[11px] font-bold text-white/90 group-hover:text-white transition-colors mt-2">
                Play Endless <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Letter Target - Compressed 2-row layout */}
          <div className="w-full bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 rounded-lg flex items-center justify-center">
                <Hash size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-tight">Target Specific Letter</h2>
                <p className="text-gray-500 dark:text-neutral-500 text-[11px]">Click a letter to practice its vocabulary.</p>
              </div>
            </div>
            
            {/* 13 columns = exactly 2 rows for 26 letters */}
            <div className="grid grid-cols-7 sm:grid-cols-13 gap-1.5">
              {alphabet.map((letter) => (
                <Link 
                  key={letter} 
                  href={`/quiz?mode=letter&letter=${letter}`}
                  className="flex items-center justify-center py-2 text-xs font-bold bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg hover:bg-[#fc4c02] hover:text-white hover:border-[#fc4c02] transition-colors"
                >
                  {letter}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tighter Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 flex flex-col gap-4">
          
          <div className="bg-white dark:bg-[#121212] p-5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-[#fc4c02]/10 text-[#fc4c02] rounded-full flex items-center justify-center mb-2">
              <User size={20} />
            </div>
            <h2 className="text-base font-black leading-tight">{userName}</h2>
            <p className="text-gray-500 dark:text-neutral-500 text-[10px] font-medium mb-4">Vocab Master</p>

            <div className="w-full grid grid-cols-2 gap-2">
              <div className="bg-gray-50 dark:bg-neutral-900 py-2 rounded-xl border border-gray-100 dark:border-neutral-800 text-center flex flex-col justify-center">
                <p className="text-[9px] text-gray-500 dark:text-neutral-500 uppercase font-bold tracking-wider">Visited</p>
                <p className="text-lg font-black text-[#fc4c02] leading-none mt-1">{visitedCount}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-900 py-2 rounded-xl border border-gray-100 dark:border-neutral-800 text-center flex flex-col justify-center">
                <p className="text-[9px] text-gray-500 dark:text-neutral-500 uppercase font-bold tracking-wider">Total</p>
                <p className="text-lg font-black text-neutral-700 dark:text-neutral-300 leading-none mt-1">{totalWords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors">
                <ChevronLeft size={16} />
              </button>
              <h3 className="font-bold text-xs text-neutral-700 dark:text-neutral-300 tracking-wide">{monthName}</h3>
              <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-1.5">
              {['S','M','T','W','T','F','S'].map((day, i) => (
                <div key={i} className="text-[9px] font-bold text-center text-gray-400 dark:text-neutral-600">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-sm bg-transparent" />
              ))}
              
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = getDayString(day);
                const isActive = activity.includes(dStr);
                const isToday = dStr === new Date().toISOString().split("T")[0];

                return (
                  <div 
                    key={day} 
                    title={dStr}
                    className={`aspect-square rounded-sm flex items-center justify-center text-[10px] font-bold cursor-default ${
                      isActive 
                        ? 'bg-[#fc4c02] text-white' 
                        : isToday 
                          ? 'border border-[#fc4c02] text-[#fc4c02]' 
                          : 'bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#121212] p-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex gap-2">
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              {theme === "dark" ? "Light" : "Dark"} Mode
            </button>
            <button 
              onClick={resetProgress} 
              className="flex items-center justify-center px-4 bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
              title="Reset Progress"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-[#fc4c02]/10 text-[#fc4c02] rounded-lg">
                <Coffee size={16} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs leading-tight">Support Project</span>
                <span className="text-gray-500 dark:text-neutral-500 text-[9px] mt-0.5 uppercase tracking-wider">UPI: <span className="font-mono font-bold text-[#fc4c02]">ysatyam9627@okaxis</span></span>
              </div>
            </div>
            <p className="text-gray-400 dark:text-neutral-600 text-[10px] text-center pt-3 border-t border-gray-100 dark:border-neutral-800">
              Created by <span className="font-bold text-neutral-700 dark:text-neutral-400">Satyam</span>
            </p>
          </div>

        </aside>
      </div>
    </main>
  );
}