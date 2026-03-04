'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, LayoutDashboard, Upload } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewBlogPost() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    coverImageAlt: '',
    seoTitle: '',
    metaDesc: '',
    canonical: '',
    publishedAt: '',
  });
  const [showImageUpload, setShowImageUpload] = useState(false);

  const generateAltText = (title: string, suffix: string = '') => {
    if (!title) return suffix;
    const cleanTitle = title.trim().substring(0, 80);
    return suffix ? `${cleanTitle} - ${suffix}` : cleanTitle;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updates: any = { [name]: value };
    
    // Auto-update ALT text when title changes
    if (name === 'title' && form.coverImage) {
      updates.coverImageAlt = generateAltText(value, 'Cover Image');
    }
    
    setForm({ ...form, ...updates });
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({ ...form, title, slug: autoSlug(title), coverImageAlt: generateAltText(title, 'Cover Image') });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      }),
    });
    router.push('/dashboard/admin?view=blog-management');
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-scope min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <Link
              href="/dashboard/admin?view=blog-management"
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Blog Management
            </Link>
          </div>

        <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700">
          <h1 className="text-[20px] font-bold mb-1">New Blog Post</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create a new blog post with SEO-optimized content</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Title *</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleTitleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                  placeholder="Enter post title"
                  required 
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Slug *</label>
                <input 
                  name="slug" 
                  value={form.slug} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                  placeholder="url-friendly-slug"
                  required 
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block font-medium mb-1">Cover Image</label>
              <div className="flex gap-3">
                <input 
                  name="coverImage" 
                  value={form.coverImage} 
                  onChange={handleChange} 
                  className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                  placeholder="Enter image URL or upload"
                />
                <button
                  type="button"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                  className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Upload
                </button>
              </div>
              {showImageUpload && (
                <div className="mt-3 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Drag and drop an image here, or enter URL above</p>
                  <p className="text-xs text-slate-400 mt-1">Recommended: 1200x630px for social sharing</p>
                </div>
              )}
              {form.coverImage && (
                <div className="mt-3">
                  <img src={form.coverImage} alt={form.coverImageAlt} className="max-h-48 rounded-lg object-cover" />
                  <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-700 dark:text-slate-300">
                    <strong>ALT:</strong> {form.coverImageAlt}
                  </div>
                </div>
              )}
              <input 
                name="coverImageAlt" 
                value={form.coverImageAlt} 
                onChange={handleChange} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500 mt-3" 
                placeholder="ALT text (auto-generated from title)"
              />
              <p className="text-xs text-slate-500">ALT text is auto-generated from your title for SEO & accessibility</p>
            </div>

            {/* SEO Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">SEO Title</label>
                <input 
                  name="seoTitle" 
                  value={form.seoTitle} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Canonical URL</label>
                <input 
                  name="canonical" 
                  value={form.canonical} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Meta Description</label>
              <input 
                name="metaDesc" 
                value={form.metaDesc} 
                onChange={handleChange} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                placeholder="Brief description for search engines (150-160 chars)"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block font-medium mb-1">Excerpt</label>
              <textarea 
                name="excerpt" 
                value={form.excerpt} 
                onChange={handleChange} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
                rows={2}
                placeholder="Brief summary shown in blog listings"
              />
            </div>

            {/* Content - Rich Text Editor */}
            <div>
              <label className="block font-medium mb-1">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Start writing your blog post..."
                minHeight="400px"
                blogTitle={form.title}
              />
            </div>

            {/* Publish Date */}
            <div className="max-w-xs">
              <label className="block font-medium mb-1">Publish Date</label>
              <input 
                type="date" 
                name="publishedAt" 
                value={form.publishedAt} 
                onChange={handleChange} 
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500" 
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
              >
                Create Post
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard/admin?view=blog-management')} 
                className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
