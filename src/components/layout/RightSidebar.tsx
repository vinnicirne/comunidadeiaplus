import Link from 'next/link';

export default function RightSidebar({ categories }: { categories?: any[] }) {
  const activeCategories = categories ? categories.filter((c) => c.is_active) : [];

  return (
    <aside className="hidden xl:block w-80 shrink-0 fixed top-16 right-0 bottom-0 overflow-y-auto py-space-lg pr-gutter pl-space-md bg-surface">
      <div className="flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm text-primary">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Comunidade IA PLUS</h3>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Participe de conversas técnicas, compartilhe experimentos com LLMs e aprenda com especialistas.
          </p>
          <Link href="/criar-topico" className="inline-flex items-center justify-center gap-space-xs w-full bg-primary text-on-primary font-label-md text-label-md py-space-sm px-space-md rounded-lg hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Iniciar Tópico</span>
          </Link>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Categorias Populares</h3>
            <Link href="/explorar" className="font-label-sm text-label-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="flex flex-wrap gap-space-xs">
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => (
                <Link key={cat.id} href={cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`} className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">
                  #{cat.name}
                </Link>
              ))
            ) : (
              <>
                <Link href="/categoria/ia-geral" className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">#LLMs</Link>
                <Link href="/categoria/programacao" className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">#Python</Link>
                <Link href="/categoria/imagens-e-videos" className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">#Diffusion</Link>
                <Link href="/categoria/ia-geral" className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">#RAG</Link>
                <Link href="/categoria/negocios" className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors">#Startups</Link>
              </>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col gap-space-md">
          <h3 className="font-label-md text-label-md text-on-surface font-semibold">Discussões em Alta</h3>
          <div className="flex flex-col gap-space-md">
            <Link href="/topico/arquiteturas-moe-em-producao-trade-offs-de-latencia" className="group flex flex-col gap-0.5">
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">Arquiteturas MoE em produção: trade-offs de latência</span>
              <span className="font-body-sm text-body-sm text-outline">42 respostas · 150 curtidas</span>
            </Link>
            <Link href="/topico/fine-tuning-de-llama-3" className="group flex flex-col gap-0.5">
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">Fine-tuning de Llama 3 para análise jurídica em português</span>
              <span className="font-body-sm text-body-sm text-outline">28 respostas · 89 curtidas</span>
            </Link>
            <Link href="/topico/comparativo-pratico-embeddings" className="group flex flex-col gap-0.5">
              <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-2">Comparativo prático de embeddings multilíngues para RAG</span>
              <span className="font-body-sm text-body-sm text-outline">19 respostas · 64 curtidas</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
