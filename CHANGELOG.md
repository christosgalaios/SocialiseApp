# Changelog

All notable changes to **Socialise** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versions follow the pattern `0.1.{PR}` — derived automatically from the latest merged pull request number.

> **Maintainers:** Update this file as part of every PR that delivers a user-facing change.
> Add entries under `[Unreleased]`, then rename that section when releasing to production.

---

## [Unreleased]

### Added
- **Edit organiser profile** — organisers can now update their display name, bio, categories, and social links after initial setup via the Edit Profile sheet on the dashboard
- **Event filtering on organiser dashboard** — events are split into "Upcoming" and "Past" tabs with counts, making it easy to see what's active vs completed
- **Event fill bar** — each event row on the organiser dashboard now shows a mini progress bar indicating how full the event is, with accent color when 80%+ filled
- **Cover photo display** — organiser dashboard and profile header now display the cover photo when one is set
- **Organiser overview on Home tab** — organisers see a quick stats banner (active events, attendees, total hosted) on the Home tab with a "New Event" shortcut and live "Today's Events" section
- **Profile completeness indicator** — organiser dashboard shows a checklist with progress bar (display name, bio, categories, social links, first event) that disappears once 100% complete; incomplete items link to the edit sheet
- **Social link validation** — edit profile sheet and setup flow validate website URLs and username formats in real-time with inline error messages; invalid links prevent saving
- **Clickable social links on public profiles** — social links on the organiser profile sheet now open the corresponding platform (Instagram, TikTok, X, Website) in a new tab with hover effects
- **Organiser quick stats on public profile** — public organiser profile now shows events, communities, and member counts in a compact 3-column grid
- **Organiser badge on Home tab** — organisers see a small "Organiser" badge next to the date and their organiser display name in the greeting
- **Dashboard Overview/Analytics tabs** — organiser dashboard now has two tabs: Overview (events + communities) and Analytics (performance stats + event fill rate chart with average)
- **Clickable event rows** — event rows on the organiser dashboard now open the EventDetailSheet when tapped
- **Clickable community rows** — community rows on the organiser dashboard now open the TribeSheet when tapped
- **"Become an Organiser" feature preview** — the CTA card on the attendee profile now shows a 3-column preview of organiser features (Host Events, Communities, Analytics)
- **Category chips on organiser dashboard** — organiser header now shows category badges (e.g. Food & Drinks, Outdoors) with matching icons so visitors instantly see what the organiser hosts
- **Dashboard refresh button** — organisers can manually refresh their dashboard stats, events, and communities with a single tap
- **"Hosting" badge on event cards** — events the organiser hosts now show a gold "HOSTING" badge with megaphone icon on both Home and Explore tabs, replacing the "GOING" badge
- **Community activity indicator** — community rows on the organiser dashboard now show an "active" badge for communities with members
- **Relative date labels on dashboard events** — event rows show "Today", "Tomorrow", "In 3 days" etc. instead of raw dates, with green highlight for today's events
- **Share profile quick action** — organisers can copy their profile link to clipboard with a single tap from the dashboard
- **Empty analytics state** — analytics tab shows a motivational empty state with a "Create Your First Event" CTA when no events exist
- **Dashboard header summary** — organiser profile card now shows a compact "X upcoming, Y past, Z communities" summary at a glance
- **Top performer card** — analytics tab highlights the event with the highest fill rate, showing title, fill percentage, and attendee count
- **Next event countdown** — overview tab shows a countdown banner (e.g. "3d 5h until start") for the organiser's next upcoming event
- **Event category distribution** — analytics tab shows a breakdown of which categories the organiser hosts most, with animated progress bars and matching category icons
- **Event status badges** — dashboard event rows now show "Live" (green pulse), "Sold Out" (red), and "Almost Full" (gold) status badges based on fill rate and date
- **Community quick action** — "Community" button on the organiser dashboard now opens the tribe discovery modal to browse and join communities
- **Responsive dashboard grid** — events and communities sections display side-by-side on wide screens (lg breakpoint) for better desktop experience
- **3-column quick actions** — dashboard quick actions reorganised into a 3-column grid (New Event, Community, Share) with icon + label layout

### Changed
- **Public organiser profile redesign** — richer layout with cover photo, quick stats grid, "Connect" section for social links, "Hosts" section for categories, and improved loading skeleton
- **Organiser dashboard loading skeleton** — replaced basic pulse blocks with a detailed skeleton that mirrors the actual dashboard structure (profile card, quick actions, stats grid, event list)
- **Stats card polish** — stat cards now animate their values on mount and show a subtle hover lift effect

