'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewNewsArticle() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    source: '',
    seoTitle: '',
    metaDesc: '',
    publishedAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({ ...form, title, slug: autoSlug(title) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      }),
    });
    router.push('/dashboard/admin/news');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold mb-6">New Healthcare News Article</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input name="title" value={form.title} onChange={handleTitleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Cover Image URL</label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="/1.png" />
          </div>
          <div>
            <label className="block font-medium mb-1">Source (e.g. FDA, CDC, Reuters)</label>
            <input name="source" value={form.source} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">SEO Title</label>
            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Meta Description</label>
            <input name="metaDesc" value={form.metaDesc} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Excerpt</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block font-medium mb-1">Content (HTML supported)</label>
            <textarea name="content" value={form.content} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={12} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Publish Date</label>
            <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">Create</button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
