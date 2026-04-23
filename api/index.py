from __future__ import annotations

import io
import re
from pathlib import Path

from flask import Flask, jsonify, request, send_file, send_from_directory
from gtts import gTTS
from gtts.tts import gTTSError

try:
    from .language_catalog import LANGUAGE_OPTIONS_BY_ID
except ImportError:
    from language_catalog import LANGUAGE_OPTIONS_BY_ID


MAX_TEXT_LENGTH = 50000
ROOT_DIR = Path(__file__).resolve().parent.parent

app = Flask(__name__)


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return str(value).strip()


def parse_bool(value: object) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "yes", "on"}
    return bool(value)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "speech"


@app.after_request
def disable_cache(response):
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/")
def home():
    return send_from_directory(ROOT_DIR, "index.html")


@app.get("/styles.css")
def styles():
    return send_from_directory(ROOT_DIR, "styles.css")


@app.get("/app.js")
def script():
    return send_from_directory(ROOT_DIR, "app.js")


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


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
    file_name = f"uthetha-{slugify(language['label'])}.mp3"
    response = send_file(
        audio_stream,
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name=file_name,
    )
    response.headers["X-Audio-Filename"] = file_name
    response.headers["X-Language-Label"] = language["label"]
    return response


if __name__ == "__main__":
    app.run(debug=True)
