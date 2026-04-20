import os
import json
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from database import (
    init_db, get_all_photos, get_photos_by_tags, insert_photo,
    delete_photo, update_photo, save_blog, get_all_blogs
)
from services.ai_service import generate_blog_content, analyze_image_tags
from services.export_service import (
    generate_wordpress_xml, generate_joomla_html, blog_content_to_html
)

PHOTOS_DIR = Path(__file__).parent / "photos"

app = FastAPI(title="BlogWriter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://blogwriters.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


# ─── Models ────────────────────────────────────────────────────────────────────

class BlogGenerateRequest(BaseModel):
    topic: str
    description: str
    format_id: int
    language: str = "nl"


class BlogExportRequest(BaseModel):
    blog_content: dict
    format_id: int
    export_type: str  # "wordpress" | "joomla" | "html"


class PhotoUpdateRequest(BaseModel):
    title: str
    description: str
    tags: list[str]
    category: str


# ─── Blog Endpoints ─────────────────────────────────────────────────────────────

@app.post("/api/blog/generate")
async def generate_blog(request: BlogGenerateRequest):
    """Generate blog content using Claude AI."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Onderwerp is verplicht")

    blog_content = generate_blog_content(
        topic=request.topic,
        description=request.description,
        format_id=request.format_id,
        language=request.language
    )

    # Gather all keywords to find matching photos
    all_keywords = []
    for section in blog_content.get("sections", []):
        all_keywords.extend(section.get("image_keywords", []))
    all_keywords.extend(blog_content.get("inspiration_keywords", []))
    all_keywords.append(request.topic)

    # Find matching photos
    matched_photos = get_photos_by_tags(all_keywords, limit=10)

    # Match specific photos to sections
    sections = blog_content.get("sections", [])
    photo_assignments = []

    # Header photo
    header_keywords = [request.topic] + blog_content.get("tags", [])[:2]
    header_photos = get_photos_by_tags(header_keywords, limit=1)
    photo_assignments.append(header_photos[0] if header_photos else None)

    # Section photos
    for section in sections:
        section_photos = get_photos_by_tags(section.get("image_keywords", []), limit=1)
        photo_assignments.append(section_photos[0] if section_photos else None)

    # Inspiration photos
    insp_keywords = blog_content.get("inspiration_keywords", [])
    insp_photos = get_photos_by_tags(insp_keywords, limit=3)
    photo_assignments.extend(insp_photos)

    # Remove None entries and deduplicate
    seen_ids = set()
    unique_photos = []
    for p in photo_assignments:
        if p is None:
            unique_photos.append(None)
        elif p["id"] not in seen_ids:
            seen_ids.add(p["id"])
            unique_photos.append(p)
        else:
            unique_photos.append(None)

    return {
        "blog_content": blog_content,
        "photos": unique_photos,
        "total_photos_available": len(get_all_photos())
    }


@app.get("/api/blog/list")
async def list_blogs():
    return get_all_blogs()


@app.post("/api/blog/export")
async def export_blog(request: BlogExportRequest):
    """Export blog in WordPress, Joomla, or plain HTML format."""
    blog_content = request.blog_content
    format_id = request.format_id

    # Gather photos referenced in the content
    photo_ids = blog_content.get("photo_ids", [])
    photos = []
    if photo_ids:
        all_photos = {p["id"]: p for p in get_all_photos()}
        photos = [all_photos.get(pid) for pid in photo_ids]
    else:
        # Use keyword matching to find photos
        all_keywords = []
        for section in blog_content.get("sections", []):
            all_keywords.extend(section.get("image_keywords", []))
        all_keywords.extend(blog_content.get("inspiration_keywords", []))
        photos = get_photos_by_tags(all_keywords, limit=10)

    html_content = blog_content_to_html(blog_content, format_id, photos)

    meta = {
        "title": blog_content.get("title", ""),
        "meta_description": blog_content.get("meta_description", ""),
        "tags": blog_content.get("tags", []),
        "html_content": html_content,
    }

    if request.export_type == "wordpress":
        xml_content = generate_wordpress_xml(blog_content, meta)
        return Response(
            content=xml_content,
            media_type="application/xml",
            headers={"Content-Disposition": "attachment; filename=wordpress-export.xml"}
        )
    elif request.export_type == "joomla":
        joomla_content = generate_joomla_html(blog_content, meta)
        return Response(
            content=joomla_content,
            media_type="text/html",
            headers={"Content-Disposition": "attachment; filename=joomla-article.html"}
        )
    elif request.export_type == "html":
        return Response(
            content=html_content,
            media_type="text/html",
            headers={"Content-Disposition": "attachment; filename=blog.html"}
        )
    else:
        raise HTTPException(status_code=400, detail="Ongeldig export type. Gebruik: wordpress, joomla, of html")


# ─── Photo Endpoints ────────────────────────────────────────────────────────────

@app.get("/api/photos")
async def list_photos():
    photos = get_all_photos()
    return {"photos": photos, "total": len(photos)}


@app.post("/api/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    auto_tag: bool = Form(True),
    title: str = Form(""),
    description: str = Form(""),
    tags: str = Form("[]"),
    category: str = Form("overig"),
):
    """Upload a photo and optionally auto-tag it with AI."""
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Alleen JPEG, PNG, GIF en WebP afbeeldingen zijn toegestaan")

    ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{ext}"
    filepath = PHOTOS_DIR / unique_filename

    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Get image dimensions
    try:
        from PIL import Image
        with Image.open(filepath) as img:
            width, height = img.size
    except Exception:
        width, height = 0, 0

    # Parse tags
    try:
        tags_list = json.loads(tags) if tags else []
    except Exception:
        tags_list = []

    # Auto-tag with AI if requested
    if auto_tag:
        try:
            ai_result = analyze_image_tags(str(filepath))
            if not title:
                title = ai_result.get("title", file.filename)
            if not description:
                description = ai_result.get("description", "")
            if not tags_list:
                tags_list = ai_result.get("tags", [])
            if category == "overig":
                category = ai_result.get("category", "overig")
        except Exception as e:
            print(f"AI tagging failed: {e}")
            if not title:
                title = file.filename

    photo_id = insert_photo(
        filename=unique_filename,
        filepath=str(filepath),
        title=title or file.filename,
        description=description,
        tags=tags_list,
        category=category,
        width=width,
        height=height,
    )

    return {
        "id": photo_id,
        "filename": unique_filename,
        "title": title,
        "description": description,
        "tags": tags_list,
        "category": category,
        "width": width,
        "height": height,
    }


@app.get("/api/photos/serve/{photo_id}")
async def serve_photo(photo_id: int):
    photos = get_all_photos()
    photo = next((p for p in photos if p["id"] == photo_id), None)
    if not photo:
        raise HTTPException(status_code=404, detail="Foto niet gevonden")

    filepath = Path(photo["filepath"])
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Fotobestand niet gevonden")

    return FileResponse(str(filepath))


@app.put("/api/photos/{photo_id}")
async def update_photo_endpoint(photo_id: int, request: PhotoUpdateRequest):
    update_photo(photo_id, request.title, request.description, request.tags, request.category)
    return {"success": True}


@app.delete("/api/photos/{photo_id}")
async def delete_photo_endpoint(photo_id: int):
    success = delete_photo(photo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Foto niet gevonden")
    return {"success": True}


@app.post("/api/photos/match")
async def match_photos(keywords: list[str]):
    """Find photos matching given keywords."""
    photos = get_photos_by_tags(keywords, limit=10)
    return {"photos": photos}


# ─── Health ─────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
