import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, ThumbsUp, MessageSquarePlus } from "lucide-react";

// SEO helpers
const useSEO = () => {
  useEffect(() => {
    const title = "Property Discussion & Articles | Astra Villa";
    const description =
      "Join the community: post property articles, comment, reply, like and rate discussions on Astra Villa.";
    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    // Canonical
    const linkRel = "canonical";
    let canonical = document.querySelector(`link[rel="${linkRel}"]`);
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", linkRel);
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.href);
  }, []);
};

// Validation schema
const articleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(120, { message: "Title must be less than 120 characters" }),
  content: z
    .string()
    .trim()
    .min(20, { message: "Content must be at least 20 characters" })
    .max(5000, { message: "Content must be less than 5000 characters" }),
  category: z.string().trim().max(50).optional().or(z.literal("")),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function slugify(input: string) {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || `post-${Date.now()}`;
}

const useArticles = () => {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, user_id, title, content, slug, category, views_count, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000,
  });
};

const Community = () => {
  useSEO();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: articles = [], isLoading } = useArticles();

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: { title: "", content: "", category: "" },
  });

  const createArticle = useMutation({
    mutationFn: async (values: ArticleFormValues) => {
      if (!user?.id) throw new Error("You must be logged in");
      const baseSlug = slugify(values.title);
      let slug = baseSlug;
      let attempt = 0;
      // Try up to 3 times if slug is taken
      while (attempt < 3) {
        const { error } = await supabase.from("articles").insert({
          user_id: user.id,
          title: values.title.trim(),
          content: values.content.trim(),
          slug,
          category: values.category ? values.category.trim() : null,
        });
        if (!error) return true;
        if ((error as any)?.code === "23505") {
          attempt++;
          slug = `${baseSlug}-${attempt}`;
          continue;
        }
        throw error;
      }
      throw new Error("Could not create article. Please try a different title.");
    },
    onSuccess: () => {
      form.reset();
      toast.success("Article posted");
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post article");
    },
  });

  return (
    <div>
      <header className="container mx-auto px-4 pt-6 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Property Discussion & Articles</h1>
        <p className="text-muted-foreground mt-1">Share insights, ask questions, and engage with the community.</p>
      </header>

      <main className="container mx-auto px-4 pb-10">
        {/* Post Article */}
        <section className="mb-6">
          <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Post an Article</h2>
              {!user?.id && (
                <a href="/auth" className="text-sm text-primary hover:underline">Sign in</a>
              )}
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((v) => createArticle.mutate(v))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tips for evaluating property value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea rows={6} placeholder="Write your article..." {...field} />
                      </FormControl>
                      <FormDescription>Keep it helpful and respectful.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={!user?.id || createArticle.isPending}>
                    {createArticle.isPending ? "Posting..." : "Post Article"}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Articles are public. Your profile will be shown.
                  </span>
                </div>
              </form>
            </Form>
          </div>
        </section>

        {/* Articles List */}
        <section className="space-y-4">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading articles...</div>
          ) : articles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No articles yet. Be the first to post!</div>
          ) : (
            articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Community;

// Sub-components
function ArticleCard({ article }: { article: any }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  // Likes
  const { data: likesCount = 0 } = useQuery({
    queryKey: ["article-likes-count", article.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("article_likes")
        .select("id", { count: "exact", head: true })
        .eq("article_id", article.id);
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: hasLiked = false } = useQuery({
    queryKey: ["article-liked", article.id, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .from("article_likes")
        .select("id")
        .eq("article_id", article.id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sign in to like");
      if (hasLiked) {
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", article.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("article_likes")
          .insert({ article_id: article.id, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-likes-count", article.id] });
      queryClient.invalidateQueries({ queryKey: ["article-liked", article.id, user?.id] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  // Ratings
  const { data: ratingInfo = { avg: 0, mine: 0 } } = useQuery({
    queryKey: ["article-rating", article.id, user?.id],
    queryFn: async () => {
      const [{ data: avgData, error: avgError }, { data: myData, error: myError }] = await Promise.all([
        supabase
          .from("article_ratings")
          .select("rating")
          .eq("article_id", article.id),
        user?.id
          ? supabase
              .from("article_ratings")
              .select("rating")
              .eq("article_id", article.id)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as any),
      ]);
      if (avgError) throw avgError;
      if (myError) throw myError;
      const ratings = avgData?.map((r: any) => r.rating) || [];
      const avg = ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      return { avg, mine: myData?.rating || 0 };
    },
  });

  const setRating = useMutation({
    mutationFn: async (value: number) => {
      if (!user?.id) throw new Error("Sign in to rate");
      const { error } = await supabase
        .from("article_ratings")
        .upsert(
          { article_id: article.id, user_id: user.id, rating: value },
          { onConflict: "article_id,user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-rating", article.id, user?.id] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <article className="bg-card border border-border rounded-xl p-4 md:p-5 shadow-sm">
      <header className="mb-2">
        <h3 className="text-lg font-semibold">{article.title}</h3>
        <p className="text-xs text-muted-foreground">
          {format(new Date(article.created_at), "dd MMM yyyy")} • {article.category || "General"}
        </p>
      </header>
      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
        {article.content.length > 400 ? article.content.slice(0, 400) + "…" : article.content}
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => toggleLike.mutate()} disabled={toggleLike.isPending}>
          <ThumbsUp className="w-4 h-4" />
          <span>{likesCount}</span>
        </Button>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating.mutate(i)}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label={`Rate ${i} star`}
            >
              <Star
                className={`w-5 h-5 ${i <= Math.round(ratingInfo.avg) ? "fill-primary text-primary" : ""}`}
              />
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-1">{ratingInfo.avg.toFixed(1)}</span>
        </div>

        <Button variant="ghost" size="sm" onClick={() => setShowComments((s) => !s)}>
          <MessageSquarePlus className="w-4 h-4" />
          Comments
        </Button>
      </div>

      {showComments && <CommentsSection articleId={article.id} />}
    </article>
  );
}

function CommentsSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentSchema = z.object({
    content: z.string().trim().min(2, { message: "Write a longer comment" }).max(1000),
  });
  type CommentForm = z.infer<typeof commentSchema>;
  const form = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["article-comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_comments")
        .select("id, content, user_id, created_at, parent_comment_id")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const addComment = useMutation({
    mutationFn: async (values: CommentForm) => {
      if (!user?.id) throw new Error("Sign in to comment");
      const { error } = await supabase
        .from("article_comments")
        .insert({ article_id: articleId, user_id: user.id, content: values.content.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <section className="mt-4 border-t border-border pt-4">
      <h4 className="text-sm font-semibold mb-2">Comments</h4>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments
            .filter((c: any) => !c.parent_comment_id)
            .map((c: any) => (
              <li key={c.id} className="text-sm">
                <div className="bg-muted/30 border border-border rounded-lg p-3">
                  <p className="leading-relaxed">{c.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {format(new Date(c.created_at), "dd MMM yyyy HH:mm")}
                  </p>
                </div>
                {/* Replies */}
                <ul className="pl-4 mt-2 space-y-2">
                  {comments
                    .filter((r: any) => r.parent_comment_id === c.id)
                    .map((r: any) => (
                      <li key={r.id} className="text-[13px]">
                        <div className="bg-muted/20 border border-border rounded-lg p-2">
                          <p>{r.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(r.created_at), "dd MMM yyyy HH:mm")}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
                <ReplyForm parentId={c.id} articleId={articleId} onAdded={() => queryClient.invalidateQueries({ queryKey: ["article-comments", articleId] })} />
              </li>
            ))}
        </ul>
      )}

      {/* New comment */}
      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => addComment.mutate(v))} className="space-y-2">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add a comment</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Write a comment…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" disabled={!user?.id || addComment.isPending}>
              {addComment.isPending ? "Posting…" : "Post Comment"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}

function ReplyForm({ parentId, articleId, onAdded }: { parentId: string; articleId: string; onAdded: () => void }) {
  const { user } = useAuth();
  const form = useForm<{ content: string }>({ defaultValues: { content: "" } });
  const addReply = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("Sign in to reply");
      const { error } = await supabase
        .from("article_comments")
        .insert({ article_id: articleId, user_id: user.id, content: content.trim(), parent_comment_id: parentId });
      if (error) throw error;
    },
    onSuccess: () => {
      form.reset();
      onAdded();
    },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });

  return (
    <form
      onSubmit={form.handleSubmit((v) => addReply.mutate(v.content))}
      className="mt-2 flex items-start gap-2"
    >
      <Textarea
        rows={2}
        placeholder="Reply…"
        {...form.register("content", { required: true, minLength: 2 })}
        className="flex-1"
      />
      <Button type="submit" size="sm" variant="outline" disabled={!user?.id || addReply.isPending}>
        Reply
      </Button>
    </form>
  );
}
