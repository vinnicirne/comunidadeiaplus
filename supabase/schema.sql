-- ==============================================================================
-- COMUNIDADE IAPLUS — SCHEMA OFICIAL POSTGRESQL (SUPABASE)
-- ==============================================================================

-- 1. Habilitar extensão UUID caso não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Perfis de Usuários (vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Tópicos
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    views_count INT NOT NULL DEFAULT 0,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Comentários (com suporte a aninhamento em até 3 níveis)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    likes_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela de Curtidas (Likes)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT like_target_check CHECK (
        (topic_id IS NOT NULL AND comment_id IS NULL) OR
        (topic_id IS NULL AND comment_id IS NOT NULL)
    ),
    CONSTRAINT unique_user_topic_like UNIQUE (user_id, topic_id),
    CONSTRAINT unique_user_comment_like UNIQUE (user_id, comment_id)
);

-- 7. Tabela de Denúncias (Reports — Fila de Moderação)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'ofensivo', 'propaganda', 'conteudo_inadequado', 'outro')),
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
    action_taken TEXT CHECK (action_taken IN ('ignored', 'content_deleted', 'user_blocked')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT report_target_check CHECK (
        (topic_id IS NOT NULL AND comment_id IS NULL) OR
        (topic_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- ==============================================================================
-- ÍNDICES ESTRATÉGICOS PARA MÁXIMA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_category_id ON public.topics(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_author_id ON public.topics(author_id);
CREATE INDEX IF NOT EXISTS idx_topics_created_at ON public.topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_is_published ON public.topics(is_published);

CREATE INDEX IF NOT EXISTS idx_comments_topic_id ON public.comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- ==============================================================================
-- TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL NO CADASTRO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || floor(random() * 8999 + 1000)::text),
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Membro'),
        COALESCE(new.raw_user_meta_data->>'avatar_url', null),
        'user'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper: checa se usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Perfis: Leitura pública, update do próprio perfil, ou admin tem acesso total
CREATE POLICY "Perfis visíveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuário edita próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin gerencia todos os perfis" ON public.profiles FOR ALL USING (public.is_admin());

-- Categorias: Leitura pública, modificação exclusiva de admin
CREATE POLICY "Categorias visíveis para todos" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admin gerencia categorias" ON public.categories FOR ALL USING (public.is_admin());

-- Tópicos: Leitura pública dos publicados (admin vê todos), criação por autenticados, edição por autor ou admin
CREATE POLICY "Tópicos visíveis para todos" ON public.topics FOR SELECT USING (is_published = true OR public.is_admin() OR auth.uid() = author_id);
CREATE POLICY "Usuário autenticado cria tópico" ON public.topics FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Autor ou Admin edita tópico" ON public.topics FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "Autor ou Admin deleta tópico" ON public.topics FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Comentários: Leitura de não-deletados (admin vê todos), criação por autenticado, moderação por admin
CREATE POLICY "Comentários visíveis" ON public.comments FOR SELECT USING (is_deleted = false OR public.is_admin() OR auth.uid() = author_id);
CREATE POLICY "Usuário autenticado comenta" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Autor ou Admin edita comentário" ON public.comments FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());
CREATE POLICY "Autor ou Admin deleta comentário" ON public.comments FOR DELETE USING (auth.uid() = author_id OR public.is_admin());

-- Denúncias: Usuário autenticado pode denunciar, apenas Admins/Moderadores leem e gerenciam
CREATE POLICY "Usuário cria denúncia" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admin gerencia denúncias" ON public.reports FOR ALL USING (public.is_admin());

-- ==============================================================================
-- DADOS INICIAIS (SEED) DAS 4 CATEGORIAS DO PRD
-- ==============================================================================
INSERT INTO public.categories (name, slug, description, icon, display_order)
VALUES
    ('IA Geral', 'ia-geral', 'Discussões gerais, lançamentos e debates sobre Inteligência Artificial.', '🤖', 1),
    ('Programação', 'programacao', 'Vibe Coding, desenvolvimento de software, criação de apps e agentes com IA.', '💻', 2),
    ('Imagens e Vídeos', 'imagens-e-videos', 'Geração de arte, renderização de vídeos, modelos visuais e prompts criativos.', '🎨', 3),
    ('Negócios', 'negocios', 'Automação comercial, monetização, marketing, produtividade e SaaS com IA.', '💼', 4)
ON CONFLICT (slug) DO NOTHING;
