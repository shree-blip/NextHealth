'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBlogPost() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    seoTitle: '',
    metaDesc: '',
    canonical: '',
    publishedAt: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/admin/posts/${id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            seoTitle: data.seoTitle || '',
            metaDesc: data.metaDesc || '',
            canonical: data.canonical || '',
            publishedAt: data.publishedAt ? data.publishedAt.split('T')[0] : '',
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      }),
    });
    router.push('/dashboard/admin/blog');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Cover Image URL</label>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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
            <label className="block font-medium mb-1">Canonical URL</label>
            <input name="canonical" value={form.canonical} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block font-medium mb-1">Excerpt</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div>
            <label className="block font-medium mb-1">Content (Markdown supported)</label>
            <textarea name="content" value={form.content} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={10} required />
          </div>
          <div>
            <label className="block font-medium mb-1">Publish Date</label>
            <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">Save</button>
        </form>
      </div>
    </div>
  );
}
