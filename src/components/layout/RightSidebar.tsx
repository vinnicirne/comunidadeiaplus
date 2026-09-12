import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function RightSidebar({ 
  categories = [],
  trendingTopics: passedTrending
}: { 
  categories?: any[]
  trendingTopics?: any[]
}) {
  const activeCategories = categories ? categories.filter((c) => c.is_active) : [];

  let trendingTopics = passedTrending;
  if (!trendingTopics) {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('topics')
        .select('id, title, slug, likes_count, comments_count')
        .eq('is_published', true)
        .order('likes_count', { ascending: false })
        .limit(3);
      trendingTopics = data || [];
    } catch (e) {
      trendingTopics = [];
    }
  }

  return (
    <aside className="hidden xl:block w-80 shrink-0 fixed top-16 right-0 bottom-0 overflow-y-auto py-space-lg pr-gutter pl-space-md bg-surface">
      <div className="flex flex-col gap-space-lg">
        {/* Banner Comunidade */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-sm text-primary">
            <span className="material-symbols-outlined text-[20px]">groups</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Comunidade IA PLUS</h3>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Participe de conversas técnicas, compartilhe experimentos com LLMs e aprenda com especialistas.
          </p>
          <Link 
            href="/criar-topico" 
            className="inline-flex items-center justify-center gap-space-xs w-full bg-primary text-on-primary font-label-md text-label-md py-space-sm px-space-md rounded-lg hover:bg-primary-container transition-colors shadow-sm font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>Iniciar Tópico</span>
          </Link>
        </div>

        {/* Categorias Populares */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Categorias Populares</h3>
            <Link href="/explorar" className="font-label-sm text-label-sm text-primary hover:underline font-medium">Ver todas</Link>
          </div>
          <div className="flex flex-wrap gap-space-xs">
            {activeCategories.length > 0 ? (
              activeCategories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={cat.slug === 'blog' ? '/blog' : `/categoria/${cat.slug}`} 
                  className="px-space-sm py-1 bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm rounded-lg transition-colors border border-outline-variant/20"
                >
                  #{cat.name}
                </Link>
              ))
            ) : (
              <span className="text-on-surface-variant text-body-sm">Nenhuma categoria ativa</span>
            )}
          </div>
        </div>

        {/* Discussões em Alta (100% Real do Supabase) */}
        <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md text-on-surface font-semibold">Discussões em Alta</h3>
            <span className="text-primary font-mono text-xs font-bold">&lt;/&gt;</span>
          </div>
          <div className="flex flex-col gap-space-md">
            {trendingTopics && trendingTopics.length > 0 ? (
              trendingTopics.map((topic) => (
                <Link 
                  key={topic.id} 
                  href={`/topico/${topic.slug}`} 
                  className="group flex flex-col gap-1 hover:bg-surface-container-low p-2 rounded-lg -mx-2 transition-colors"
                >
                  <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors line-clamp-2 font-semibold">
                    {topic.title}
                  </span>
                  <div className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">forum</span>
                      <span>{topic.comments_count || 0} respostas</span>
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <span className="font-mono text-xs font-bold">&lt;/&gt;</span>
                      <span>{topic.likes_count || 0}</span>
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                Nenhuma discussão ativa no momento.{' '}
                <Link href="/criar-topico" className="text-primary hover:underline font-semibold">
                  Crie uma!
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
