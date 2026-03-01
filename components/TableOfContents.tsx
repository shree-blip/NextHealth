'use client';
import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface Props {
  html: string;
}

export default function TableOfContents({ html }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const slugify = (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/["'`]/g, '')
        .replace(/[^a-z0-9-]/g, '');

    const seen = new Map<string, number>();
    const ensureUniqueId = (baseId: string) => {
      const count = seen.get(baseId) || 0;
      seen.set(baseId, count + 1);
      return count === 0 ? baseId : `${baseId}-${count + 1}`;
    };

    const contentRoot = document.querySelector('[data-article-content]');

    if (contentRoot) {
      const els = contentRoot.querySelectorAll('h1,h2,h3,h4,h5,h6');
      const items: Heading[] = Array.from(els).map((el) => {
        const text = el.textContent || '';
        const baseId = slugify(el.id || text || 'section');
        const id = ensureUniqueId(baseId || 'section');
        el.id = id;
        return {
          id,
          text,
          level: parseInt(el.tagName.substring(1), 10),
        };
      });
      setHeadings(items);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fallbackEls = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
    const fallbackItems: Heading[] = Array.from(fallbackEls).map((el) => {
      const text = el.textContent || '';
      const id = ensureUniqueId(slugify(el.id || text || 'section'));
      return {
        id,
        text,
        level: parseInt(el.tagName.substring(1), 10),
      };
    });
    setHeadings(fallbackItems);
  }, [html]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
      <h2 className="text-base font-bold text-slate-900">Table of Contents</h2>
      <ul className="mt-3 space-y-2">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ marginLeft: (h.level - 1) * 16 }}
            className="text-sm"
          >
            <a
              href={`#${h.id}`}
              className="text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
