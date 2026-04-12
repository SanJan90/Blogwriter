import React from 'react';
import { BLOG_FORMATS, BlogFormat } from '../types/blog';
import clsx from 'clsx';

interface Props {
  selectedFormat: number;
  onSelect: (id: number) => void;
}

const FormatPreviews: Record<number, React.ReactNode> = {
  1: (
    <div className="w-full h-full p-1.5 space-y-1 bg-white">
      <div className="w-full h-6 bg-gray-200 rounded-sm" />
      <div className="w-1/2 h-2 bg-gray-300 rounded-sm" />
      <div className="flex gap-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded-sm flex-shrink-0" />
      </div>
      <div className="flex gap-1">
        <div className="w-8 h-8 bg-gray-300 rounded-sm flex-shrink-0" />
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded-sm flex-shrink-0" />
      </div>
    </div>
  ),
  2: (
    <div className="w-full h-full p-1.5 space-y-1 bg-white">
      <div className="w-full h-8 bg-gray-200 rounded-sm" />
      <div className="w-1/2 h-2 bg-gray-300 rounded-sm" />
      <div className="flex gap-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
        </div>
        <div className="w-10 h-10 bg-gray-300 rounded-sm flex-shrink-0" />
      </div>
      <div className="space-y-0.5">
        <div className="h-1.5 bg-gray-200 rounded-sm" />
        <div className="h-1.5 bg-gray-200 rounded-sm" />
        <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
      </div>
      <div className="flex gap-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
        <div className="w-10 h-8 bg-gray-300 rounded-sm flex-shrink-0" />
      </div>
    </div>
  ),
  3: (
    <div className="w-full h-full p-1.5 space-y-1 bg-white">
      <div className="flex gap-1">
        <div className="flex-1">
          <div className="w-3/4 h-2.5 bg-gray-300 rounded-sm mb-1" />
          <div className="space-y-0.5">
            <div className="h-1.5 bg-gray-200 rounded-sm" />
            <div className="h-1.5 bg-gray-200 rounded-sm" />
            <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
          </div>
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-sm flex-shrink-0" />
      </div>
      <div className="space-y-0.5 mt-1">
        <div className="h-1.5 bg-gray-300 rounded-sm w-1/3" />
        <div className="h-1.5 bg-gray-200 rounded-sm" />
        <div className="h-1.5 bg-gray-200 rounded-sm" />
        <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
      </div>
      <div className="flex gap-1 mt-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/3" />
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-sm flex-shrink-0" />
      </div>
    </div>
  ),
  4: (
    <div className="w-full h-full p-1.5 space-y-1 bg-white">
      <div className="w-full h-8 bg-gray-200 rounded-sm" />
      <div className="w-1/2 h-2 bg-gray-300 rounded-sm" />
      <div className="space-y-0.5">
        <div className="h-1.5 bg-gray-200 rounded-sm" />
        <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
      </div>
      <div className="w-full h-10 bg-gray-300 rounded-sm" />
      <div className="flex gap-1">
        <div className="flex-1 space-y-0.5">
          <div className="h-1.5 bg-gray-300 rounded-sm w-1/2" />
          <div className="h-1.5 bg-gray-200 rounded-sm" />
          <div className="h-1.5 bg-gray-200 rounded-sm w-4/5" />
        </div>
        <div className="w-8 h-10 bg-gray-300 rounded-sm flex-shrink-0" />
      </div>
    </div>
  ),
};

export default function FormatSelector({ selectedFormat, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {BLOG_FORMATS.map((format) => (
        <button
          key={format.id}
          onClick={() => onSelect(format.id)}
          className={clsx(
            'flex flex-col rounded-xl border-2 overflow-hidden transition-all hover:shadow-md text-left',
            selectedFormat === format.id
              ? 'border-brand-600 shadow-md ring-2 ring-brand-200'
              : 'border-gray-200 hover:border-gray-300'
          )}
        >
          {/* Preview thumbnail */}
          <div className="h-40 bg-gray-50 border-b border-gray-100 overflow-hidden">
            {FormatPreviews[format.id]}
          </div>
          {/* Info */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-900">{format.name}</span>
              {selectedFormat === format.id && (
                <span className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-snug">{format.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
