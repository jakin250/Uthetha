from __future__ import annotations

import io
import re
import sys
from pathlib import Path

from flask import Flask, jsonify, render_template, request, send_file
from gtts import gTTS
from gtts.tts import gTTSError

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from language_catalog import (
    LANGUAGE_OPTIONS_BY_ID,
    LANGUAGE_PAYLOAD,
    SUPPORTED_LANGUAGE_OPTIONS,
    UNSUPPORTED_LANGUAGE_OPTIONS,
)


FRONTEND_DIR = BASE_DIR.parent / "Front End"
MAX_TEXT_LENGTH = 250000
DEFAULT_LANGUAGE_ID = "english-uk"

app = Flask(
    __name__,
    template_folder=str(FRONTEND_DIR / "templates"),
    static_folder=str(FRONTEND_DIR / "static"),
    static_url_path="/static",
)


def parse_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return bool(value)


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "speech"


@app.after_request
def disable_cache(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/")
def index():
    return render_template(
        "index.html",
        supported_languages=SUPPORTED_LANGUAGE_OPTIONS,
        unsupported_languages=UNSUPPORTED_LANGUAGE_OPTIONS,
        language_options=LANGUAGE_PAYLOAD,
        supported_count=len(SUPPORTED_LANGUAGE_OPTIONS),
        unsupported_count=len(UNSUPPORTED_LANGUAGE_OPTIONS),
        default_language_id=DEFAULT_LANGUAGE_ID,
        max_text_length=MAX_TEXT_LENGTH,
    )


@app.post("/api/speak")
def speak():
    payload = request.get_json(silent=True) or request.form
    text = clean_text(payload.get("text"))
    language_id = clean_text(payload.get("language"))
    slow = parse_bool(payload.get("slow"))

    if not text:
        return jsonify({"error": "Please paste some text before generating speech."}), 400

    if len(text) > MAX_TEXT_LENGTH:
        return (
            jsonify(
                {
                    "error": f"Text is too long. Keep it under {MAX_TEXT_LENGTH} characters per request."
                }
            ),
            400,
        )

    if language_id not in LANGUAGE_OPTIONS_BY_ID:
        return jsonify({"error": "Please choose a valid language or dialect."}), 400

    language = LANGUAGE_OPTIONS_BY_ID[language_id]
    if not language["supported"]:
        return (
            jsonify(
                {
                    "error": f"{language['label']} is listed but is not supported by the installed gTTS package."
                }
            ),
            400,
        )

    audio_stream = io.BytesIO()

    try:
        tts = gTTS(
            text=text,
            lang=language["lang"],
            tld=language["tld"] or "com",
            slow=slow,
            timeout=(5, 20),
        )
        tts.write_to_fp(audio_stream)
    except (AssertionError, ValueError):
        return jsonify({"error": "The request could not be prepared for speech generation."}), 400
    except gTTSError as exc:
        return (
            jsonify(
                {
                    "error": "Google Text-to-Speech could not generate audio right now. Check your internet connection and try again.",
                    "details": str(exc),
                }
            ),
            502,
        )

    audio_stream.seek(0)
    filename = f"uthetha-{slugify(language['label'])}.mp3"
    response = send_file(
        audio_stream,
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name=filename,
    )
    response.headers["X-Audio-Filename"] = filename
    response.headers["X-Language-Label"] = language["label"]
    return response


if __name__ == "__main__":
    app.run(debug=True)
