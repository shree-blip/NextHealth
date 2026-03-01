'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  source: string | null;
  publishedAt: string | null;
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    setArticles(articles.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Healthcare News Management</h1>
            <p className="text-slate-500 mt-1">Create and manage healthcare news articles</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/admin" className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">
              ← Back to Admin
            </Link>
            <Link href="/dashboard/admin/news/new" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">
              + New Article
            </Link>
          </div>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-500">No news articles yet. Create your first one!</p>
        ) : (
          <ul className="space-y-4">
            {articles.map(article => (
              <li key={article.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  {article.coverImage && <img src={article.coverImage} alt="" className="w-20 h-14 object-cover rounded-lg" />}
                  <div>
                    <div className="font-bold text-slate-900">{article.title}</div>
                    <div className="text-sm text-slate-500 flex gap-3 mt-1">
                      <span>/{article.slug}</span>
                      {article.source && <span className="text-emerald-600">Source: {article.source}</span>}
                      {article.publishedAt && <span>{new Date(article.publishedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/admin/news/edit/${article.id}`} className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-400">Edit</Link>
                  <button onClick={() => handleDelete(article.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-400">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
