import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';

export default function Header({ user }: { user: any }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-space-md lg:px-gutter flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md min-w-[220px]">
          <Link href="/" className="flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-primary text-[32px]">hub</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">Comunidade IA Plus</span>
          </Link>
        </div>
        
        <div className="flex-1 max-w-2xl hidden md:flex items-center">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input 
              className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface placeholder:text-outline text-label-md font-label-md pl-10 pr-space-md py-space-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest" 
              placeholder="Pesquisar discussões, tópicos ou códigos..." 
              type="text"
            />
            <kbd className="absolute right-space-md top-1/2 -translate-y-1/2 font-code-md text-code-md text-outline bg-surface-container px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-space-md justify-end min-w-[220px]">
          {user ? (
            <>
              <Link href="/criar-topico" className="hidden sm:inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Criar discussão</span>
              </Link>
              <button aria-label="Notificações" className="relative p-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" type="button">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
              </button>
              
              <div className="flex items-center gap-2 pl-2 border-l border-outline-variant">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shrink-0 cursor-pointer hover:opacity-90">
                  {user.email?.slice(0, 2).toUpperCase()}
                </div>
                <form action={signOut}>
                  <button type="submit" className="text-xs text-on-surface-variant hover:text-error transition-colors font-medium hidden sm:block">
                    Sair
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex items-center gap-space-xs bg-surface-container-low text-on-surface-variant font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-surface-container transition-colors shadow-sm">
                <span>Entrar</span>
              </Link>
              <Link href="/cadastro" className="hidden sm:inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm">
                <span>Criar Conta</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
