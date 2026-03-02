'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  metaDesc: string | null;
  publishedAt: string | null;
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="dashboard-scope min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <Link href="/dashboard/admin/blog/new" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500">
            + New Post
          </Link>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p>No posts yet. Create your first post!</p>
        ) : (
          <ul className="space-y-4">
            {posts.map(post => (
              <li key={post.id} className="bg-white dark:bg-slate-900 p-4 rounded shadow dark:shadow-slate-800 flex justify-between items-center border dark:border-slate-700">
                <div className="flex gap-4 items-center">
                  {post.coverImage && <img src={post.coverImage} alt="" className="w-16 h-16 object-cover rounded" />}
                  <div>
                    <div className="font-bold">{post.title}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{post.slug}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/admin/blog/edit/${post.id}`} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</Link>
                  <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
