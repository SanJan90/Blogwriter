import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import FormatSelector from './FormatSelector';
import { generateBlog } from '../api/client';
import { GeneratedBlog } from '../types/blog';

interface Props {
  onGenerated: (result: GeneratedBlog, formatId: number) => void;
}

export default function BlogForm({ onGenerated }: Props) {
  const [formatId, setFormatId] = useState(1);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('nl');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Vul een onderwerp in');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await generateBlog(topic, description, formatId, language);
      onGenerated(result, formatId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Genereren mislukt. Controleer of de API sleutel is ingesteld.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Format Selection */}
      <div>
        <label className="label text-base font-semibold text-gray-900 mb-3 block">
          Stap 1: Kies een blog formaat
        </label>
        <FormatSelector selectedFormat={formatId} onSelect={setFormatId} />
      </div>

      {/* Topic & Description */}
      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-gray-900">
          Stap 2: Beschrijf je blog
        </h3>

        <div>
          <label htmlFor="topic" className="label">
            Onderwerp <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Bijv. De voordelen van duurzaam ondernemen"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Uitleg & context
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschrijf waar de blog over moet gaan, welke punten behandeld moeten worden, de doelgroep, tone of voice, etc."
            className="input-field h-32 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            Hoe meer context je geeft, hoe beter de blog aansluit bij je wensen.
          </p>
        </div>

        <div>
          <label htmlFor="language" className="label">
            Taal
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-field"
          >
            <option value="nl">Nederlands</option>
            <option value="en">Engels</option>
            <option value="de">Duits</option>
            <option value="fr">Frans</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !topic.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Blog wordt gegenereerd... (dit duurt ca. 30 seconden)
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Genereer Blog
          </>
        )}
      </button>
    </form>
  );
}
