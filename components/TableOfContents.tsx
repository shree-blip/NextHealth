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
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const els = doc.querySelectorAll('h1,h2,h3,h4,h5,h6');
    const items: Heading[] = Array.from(els).map((el) => {
      let id = el.id;
      if (!id) {
        id = (el.textContent || '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/["'`]/g, '');
        el.id = id;
      }
      return {
        id,
        text: el.textContent || '',
        level: parseInt(el.tagName.substr(1)),
      };
    });
    setHeadings(items);
  }, [html]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc mb-8 p-4 bg-slate-100 rounded">
      <h2 className="font-semibold">Table of Contents</h2>
      <ul className="mt-2">
        {headings.map((h) => (
          <li
            key={h.id}
            style={{ marginLeft: (h.level - 1) * 16 }}
            className="text-sm"
          >
            <a
              href={`#${h.id}`}
              className="text-blue-500 hover:underline"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
