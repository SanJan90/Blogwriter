import json
from datetime import datetime
from xml.etree import ElementTree as ET


def generate_wordpress_xml(blog_data: dict, blog_meta: dict) -> str:
    """Generate WordPress WXR (XML) export format."""
    title = blog_meta.get("title", "Blog Post")
    content = blog_meta.get("html_content", "")
    pub_date = datetime.now().strftime("%a, %d %b %Y %H:%M:%S +0000")
    slug = title.lower().replace(" ", "-").replace("'", "")[:50]

    wxr = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>Blog Export</title>
    <link>https://yoursite.com</link>
    <description>Blog posts exported from BlogWriter</description>
    <pubDate>{pub_date}</pubDate>
    <language>nl</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>https://yoursite.com</wp:base_site_url>
    <wp:base_blog_url>https://yoursite.com</wp:base_blog_url>
    <item>
      <title>{_xml_escape(title)}</title>
      <link>https://yoursite.com/{slug}/</link>
      <pubDate>{pub_date}</pubDate>
      <dc:creator>admin</dc:creator>
      <content:encoded><![CDATA[{content}]]></content:encoded>
      <excerpt:encoded><![CDATA[{_xml_escape(blog_meta.get("meta_description", ""))}]]></excerpt:encoded>
      <wp:post_date>{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</wp:post_date>
      <wp:post_date_gmt>{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</wp:post_date_gmt>
      <wp:comment_status>open</wp:comment_status>
      <wp:ping_status>open</wp:ping_status>
      <wp:post_name>{slug}</wp:post_name>
      <wp:status>draft</wp:status>
      <wp:post_type>post</wp:post_type>
      <wp:post_password></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
      {_generate_wp_tags(blog_meta.get("tags", []))}
    </item>
  </channel>
</rss>"""
    return wxr


def _generate_wp_tags(tags: list) -> str:
    if not tags:
        return ""
    tag_xml = ""
    for tag in tags:
        slug = tag.lower().replace(" ", "-")
        tag_xml += f"""
      <category domain="post_tag" nicename="{slug}"><![CDATA[{tag}]]></category>"""
    return tag_xml


def _xml_escape(text: str) -> str:
    return (text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&apos;"))


def generate_joomla_html(blog_data: dict, blog_meta: dict) -> str:
    """Generate Joomla-compatible article HTML."""
    title = blog_meta.get("title", "Blog Post")
    content = blog_meta.get("html_content", "")
    meta_desc = blog_meta.get("meta_description", "")
    tags = blog_meta.get("tags", [])
    tags_str = ", ".join(tags)

    joomla_html = f"""<!-- Joomla Article Export - BlogWriter -->
<!-- Plak de inhoud hieronder in het Joomla artikel editor -->
<!-- Meta beschrijving: {meta_desc} -->
<!-- Tags: {tags_str} -->

{content}"""
    return joomla_html


def blog_content_to_html(blog_content: dict, format_id: int, photos: list) -> str:
    """Convert blog content JSON to HTML with photo references."""

    def photo_img(photo, alt="Blog afbeelding", css_class="blog-image"):
        if photo:
            src = f"/api/photos/serve/{photo['id']}"
            title = photo.get("title") or alt
            return f'<img src="{src}" alt="{_xml_escape(title)}" class="{css_class}" loading="lazy" />'
        return f'<div class="placeholder-image {css_class}"><span>Afbeelding</span></div>'

    sections = blog_content.get("sections", [])
    html_parts = []

    # Header image
    header_photo = photos[0] if photos else None
    html_parts.append(f'<div class="blog-header-image">{photo_img(header_photo, blog_content.get("title", ""), "header-img")}</div>')

    # Title
    html_parts.append(f'<h1 class="blog-title">{_xml_escape(blog_content.get("title", ""))}</h1>')

    # Intro
    html_parts.append(f'<div class="blog-intro"><p>{blog_content.get("intro", "")}</p></div>')

    # Sections based on format
    photo_idx = 1
    for i, section in enumerate(sections):
        heading = section.get("heading", "")
        content = section.get("content", "")
        section_photo = photos[photo_idx] if photo_idx < len(photos) else None
        photo_idx += 1

        if format_id == 1:
            # Alternating layout
            if i % 2 == 0:
                html_parts.append(f"""<div class="blog-section section-text-left">
  <div class="section-text">
    <h2>{_xml_escape(heading)}</h2>
    <p>{content}</p>
  </div>
  <div class="section-image">{photo_img(section_photo)}</div>
</div>""")
            else:
                html_parts.append(f"""<div class="blog-section section-image-left">
  <div class="section-image">{photo_img(section_photo)}</div>
  <div class="section-text">
    <h2>{_xml_escape(heading)}</h2>
    <p>{content}</p>
  </div>
</div>""")
        elif format_id == 2:
            # Image consistently right
            html_parts.append(f"""<div class="blog-section section-text-left">
  <div class="section-text">
    <h2>{_xml_escape(heading)}</h2>
    <p>{content}</p>
  </div>
  <div class="section-image">{photo_img(section_photo)}</div>
</div>""")
        elif format_id == 3:
            # Text-heavy, smaller images
            html_parts.append(f"""<div class="blog-section section-minimal">
  <h2>{_xml_escape(heading)}</h2>
  <div class="section-content-minimal">
    <p>{content}</p>
    <div class="section-image-small">{photo_img(section_photo, css_class="small-img")}</div>
  </div>
</div>""")
        elif format_id == 4:
            # First section gets large featured image
            if i == 0:
                html_parts.append(f"""<div class="blog-section section-featured">
  <div class="featured-image">{photo_img(section_photo, css_class="featured-img")}</div>
  <h2>{_xml_escape(heading)}</h2>
  <p>{content}</p>
</div>""")
            else:
                html_parts.append(f"""<div class="blog-section section-text-left">
  <div class="section-text">
    <h2>{_xml_escape(heading)}</h2>
    <p>{content}</p>
  </div>
  <div class="section-image">{photo_img(section_photo)}</div>
</div>""")

    # Closing section
    html_parts.append(f"""<div class="blog-closing">
  <h2>Sluiting / Uitnodiging</h2>
  <p>{blog_content.get("closing", "")}</p>
</div>""")

    # Inspiration section
    inspiration_photos = photos[photo_idx:photo_idx + 3]
    while len(inspiration_photos) < 3:
        inspiration_photos.append(None)

    html_parts.append(f"""<div class="blog-inspiration">
  <h2>Inspiratie</h2>
  <div class="inspiration-grid">
    {photo_img(inspiration_photos[0], "Inspiratie 1", "inspiration-img")}
    {photo_img(inspiration_photos[1], "Inspiratie 2", "inspiration-img")}
    {photo_img(inspiration_photos[2], "Inspiratie 3", "inspiration-img")}
  </div>
</div>""")

    return "\n".join(html_parts)
