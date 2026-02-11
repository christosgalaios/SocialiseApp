# ANTIGRAVITY BRAIN 🧠
> **Project**: Socialise
> **Purpose**: Single source of truth for design patterns, technical decisions, and "learnings" to maintain consistency.
> **Last Updated**: 2026-02-06

---

## 1. Design System 🎨

### Philosophy: "The Warm Hearth"
We prioritize human connection over cold "tech" aesthetics. The app should feel tactile, grounded, and inviting.

| Element | Value | Description |
| :--- | :--- | :--- |
| **Primary** | `#E2725B` | **Community Terracotta**. Warm, inviting, energetic. Used for primary actions, interactions. |
| **Secondary** | `#2D5F5D` | **Open Door Teal**. Grounded, calm, sophisticated. Used for navigation, text, secondary gradients. |
| **Accent** | `#F4B942` | **Latecomer Gold**. Used for highlights, sparks, "delight" moments. |
| **Paper** | `#F9F7F2` | **Paper White**. The main background color. Avoid pure white `#FFFFFF` for backgrounds. |
| **Text** | `#1A1C1C` | **Soft Charcoal**. High contrast but softer than pure black. |
| **Muted** | `#5C6363` | For secondary text and placeholders. |

### Typography
- **Headings**: `Outfit` (Bold, rounded, friendly but clean).
- **Body**: `Quicksand` (rounded sans-serif, high readability).

### Styling Rules (CRITICAL)
- **CONTRAST**: never use white text on `bg-paper` or `bg-secondary/5` backgrounds. Always use `text-secondary` or `text-primary`.
- **INPUTS**: Input fields must have `color: var(--text)` explicitly set.
- **ROUNDNESS**: Heavy use of `rounded-[24px]` or `rounded-[32px]` for cards/modals. `rounded-2xl` for inner elements.
- **SCROLLBARS**: Hidden globally (`no-scrollbar` utility) but functional.
- **THEME**: Currently **Light Mode Only** (enforced via CSS variables). Dark mode classes exist but app defaults to the "Warm Hearth" light palette.

---

## 2. Core Architecture 🏗️

### Tech Stack
- React 19 + Vite
- Tailwind CSS 4
- Framer Motion (heavy usage for `AnimatePresence`, page transitions, and micro-interactions)
- Lucide React (icons)

### Component Patterns
- **Modals**: Centered, `fixed inset-0`, backdrop blur (`bg-secondary/60 backdrop-blur-sm`). White/Paper content box.
- **Sheets**: Slide-up from bottom (mobile style), often used for "My Bookings", "Saved", "Help".
- **Navigation**: Bottom navigation bar floating above content.
- **Feed**: Threaded comments (Depth 1), Emoji toggles (one-per-person storage).

### Integrations
- **Maps**: Uses `@react-google-maps/api` + `use-places-autocomplete`.
  - Requires `VITE_GOOGLE_MAPS_API_KEY` in `.env`.
  - Component: `LocationPicker.jsx` (handles autocomplete + pin on map).
  - **Graceful Failure**: If API key is missing, shows a "Key missing" UI rather than crashing.

---

## 3. Learnings Log 📝

### 2026-02-06
- **Contrast Check**: Identified that default browser styles often default inputs to white text if not overridden, causing invisibility on light themes. We fixed this globally in `index.css`.
- **Google Maps**: Added full map integration. It replaces simple text inputs for locations.
- **Onboarding**: Users need a frictionless entry. Created a 3-step `OnboardingFlow` (Interests -> Location -> Group Size) stored in `localStorage` or state.
- **Threaded Comments**: Users wanted replies but not infinite nesting. We implemented a hard max-depth of 1 (Comment -> Reply).

---

## 4. Pending / Roadmap 🚀
- [ ] Connect `LocationPicker` coordinates to backend/search.
- [ ] implement `TribeSheet` full functionality.
- [ ] Expand "Go Pro" features beyond the modal.
