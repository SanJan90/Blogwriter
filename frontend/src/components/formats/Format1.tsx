// Format 1: Klassiek - Alternating text-left/image-right layout
import React from 'react';
import { BlogContent, Photo } from '../../types/blog';
import { getPhotoUrl } from '../../api/client';

interface Props {
  content: BlogContent;
  photos: (Photo | null)[];
}

function PhotoOrPlaceholder({
  photo,
  className,
  alt,
}: {
  photo: Photo | null;
  className?: string;
  alt?: string;
}) {
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
    <div className={`placeholder-image bg-gray-200 flex items-center justify-center ${className ?? ''}`}>
      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
        <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function Format1({ content, photos }: Props) {
  const headerPhoto = photos[0] ?? null;
  const sectionPhotos = photos.slice(1, 4);
  const inspirationPhotos = photos.slice(4, 7);

  return (
    <div className="blog-preview max-w-[680px] mx-auto font-serif text-gray-800 bg-white">
      {/* Header Image */}
      <div className="w-full h-52 overflow-hidden mb-2">
        <PhotoOrPlaceholder photo={headerPhoto} className="w-full h-full" alt="Header" />
      </div>

      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-300">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">
          {content.title || 'TITEL BLOG'}
        </h1>
      </div>

      {/* Intro */}
      <div className="px-6 py-4">
        <p className="text-sm leading-relaxed text-gray-700">{content.intro}</p>
      </div>

      {/* Sections - Alternating */}
      {content.sections.map((section, i) => (
        <div key={i} className="px-6 py-3">
          {i % 2 === 0 ? (
            // Text left, image right
            <div className="flex gap-4">
              <div className="flex-1">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">
                  {section.heading}
                </h2>
                <p className="text-xs leading-relaxed text-gray-700">{section.content}</p>
              </div>
              <div className="w-36 h-28 flex-shrink-0 overflow-hidden">
                <PhotoOrPlaceholder photo={sectionPhotos[i] ?? null} className="w-full h-full" />
              </div>
            </div>
          ) : (
            // Image left, text right
            <div className="flex gap-4">
              <div className="w-36 h-28 flex-shrink-0 overflow-hidden">
                <PhotoOrPlaceholder photo={sectionPhotos[i] ?? null} className="w-full h-full" />
              </div>
              <div className="flex-1">
                <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">
                  {section.heading}
                </h2>
                <p className="text-xs leading-relaxed text-gray-700">{section.content}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Closing */}
      <div className="px-6 py-4 border-t border-gray-200 mt-2">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-2">
          Sluiting / Uitnodiging
        </h2>
        <p className="text-xs leading-relaxed text-gray-700">{content.closing}</p>
      </div>

      {/* Inspiration */}
      <div className="px-6 py-4 bg-gray-50">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3">Inspiratie</h2>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 overflow-hidden">
              <PhotoOrPlaceholder
                photo={inspirationPhotos[i] ?? null}
                className="w-full h-full"
                alt={`Inspiratie ${i + 1}`}
              />
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
          Ontwerp gemaakt door BlogWriter | Privacybeleid | Sitemap | Voorwaarden | Privacy beleid
        </p>
      </div>
    </div>
  );
}
