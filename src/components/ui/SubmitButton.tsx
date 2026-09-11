'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, Send } from 'lucide-react'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Publicando...</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span>Publicar Discussão</span>
        </>
      )}
    </button>
  )
}
