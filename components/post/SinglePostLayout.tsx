import { ReactNode } from 'react';
import Image from 'next/image';
import SocialShare from '@/components/SocialShare';

interface SinglePostLayoutProps {
  title: string;
  shareTitle: string;
  headerTop?: ReactNode;
  headerMeta?: ReactNode;
  coverImage?: string | null;
  coverAlt?: string;
  children: ReactNode;
}

export default function SinglePostLayout({
  title,
  shareTitle,
  headerTop,
  headerMeta,
  coverImage,
  coverAlt,
  children,
}: SinglePostLayoutProps) {
  return (
    <article className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      <header className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-5 sm:p-8 lg:p-10">
        <div className="space-y-4 min-w-0">
          {headerTop && <div>{headerTop}</div>}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight break-words">
            {title}
          </h1>
          {headerMeta && <div>{headerMeta}</div>}
        </div>
      </header>

      {coverImage && (
        <div className="relative w-full h-64 sm:h-80 lg:h-[28rem] mt-5 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
          <Image
            src={coverImage}
            alt={coverAlt || title}
            fill
            sizes="(min-width: 1024px) 80vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-5">
        <SocialShare title={shareTitle} />
      </div>

      <div className="mt-5 min-w-0">{children}</div>
    </article>
  );
}