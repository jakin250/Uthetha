# Uthetha Text to Speech

This project is a simple text-to-speech website built with Python, Flask, and `gTTS`.

## Run it locally

```powershell
python -m pip install -r "Back End/requirements.txt"
python "Back End/app.py"
```

Open `http://127.0.0.1:5000` in your browser.

## Notes

- The app requires internet access when generating audio because `gTTS` calls Google's Text-to-Speech service.
- `gTTS` 2.5.4 does not expose true male or female voice selection, so this build uses the default Google voice for each language or accent path.
- Some of the requested languages are shown in the interface as unavailable because they are not supported in the installed `gTTS` language set.
