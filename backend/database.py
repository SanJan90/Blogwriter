import sqlite3
import os
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "blogwriter.db"
PHOTOS_DIR = Path(__file__).parent / "photos"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    PHOTOS_DIR.mkdir(exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            title TEXT,
            description TEXT,
            tags TEXT DEFAULT '[]',
            category TEXT DEFAULT 'algemeen',
            width INTEGER,
            height INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            format_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            description TEXT,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    conn.close()


def get_all_photos():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM photos ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def get_photos_by_tags(keywords: list[str], limit: int = 10):
    if not keywords:
        return get_all_photos()[:limit]

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM photos")
    all_photos = [dict(row) for row in cursor.fetchall()]
    conn.close()

    scored = []
    kw_lower = [k.lower() for k in keywords]
    for photo in all_photos:
        tags = json.loads(photo.get("tags") or "[]")
        tags_lower = [t.lower() for t in tags]
        title_lower = (photo.get("title") or "").lower()
        desc_lower = (photo.get("description") or "").lower()
        cat_lower = (photo.get("category") or "").lower()

        score = 0
        for kw in kw_lower:
            for tag in tags_lower:
                if kw in tag or tag in kw:
                    score += 3
            if kw in title_lower:
                score += 2
            if kw in desc_lower:
                score += 1
            if kw in cat_lower:
                score += 2

        if score > 0:
            scored.append((score, photo))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:limit]]


def insert_photo(filename: str, filepath: str, title: str, description: str,
                  tags: list, category: str, width: int, height: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO photos (filename, filepath, title, description, tags, category, width, height)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (filename, filepath, title, description, json.dumps(tags), category, width, height))
    photo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return photo_id


def delete_photo(photo_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT filepath FROM photos WHERE id = ?", (photo_id,))
    row = cursor.fetchone()
    if row:
        filepath = row["filepath"]
        if os.path.exists(filepath):
            os.remove(filepath)
        cursor.execute("DELETE FROM photos WHERE id = ?", (photo_id,))
        conn.commit()
    conn.close()
    return row is not None


def update_photo(photo_id: int, title: str, description: str, tags: list, category: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE photos SET title=?, description=?, tags=?, category=?
        WHERE id=?
    """, (title, description, json.dumps(tags), category, photo_id))
    conn.commit()
    conn.close()


def save_blog(title: str, format_id: int, topic: str, description: str, content: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO blogs (title, format_id, topic, description, content)
        VALUES (?, ?, ?, ?, ?)
    """, (title, format_id, topic, description, content))
    blog_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return blog_id


def get_all_blogs():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, format_id, topic, status, created_at FROM blogs ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
