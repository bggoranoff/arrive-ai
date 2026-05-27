# Lotse — front-end prototype

A clickable mobile-app prototype for scanning an official document, understanding
what it means, and tracking related applications. **Front-end only**: no backend,
no real camera, no AI calls. All screen state lives in React; all data is
hard-coded in `src/data/mockData.js`.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (defaults to <http://localhost:5173>).

## What's here

- `src/App.jsx` — phone frame, navigation stack, popup state, data mutations.
- `src/components/` — `PhoneFrame`, `StatusBar`, `ScreenHeader`, `IconTile`,
  `ProgressBar`, `BottomSheet`.
- `src/screens/`
  - `ApplicationList.jsx` — screen 1, root list with add button.
  - `ApplicationOverview.jsx` — screen 2, three-card swipe carousel
    (Overview / Deadlines / Documents) over a pinned progress bar.
  - `ScanDocument.jsx` — screen 3, mocked camera viewfinder.
  - `DocumentChat.jsx` — screen 4, document summary + canned chat.
- `src/popups/` — `AddApplicationSheet`, `DeadlineSheet`, `CameraGallerySheet`.
- `src/data/mockData.js` — all seed data and canned chat replies.

## Stack

React 19 + Vite + Tailwind CSS v4 + lucide-react. No router library — the
screen stack and popup state are plain `useState`. Screen transitions are CSS
keyframe animations (`anim-slide-in/out`, `anim-sheet-in/out`).

## Design tokens

Defined as Tailwind v4 `@theme` variables in `src/index.css`:

- `--color-brand` `#185fa5` (primary)
- `--color-deadline-bg` `#faeeda`, `--color-deadline-text` `#854f0b`,
  `--color-deadline-dot` `#ef9f27`
- `--color-screen-bg` `#f5f6f8`, `--color-card-border` `#e6e8ec`

## Not included

No backend, persistence, real camera, file pickers, or AI. The chat input
echoes the user's text and replies with a canned line from `cannedReplies`.
