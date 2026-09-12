'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDarkActive = document.documentElement.classList.contains('dark')
    setIsDark(isDarkActive)
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!mounted) {
    return <div className="w-9 h-9 p-space-sm rounded-lg" />
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="p-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center justify-center"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-500 hover:text-amber-400 transition-transform active:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-on-surface-variant hover:text-on-surface transition-transform active:-rotate-12" />
      )}
    </button>
  )
}
