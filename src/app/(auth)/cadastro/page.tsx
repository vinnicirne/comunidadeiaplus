'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/lib/actions/auth'

export default function CadastroPage() {
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
      <div className="p-8 rounded-2xl bg-slate-900/70 border border-emerald-500/30 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-lg font-black text-white">Cadastro realizado!</h2>
        <p className="text-sm text-slate-300">
          Verifique seu e-mail e clique no link de confirmação para ativar sua conta.
        </p>
        <Link
          href="/login"
          className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
        >
          Ir para o Login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Junte-se à comunidade</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Criar sua conta</h1>
        <p className="text-sm text-slate-400">
          Participe gratuitamente das discussões sobre Inteligência Artificial
        </p>
      </div>

      {/* Card */}
      <div className="p-7 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xl space-y-5">
        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={isPending}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-semibold text-white transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
              <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.777L1.24 17.35C3.198 21.302 7.27 24 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
              <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
              <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.35l4.04-3.082z"/>
            </svg>
          )}
          <span>Criar conta com Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-xs text-slate-500 font-medium">ou preencha os dados</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="Seu Nome"
                  className="w-full pl-10 pr-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">@Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">@</span>
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="seunome"
                  pattern="[a-zA-Z0-9_]+"
                  title="Apenas letras, números e _"
                  minLength={3}
                  className="w-full pl-8 pr-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Mín. 6 caracteres"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirmar</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirm_password"
                  required
                  placeholder="Repita a senha"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ao criar uma conta, você concorda com os nossos termos de uso e política de privacidade.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isPending ? 'Criando conta...' : 'Criar minha conta grátis'}</span>
          </button>
        </form>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-slate-400">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  )
}
