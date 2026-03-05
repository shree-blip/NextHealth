'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, LayoutDashboard, Upload, X, Eye, EyeOff, Save, Check } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
    coverImageAlt: '',
    seoTitle: '',
    metaDesc: '',
    canonical: '',
    publishedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate ALT text from blog title
  const generateAltText = (title: string, suffix: string = '') => {
    if (!title) return suffix;
    const cleanTitle = title.trim().substring(0, 80);
    return suffix ? `${cleanTitle} - ${suffix}` : cleanTitle;
  };

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
            coverImageAlt: data.coverImageAlt || generateAltText(data.title || '', 'Cover Image'),
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
    const { name, value } = e.target;
    const updates: any = { [name]: value };
    
    // Auto-update ALT text when title changes
    if (name === 'title' && form.coverImage) {
      updates.coverImageAlt = generateAltText(value, 'Cover Image');
    }
    
    setForm({ ...form, ...updates });
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', generateAltText(form.title, 'Cover Image'));

      const response = await fetch('/api/upload/blog-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const newUrl = data.url as string;
      const newAlt = (data.alt as string) || generateAltText(form.title, 'Cover Image');

      // Update local state
      setForm(prev => ({ ...prev, coverImage: newUrl, coverImageAlt: newAlt }));
      setShowCoverUpload(false);

      // Auto-save the new cover image to the database immediately
      const saveRes = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: newUrl, coverImageAlt: newAlt }),
      });
      if (!saveRes.ok) throw new Error('Failed to save cover image to database');
    } catch (error) {
      console.error('Cover image upload failed:', error);
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setUploadingCover(false);
      // Reset the file input so the same file can be re-selected if needed
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishedAt: publish 
          ? new Date().toISOString() 
          : (form.publishedAt ? new Date(form.publishedAt).toISOString() : null),
      };
      
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error('Save failed');
      
      // Trigger sitemap revalidation if publishing
      if (publish || form.publishedAt) {
        await fetch('/api/revalidate-sitemap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: form.slug }),
        });
      }
      
      router.push('/dashboard/admin?view=blog-management');
    } catch (error) {
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
      <Footer />
    </>
  );

  const isPublished = !!form.publishedAt;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/admin?view=blog-management"
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Blog Post</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Update content and SEO settings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPublished && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-medium text-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Published
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title & Slug */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Post Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Title *</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                    placeholder="Enter post title"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">URL Slug *</label>
                  <input 
                    name="slug" 
                    value={form.slug} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors font-mono text-sm" 
                    placeholder="url-friendly-slug"
                    required 
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Excerpt</label>
                <textarea 
                  name="excerpt" 
                  value={form.excerpt} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                  rows={2}
                  placeholder="Brief summary for blog listings"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Cover Image</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <input 
                    name="coverImage" 
                    value={form.coverImage} 
                    onChange={handleChange} 
                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                    placeholder="Image URL or upload below"
                  />
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverUpload(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    {uploadingCover ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                <input 
                  name="coverImageAlt" 
                  value={form.coverImageAlt} 
                  onChange={handleChange} 
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                  placeholder="ALT text (auto-generated from title)"
                />
                {form.coverImage && (
                  <div className="relative">
                    <img src={form.coverImage} alt={form.coverImageAlt} className="w-full max-h-64 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                    <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                      <strong>ALT:</strong> {form.coverImageAlt}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Content *</h2>
              <RichTextEditor
                value={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Start writing your blog post..."
                minHeight="400px"
                blogTitle={form.title}
              />
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">SEO Settings</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">SEO Title</label>
                    <input 
                      name="seoTitle" 
                      value={form.seoTitle} 
                      onChange={handleChange} 
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                      placeholder="SEO optimized title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Canonical URL</label>
                    <input 
                      name="canonical" 
                      value={form.canonical} 
                      onChange={handleChange} 
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Meta Description</label>
                  <input 
                    name="metaDesc" 
                    value={form.metaDesc} 
                    onChange={handleChange} 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors" 
                    placeholder="Brief description for search engines (150-160 chars)"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
              <div className="flex gap-3">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {!isPublished && (
                  <button 
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="h-5 w-5" />
                    Save & Publish
                  </button>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard/admin?view=blog-management')} 
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
