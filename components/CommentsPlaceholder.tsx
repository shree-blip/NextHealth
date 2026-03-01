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
    <section className="mt-16">
      <h2 className="text-xl font-semibold">Comments</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-slate-600">No comments yet.</p>
      ) : (
        <ul className="space-y-4 mt-4">
          {comments.map((c) => (
            <li key={c.id} className="border-b pb-2">
              <p className="text-sm font-semibold">{c.author}</p>
              <p className="text-sm">{c.content}</p>
              <p className="text-xs text-slate-500">{new Date(c.publishedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Comment</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-emerald-500 text-white rounded"
        >
          {submitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-4">
        Comments are created in pending state and must be approved via the admin
        dashboard before appearing.
      </p>
    </section>
  );
}
