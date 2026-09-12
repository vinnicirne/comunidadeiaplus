import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { adminService } from '@/lib/services/adminService';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/server';

export default async function Header({ user }: { user: any }) {
  let categories: any[] = [];
  try {
    categories = await adminService.getCategories();
  } catch (error) {
    console.error('Falha ao carregar categorias no Header:', error);
  }

  let userRole = 'user';
  if (user) {
    try {
      const supabase = createClient();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) userRole = profile.role;
    } catch (e) {
      console.error('Falha ao checar role no Header', e);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-space-md lg:px-gutter flex items-center justify-between gap-space-md">
        {/* Logo & Mobile Trigger */}
        <div className="flex items-center gap-space-md min-w-[220px]">
          <MobileMenu categories={categories} user={user} />
          
          <Link href="/" className="flex items-center gap-space-sm">
            <img 
              alt="Logo IA Comunidade" 
              className="h-8 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1WTT2lEtWBsUU6-jrFkQNl0PGaOSKERDTYLIFNGXf3kVCC8Bc6EA9fueJyQo8RQSnHUFFf7DG5tWD3HSqXc87Y3n3_3pNB4HejhrOFjOypRWZqciZNMCaTsIYfseaVE6q-iMBF17wyqs9YXOWw4C5rcFRJkRH13V2ULKFuVBL2_GFbwJhGeZ1cOHQB7afERrydIIaJslgedzOCgVHK4qnW1Ywac4mC-5_nLKL9lVhIfHBgxWA4qO2TLsA"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
              IA Comunidade
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input 
              className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface placeholder:text-outline text-label-md font-label-md pl-10 pr-space-md py-space-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest" 
              placeholder="Pesquisar discussões, tópicos ou códigos..." 
              type="text"
            />
            <kbd className="absolute right-space-md top-1/2 -translate-y-1/2 font-code-md text-code-md text-outline bg-surface-container px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-space-md justify-end min-w-[220px]">
          <ThemeToggle />

          {user ? (
            <>
              <Link 
                href="/upload-recursos" 
                className="hidden sm:inline-flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-space-md py-space-sm rounded-lg transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Upload</span>
              </Link>
              <Link 
                href="/criar-topico" 
                className="hidden sm:inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Criar discussão</span>
              </Link>
              {(userRole === 'admin' || userRole === 'moderator') && (
                <Link 
                  href="/admin" 
                  className="hidden lg:inline-flex items-center gap-space-xs text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md px-space-sm py-space-sm rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}
              <button 
                aria-label="Notificações" 
                className="relative p-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>
              </button>
              
              <div className="flex items-center gap-space-sm pl-space-xs border-l border-outline-variant/30">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md font-bold shadow-sm shrink-0">
                  {user.email?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <form action={signOut}>
                  <button 
                    type="submit" 
                    className="font-label-sm text-label-sm text-outline hover:text-error transition-colors hidden sm:block"
                  >
                    Sair
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="hidden sm:inline-flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-space-md py-space-sm rounded-lg transition-colors shadow-sm"
              >
                <span>Entrar</span>
              </Link>
              <Link 
                href="/cadastro" 
                className="hidden sm:inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm"
              >
                <span>Criar Conta</span>
              </Link>
              <Link 
                href="/login" 
                className="sm:hidden p-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[24px]">login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