### Fixed
- **GitHub Pages deploy reliability** — added `.nojekyll` file to disable unnecessary Jekyll processing that adds latency to deployments and can interfere with build output
- **Deploy race condition** — both deploy workflows now share a single concurrency group (`deploy-gh-pages`) so concurrent dev/prod deploys can't overwrite each other's changes on the `gh-pages` branch
- **Silent deploy failures** — `auto-approve` now catches and reports merge failures (posts a comment on the PR) and deploy dispatch failures instead of failing silently
- **Branch cleanup safety** — branch deletion in `auto-approve` no longer fails the workflow if the branch was already deleted

### Added
- **Full-sync endpoint** — `POST /api/bugs/full-sync` rebuilds the Google Sheet from Supabase in one call, useful after direct database edits or to fix sync drift
- **Full bi-directional Google Sheet sync** — editing any column in the bug tracker sheet (Description, Environment, Component, Fix Notes, etc.) now syncs back to Supabase automatically, not just Status/Priority/Type

### Changed
- **Bug tracker cleanup** — consolidated 31 tickets down to 20 by merging duplicate reports and deleting test submissions; all merged entries preserve original debugging context

### Added
- **Bug fix process improvements** — bug reports are now fetched from a structured JSON API instead of Google Sheet CSV, service key authentication replaces throwaway user registration, batch updates for bulk operations, fix notes and component columns for better traceability, age-based priority boosting for old bugs, and fuzzy duplicate matching

### Added
- **Organiser Profile** — any user can now become an organiser via a guided 3-step setup flow (display name, categories, bio & social links) accessible from the Profile tab
- **Organiser Dashboard** — organisers see a dedicated dashboard with performance stats (events hosted, total attendees, active events, community members), their event list with RSVP counts, and their communities
- **Public Organiser Profile** — tap on an event host's name to view their organiser profile sheet with bio, social links, upcoming events, and communities
- **Role switching** — organisers can switch back to attendee view at any time; the profile tab adapts to show the appropriate experience
- New backend endpoints: `PUT /users/me/role`, `GET /users/me/organiser-stats`, `GET /users/:id/organiser-profile`
- Database migration 012 adds organiser columns (role, bio, display name, categories, social links, cover photo, verified status)

### Changed
- Renamed "Community Hub" to "Event Hub" on event detail chat tab — better reflects that the hub is specific to each event
- Event detail sheet now shows a "Hosted By" section with a tappable host name that opens the organiser profile

### Added
- **Your Skills** progression system — 5 individual skills (Social Spark, Adventure Spirit, Creative Soul, Community Leader, Knowledge Seeker), each with 10 levels, their own XP track, and a full milestone badge ladder
- **Skill badges & stamps** — 4 milestone rewards per skill (at levels 3, 5, 7, 10); level-5 and level-10 milestones award special profile stamps (e.g. Hiking Boots at Adventure Spirit Lv.5, Social Butterfly at Social Spark Lv.5)
- **Fame Score** — overall rank (10 levels, Newcomer → Luminary) derived from the sum of all skill XP; replaces the old single global XP level
- **Full-screen Level Up Screen** — replaces the small LevelUpModal; shows the levelled-up skill icon with spinning rings, a fresh progress bar, and a badge-reveal card when a milestone is hit; also shows Fame Score level-ups when the overall rank increases
- **Category-aware XP awards** — joining events now awards XP to the matching skill (Outdoors/Active → Adventure Spirit, Creative → Creative Soul, Learning → Knowledge Seeker, others → Social Spark) instead of a flat +50 to a global pool
- **Level Roadmap** redesigned — bottom sheet now shows Fame Score track (all 10 levels with progress bar) followed by per-skill detail cards showing level, XP progress, and all 4 milestone badges
- **Earned Badges section** on Profile — grid of all badges and stamps unlocked so far, with stamp badges highlighted in gold

### Changed
- Profile "Your Stats" section renamed to **Your Skills** with individual level bars, XP progress, and milestone badge grid per skill
- WarmthScore circle now shows "Fame" label (was "Level") to reflect the new Fame Score system
- XP rollback on failed event join now restores per-skill XP correctly instead of a flat total

