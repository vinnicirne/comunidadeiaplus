'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeftSidebar({ categories }: { categories?: any[] }) {
  const pathname = usePathname();
  const activeCategories = categories ? categories.filter((c) => c.is_active) : [];

  const getLinkClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    return isActive
      ? "flex items-center gap-space-md px-space-md py-space-sm transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg text-label-md font-label-md shadow-xs"
      : "flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-colors";
  };

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('prog') || slug.includes('dev')) return 'terminal';
    if (slug.includes('image') || slug.includes('video')) return 'photo_library';
    if (slug.includes('nego') || slug.includes('business')) return 'trending_up';
    if (slug.includes('blog') || slug.includes('artigo')) return 'article';
    return 'psychology';
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0 fixed top-16 bottom-0 overflow-y-auto py-space-lg pr-space-md pl-space-md bg-surface">
      <div className="flex flex-col gap-space-lg">
        <nav className="flex flex-col gap-space-xs">
          <Link href="/" aria-current={pathname === '/' ? "page" : undefined} className={getLinkClass('/', true)}>
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Início</span>
          </Link>
          <Link href="/explorar" className={getLinkClass('/explorar')}>
            <span className="material-symbols-outlined text-[20px]">explore</span>
            <span>Explorar</span>
          </Link>
          <Link href="/upload-recursos" className={getLinkClass('/upload-recursos')}>
            <span className="material-symbols-outlined text-[20px]">cloud_download</span>
            <span>Arquivos & Downloads</span>
          </Link>
          <Link href="/blog" className={getLinkClass('/blog')}>
            <span className="material-symbols-outlined text-[20px]">article</span>
            <span>Blog</span>
          </Link>
          <Link href="/meus-artigos" className={getLinkClass('/meus-artigos')}>
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
            <span>Meus Artigos</span>
          </Link>
          <Link href="/minhas-discussoes" className={getLinkClass('/minhas-discussoes')}>
            <span className="material-symbols-outlined text-[20px]">forum</span>
            <span>Minhas discussões</span>
          </Link>
          <Link href="/salvos" className={getLinkClass('/salvos')}>
            <span className="material-symbols-outlined text-[20px]">bookmark</span>
            <span>Salvos</span>
          </Link>
        </nav>
        
        <div className="flex flex-col gap-space-sm">
          <div className="px-space-md font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
            Categorias
          </div>
          <nav className="flex flex-col gap-space-xs">
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`} 
                  className={getLinkClass(cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {getCategoryIcon(cat.slug)}
                  </span>
                  <span>{cat.name}</span>
                </Link>
              ))
            ) : (
              <>
                <Link href="/categoria/ia-geral" className={getLinkClass('/categoria/ia-geral')}>
                  <span className="material-symbols-outlined text-[20px]">psychology</span>
                  <span>IA Geral</span>
                </Link>
                <Link href="/categoria/programacao" className={getLinkClass('/categoria/programacao')}>
                  <span className="material-symbols-outlined text-[20px]">terminal</span>
                  <span>Programação</span>
                </Link>
                <Link href="/categoria/imagens-e-videos" className={getLinkClass('/categoria/imagens-e-videos')}>
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                  <span>Imagens e Vídeos</span>
                </Link>
                <Link href="/categoria/negocios" className={getLinkClass('/categoria/negocios')}>
                  <span className="material-symbols-outlined text-[20px]">trending_up</span>
                  <span>Negócios</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
