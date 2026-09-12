import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { adminService } from '@/lib/services/adminService';
import MobileMenu from './MobileMenu';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141b2b]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="h-16 w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-4 min-w-[220px]">
          <MobileMenu categories={categories} user={user} />
          
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline-sm text-[17px] text-[#f8fafc] font-semibold tracking-tight">IA Comunidade</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-[20px]">search</span>
            <input 
              className="w-full bg-[#0f172a] hover:bg-[#111827] text-[#f8fafc] placeholder:text-[#64748b] text-[14px] pl-10 pr-4 py-2 rounded-lg border border-[#334155] focus:border-[#818cf8] focus:outline-none focus:ring-1 focus:ring-[#818cf8] transition-all" 
              placeholder="Pesquisar discussões, datasets, pesos LoRA ou modelos..." 
              type="text"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-code-md text-[11px] text-[#94a3b8] bg-[#1e293b] border border-[#334155] px-1.5 py-0.5 rounded">⌘K</kbd>
          </div>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-4 justify-end min-w-[220px]">
          {user ? (
            <>
              <Link href="/upload-recursos" className="hidden sm:inline-flex items-center gap-1 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#f8fafc] font-medium text-[13px] px-3.5 py-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px] text-[#818cf8]">cloud_upload</span>
                <span>Upload</span>
              </Link>
              <Link href="/criar-topico" className="hidden sm:inline-flex items-center gap-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium text-[13px] px-3.5 py-2 rounded-lg transition-colors shadow-md shadow-[#6366f1]/20">
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Criar</span>
              </Link>
              {(userRole === 'admin' || userRole === 'moderator') && (
                <Link href="/admin" className="hidden lg:inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] text-[13px] font-medium px-3.5 py-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  <span>Admin</span>
                </Link>
              )}
              <button aria-label="Notificações" className="relative p-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc] transition-colors" type="button">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#818cf8]"></span>
              </button>
              
              <div className="flex items-center gap-2 pl-2 border-l border-[#1e293b]">
                <div className="w-8 h-8 rounded-full bg-[#6366f1] text-white flex items-center justify-center font-medium shadow-sm shrink-0 cursor-pointer hover:opacity-90">
                  {user.email?.slice(0, 2).toUpperCase()}
                </div>
                <form action={signOut}>
                  <button type="submit" className="text-[13px] text-[#94a3b8] hover:text-[#ffb4ab] transition-colors font-medium hidden sm:block">
                    Sair
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex items-center gap-1 bg-[#1e293b] text-[#f8fafc] text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#334155] transition-colors border border-[#334155]">
                <span>Entrar</span>
              </Link>
              <Link href="/cadastro" className="hidden sm:inline-flex items-center gap-1 bg-[#6366f1] text-white text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-[#4f46e5] transition-colors shadow-md shadow-[#6366f1]/20">
                <span>Criar Conta</span>
              </Link>
              <Link href="/login" className="sm:hidden p-2 text-[#94a3b8] hover:bg-[#1e293b] rounded-lg">
                <span className="material-symbols-outlined text-[24px]">login</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
