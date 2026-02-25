# Changelog

All notable changes to **Socialise** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versions follow the pattern `0.1.{PR}` — derived automatically from the latest merged pull request number.

> **Maintainers:** Update this file as part of every PR that delivers a user-facing change.
> Add entries under `[Unreleased]`, then rename that section when releasing to production.

---

## [Unreleased]

### Added
- Swipe down on the handle bar of any bottom sheet or modal to dismiss it — works across all 12 sheets
- Feature request button repositioned with clear spacing from the bug report button

### Fixed
- "What's New" changelog sheet is now scrollable on iOS Safari
- Video cards stay pressed when dragging after a long press — no more visual snap-back glitch
- Community hub page no longer locks your scroll when switching tabs quickly on iOS Safari
- "Create event" close button and backdrop now respond reliably on iOS — no more stuck modals
- Events on the Explore tab no longer wobble when the page first loads
- Feature request box text no longer overflows on smaller screens

---

## [0.1.164] — 2026-02-24

### Added
- Bug reports now automatically capture your platform, operating system, and browser — no manual input required

### Fixed
- Duplicate bug entries in the tracking sheet are automatically detected and merged
- Bug report form now includes step-by-step prompts to make it easier to describe the problem clearly
- Explore tab search, filters, and category selection no longer bleed through to the Home tab
- "Create event" close button is now reliably tappable when scrolling on mobile
- Location picker shows a plain text input fallback when Google Maps is unavailable
- Desktop sidebar navigation links now route correctly
- Mango's drag boundaries update correctly when the browser window is resized

---

## [0.1.150] — 2026-02-24

### Fixed
- Swiping through event reels no longer freezes mid-swipe during rapid interactions
- Creating an event now shows a loading spinner and prevents accidental double-submission
- Video wall autoplay no longer accumulates background timers over repeated interactions

---

## [0.1.147] — 2026-02-24

### Fixed
- Splash screen no longer skips too early when the session check resolves quickly
- Bug reports now include the current app version for easier triage

---

## [0.1.142] — 2026-02-23

### Added
- Bug reports submitted through the app are now stored permanently in the database and synced to a shared tracking sheet

---

## [0.1.134] — 2026-02-22

### Added
- XP points and unlocked titles now save to your account — progress is no longer lost when switching devices or browsers

### Fixed
- XP level and unlocked achievements are now consistent between development and production environments

---

## [0.1.123] — 2026-02-22

### Added
- Login streak tracking — your profile now shows how many days in a row you've been active
- In-app bug reporting — tap "Report a bug" in Profile → Settings to submit issues directly from the app

### Fixed
- New accounts now start with 0 XP and no phantom achievements from previous test data

---

## [0.1.96] — 2026-02-22

### Changed
- Profile pictures are now optimised server-side before saving — faster uploads, smaller files

### Fixed
- New profiles no longer inherit leftover avatar images from previous accounts

---

## [0.1.95] — 2026-02-22

### Added
- Password confirmation field on the registration form
- Escape key now closes all modals and bottom sheets
- Keyboard navigation for the tab bar (arrow keys cycle through tabs) and category sidebar
- Screen reader support — dialogs, tabs, and notifications now have proper ARIA roles, labels, and live regions
- Community group chat now loads real messages from the server (previously used device-local storage)

### Changed
- App loads ~47% faster — main JavaScript bundle reduced from 736 kb to 389 kb
- Heavy features (Google Maps, animations, video reels) now load on demand rather than upfront
- Smoother navigation and faster state updates across all tabs

### Fixed
- Switching tabs on mobile now correctly scrolls back to the top and triggers Mango animations
- Cancelling a booking now correctly removes you from the event on the server (was previously UI-only)
- Various null-safety fixes across the feed, event reels, and home recommendations

---

## [0.1.79] — 2026-02-21

### Added
- Delete your account permanently from Profile → Settings

### Fixed
- Mango kitten no longer appears on the login screen

---

## [0.1.67] — 2026-02-21

### Added
- Registration now asks for separate First Name and Last Name fields

### Changed
- Images across the app now load lazily — only fetched when scrolled into view, reducing initial data usage

### Security
- Row Level Security enforced on all database tables — your data is strictly isolated from other users
- Login and registration are now rate-limited to prevent brute-force attacks (15 attempts per 15 minutes)
- JWT tokens in production no longer fall back to a predictable secret
- CORS is locked to known production and development origins only
- Database functions hardened against search path manipulation

---

## [0.1.52] — 2026-02-21

### Changed
- App now deploys to separate `/dev/` and `/prod/` subfolders on GitHub Pages — preview and production are clearly separated

### Removed
- Email verification step on registration — was blocking new users from completing sign-up

### Fixed
- Server no longer crashes when no users have registered yet

---

## [0.1.0] — 2026-02-21

Initial release of **Socialise** — a community-driven social event discovery and Micro-Meet matchmaking platform.

### Added
- Browse, join, and save local social events
- Micro-Meets — AI-curated small dinners (4–6 people) matched by your interests and preferences
- Communities (Tribes) — join local groups, participate in group chat, and share posts to the feed
- Global social feed with emoji reactions and threaded replies
- Mango — interactive kitten assistant you can drag around the screen and tap for responses
- Customisable profile with avatar, bio, interests, XP points, and unlockable achievement titles
- Secure email and password sign-up and login, backed by Supabase

[0.1.164]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.150...HEAD
[0.1.150]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.147...0.1.150
[0.1.147]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.142...0.1.147
[0.1.142]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.134...0.1.142
[0.1.134]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.123...0.1.134
[0.1.123]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.96...0.1.123
[0.1.96]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.95...0.1.96
[0.1.95]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.79...0.1.95
[0.1.79]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.67...0.1.79
[0.1.67]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.52...0.1.67
[0.1.52]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.0...0.1.52
[0.1.0]: https://github.com/christosgalaios/SocialiseApp/releases/tag/0.1.0
