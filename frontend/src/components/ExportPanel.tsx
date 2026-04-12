import React, { useState } from 'react';
import { Download, X, Loader2, FileCode, Globe, Code } from 'lucide-react';
import { BlogContent } from '../types/blog';
import { exportBlog } from '../api/client';

interface Props {
  blogContent: BlogContent;
  formatId: number;
  onClose: () => void;
}

type ExportType = 'wordpress' | 'joomla' | 'html';

const EXPORT_OPTIONS: { type: ExportType; label: string; description: string; icon: React.ReactNode; filename: string }[] = [
  {
    type: 'wordpress',
    label: 'WordPress',
    description: 'Exporteer als WordPress WXR XML bestand. Importeer via Tools > Import in WordPress.',
    icon: <Globe className="w-5 h-5" />,
    filename: 'wordpress-export.xml',
  },
  {
    type: 'joomla',
    label: 'Joomla',
    description: 'Exporteer als HTML bestand. Plak de inhoud in de Joomla artikel editor.',
    icon: <FileCode className="w-5 h-5" />,
    filename: 'joomla-article.html',
  },
  {
    type: 'html',
    label: 'HTML',
    description: 'Exporteer als puur HTML bestand voor gebruik in elk CMS of website.',
    icon: <Code className="w-5 h-5" />,
    filename: 'blog.html',
  },
];

export default function ExportPanel({ blogContent, formatId, onClose }: Props) {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const [error, setError] = useState('');

  const handleExport = async (type: ExportType, filename: string) => {
    setLoading(type);
    setError('');
    try {
      const blob = await exportBlog(blogContent, formatId, type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Export mislukt. Probeer het opnieuw.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="card border-brand-200 bg-brand-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Blog exporteren
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Kies het exportformaat dat past bij jouw CMS. De blog wordt inclusief foto-referenties geëxporteerd.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {EXPORT_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => handleExport(opt.type, opt.filename)}
            disabled={loading !== null}
            className="flex flex-col items-start gap-2 p-4 bg-white rounded-lg border border-gray-200 hover:border-brand-400 hover:shadow-sm transition-all text-left disabled:opacity-60"
          >
            <div className="flex items-center gap-2 text-brand-600">
              {loading === opt.type ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                opt.icon
              )}
              <span className="font-semibold text-gray-900">{opt.label}</span>
            </div>
            <p className="text-xs text-gray-500 leading-snug">{opt.description}</p>
            <span className="text-xs text-brand-600 font-medium flex items-center gap-1">
              <Download className="w-3 h-3" />
              {opt.filename}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Let op:</strong> Afbeeldingen worden via URL-referenties meegeëxporteerd.
          Upload de foto's ook naar je WordPress/Joomla mediabibliotheek en vervang de URL's indien nodig.
        </p>
      </div>
    </div>
  );
}
