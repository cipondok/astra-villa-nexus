
-- ═══════════════════════════════════════════════════════════
-- Investor Social Network Schema
-- ═══════════════════════════════════════════════════════════

-- Post types enum
CREATE TYPE public.social_post_type AS ENUM ('opportunity', 'insight', 'discussion', 'watchlist');

-- ── Investor Posts ──
CREATE TABLE public.investor_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_type social_post_type NOT NULL DEFAULT 'discussion',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  saves_count INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  is_elite BOOLEAN NOT NULL DEFAULT false,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  moderation_status TEXT NOT NULL DEFAULT 'approved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Post Likes ──
CREATE TABLE public.investor_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.investor_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ── Post Saves ──
CREATE TABLE public.investor_post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.investor_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ── Post Comments ──
CREATE TABLE public.investor_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.investor_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.investor_post_comments(id) ON DELETE CASCADE,
  likes_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Investor Follows ──
CREATE TABLE public.investor_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- ── Investor Credibility Scores ──
CREATE TABLE public.investor_credibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reputation_score INT NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'member',
  deals_shared INT NOT NULL DEFAULT 0,
  total_likes_received INT NOT NULL DEFAULT 0,
  total_saves_received INT NOT NULL DEFAULT 0,
  successful_referrals INT NOT NULL DEFAULT 0,
  verified_transactions INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══ Indexes ═══
CREATE INDEX idx_investor_posts_author ON public.investor_posts(author_id);
CREATE INDEX idx_investor_posts_type ON public.investor_posts(post_type);
CREATE INDEX idx_investor_posts_created ON public.investor_posts(created_at DESC);
CREATE INDEX idx_investor_posts_property ON public.investor_posts(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX idx_post_likes_post ON public.investor_post_likes(post_id);
CREATE INDEX idx_post_likes_user ON public.investor_post_likes(user_id);
CREATE INDEX idx_post_saves_user ON public.investor_post_saves(user_id);
CREATE INDEX idx_post_comments_post ON public.investor_post_comments(post_id);
CREATE INDEX idx_investor_follows_follower ON public.investor_follows(follower_id);
CREATE INDEX idx_investor_follows_following ON public.investor_follows(following_id);
CREATE INDEX idx_investor_credibility_score ON public.investor_credibility(reputation_score DESC);

-- ═══ RLS Policies ═══
ALTER TABLE public.investor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_credibility ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read approved, authors can manage own
CREATE POLICY "Anyone can read approved posts" ON public.investor_posts FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Authors can insert posts" ON public.investor_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.investor_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON public.investor_posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Likes: anyone can read, authenticated users manage own
CREATE POLICY "Anyone can read likes" ON public.investor_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert likes" ON public.investor_post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.investor_post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Saves: users can read own, manage own
CREATE POLICY "Users can read own saves" ON public.investor_post_saves FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert saves" ON public.investor_post_saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saves" ON public.investor_post_saves FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments: anyone can read, authenticated manage own
CREATE POLICY "Anyone can read comments" ON public.investor_post_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.investor_post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.investor_post_comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Follows: anyone can read, authenticated manage own
CREATE POLICY "Anyone can read follows" ON public.investor_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.investor_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.investor_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Credibility: anyone can read, system managed
CREATE POLICY "Anyone can read credibility" ON public.investor_credibility FOR SELECT USING (true);
CREATE POLICY "Users can insert own credibility" ON public.investor_credibility FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credibility" ON public.investor_credibility FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ═══ Trigger: Update post counts on like/save/comment ═══
CREATE OR REPLACE FUNCTION public.update_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE investor_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE investor_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_like_count
AFTER INSERT OR DELETE ON public.investor_post_likes
FOR EACH ROW EXECUTE FUNCTION public.update_post_like_count();

CREATE OR REPLACE FUNCTION public.update_post_save_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE investor_posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE investor_posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_save_count
AFTER INSERT OR DELETE ON public.investor_post_saves
FOR EACH ROW EXECUTE FUNCTION public.update_post_save_count();

CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE investor_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE investor_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_post_comment_count
AFTER INSERT OR DELETE ON public.investor_post_comments
FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();

-- ═══ Trigger: Update follower counts ═══
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO investor_credibility (user_id, follower_count) VALUES (NEW.following_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET follower_count = investor_credibility.follower_count + 1, updated_at = now();
    INSERT INTO investor_credibility (user_id, following_count) VALUES (NEW.follower_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET following_count = investor_credibility.following_count + 1, updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE investor_credibility SET follower_count = GREATEST(0, follower_count - 1), updated_at = now() WHERE user_id = OLD.following_id;
    UPDATE investor_credibility SET following_count = GREATEST(0, following_count - 1), updated_at = now() WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_follow_counts
AFTER INSERT OR DELETE ON public.investor_follows
FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();
