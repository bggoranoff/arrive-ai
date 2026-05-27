## ArriveAI — Document Assistant for Immigrants

Scan a document. Understand what it means. Start and manage applications related to it.

ArriveAI is a mobile app that helps immigrants and expats deal with government paperwork. The user starts by picking an application type (e.g. Blue Card, Anmeldung, Kindergeld). The app knows which documents are required for that application and shows a checklist of missing and existing documents. The user scans documents with their camera, the app auto-detects the document type and matches it to the checklist, and a chat interface lets them ask follow-up questions about any document. Initial scope is 4-5 supported application types for Germany.

## Target User

A non-native speaker living in a foreign country (initially Germany) who regularly receives official letters they don't fully understand. They need to know: what does this say, what do I need to do, and when is the deadline.

## Core Loop

1. User creates an application by picking from a list of supported types (e.g. Blue Card, Anmeldung)
2. App shows the required document checklist for that application type — each item is either missing or submitted
3. User taps "+" to scan/upload a document
4. Vision-language model identifies the document type and auto-matches it to the correct checklist item
5. App generates a plain-language explanation of the document in the user's preferred language
6. User can chat with the document for follow-up questions (e.g. "what do I fill in field 3?")

## Supported Applications (v1)

The first version supports 4-5 application types for Germany. Each application type has a predefined list of required documents. Examples:

- **EU Blue Card** — job contract, university degree, degree recognition (anabin/ZAB), health insurance proof, passport copy, biometric photo, rental contract or Anmeldung confirmation
- **Anmeldung (address registration)** — Wohnungsgeberbestätigung (landlord confirmation), passport/ID, rental contract
- **Kindergeld (child benefit)** — birth certificate, residence permit, proof of employment, tax ID, child's passport
- **Health Insurance registration** — employment contract or enrollment letter, passport, previous insurance proof
- **Aufenthaltstitel (residence permit renewal)** — current permit, passport, biometric photo, proof of income, health insurance, rental contract

The coding agent should store these as configuration so adding new application types is just adding a new checklist definition.

## Infrastructure

- Serverless inference via **Lyceum** GPU cloud
- Model: **Qwen2.5-VL-72B** (vision-language, handles OCR + understanding in one pass)
- The app sends the document image to the Lyceum inference endpoint, receives structured output (explanation, document type classification, matched checklist item)
- Chat follow-ups hit the same model with the document as context

## Tech Difficulties

There are three main challenges to solve:

**Connecting with Lyceum inference API** — The app needs to call the Lyceum serverless endpoint for Qwen2.5-VL-72B. This means handling auth, sending image payloads (base64 or multipart), streaming responses for the chat interface, and handling cold starts gracefully (show loading state, maybe optimistic UI for scan results).

**Scanning and parsing images** — Mobile camera capture needs to produce clean, well-lit, de-skewed images of documents. The vision model handles OCR internally but image quality matters a lot for accuracy. Need to handle multi-page documents (user scans page 1, then page 2, app stitches them into one document). Gallery upload as fallback for users who already have photos.

**Deploying on iOS** — The app should be a native iOS app (or React Native / Flutter for cross-platform later). Needs camera permissions, local image storage. App Store review process requires privacy policy, data handling disclosures, etc.

## Data Model

The coding agent should design the full schema, but here is the conceptual structure:

- **User** — language preference, country, notification settings
- **Application type** (config) — name, country, list of required document types
- **Application** — type reference, status, created date
- **Required document** — document type name, status (missing/submitted), linked application
- **Document** — image file(s), extracted text, AI-generated summary, detected type, linked required document slot
- **Chat message** — role (user/assistant), content, linked document, timestamp

Key relationships: a user has many applications, an application type defines many required document slots, an application has many required documents (from its type), each required document slot is either empty (missing) or linked to a scanned document, a document has many chat messages.

## Screens

### (1) Application List Screen

The home screen. Shows all the user's active applications as a scrollable list.

Each application list item shows: application title, type icon, status badge, progress indicator (e.g. "3 of 6 documents submitted"). Tapping an item navigates to screen (2).

A floating add button opens a popup with the supported application types (e.g. "EU Blue Card", "Anmeldung", "Kindergeld", "Health Insurance", "Residence Permit Renewal"). User picks one and it appears in the list with all its required documents in "missing" state.

