/**
 * Input sanitization helpers for API routes.
 *
 * Since this app stores and renders HTML content (blog/news), we apply
 * tag-allowlisting for HTML fields and strict escaping for plain-text fields.
 */

/**
 * Escape HTML special characters for plain-text fields (names, slugs, etc.).
 * Prevents stored XSS when these values are rendered.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize an HTML string by stripping dangerous tags/attributes.
 * Allows safe formatting tags used in blog/news content.
 */
export function sanitizeHtml(html: string): string {
  // Remove <script> tags and their content
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol from href/src attributes
  clean = clean.replace(/(href|src|action)\s*=\s*["']?\s*javascript\s*:/gi, '$1="');

  // Remove data: protocol from src (can be used for XSS)
  clean = clean.replace(/src\s*=\s*["']?\s*data\s*:/gi, 'src="');

  // Remove <iframe>, <object>, <embed>, <form>, <input>, <textarea>, <style> tags
  clean = clean.replace(/<\/?(iframe|object|embed|form|input|textarea|style|link|meta|base)\b[^>]*>/gi, '');

  return clean;
}

/**
 * Validate and sanitize a URL string.
 * Only allows http: and https: protocols.
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validate a slug (URL-safe string): lowercase alphanumeric + hyphens only.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Sanitize a filename to prevent path traversal.
 * Strips directory separators and ".." sequences.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '');
}
