import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Tag, Loader2, Image, X, Edit2, Check } from 'lucide-react';
import { Photo } from '../types/blog';
import { listPhotos, uploadPhoto, deletePhoto, updatePhoto, getPhotoUrl } from '../api/client';

const CATEGORIES = [
  'overig', 'natuur', 'mensen', 'zakelijk', 'eten',
  'reizen', 'interieur', 'technologie', 'sport', 'mode',
];

export default function PhotoManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', tags: '', category: '' });
  const [error, setError] = useState('');
  const [autoTag, setAutoTag] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await listPhotos();
      setPhotos(data.photos);
    } catch {
      setError('Foto\'s laden mislukt');
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    for (const file of Array.from(files)) {
      try {
        await uploadPhoto(file, autoTag);
      } catch {
        setError(`Upload mislukt voor ${file.name}`);
      }
    }
    await loadPhotos();
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze foto wilt verwijderen?')) return;
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Verwijderen mislukt');
    }
  };

  const startEdit = (photo: Photo) => {
    const tags = (() => {
      try { return JSON.parse(photo.tags || '[]'); } catch { return []; }
    })();
    setEditingId(photo.id);
    setEditForm({
      title: photo.title || '',
      description: photo.description || '',
      tags: Array.isArray(tags) ? tags.join(', ') : '',
      category: photo.category || 'overig',
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await updatePhoto(id, {
        title: editForm.title,
        description: editForm.description,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category: editForm.category,
      });
      await loadPhotos();
      setEditingId(null);
    } catch {
      setError('Opslaan mislukt');
    }
  };

  const parseTags = (tagsJson: string): string[] => {
    try { return JSON.parse(tagsJson || '[]'); } catch { return []; }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fotodatabase</h2>
          <p className="text-sm text-gray-500">{photos.length} foto's beschikbaar</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={autoTag}
            onChange={(e) => setAutoTag(e.target.checked)}
            className="rounded"
          />
          AI auto-tags
        </label>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm text-gray-600">Uploaden{autoTag ? ' en AI-analyse...' : '...'}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">Sleep foto's hier naartoe</p>
            <p className="text-xs text-gray-400">of klik om te bladeren · JPEG, PNG, WebP</p>
            {autoTag && (
              <p className="text-xs text-brand-600">
                ✨ AI analyseert de foto's automatisch en voegt tags toe
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Photo Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nog geen foto's. Upload de eerste foto om te beginnen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative h-32 bg-gray-100">
                <img
                  src={getPhotoUrl(photo.id)}
                  alt={photo.title || photo.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(photo)}
                    className="p-1 bg-white rounded shadow text-gray-600 hover:text-brand-600"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1 bg-white rounded shadow text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Info / Edit form */}
              {editingId === photo.id ? (
                <div className="p-2 space-y-1.5">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Titel"
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="Tags (kommagescheiden)"
                    className="w-full px-2 py-1 text-xs border rounded"
                  />
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border rounded"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => saveEdit(photo.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-brand-600 text-white text-xs rounded"
                    >
                      <Check className="w-3 h-3" /> Opslaan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      <X className="w-3 h-3" /> Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {photo.title || photo.filename}
                  </p>
                  <p className="text-xs text-gray-400">{photo.category}</p>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {parseTags(photo.tags).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-1 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {parseTags(photo.tags).length > 3 && (
                      <span className="text-xs text-gray-400">+{parseTags(photo.tags).length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
