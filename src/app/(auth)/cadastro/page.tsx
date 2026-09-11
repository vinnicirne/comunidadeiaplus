'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'

function CadastroContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) {
        if (result.error.includes('already registered')) {
          setError('Esse e-mail já está cadastrado. Tente fazer login.')
        } else {
          setError(result.error)
        }
      } else {
        setSuccess(true)
      }
    })
  }

  const handleGoogle = () => {
    startTransition(async () => {
      await signInWithGoogle(next)
    })
  }

  if (success) {
    return (
      <div className="p-8 rounded-2xl bg-surface-container-low border border-primary/30 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-primary-fixed text-primary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">check_circle</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Cadastro realizado!</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
        </p>
        <Link
          href="/login"
          className="inline-block mt-4 px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm"
        >
          Ir para o Login
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="w-16 h-16 rounded-xl bg-surface-container-low p-2.5 shadow-sm flex items-center justify-center mb-space-lg">
        <img alt="Logo IA Comunidade" className="w-full h-full object-contain rounded-lg" src="https://lh3.googleusercontent.com/aida/AEtjO1WTT2lEtWBsUU6-jrFkQNl0PGaOSKERDTYLIFNGXf3kVCC8Bc6EA9fueJyQo8RQSnHUFFf7DG5tWD3HSqXc87Y3n3_3pNB4HejhrOFjOypRWZqciZNMCaTsIYfseaVE6q-iMBF17wyqs9YXOWw4C5rcFRJkRH13V2ULKFuVBL2_GFbwJhGeZ1cOHQB7afERrydIIaJslgedzOCgVHK4qnW1Ywac4mC-5_nLKL9lVhIfHBgxWA4qO2TLsA" />
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
        Crie sua conta técnica
      </h1>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs max-w-sm">
        Participe dos melhores debates sobre LLMs, Visão Computacional e Agentes Autônomos.
      </p>

      <div className="w-full grid grid-cols-2 p-1 bg-surface-container rounded-lg mt-space-lg mb-space-lg">
        <Link href={`/login${next !== '/' ? `?next=${next}` : ''}`} className="py-2 text-center rounded-md font-label-md text-label-md transition-all duration-200 text-on-surface-variant hover:text-on-surface">
          Entrar
        </Link>
        <button className="py-2 text-center rounded-md font-label-md text-label-md transition-all duration-200 bg-surface-container-lowest text-primary shadow-sm" type="button">
          Criar Conta
        </button>
      </div>

      <div className="w-full grid grid-cols-2 gap-space-sm mb-space-lg">
        <button onClick={handleGoogle} disabled={isPending} className="flex items-center justify-center gap-2 py-2.5 px-space-md bg-surface-container-low hover:bg-surface-container rounded-lg font-label-md text-label-md text-on-surface transition-colors shadow-sm disabled:opacity-50" type="button">
          {isPending ? (
            <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
              <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z" fill="#34A853"></path>
              <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z" fill="#FBBC05"></path>
              <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
            </svg>
          )}
          <span>Google</span>
        </button>
        <button disabled className="flex items-center justify-center gap-2 py-2.5 px-space-md bg-surface-container-low opacity-50 rounded-lg font-label-md text-label-md text-on-surface transition-colors shadow-sm cursor-not-allowed" type="button" title="Em breve">
          <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 24 24">
            <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      <div className="relative w-full flex items-center justify-center mb-space-lg">
        <div className="w-full h-px bg-surface-container-high"></div>
        <span className="absolute bg-surface-container-lowest px-space-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
          ou continue com
        </span>
      </div>

      {error && (
        <div className="w-full flex items-start gap-2.5 p-3.5 mb-4 rounded-xl bg-error-container border border-error/30 text-on-error-container text-xs">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form className="w-full flex flex-col gap-space-md text-left" onSubmit={handleSubmit}>
        
        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">
            Nome completo
          </label>
          <div className="relative flex items-center">
            <input 
              name="full_name"
              required
              className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-3.5 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/70 shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
              placeholder="Ada Lovelace" 
              type="text" 
            />
            <span className="material-symbols-outlined absolute right-3 text-outline pointer-events-none text-xl">badge</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">
            @Username
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-sm font-bold">@</span>
            <input 
              name="username"
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              title="Apenas letras, números e _"
              className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-8 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/70 shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
              placeholder="seunome" 
              type="text" 
            />
            <span className="material-symbols-outlined absolute right-3 text-outline pointer-events-none text-xl">account_circle</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-label-md text-label-md text-on-surface font-medium">
            E-mail
          </label>
          <div className="relative flex items-center">
            <input 
              name="email"
              required
              className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-3.5 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/70 shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
              placeholder="seu@email.com" 
              type="email" 
            />
            <span className="material-symbols-outlined absolute right-3 text-outline pointer-events-none text-xl">alternate_email</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium">
              Senha
            </label>
            <div className="relative flex items-center">
              <input 
                name="password"
                required
                minLength={6}
                className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-3.5 pr-10 font-body-md text-body-md text-on-surface placeholder:text-outline/70 shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
                placeholder="Mín. 6 caracteres" 
                type={showPassword ? 'text' : 'password'} 
              />
              <button 
                className="absolute right-2.5 p-1 text-outline hover:text-on-surface transition-colors flex items-center justify-center" 
                onClick={() => setShowPassword(!showPassword)} 
                type="button"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-medium">
              Confirmar
            </label>
            <div className="relative flex items-center">
              <input 
                name="confirm_password"
                required
                minLength={6}
                className="w-full bg-surface-container-lowest rounded-lg py-2.5 pl-3.5 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline/70 shadow-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" 
                placeholder="Repita a senha" 
                type={showPassword ? 'text' : 'password'} 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5" id="roleSelectorContainer">
          <label className="font-label-md text-label-md text-on-surface font-medium">Área de atuação</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 p-2 bg-surface rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
              <input defaultChecked className="accent-primary" name="userRole" type="radio" value="engineer"/>
              <span className="font-body-sm text-body-sm text-on-surface">ML Engineer</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-surface rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
              <input className="accent-primary" name="userRole" type="radio" value="researcher"/>
              <span className="font-body-sm text-body-sm text-on-surface">Pesquisador</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input required className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer" type="checkbox" />
            <span className="font-body-sm text-body-sm text-on-surface-variant select-none">Concordo com os termos de conduta da comunidade</span>
          </label>
        </div>

        <button 
          disabled={isPending}
          className="w-full mt-space-sm bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-space-md rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-60" 
          type="submit"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              <span>Criando conta...</span>
            </>
          ) : (
            <>
              <span>Concluir cadastro e começar</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-space-lg pt-space-md flex items-center justify-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Já faz parte?
          <Link href={`/login${next !== '/' ? `?next=${next}` : ''}`} className="text-primary font-label-md text-label-md hover:underline ml-1">
            Fazer login
          </Link>
        </p>
      </div>
    </>
  )
}

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center p-12">
        <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
      </div>
    }>
      <CadastroContent />
    </Suspense>
  )
}
