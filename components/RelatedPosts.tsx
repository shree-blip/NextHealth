interface PostLink {
  slug: string;
  title: string;
}

interface Props {
  posts: PostLink[];
}

export default function RelatedPosts({ posts }: Props) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Related Posts</h2>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {posts.map((p) => (
          <a
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-white hover:shadow-sm transition-all"
          >
            <span className="font-medium text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {p.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