### (2) Application Overview Screen

Detail view for a single application. Contains several sections:

**(2.1) Overview section** — Application title at the top. Below it, a text block with bullet points summarizing the current state: how many documents submitted vs required, what is still missing. This is derived from the checklist state.

**(2.2) Document checklist section** — The core of this screen. A list of all required documents for this application type. Each item shows: document type name, status icon (checkmark if submitted, empty circle if missing), and if submitted, a thumbnail + scan date. Tapping a submitted document navigates to screen (4). Tapping a missing document slot could show a hint about what that document looks like or where to get it.

**(2.3) Add document button** — A "+" button that triggers the scan flow (screen 3). After scanning, the model auto-detects the document type and matches it to the correct checklist slot. If the model can't confidently match, it asks the user to pick from the remaining missing slots.

**Progress bar** — A visual indicator showing how far along the application is (e.g. "3 of 6 documents submitted"). Directly derived from the checklist — no AI inference needed for this.

Back button navigates to screen (1).

### (3) Scan Screen

Triggered from the document add button on screen (2).

Opens a popup with two options: take a photo (opens camera) or choose from gallery. After the image is captured/selected, the app sends it to the Lyceum inference endpoint. While processing, show a loading state with the document thumbnail.

The model identifies the document type (e.g. "this is a Wohnungsgeberbestätigung") and auto-matches it to the correct missing slot in the application checklist. If the match is confident, the document is saved and the checklist updates. If the model is unsure, it shows the user the remaining missing document types and asks them to pick the right one.

On completion, the user is navigated to screen (4) to see the explanation.

For multi-page documents: after scanning page 1, prompt the user "scan another page?" with yes/no. If yes, repeat. All pages are grouped into one document.

### (4) Document Overview + Chat Screen

The detail view for a single document. Two parts:

**Top section** — Document title (auto-detected type or user-editable), scan date, document thumbnail(s). Below that, a text block with the AI-generated explanation: what the document is, what it says, and any important details the user should know.

**Bottom section** — A chat interface. The document is pre-loaded as context. The user can ask questions like "what does paragraph 2 mean?", "what do I fill in for field Familienstand?", "do I need to bring this to an appointment?". The model responds using the document content as grounding.

Back button navigates to screen (2).

## Deliverables

This is the build order. Each deliverable builds on the previous one.

1. **Front-end mockups** — Static designs for all four screens plus popups. Establish the visual language, color palette, typography, icon set. Mobile-first, iOS-native feel.

2. **Front-end screens with static transitions** — Implement the screens with navigation between them. Use placeholder data. All taps, scrolls, popups, and transitions should work. No backend yet.

3. **Chatbot interaction** — Connect the chat interface on screen (4) to the Lyceum inference endpoint. Send the document image + user message, stream the response. Handle loading, errors, retry.

4. **Document store** — Implement the full data layer. Scan → auto-detect type → match to checklist slot → persist locally. Application type configs with required document lists. Checklist state management.

5. **Presentation deck** — A short slide deck (5-8 slides) covering: problem, solution, demo screenshots, architecture, Lyceum integration, target market, and next steps. For pitching the app as a Lyceum showcase.

## Competitive Landscape

Existing players in adjacent space: Ridocu (Berlin, GPT-based letter scanning for expats), Abc Doc (Berlin, bureaucratic letter recognition + action recommendations), SmartBürokratie (AI legal assistant for German bureaucracy), VisaFlow (step-by-step German visa guidance), Bureaucrazy (grassroots app by Syrian refugees for navigating German paperwork). None of these combine scan → explain → track → chat in one polished mobile experience. General tools like DeepL translate but don't advise. DocumentKit organizes but doesn't understand context.

## Notes

- The app name "ArriveAI" signals arrival in a new country + AI assistance. Short, memorable, works in any language.
- Initial scope is Germany but the architecture is country-agnostic. Swap the knowledge base and suggestions for any country.
- Privacy is critical. Documents contain sensitive personal data. All images should be stored locally on-device by default. Inference calls send images to Lyceum but nothing is persisted server-side.
- The vision-language model (Qwen2.5-VL-72B) handles OCR, language detection, translation, and explanation in a single inference call. No separate OCR pipeline needed.
