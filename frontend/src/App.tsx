import React, { useState, useEffect } from 'react';
import { PenSquare, Image, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
import BlogForm from './components/BlogForm';
import BlogPreview from './components/BlogPreview';
import PhotoManager from './components/PhotoManager';
import { GeneratedBlog, BlogContent, Photo } from './types/blog';
import { checkHealth } from './api/client';

type Tab = 'generator' | 'photos';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('generator');
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(1);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    checkHealth().then((ok) => setApiStatus(ok ? 'ok' : 'error'));
  }, []);

  const handleGenerated = (result: GeneratedBlog, formatId: number) => {
    setGeneratedBlog(result);
    setSelectedFormat(formatId);
  };

  const handleReset = () => {
    setGeneratedBlog(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">BlogWriter</h1>
                <p className="text-xs text-gray-400 -mt-0.5">AI Blog Generator</p>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'generator'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PenSquare className="w-4 h-4" />
                Blog Maken
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'photos'
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Image className="w-4 h-4" />
                Fotodatabase
              </button>
            </nav>

            {/* API Status */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
                apiStatus === 'ok' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-gray-500">
                {apiStatus === 'checking' ? 'Verbinden...' :
                 apiStatus === 'ok' ? 'API verbonden' : 'API niet bereikbaar'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* API Error Banner */}
      {apiStatus === 'error' && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              Backend niet bereikbaar. Start de FastAPI server met: <code className="bg-red-100 px-1 rounded">cd backend && uvicorn main:app --reload</code>
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' ? (
          <div>
            {!generatedBlog ? (
              <div className="max-w-2xl mx-auto">
                {/* Intro */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Maak een professionele blog
                  </h2>
                  <p className="text-gray-500">
                    Kies een formaat, geef je onderwerp op en laat AI een complete blog genereren
                    met automatisch passende foto's uit jouw database.
                  </p>
                </div>
                <BlogForm onGenerated={handleGenerated} />
              </div>
            ) : (
              <BlogPreview
                blogContent={generatedBlog.blog_content}
                photos={generatedBlog.photos}
                formatId={selectedFormat}
                onReset={handleReset}
              />
            )}
          </div>
        ) : (
          <PhotoManager />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        BlogWriter · Powered by Claude AI · Voor gebruik met WordPress &amp; Joomla
      </footer>
    </div>
  );
}
