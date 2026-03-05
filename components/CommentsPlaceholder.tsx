'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Reply, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import AuthModal from '@/components/AuthModal';

interface ReplyItem {
  id: number;
  author: string;
  content: string;
  publishedAt: string;
}

interface CommentItem {
  id: number;
  author: string;
  content: string;
  publishedAt: string;
  replies: ReplyItem[];
}

export default function CommentsPlaceholder() {
  const { user, refreshUser } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const slug = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || '';
  }, []);

  const fetchComments = useCallback(async () => {
    if (!slug) return;
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (!slug) return;
    const id = window.setInterval(() => {
      fetchComments();
    }, 5000);
    return () => window.clearInterval(id);
  }, [slug, fetchComments]);

  const openAuthModal = (actionAfterAuth: () => void) => {
    setError('');
    setPendingAction(() => actionAfterAuth);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    await refreshUser();
    if (pendingAction) {
      pendingAction();
    }
    setPendingAction(null);
  };

  const openNewCommentModal = () => {
    const launch = () => {
      setReplyTo(null);
      setContent('');
      setError('');
      setIsModalOpen(true);
    };

    if (!user) {
      openAuthModal(launch);
      return;
    }

    launch();
  };

  const openReplyModal = (comment: CommentItem) => {
    const launch = () => {
      setReplyTo(comment);
      setContent('');
      setError('');
      setIsModalOpen(true);
    };

    if (!user) {
      openAuthModal(launch);
      return;
    }

    launch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !slug) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: Record<string, unknown> = { content: content.trim() };
      if (replyTo) payload.parentId = replyTo.id;

      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setIsSubmitting(false);
        setIsModalOpen(false);
        if (replyTo) {
          openAuthModal(() => openReplyModal(replyTo));
        } else {
          openAuthModal(openNewCommentModal);
        }
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      if (replyTo) {
        setComments((prev) =>
          prev.map((item) =>
            item.id === replyTo.id
              ? {
                  ...item,
                  replies: [
                    ...item.replies,
                    {
                      id: data.id,
                      author: data.author,
                      content: data.content,
                      publishedAt: data.publishedAt,
                    },
                  ],
                }
              : item
          )
        );
      } else {
        setComments((prev) => [
          ...prev,
          {
            id: data.id,
            author: data.author,
            content: data.content,
            publishedAt: data.publishedAt,
            replies: [],
          },
        ]);
      }

      setIsModalOpen(false);
      setContent('');
      setReplyTo(null);
      fetchComments();
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Comments</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Join the conversation</p>
          </div>
        </div>
        <button
          onClick={openNewCommentModal}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {comments.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-6">No comments yet. Be the first to comment.</p>
      ) : (
        <ul className="space-y-4 mt-6">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{comment.author}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{new Date(comment.publishedAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => openReplyModal(comment)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Reply className="h-3.5 w-3.5" />
                  Reply
                </button>
              </div>

              {comment.replies.length > 0 && (
                <ul className="mt-4 space-y-3 pl-4 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                  {comment.replies.map((reply) => (
                    <li key={reply.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{reply.author}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{reply.content}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{new Date(reply.publishedAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {replyTo ? `Reply to ${replyTo.author}` : 'Write a comment'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {replyTo ? 'Your reply will appear under this comment right away.' : 'Your comment will be published immediately.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                className="w-full min-h-32 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                required
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {replyTo ? 'Post Reply' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleAuthSuccess}
        initialMode="signup"
      />
    </section>
  );
}