### Added
- Interactive sound feedback across the entire app — warm, on-brand audio cues using the Web Audio API (no external files)
- Splash screen sounds: each animation phase (host letter, members arriving, huddle, latecomer, welcome, together) has its own warm tone
- Mango AI kitten sounds: chirp on tap, purr on hold, pickup/drop sounds when dragged, sleep/wake tones, celebrate cascade, and chat toggle chimes
- Navigation tap sounds on BottomNav and Sidebar tab switches
- Event card and micro-meet card press sounds with haptic feedback
- Feed interaction sounds: like pop, unlike, emoji reactions, comment/reply send
- Action sounds: join event success chime with confetti sparkle, level-up fanfare, pull-to-refresh complete, chat message send
- Modal/sheet close swoosh sound on all close (X) buttons — EventDetailSheet, MyBookingsSheet, SavedEventsSheet, HelpSheet, GroupChatsSheet, ChangelogSheet, BugReportModal, FeatureRequestModal, AvatarCropModal, ProUpgradeModal, TribeDiscovery, TribeSheet, LevelUpModal, UserProfileSheet
- Tap sound and haptic feedback on all arrow/scroll buttons — HomeTab micro-meets carousel, ExploreTab reels carousel, AuthScreen testimonial arrows, GroupChatsSheet back arrow
- Click sound on HelpSheet FAQ expand/collapse chevrons
- Onboarding flow sounds: interest selection clicks, step navigation taps, completion chime
- Sound toggle in Settings (Profile > Settings > Sound & feedback) — persisted to localStorage, respects `prefers-reduced-motion`
- Login success and auth error sounds
- Haptic feedback (vibration) on key mobile interactions: navigation, cards, joins, buttons

### Fixed
- Swipe-to-close on bottom sheets and modals now responds when starting the drag from anywhere on the top bar (handle + header area), not just the tiny visual handle pill
- Explore page reels carousel no longer traps scroll on iOS — changed snap behaviour so users can scroll past the reels section naturally (BUG-1772022302002)
- Feature request modal text no longer bleeds outside the box on mobile — padding now matches the bug report modal (BUG-1772022766344)

### Changed
- Bug report floating button now uses terracotta theme to match the bug report modal
- Feature request floating button now uses gold theme to match the feature request modal
- Reels are now embedded directly in the Explore page as a horizontal carousel instead of opening as a full-screen overlay
- Reels button removed from the mobile bottom navigation bar — reels are always visible on Explore

### Removed
- Category filter ("Discover") section removed from the desktop sidebar on the Explore tab — filters are handled inline in the Explore tab itself
- Full-screen EventReels modal removed — replaced by the inline reels carousel on the Explore tab

---

## [0.1.188] — 2026-02-25

### Added
- Submit feature requests directly from the app — new Lightbulb button alongside the bug report button
- Swipe down on the handle bar of any bottom sheet or modal to dismiss it — works across all 12 sheets
- Feature request and bug report buttons repositioned with clear spacing to prevent accidental taps

### Fixed
- Main page scroll no longer freezes after closing a modal or sheet on iOS
- Profile page no longer freezes when scrolling on iOS Safari
- "Create event" close button and backdrop now respond reliably on iOS — no more stuck modals
- Community hub page no longer locks your scroll when switching tabs quickly on iOS Safari
- Pull-to-refresh no longer double-fires when triggered rapidly
- Pull-to-refresh no longer triggers when swiping horizontally through video carousels
- "What's New" changelog sheet is now scrollable on iOS Safari
- Video cards stay pressed when dragging after a long press — no more visual snap-back glitch
- VideoWall horizontal scrolling no longer conflicts with vertical page scroll on diagonal swipes
- Events on the Explore tab no longer wobble when the page first loads
- Bug report text no longer overflows on smaller screens
- Feature request box text no longer overflows on smaller screens
- Bug reports now correctly detect which environment (production, development, local) they were submitted from
- Event reels screen reader support — all icon-only buttons now announce their purpose correctly
- Community group chat screen reader improvements — search and close buttons in the chat list header now announce their purpose correctly
- Chat messages that fail to send are now removed instead of showing as ghost "sent" messages
- Joining multiple events rapidly now correctly accumulates XP instead of repeating the same amount
- XP is now rolled back when an event join fails on the server
- Zoom wheel on the avatar crop tool no longer triggers Chrome passive event warnings
- App now shows an error message when initial data fails to load instead of silently showing nothing
- Mango kitten no longer causes memory warnings when navigating away quickly after dragging
- Bug report and feature request close buttons now respond reliably on iOS (same fix as create event modal)
- Fixed a potential crash when filtering events with missing titles
- Home tab and onboarding screen reader improvements — scroll and back buttons now announce their purpose

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

[0.1.188]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.164...HEAD
[0.1.164]: https://github.com/christosgalaios/SocialiseApp/compare/0.1.150...0.1.164
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
