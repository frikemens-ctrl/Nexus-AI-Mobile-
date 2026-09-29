# Nexus AI Mobile

Nexus AI is a mobile-inspired AI workspace with four complete visual experiences: Classic, Cyberpunk, GTA/Comic and Advanced Vision. The web build is deployed automatically to GitHub Pages on every push to `main`.

## Permanent website

https://frikemens-ctrl.github.io/Nexus-AI-Mobile-/

The published site is a static Expo web build. Chat history and theme selection work locally in the browser. Server-backed AI chat, OAuth and file/audio upload require a separately hosted API backend.

## External AI backend

The recommended production setup is OpenAI API behind the included Render web service. Deploy this repository to Render using `render.yaml`, then add the secret `OPENAI_API_KEY` in the Render dashboard. Never put the key in frontend code, GitHub Pages files, a commit, or a chat message. Render receives the key only as a server-side environment variable.

After Render provides the API URL, add the GitHub Actions repository variable `EXPO_PUBLIC_API_BASE_URL` with that URL and rerun the Pages workflow. This causes the static frontend to send chat, attachment and voice requests to the protected backend.

The backend accepts `OPENAI_BASE_URL` (default `https://api.openai.com/v1`) and `OPENAI_API_KEY`. It exposes the existing tRPC API under `/api/trpc` and health check `/api/health`.
