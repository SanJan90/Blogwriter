import os
import json
import base64
from pathlib import Path
import anthropic

# DEBUG - tijdelijk
print(f"DEBUG: ANTHROPIC_API_KEY present: {bool(os.environ.get('ANTHROPIC_API_KEY'))}", flush=True)
print(f"DEBUG: Key length: {len(os.environ.get('ANTHROPIC_API_KEY', ''))}", flush=True)
# EINDE DEBUG

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

BLOG_SYSTEM_PROMPT = """Je bent een professionele blog schrijver die blogs maakt voor websites.
Je schrijft in het Nederlands, tenzij anders gevraagd.
Je genereert gestructureerde, SEO-vriendelijke blog content die geschikt is voor publicatie op Joomla en WordPress websites.
Je schrijft altijd in een professionele maar toegankelijke stijl.
"""


def generate_blog_content(topic: str, description: str, format_id: int, language: str = "nl") -> dict:
    """Generate blog content using Claude API."""

    format_descriptions = {
        1: "Klassiek formaat: header afbeelding, introductie, 3 secties met afwisselend tekst-links/afbeelding-rechts en afbeelding-links/tekst-rechts, afsluiting en inspiratie sectie",
        2: "Modern formaat: header afbeelding, introductie, 3 secties waarbij afbeeldingen consistent rechts staan, grote tekstblokken, afsluiting en inspiratie sectie",
        3: "Minimaal formaat: compacte opzet, header afbeelding, introductie, 2 tekstrijke secties met kleinere afbeeldingen, afsluiting en inspiratie sectie",
        4: "Feature formaat: grote header afbeelding, introductie, uitgelichte grote afbeelding sectie, 2 content secties, afsluiting en inspiratie sectie",
    }

    lang_instruction = "Schrijf in het Nederlands." if language == "nl" else f"Write in {language}."

    prompt = f"""Genereer een complete blog post over het volgende onderwerp:

**Onderwerp:** {topic}
**Beschrijving/Context:** {description}
**Blog Formaat:** {format_descriptions.get(format_id, format_descriptions[1])}

{lang_instruction}

Genereer de blog als een JSON object met precies deze structuur:

{{
  "title": "De pakkende blogtitel",
  "meta_description": "SEO beschrijving van max 160 tekens",
  "intro": "Introductie paragraaf van 2-3 zinnen die de lezer meteen pakt",
  "sections": [
    {{
      "heading": "Sectie koptitel",
      "content": "Sectie inhoud van 3-5 paragrafen. Schrijf uitgebreid en informatief.",
      "image_keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ],
  "closing": "Afsluitende paragraaf met call-to-action van 2-3 zinnen",
  "inspiration_keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}}

Regels:
- Voor formaat 1 en 4: maak 3 secties
- Voor formaat 2: maak 3 secties
- Voor formaat 3: maak 2 secties
- image_keywords zijn Nederlandse zoekwoorden om passende foto's te vinden (3 per sectie)
- inspiration_keywords zijn 3 zoekwoorden voor de inspiratie foto's onderaan
- Schrijf substantiële, informatieve tekst per sectie (minimaal 150 woorden per sectie)
- De afsluiting moet een uitnodiging/call-to-action bevatten

Geef ALLEEN het JSON object terug, geen extra tekst."""

    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=4096,
        system=BLOG_SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code blocks if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)


def analyze_image_tags(image_path: str) -> dict:
    """Use Claude vision to automatically generate tags for an uploaded photo."""
    with open(image_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = Path(image_path).suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }
    media_type = media_type_map.get(ext, "image/jpeg")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {
                        "type": "text",
                        "text": """Analyseer deze afbeelding en geef een JSON object terug met:
{
  "title": "Korte beschrijvende titel van de foto",
  "description": "Korte beschrijving van wat er op de foto staat (max 2 zinnen)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "een van: natuur, mensen, zakelijk, eten, reizen, interieur, technologie, sport, mode, overig"
}

Tags moeten Nederlandse zoekwoorden zijn die goed beschrijven wat er op de foto staat.
Geef ALLEEN het JSON object terug."""
                    }
                ],
            }
        ],
    )

    response_text = message.content[0].text.strip()
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    return json.loads(response_text)
