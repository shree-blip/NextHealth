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
    <section className="mt-12">
      <h2 className="text-xl font-semibold">Related Posts</h2>
      <ul className="list-disc ml-5 mt-2 space-y-1">
        {posts.map((p) => (
          <li key={p.slug}>
            <a
              href={`/blog/${p.slug}`}
              className="text-blue-600 hover:underline"
            >
              {p.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
