'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeftSidebar({ categories }: { categories?: any[] }) {
  const pathname = usePathname();
  const activeCategories = categories ? categories.filter((c) => c.is_active) : [];

  const getLinkClass = (path: string, exact: boolean = false) => {
    const isActive = exact ? pathname === path : pathname?.startsWith(path);
    return isActive
      ? "flex items-center gap-space-md px-space-md py-space-sm transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg"
      : "flex items-center gap-space-md px-space-md py-space-sm rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-md text-label-md transition-colors";
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
          <Link href="/categoria/blog" className={getLinkClass('/categoria/blog')}>
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span>Blog da Comunidade</span>
          </Link>
          <Link href="/upload-recursos" className={getLinkClass('/upload-recursos')}>
            <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            <span>Upload de Recursos</span>
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
                <Link key={cat.id} href={`/categoria/${cat.slug}`} className={getLinkClass(`/categoria/${cat.slug}`)}>
                  {cat.icon && (
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  )}
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
              </>
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
}
