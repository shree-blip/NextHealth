'use client';

interface MapSectionProps {
  address: string;
  /**
   * Latitude of the pin. Defaults to The NextGen Healthcare Marketing office
   * in Irving, TX (32.8613° N). Pass an explicit value when embedding a
   * different location.
   */
  lat?: number;
  /**
   * Longitude of the pin. Defaults to -96.9850° (Irving, TX office).
   */
  lng?: number;
}

/**
 * Embeds an OpenStreetMap tile iframe.
 *
 * NOTE: The old maps.google.com/maps?output=embed URL was deprecated by
 * Google and now returns a blank/error page without a Maps Platform API key.
 * OpenStreetMap is free, requires no API key, and renders reliably.
 */
export default function MapSection({
  address,
  lat = 32.8613,
  lng = -96.985,
}: MapSectionProps) {
  // Build a tight bounding box around the pin (±0.02°) so the map is
  // zoomed in enough to clearly show the office location.
  const delta = 0.02;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;

  const osmSrc =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${encodeURIComponent(bbox)}` +
    `&layer=mapnik` +
    `&marker=${lat}%2C${lng}`;

  // Link opens full Google Maps for directions in a new tab.
  const googleMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <iframe
        title={`Map showing ${address}`}
        width="100%"
        height="400"
        src={osmSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        style={{ border: 0, display: 'block' }}
      />
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 text-sm text-slate-600">
        <span>{address}</span>
        <a
          href={googleMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap transition-colors"
        >
          Open in Google Maps
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h4a.75.75 0 010 1.5h-4zm6.5-1a.75.75 0 010-1.5h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-3.97 3.97a.75.75 0 11-1.06-1.06l3.97-3.97H10.75z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
}
