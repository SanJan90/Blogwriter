import axios from 'axios';
import { BlogContent, Photo, GeneratedBlog } from '../types/blog';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api',
  timeout: 120000,
});

// ─── Blog API ────────────────────────────────────────────────────────────────

export async function generateBlog(
  topic: string,
  description: string,
  formatId: number,
  language: string = 'nl'
): Promise<GeneratedBlog> {
  const res = await api.post('/blog/generate', {
    topic,
    description,
    format_id: formatId,
    language,
  });
  return res.data;
}

export async function exportBlog(
  blogContent: BlogContent,
  formatId: number,
  exportType: 'wordpress' | 'joomla' | 'html'
): Promise<Blob> {
  const res = await api.post(
    '/blog/export',
    { blog_content: blogContent, format_id: formatId, export_type: exportType },
    { responseType: 'blob' }
  );
  return res.data;
}

export async function listBlogs() {
  const res = await api.get('/blog/list');
  return res.data;
}

// ─── Photo API ───────────────────────────────────────────────────────────────

export async function listPhotos(): Promise<{ photos: Photo[]; total: number }> {
  const res = await api.get('/photos');
  return res.data;
}

export async function uploadPhoto(
  file: File,
  autoTag: boolean = true,
  title: string = '',
  description: string = '',
  tags: string[] = [],
  category: string = 'overig'
): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('auto_tag', autoTag ? 'true' : 'false');
  formData.append('title', title);
  formData.append('description', description);
  formData.append('tags', JSON.stringify(tags));
  formData.append('category', category);

  const res = await api.post('/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return res.data;
}

export async function updatePhoto(
  photoId: number,
  data: { title: string; description: string; tags: string[]; category: string }
): Promise<void> {
  await api.put(`/photos/${photoId}`, data);
}

export async function deletePhoto(photoId: number): Promise<void> {
  await api.delete(`/photos/${photoId}`);
}

export function getPhotoUrl(photoId: number): string {
  return `/api/photos/serve/${photoId}`;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

