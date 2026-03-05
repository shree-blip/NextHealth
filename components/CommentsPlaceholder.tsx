'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Reply, Send, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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

interface SuccessNotification {
  id: string;
  message: string;
}

export default function CommentsPlaceholder() {
  const { user, refreshUser } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessNotification | null>(null);
  const [lastPollTime, setLastPollTime] = useState<Date>(new Date());

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
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setIsLoading(false);
    }
  }, [slug]);

  // Initial load
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Polling for real-time updates every 3 seconds
  useEffect(() => {
    if (!slug) return;
    const pollInterval = setInterval(() => {
      fetchComments();
      setLastPollTime(new Date());
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [slug, fetchComments]);

  // Auto-dismiss success notification after 4 seconds
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 4000);
    return () => clearTimeout(timer);
  }, [success]);

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
      const payload: Record<string, any> = { content: content.trim() };
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
      setSuccess({
        id: Date.now().toString(),
        message: replyTo ? 'Reply posted successfully!' : 'Comment posted successfully!',
      });
      await fetchComments();
    } catch (err: any) {
      setError(err?.message || 'Failed to post comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Comments
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isLoading ? 'Loading...' : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`}
            </p>
          </div>
        </div>
        <motion.button
          onClick={openNewCommentModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </motion.button>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 px-4 py-3 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10, x: 20 }}
            className="fixed top-20 right-4 z-[200] rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 px-4 py-3 flex items-center gap-3 shadow-lg"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{success.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments List */}
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center justify-center py-12"
          >
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </motion.div>
        ) : comments.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-slate-600 dark:text-slate-300 mt-6"
          >
            No comments yet. Be the first to share your thoughts!
          </motion.p>
        ) : (
          <ul className="space-y-4 mt-6">
            {comments.map((comment) => (
              <motion.li
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {comment.author}
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <time className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(comment.publishedAt).toLocaleString()}
                      </time>
                      <motion.button
                        onClick={() => openReplyModal(comment)}
                        whileHover={{ scale: 1.05 }}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        Reply
                      </motion.button>
                    </div>
                  </div>
                  <Reply className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <ul className="mt-4 space-y-3 pl-4 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                    {comment.replies.map((reply) => (
                      <motion.li
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {reply.author}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                        <time className="text-xs text-slate-500 dark:text-slate-400 mt-2 block">
                          {new Date(reply.publishedAt).toLocaleString()}
                        </time>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.li>
            ))}
          </ul>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {replyTo ? `Reply to ${replyTo.author}` : 'Write a comment'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {replyTo
                      ? 'Your reply will appear under this comment right away.'
                      : 'Share your thoughts with the community.'}
                  </p>
                </div>
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={replyTo ? 'Write your reply...' : 'Share your thoughts...'}
                  className="w-full min-h-32 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                  required
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {content.length}/2000 characters
                  </p>
                  <div className="flex items-center justify-end gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl px-4 py-2.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !content.trim()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {replyTo ? 'Post Reply' : 'Post Comment'}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
