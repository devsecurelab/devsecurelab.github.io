# DevSecure Lab — Audio Acceptance Note

## Current accepted behavior

The current static GitHub Pages release uses browser Speech Synthesis. Audio is organized into sentence chunks. When a learner pauses, the current chunk is preserved; Resume continues at the current sentence/chunk boundary rather than restarting the entire lesson.

This is the explicitly accepted behavior for the current release. Exact word- or character-level resume is not claimed because browser Speech Synthesis does not expose a consistent cross-browser playback timestamp.

## Future audio roadmap

A future production audio release may use pre-generated MP3 or WebM assets with the native HTML `<audio>` element. That implementation can persist `currentTime` and support more precise play, pause, resume and seek behavior across supported browsers.

## Content and language policy

The website keeps the existing six learning tracks and 48 modules. Bengali support is restricted to the English for Cybersecurity track, where each language card follows Bangla Meaning → English Sentence → Bangla Pronunciation. The dashboard, cybersecurity tracks, policy pages and navigation remain English-only.

No Level 10 badge should be announced until the remaining acceptance evidence is recorded.
