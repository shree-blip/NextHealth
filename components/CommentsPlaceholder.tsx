'use client';

import { useEffect, useState } from 'react';

interface Comment {
  id: number;
  author: string;
  content: string;
  publishedAt: string;
}

export default function CommentsPlaceholder() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const slug = parts[parts.length - 1] || '';
    fetch(`/api/posts/${slug}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return;
    setSubmitting(true);
    try {
      const parts = window.location.pathname.split('/');
      const slug = parts[parts.length - 1] || '';
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setAuthor('');
        setContent('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Comments</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-slate-600 mt-3">No comments yet.</p>
      ) : (
        <ul className="space-y-4 mt-5">
          {comments.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{c.author}</p>
              <p className="text-sm text-slate-700 mt-1">{c.content}</p>
              <p className="text-xs text-slate-500 mt-2">{new Date(c.publishedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800">Name</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800">Comment</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border border-slate-300 rounded-xl p-2.5 bg-white min-h-28 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-5">
        Comments are created in pending state and must be approved via the admin
        dashboard before appearing.
      </p>
    </section>
  );
}
