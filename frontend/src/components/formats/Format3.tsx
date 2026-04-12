// Format 3: Minimaal - Text-heavy with smaller inline images
import React from 'react';
import { BlogContent, Photo } from '../../types/blog';
import { getPhotoUrl } from '../../api/client';

interface Props {
  content: BlogContent;
  photos: (Photo | null)[];
}

function PhotoOrPlaceholder({ photo, className, alt }: { photo: Photo | null; className?: string; alt?: string }) {
  if (photo) {
    return (
      <img
        src={getPhotoUrl(photo.id)}
        alt={photo.title || alt || 'Blog afbeelding'}
        className={`object-cover w-full h-full ${className ?? ''}`}
      />
    );
  }
  return (
    <div className={`bg-gray-200 flex items-center justify-center ${className ?? ''}`}>
      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
        <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function Format3({ content, photos }: Props) {
  const headerPhoto = photos[0] ?? null;
  const sectionPhotos = photos.slice(1, 3);
  const inspirationPhotos = photos.slice(3, 6);

  return (
    <div className="blog-preview max-w-[760px] mx-auto font-serif text-gray-800 bg-white">
      {/* Header - smaller image */}
      <div className="flex gap-4 px-6 pt-6 pb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900 mb-3">
            {content.title || 'TITEL BLOG'}
          </h1>
          <p className="text-sm leading-relaxed text-gray-700">{content.intro}</p>
        </div>
        <div className="w-48 h-36 flex-shrink-0 overflow-hidden">
          <PhotoOrPlaceholder photo={headerPhoto} className="w-full h-full" alt="Header" />
        </div>
      </div>

      <hr className="mx-6 border-gray-300" />

      {/* Sections - minimal, text-focused */}
      {content.sections.map((section, i) => (
        <div key={i} className="px-6 py-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">
            {section.heading}
          </h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs leading-relaxed text-gray-700">{section.content}</p>
            </div>
            {sectionPhotos[i] !== undefined && (
              <div className="w-32 h-24 flex-shrink-0 overflow-hidden">
                <PhotoOrPlaceholder photo={sectionPhotos[i] ?? null} className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      ))}

      <hr className="mx-6 border-gray-300 mt-2" />

      {/* Closing */}
      <div className="px-6 py-4">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
          Sluiting / Uitnodiging
        </h2>
        <p className="text-xs leading-relaxed text-gray-700">{content.closing}</p>
      </div>

      {/* Inspiration - compact */}
      <div className="px-6 py-4 bg-gray-50">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Inspiratie</h2>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 overflow-hidden">
              <PhotoOrPlaceholder photo={inspirationPhotos[i] ?? null} className="w-full h-full" alt={`Inspiratie ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-300 bg-gray-100">
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-gray-700 mb-1">Contact</p>
            <p>info@uwbedrijf.nl</p>
            <p>+31 (0)6 00 00 00 00</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Informatie</p>
            <p>Over ons</p>
            <p>Diensten</p>
            <p>Portfolio</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Blijf op de hoogte</p>
            <p className="text-xs text-gray-400">Schrijf je in voor onze nieuwsbrief</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Ontwerp gemaakt door BlogWriter | Privacybeleid | Sitemap | Voorwaarden
        </p>
      </div>
    </div>
  );
}
