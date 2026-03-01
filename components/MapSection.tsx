'use client';

interface MapSectionProps {
  address: string;
}

export default function MapSection({ address }: MapSectionProps) {
  // use a simple Google Maps embed based on the provided address
  const encoded = encodeURIComponent(address);
  const src = `https://maps.google.com/maps?q=${encoded}&output=embed`;

  return (
    <div className="w-full h-96 overflow-hidden">
      <iframe
        title="Our location"
        width="100%"
        height="100%"
        frameBorder="0"
        src={src}
        allowFullScreen
        className="border-0"
      />
    </div>
  );
}
