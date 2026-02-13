# Project State & Improvement Suggestions

**Date**: 2026-02-11  
**Scope**: Existing features only. No new features. Robustness and quality improvements.

---

## 1. Current Project State

### Stack & structure
- **React 19 + Vite**, Tailwind 4, Framer Motion, Lucide. Maps: `@react-google-maps/api` + `use-places-autocomplete`.
- **Entry**: `main.jsx` → `App.jsx`. State lives in App (localStorage for persistence). No global store.
- **Data**: Mock only via `src/data/mockData.js`. API layer in `src/api.js` (login, register, getMe) pointing at `localhost:3001/api`.

### Features (existing)
| Area | What exists |
|------|-------------|
| **Auth** | Splash → Auth (Demo / Google simulated) → App. Token in localStorage; session check on load. |
| **Home** | Greeting, VideoWall, Curated Micro-Meets, Your Next Events, pull-to-refresh, Mango assistant. |
| **Hub** | Live Pulse feed (FeedItem), Your Tribes, TribeSheet, TribeDiscovery (join/leave). |
| **Explore** | Event grid, ExploreFilters (search, category, size, date range, this week). |
| **Profile** | Avatar (upload), WarmthScore, feature cards, My Bookings, Saved, Pro, Help, Log out. |
| **Events** | EventCard, EventDetailSheet (info + chat), join/leave, Micro-Meet match modal. |
| **Create** | CreateEventModal with LocationPicker (Google Places + map), image URL, category, date/time, free/ticketed. |
| **Sheets** | MyBookingsSheet, SavedEventsSheet, ProUpgradeModal, HelpSheet. |
| **Onboarding** | 3-step flow (interests, location, group size), stored in localStorage. |
| **Delight** | Confetti, RealtimePing, Toast, IOSInstallPrompt. |

### Design
- Antigravity Brain applied: Warm Hearth palette, Outfit/Quicksand, contrast/input rules, roundness, light-only. See `.cursor/rules/antigravity-brain.mdc` and `ANTIGRAVITY_BRAIN.md`.

---

## 2. Robustness Issues (bugs / edge cases)

1. **API non-JSON / network errors**  
   `api.js`: `response.json()` can throw if server returns HTML (e.g. 500) or non-JSON. No try/catch; no handling for `response.ok === false` when body isn’t JSON.

2. **Null user in app state**  
   In `App.jsx`, `sendMessage` and `createNewEvent` use `user.name` / `user.avatar` without optional chaining. If `user` is set but malformed (e.g. bad getMe response), this can throw.

3. **Onboarding flow with missing user**  
   Onboarding is rendered when `user && !showOnboarding && !userPreferences`. `userName={user.name}` is passed without fallback; if `user` exists but `user.name` is missing, OnboardingFlow can throw on `userName.split(' ')[0]`.

4. **FeedItem currentUser**  
   Hub feed uses `<FeedItem key={post.id} post={post} />` without `currentUser`. FeedItem falls back to `{ name: 'Ben B.', avatar: '/ben-avatar.png' }`, so comments/replies don’t show the actual logged-in user and avatar may 404.

5. **LocationPicker value sync**  
   CreateEventModal passes `value={formData.location}`. When LocationPicker calls `onChange` with `{ address, lat, lng }`, form stores `location: loc.address`. If the parent ever passes an object as `value`, MapSearch’s `useState( typeof value === 'object' ? value : ... )` only runs on first render; external updates to `value` don’t update internal state (no useEffect syncing value → state).

6. **EventDetailSheet chat input color**  
   Chat input uses `text-secondary`; Antigravity requires inputs to use `color: var(--text)` for contrast. Minor consistency fix.

---

## 3. Suggested Improvements (by category)

### A. Defensive / robustness (recommended)
- **api.js**: Wrap `response.json()` in try/catch; on parse error or !response.ok, throw a clear Error so callers can show a toast.
- **App.jsx**: Use optional chaining (and fallbacks) for all `user` usage in `sendMessage`, `createNewEvent`, and anywhere else (e.g. `user?.name ?? 'Guest'`, `user?.avatar ?? ''`).
- **OnboardingFlow**: Pass `userName={user?.name ?? 'there'}` and in OnboardingFlow use `(userName || 'there').split(' ')[0]` so missing name doesn’t throw.
- **FeedItem**: Pass `currentUser={{ name: user?.name ?? 'Guest', avatar: user?.avatar ?? '' }}` from App so Hub comments/replies show the real user and avoid bad avatar URL.

### B. Correctness / data flow
- **LocationPicker**: When `value` prop changes (e.g. from parent reset), sync internal state in MapSearch via `useEffect` so the field and map stay in sync with form state.

### C. UX / polish (existing features only)
- **EventDetailSheet**: Set chat input to `text-[var(--text)]` (or equivalent) so it follows Antigravity input rules.
- **MatchAnalysisModal**: Use `event.matchTags?.slice(0, 2).join(' & ') ?? 'this event'` so missing `matchTags` doesn’t show “undefined”.

### D. Consistency / maintainability
- **Session check**: In the session-check effect, `handleLogout` is used but not in the dependency array; consider a ref or stable callback so the linter doesn’t require disabling.
- **version**: `package.json` still has `"version": "0.6.0"`; consider aligning with tagged release (e.g. v0.10) for clarity.

---

## 4. What I will not do (per your instructions)
- No new features.
- No new UI flows or new pages.
- Only harden and improve existing behaviour and consistency.

---

## 5. Permission for suggestions

If you want me to implement the above:

1. **Quick wins (robustness)**  
   - Fix api.js error handling.  
   - Add user null-safety in App (sendMessage, createNewEvent, OnboardingFlow, FeedItem currentUser).  
   - MatchAnalysisModal safe matchTags.  
   - EventDetailSheet input color.

2. **Data flow**  
   - LocationPicker sync from `value` prop in MapSearch.

3. **Optional**  
   - Session-check effect deps / stable handleLogout.  
   - Bump package.json version to 0.10.0.

Reply with which of these you want applied (e.g. “1 and 2”, “all”, “only quick wins”).
