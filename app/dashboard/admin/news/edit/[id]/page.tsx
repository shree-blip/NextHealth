'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  EditPostShell,
  PageHeader,
  Card,
  CoverImageCard,
  SEOCard,
  ContentEditorCard,
  PublishDateCard,
  inputCls,
  labelCls,
} from '@/components/EditPostLayout';

export default function EditNewsArticle() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    publisher: 'The NextGen Healthcare Marketing',
    source: '',
    sourceUrl: '',
    sourceDate: '',
    seoTitle: '',
    metaDesc: '',
    publishedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  /* ── Load article ─────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/news/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          coverImage: data.coverImage || '',
          publisher: data.publisher || 'The NextGen Healthcare Marketing',
          source: data.source || '',
          sourceUrl: data.sourceUrl || '',
          sourceDate: data.sourceDate ? data.sourceDate.split('T')[0] : '',
          seoTitle: data.seoTitle || '',
          metaDesc: data.metaDesc || '',
          publishedAt: data.publishedAt ? data.publishedAt.split('T')[0] : '',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  /* ── Field helpers ────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* ── Cover upload ─────────────────────────────────────── */
  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('alt', form.title || file.name);
      const res = await fetch('/api/upload/blog-image', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      const data = await res.json();
      const newUrl = data.url as string;
      setForm((p) => ({ ...p, coverImage: newUrl }));
      // Auto-save to DB
      const saveRes = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage: newUrl }),
      });
      if (!saveRes.ok) throw new Error('Failed to save cover image');
    } catch (error) {
      console.error('Cover upload failed:', error);
      alert(
        `Failed to upload cover image: ${error instanceof Error ? error.message : 'Please try again.'}`,
      );
    } finally {
      setUploadingCover(false);
    }
  };

  /* ── Submit ───────────────────────────────────────────── */
  const handleSubmit = async (publish?: boolean) => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sourceDate: form.sourceDate
          ? new Date(form.sourceDate).toISOString()
          : null,
        publishedAt: publish
          ? new Date().toISOString()
          : form.publishedAt
            ? new Date(form.publishedAt).toISOString()
            : null,
      };
      const res = await fetch(`/api/admin/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      router.push('/dashboard/admin?view=news-management');
    } catch {
      alert('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const isPublished = !!form.publishedAt;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <EditPostShell loading={loading}>
      <PageHeader
        title="Edit News Article"
        subtitle="Update article content and metadata"
        backHref="/dashboard/admin?view=news-management"
        backLabel="Back"
        isPublished={isPublished}
        saving={saving}
        onSave={() => handleSubmit()}
        onPublish={() => handleSubmit(true)}
        onCancel={() => router.push('/dashboard/admin?view=news-management')}
      />

      <div className="space-y-6">
        {/* ── 1. Post Details ──────────────────────────────── */}
        <Card title="Article Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className={inputCls}
                placeholder="Enter article title"
                required
              />
            </div>
            <div>
              <label className={labelCls}>URL Slug *</label>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={`${inputCls} font-mono text-sm`}
                placeholder="url-friendly-slug"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Excerpt</label>
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="Brief summary shown in news listings"
            />
          </div>
        </Card>

        {/* ── 2. Source & Publisher ────────────────────────── */}
        <Card title="Source & Publisher">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Publisher</label>
              <input
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                className={inputCls}
                placeholder="Publisher name"
              />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. FDA, CDC, Reuters"
              />
            </div>
            <div>
              <label className={labelCls}>Source URL</label>
              <input
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                className={inputCls}
                placeholder="https://original-source.com/article"
              />
            </div>
            <div>
              <label className={labelCls}>Source Publish Date</label>
              <input
                type="date"
                name="sourceDate"
                value={form.sourceDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>
        </Card>

        {/* ── 3. SEO Settings ─────────────────────────────── */}
        <SEOCard
          seoTitle={form.seoTitle}
          metaDesc={form.metaDesc}
          canonical=""
          onSeoTitleChange={(v) => setForm((p) => ({ ...p, seoTitle: v }))}
          onMetaDescChange={(v) => setForm((p) => ({ ...p, metaDesc: v }))}
          onCanonicalChange={() => {}}
        />

        {/* ── 4. Cover Image ─────────────────────────────── */}
        <CoverImageCard
          url={form.coverImage}
          alt={form.title || 'News cover image'}
          uploading={uploadingCover}
          onUrlChange={(v) => setForm((p) => ({ ...p, coverImage: v }))}
          onAltChange={() => {}}
          onUpload={handleCoverUpload}
          onRemove={() => setForm((p) => ({ ...p, coverImage: '' }))}
        />

        {/* ── 5. Publish Status ─────────────────────────── */}
        <PublishDateCard
          publishedAt={form.publishedAt}
          onDateChange={(v) => setForm((p) => ({ ...p, publishedAt: v }))}
        />

        {/* ── 6. Content Editor ──────────────────────────── */}
        <ContentEditorCard
          content={form.content}
          onChange={(v) => setForm((p) => ({ ...p, content: v }))}
          placeholder="Start writing your news article…"
          blogTitle={form.title}
        />
      </div>
    </EditPostShell>
  );
}
