export interface BlogSection {
  heading: string;
  content: string;
  image_keywords: string[];
}

export interface BlogContent {
  title: string;
  meta_description: string;
  intro: string;
  sections: BlogSection[];
  closing: string;
  inspiration_keywords: string[];
  tags: string[];
  photo_ids?: number[];
}

export interface Photo {
  id: number;
  filename: string;
  filepath: string;
  title: string;
  description: string;
  tags: string;
  category: string;
  width: number;
  height: number;
  created_at: string;
}

export interface GeneratedBlog {
  blog_content: BlogContent;
  photos: (Photo | null)[];
  total_photos_available: number;
}

export interface BlogFormat {
  id: number;
  name: string;
  description: string;
  sections: number;
  imageLayout: string;
}

export const BLOG_FORMATS: BlogFormat[] = [
  {
    id: 1,
    name: 'Klassiek',
    description: 'Afwisselend tekst-links/afbeelding-rechts layout met 3 secties',
    sections: 3,
    imageLayout: 'alternating',
  },
  {
    id: 2,
    name: 'Modern',
    description: 'Afbeeldingen consistent rechts, ruime tekstblokken, 3 secties',
    sections: 3,
    imageLayout: 'right',
  },
  {
    id: 3,
    name: 'Minimaal',
    description: 'Tekst-georiënteerd met kleinere afbeeldingen, 2 secties',
    sections: 2,
    imageLayout: 'minimal',
  },
  {
    id: 4,
    name: 'Feature',
    description: 'Grote uitgelichte afbeelding sectie, 3 secties',
    sections: 3,
    imageLayout: 'featured',
  },
];
