'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const hasDarkClass = document.documentElement.classList.contains('dark')
    setIsDark(hasDarkClass)
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) {
    return (
      <div className="w-9 h-9 p-2 rounded-lg" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="p-2 rounded-lg text-slate-500 dark:text-[#94a3b8] hover:bg-slate-100 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-[#f8fafc] transition-colors flex items-center justify-center"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 hover:text-amber-300 transition-transform active:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700 hover:text-slate-900 transition-transform active:-rotate-12" />
      )}
    </button>
  )
}
