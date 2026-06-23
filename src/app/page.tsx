"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BookOpen, Calculator, Lock, Moon, Sun, Library } from "lucide-react";

export default function GlobalHub() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <Library size={32} className="text-[#fc4c02]" />
          <h1 className="text-2xl font-black tracking-tight">Learning Hub</h1>
        </div>
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
          className="p-3 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-neutral-800 shadow-sm hover:text-[#fc4c02] transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
          Master Your <span className="text-[#fc4c02]">Exams</span>
        </h2>
        <p className="text-gray-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
          Select a module below to start practicing. Your progress is saved locally on your device.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Module 1: Vocab */}
        <Link href="/vocab" className="group bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-[#fc4c02] dark:hover:border-[#fc4c02] hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-[#fc4c02]/10 text-[#fc4c02] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BookOpen size={32} />
          </div>
          <h3 className="text-2xl font-black mb-2">English Vocab</h3>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
            Master nearly 1,000 advanced vocabulary words with synonyms, random generation, and endless survival modes.
          </p>
          <div className="text-[#fc4c02] font-bold flex items-center gap-2">
            Enter Module &rarr;
          </div>
        </Link>

        {/* Module 2: Percentage (Math) */}
        <Link href="/percentage" className="group bg-white dark:bg-[#121212] p-8 rounded-[2rem] border border-gray-200 dark:border-neutral-800 shadow-sm hover:border-[#fc4c02] dark:hover:border-[#fc4c02] hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Calculator size={32} />
          </div>
          <h3 className="text-2xl font-black mb-2">Percentage</h3>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mb-8">
            Fast-paced quantitative aptitude practice. Test your speed and accuracy on competitive percentage problems.
          </p>
          <div className="text-blue-500 font-bold flex items-center gap-2">
            Enter Module &rarr;
          </div>
        </Link>

        {/* Module 3: Coming Soon */}
        <div className="bg-gray-100 dark:bg-neutral-900/50 p-8 rounded-[2rem] border border-dashed border-gray-300 dark:border-neutral-800 flex flex-col items-center justify-center text-center opacity-70">
          <div className="w-16 h-16 bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 rounded-2xl flex items-center justify-center mb-6">
            <Lock size={32} />
          </div>
          <h3 className="text-2xl font-black mb-2 text-gray-600 dark:text-neutral-400">More Coming Soon</h3>
          <p className="text-gray-500 dark:text-neutral-500 text-sm">
            Reasoning, Advanced Math, and General Knowledge modules are currently under construction.
          </p>
        </div>

      </div>
    </main>
  );
}