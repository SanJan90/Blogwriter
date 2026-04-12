import React, { useState } from 'react';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import { BlogContent, Photo } from '../types/blog';
import Format1 from './formats/Format1';
import Format2 from './formats/Format2';
import Format3 from './formats/Format3';
import Format4 from './formats/Format4';
import ExportPanel from './ExportPanel';

interface Props {
  blogContent: BlogContent;
  photos: (Photo | null)[];
  formatId: number;
  onReset: () => void;
}

const FORMAT_COMPONENTS: Record<number, React.ComponentType<{ content: BlogContent; photos: (Photo | null)[] }>> = {
  1: Format1,
  2: Format2,
  3: Format3,
  4: Format4,
};

const FORMAT_NAMES: Record<number, string> = {
  1: 'Klassiek',
  2: 'Modern',
  3: 'Minimaal',
  4: 'Feature',
};

export default function BlogPreview({ blogContent, photos, formatId, onReset }: Props) {
  const [showExport, setShowExport] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'content'>('preview');

  const FormatComponent = FORMAT_COMPONENTS[formatId] ?? Format1;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{blogContent.title}</h2>
          <p className="text-sm text-gray-500">
            Formaat: {FORMAT_NAMES[formatId]} · {photos.filter(Boolean).length} foto's gekoppeld
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Nieuwe blog
          </button>
          <button
            onClick={() => setShowExport(!showExport)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Exporteren
          </button>
        </div>
      </div>

      {/* Export Panel */}
      {showExport && (
        <ExportPanel
          blogContent={blogContent}
          formatId={formatId}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Voorbeeld
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'content'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Inhoud bewerken
        </button>
      </div>

      {activeTab === 'preview' ? (
        <div className="bg-gray-100 rounded-xl p-4 overflow-auto">
          <div className="shadow-lg">
            <FormatComponent content={blogContent} photos={photos} />
          </div>
        </div>
      ) : (
        <ContentEditor blogContent={blogContent} />
      )}

      {/* Meta info */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO & Meta informatie</h3>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-500">Meta beschrijving:</span>
            <p className="text-sm text-gray-700 mt-0.5">{blogContent.meta_description}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {blogContent.tags?.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentEditor({ blogContent }: { blogContent: BlogContent }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Introductie</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{blogContent.intro}</p>
      </div>
      {blogContent.sections.map((section, i) => (
        <div key={i} className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{section.heading}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">{section.content}</p>
          <div className="flex flex-wrap gap-1">
            {section.image_keywords.map((kw) => (
              <span key={kw} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                📷 {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Afsluiting</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{blogContent.closing}</p>
      </div>
    </div>
  );
}
