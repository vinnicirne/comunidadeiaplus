'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function MobileMenu({ categories, user }: { categories?: any[], user?: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const activeCategories = categories ? categories.filter((c: any) => c.is_active) : []

  const getLinkClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path)
    return isActive
      ? "flex items-center gap-space-md px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold transition-colors"
      : "flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-colors"
  }

  return (
    <div className="lg:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        aria-label="Menu"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      {/* Overlay & Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Overlay fundo escuro */}
          <div 
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="relative w-72 max-w-[80vw] bg-surface h-full shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-space-md flex items-center justify-between border-b border-outline-variant">
              <div className="flex items-center gap-space-sm">
                <img 
                  alt="Logo IA Comunidade" 
                  className="h-7 w-auto object-contain" 
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WTT2lEtWBsUU6-jrFkQNl0PGaOSKERDTYLIFNGXf3kVCC8Bc6EA9fueJyQo8RQSnHUFFf7DG5tWD3HSqXc87Y3n3_3pNB4HejhrOFjOypRWZqciZNMCaTsIYfseaVE6q-iMBF17wyqs9YXOWw4C5rcFRJkRH13V2ULKFuVBL2_GFbwJhGeZ1cOHQB7afERrydIIaJslgedzOCgVHK4qnW1Ywac4mC-5_nLKL9lVhIfHBgxWA4qO2TLsA"
                />
                <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
                  IA Comunidade
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1 p-space-md" onClick={() => setIsOpen(false)}>
              <Link href="/" className={getLinkClass('/', true)}>
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span>Início</span>
              </Link>
              <Link href="/explorar" className={getLinkClass('/explorar')}>
                <span className="material-symbols-outlined text-[20px]">explore</span>
                <span>Explorar</span>
              </Link>
              <Link href="/blog" className={getLinkClass('/blog')}>
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                <span>Blog da Comunidade</span>
              </Link>
              <Link href="/upload-recursos" className={getLinkClass('/upload-recursos')}>
                <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                <span>Upload de Recursos</span>
              </Link>
              
              {user && (
                <>
                  <Link href="/minhas-discussoes" className={getLinkClass('/minhas-discussoes')}>
                    <span className="material-symbols-outlined text-[20px]">forum</span>
                    <span>Minhas discussões</span>
                  </Link>
                  <Link href="/salvos" className={getLinkClass('/salvos')}>
                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                    <span>Salvos</span>
                  </Link>
                  <Link href="/criar-topico" className="flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-primary bg-primary/10 hover:bg-primary/20 font-label-md text-label-md transition-colors mt-2">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Criar discussão</span>
                  </Link>
                </>
              )}
            </nav>
            
            {activeCategories.length > 0 && (
              <div className="flex flex-col gap-1 p-space-md border-t border-outline-variant" onClick={() => setIsOpen(false)}>
                <div className="px-space-md pb-2 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                  Categorias
                </div>
                {activeCategories.map((cat: any) => (
                  <Link key={cat.id} href={cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`} className={getLinkClass(cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`)}>
                    {cat.icon && <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>}
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  )
}
