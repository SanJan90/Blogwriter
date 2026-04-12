// Format 4: Feature - Large featured image section
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
      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5" />
        <polyline points="21 15 16 10 5 21" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export default function Format4({ content, photos }: Props) {
  const headerPhoto = photos[0] ?? null;
  const featuredPhoto = photos[1] ?? null;
  const sectionPhotos = photos.slice(2, 4);
  const inspirationPhotos = photos.slice(4, 7);

  const sections = content.sections ?? [];

  return (
    <div className="blog-preview max-w-[700px] mx-auto font-serif text-gray-800 bg-white">
      {/* Large Header Image */}
      <div className="w-full h-60 overflow-hidden">
        <PhotoOrPlaceholder photo={headerPhoto} className="w-full h-full" alt="Header" />
      </div>

      {/* Title */}
      <div className="px-7 py-5 border-b border-gray-800">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">
          {content.title || 'TITEL BLOG'}
        </h1>
      </div>

      {/* Intro */}
      <div className="px-7 py-4">
        <p className="text-sm leading-loose text-gray-700">{content.intro}</p>
      </div>

      {/* Featured Section - large image with text overlay effect */}
      {sections[0] && (
        <div className="px-7 py-3">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-900">
            {sections[0].heading}
          </h2>
          <p className="text-xs leading-relaxed text-gray-700 mb-3">{sections[0].content}</p>
          {/* Large featured image */}
          <div className="w-full h-48 overflow-hidden mb-1 border border-gray-100">
            <PhotoOrPlaceholder photo={featuredPhoto} className="w-full h-full" alt="Uitgelichte afbeelding" />
          </div>
          <p className="text-xs text-gray-400 italic text-center">Maak jouw foto</p>
        </div>
      )}

      {/* Remaining Sections */}
      {sections.slice(1).map((section, i) => (
        <div key={i} className="px-7 py-3">
          <div className="flex gap-5">
            <div className="flex-1">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-900">
                {section.heading}
              </h2>
              <p className="text-xs leading-relaxed text-gray-700">{section.content}</p>
            </div>
            <div className="w-40 h-32 flex-shrink-0 overflow-hidden">
              <PhotoOrPlaceholder photo={sectionPhotos[i] ?? null} className="w-full h-full" />
            </div>
          </div>
        </div>
      ))}

      {/* Closing */}
      <div className="px-7 py-4 border-t border-gray-200 mt-2">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-3">
          Sluiting / Uitnodiging
        </h2>
        <p className="text-xs leading-relaxed text-gray-700">{content.closing}</p>
      </div>

      {/* Inspiration */}
      <div className="px-7 py-4 bg-gray-50">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Inspiratie</h2>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 overflow-hidden">
              <PhotoOrPlaceholder photo={inspirationPhotos[i] ?? null} className="w-full h-full" alt={`Inspiratie ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 border-t border-gray-300 bg-gray-100">
        <div className="grid grid-cols-3 gap-5 text-xs text-gray-500">
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
            <input
              type="email"
              placeholder="Uw e-mailadres"
              className="mt-1 px-2 py-1 border border-gray-300 rounded text-xs w-full"
              readOnly
            />
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Ontwerp gemaakt door BlogWriter | Privacybeleid | Sitemap | Voorwaarden
        </p>
      </div>
    </div>
  );
}
