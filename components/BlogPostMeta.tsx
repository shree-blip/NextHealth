'use client';

import { useSitePreferences } from '@/components/SitePreferencesProvider';

interface BlogPostMetaProps {
  authorName: string | null;
  publishedAt: string | null;
}

export default function BlogPostMeta({ authorName, publishedAt }: BlogPostMetaProps) {
  const { t, language } = useSitePreferences();
  const dateLocale = language === 'es' ? 'es-US' : 'en-US';
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString(dateLocale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {authorName && (
        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 px-3 py-1 font-medium">
          {t('By')} {authorName}
        </span>
      )}
      {formattedDate && (
        <time className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-100 px-3 py-1 font-medium">
          {formattedDate}
        </time>
      )}
    </div>
  );
}
