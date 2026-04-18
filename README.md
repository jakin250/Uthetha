# Uthetha

Unified Uthetha website with:

- Text to speech
- Word counter
- Keyword search and highlight
- Keyword density tracking

## Vercel structure

This repo now has a root-level `index.html`, so Vercel can detect a homepage from the repository root.

- `index.html` is the homepage
- `styles.css` contains the merged site styling
- `app.js` powers the shared frontend features
- `api/speak.py` handles MP3 generation for `/api/speak`
- `requirements.txt` installs the Python dependency for the speech API

## Deploy

Import the repository into Vercel and deploy from the repository root.
