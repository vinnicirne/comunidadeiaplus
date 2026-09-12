'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeftSidebar({ categories }: { categories?: any[] }) {
  const pathname = usePathname();
  const activeCategories = categories ? categories.filter((c) => c.is_active) : [];

  const getLinkClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    return isActive
      ? "flex items-center px-3 py-2 rounded-lg bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/30 font-semibold text-[14px] transition-colors light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200"
      : "flex items-center px-3 py-2 rounded-lg text-[#94a3b8] hover:bg-[#1e293b] hover:text-[#f8fafc] text-[14px] font-medium transition-colors light:text-slate-600 light:hover:bg-slate-100 light:hover:text-slate-900";
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0 fixed top-16 bottom-0 overflow-y-auto py-6 pr-4 pl-4 bg-[#0f172a] border-r border-[#1e293b] light:bg-white light:border-slate-200 transition-colors">
      <div className="flex flex-col gap-6">
        <nav className="flex flex-col gap-1">
          <Link href="/" aria-current={pathname === '/' ? "page" : undefined} className={getLinkClass('/', true)}>
            Início
          </Link>
          <Link href="/explorar" className={getLinkClass('/explorar')}>
            Explorar
          </Link>
          <Link href="/upload-recursos" className={getLinkClass('/upload-recursos')}>
            Arquivos & Downloads
          </Link>
          <Link href="/blog" className={getLinkClass('/blog')}>
            Blog
          </Link>
          <Link href="/meus-artigos" className={getLinkClass('/meus-artigos')}>
            Meus Artigos
          </Link>
          <Link href="/minhas-discussoes" className={getLinkClass('/minhas-discussoes')}>
            Minhas discussões
          </Link>
          <Link href="/salvos" className={getLinkClass('/salvos')}>
            Salvos
          </Link>
        </nav>
        
        <div className="flex flex-col gap-2 pt-2 border-t border-[#1e293b] light:border-slate-200">
          <div className="px-3 text-[11px] text-[#64748b] light:text-slate-400 uppercase tracking-wider font-semibold">
            Categorias
          </div>
          <nav className="flex flex-col gap-1">
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => (
                <Link key={cat.id} href={cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`} className={getLinkClass(cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`)}>
                  {cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link href="/categoria/ia-geral" className={getLinkClass('/categoria/ia-geral')}>
                  IA Geral
                </Link>
                <Link href="/categoria/programacao" className={getLinkClass('/categoria/programacao')}>
                  Programação
                </Link>
                <Link href="/categoria/imagens-e-videos" className={getLinkClass('/categoria/imagens-e-videos')}>
                  Imagens e Vídeos
                </Link>
                <Link href="/categoria/negocios" className={getLinkClass('/categoria/negocios')}>
                  Negócios
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
