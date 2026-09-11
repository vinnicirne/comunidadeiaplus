'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-semibold transition-all shadow-sm disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
          <span>Publicando...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">send</span>
          <span>Publicar discussão</span>
        </>
      )}
    </button>
  )
}
