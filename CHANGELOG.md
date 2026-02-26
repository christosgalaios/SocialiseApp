# Changelog

All notable changes to **Socialise** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.
Versions follow the pattern `0.1.{PR}` — derived automatically from the latest merged pull request number.

> **Maintainers:** Update this file as part of every PR that delivers a user-facing change.
> Add entries under `[Unreleased]`, then rename that section when releasing to production.

---

## [Unreleased]

### Fixed
- **Desktop sidebar branding** — sidebar now shows Socialise logo and tagline instead of blank space, improving desktop navigation clarity (BUG-1771935219235)
- **Mango drag bounds on resize** — Mango's draggable area now auto-updates when the window resizes, using a viewport-anchored constraint ref instead of manual calculations (BUG-1771935652026)
- **Connections card now tappable** — the "Connections" card on the profile page now opens your bookings when tapped, instead of being a dead button (BUG-1771954500334)
- **Text overflow in bug/feature modals** — both BugReportModal and FeatureRequestModal now consistently handle long text with word-break, overflow-wrap, and overscroll containment (BUG-1772022766344)

### Added
- **Public profile event card hover** — event cards on the public organiser profile nudge right on hover and scale on tap for tactile feedback
- **Public profile community card hover** — community cards on the public profile gain matching hover nudge and tap scale
- **Profile completeness chip stagger** — completeness check chips now stagger in with scale animation, incomplete items have hover background and tap scale for better affordance
- **View all events button animation** — the expand/collapse button now has hover scale, tap feedback, and smooth text transition between "View all" and "Show less"
- **Revenue active income indicator** — a pulsing green dot appears next to the "% paid" label in Revenue Insights, indicating active income
- **Most Popular Event tappable** — the "Most Popular Event" in Audience Insights is now a button that opens the event detail, with hover highlight and chevron
- **Edit profile unsaved indicator** — a pulsing amber dot appears next to "Edit Profile" header when there are unsaved changes, and the Save button gains a warm glow shadow
- **Verification request interaction** — the shield icon wobbles on hover, and the card has a decorative background glow
- **Dashboard loading skeleton cascade** — skeleton elements now stagger in with individual fade-up animations instead of a single pulse, with quick actions scaling in individually and stat cards cascading
- **Next Event countdown urgency pulse** — when the countdown says "Starting soon", a green border pulse animation appears around the card to draw attention
- **Stats card icon wobble** — stat card icons tilt and scale up on hover, value text shifts to primary color, label brightens — adds tactile feedback across both dashboard tabs
- **Public profile stat cards hover lift** — quick stats grid on the public organiser profile lifts on hover with staggered entrance animation
- **Public profile category chips stagger** — category chips on the public profile spring in with staggered scale animation
- **Public profile empty state polish** — the "hasn't hosted anything yet" message now shows a spring-animated icon in a styled container with helper text
- **Event card hover nudge** — event cards in the dashboard list subtly nudge right on hover for tactile feedback
- **Empty filter state icon** — the "No upcoming/past events" message now shows a contextual icon (clock or history) with spring entrance and search hint
- **Create community form header** — the Quick Create form now has a spring-animated Plus icon beside the header for better visual hierarchy
- **Organiser setup flow polish** — the Megaphone icon on step 1 springs in with rotation and has a breathing pulse; category grid items stagger in with scale; "Start Organising" button gets a pulsing glow on the final step
- **Widget settings panel animation** — settings gear icon spins in on open, toggle items stagger in with slide animation, checkbox icons pulse on toggle
- **Weekly activity bar hover scale** — individual bars in the weekly activity chart widen on hover with brightness boost for better data inspection
- **Milestone card hover lift** — milestone cards lift up on hover and scale down on tap for consistent tactile feedback
- **Attention alert icon pulse** — the warning icon on low-fill alerts gently pulses to draw organiser attention to urgent items
- **Edit profile category hover scale** — unselected category chips scale up on hover for better discoverability before tapping
- **Social link icon bounce** — the link icon container pulses when a social link is filled in, giving visual confirmation
- **Preview toggle eye animation** — the Eye button tilts slightly when preview is active and has tap-scale feedback
- **Setup flow back button feedback** — the back button on organiser setup now has hover scale and tap compression
- **Setup flow social link state** — social link icons turn green when a URL is entered, matching the edit profile behavior
- **Setup flow name progress bar** — the display name field now shows a thin progress bar that turns green once the minimum 2-character requirement is met
- **Public profile top event hover lift** — the "Top Event" highlight card lifts on hover and compresses on tap for consistent card feedback
- **Public profile social link hover scale** — social link chips scale up on hover and compress on tap for better affordance
- **Public profile follow button hover** — the Follow/Following button subtly scales up on hover before the tap compression
- **Category distribution hover nudge** — category rows in analytics slide right on hover for easier data scanning
- **Fill rate row hover nudge** — event fill rate rows in analytics slide right on hover for consistent interaction
- **Export analytics hover scale** — the Export button scales up on hover for better affordance
- **Stats card glow fix** — the subtle radial glow on stat cards now properly appears on hover instead of being stuck at a faint static opacity
- **Stats card trend badge hover** — the trend percentage badge (e.g. "+12%") subtly scales up on hover for visual polish
- **Switch to attendee hover underline** — the "Switch to attendee view" link shows an underline on hover for better affordance
- **Quick action keyboard focus rings** — Community, Edit, and Share quick action buttons now show a primary-colored ring when focused via keyboard
- **Keyboard shortcut badge hover** — the `C` and `E` shortcut badges on quick actions brighten on hover
- **Community size label transition** — the "Starting/Growing/Large" size label now transitions smoothly between color states
- **Setup flow progress label transition** — step labels ("Identity", "Categories", "Details") now smooth-transition color over 300ms instead of snapping
- **Edit profile social links focus ring** — the collapsible "Social Links" section header shows a focus ring when navigated via keyboard
- **Setup flow info card hover border** — the organiser benefits card on step 1 shows a subtle primary border on hover
- **Public profile loading skeleton cascade** — skeleton elements now animate with individual staggered delays instead of a single parent pulse
- **Public profile bio card hover border** — the bio section shows a subtle border on hover for visual depth
- **Edit profile verified badge hover glow** — the "Verified Organiser" badge shows a brighter border and soft shadow on hover
- **Dashboard tab keyboard focus rings** — Overview/Analytics tab buttons show a primary ring when navigated via keyboard
- **Event filter tab focus rings** — Upcoming/Past event filter tabs show a focus ring for keyboard accessibility
- **Checklist item focus rings** — pre-event checklist checkboxes show a focus ring when navigated via keyboard
- **Edit profile cover photo hover** — the dashed upload border transitions to primary color on hover for better discoverability
- **Edit profile input hover borders** — display name and bio inputs darken their border on hover before focus
- **Public profile event tab hover** — Upcoming/Past event tab buttons show a subtle background on hover and focus ring for keyboard nav
- **Setup flow close button hover** — the X close button now shows a darker background on hover
- **Setup flow category card focus ring** — category cards in step 2 show a focus ring when navigated via keyboard
- **Edit profile verification button focus ring** — the "Request" verification button shows a focus ring for keyboard accessibility
- **Checklist toggle focus ring** — the "Pre-event checklist" expand/collapse button shows a focus ring for keyboard nav
- **Note editor Save focus ring** — the event note Save button shows a focus ring for keyboard accessibility
- **Create community form focus rings** — both the Create and Cancel buttons in the inline community form now show focus rings
- **Edit profile close button hover** — the close button on the edit profile sheet darkens on hover
- **Edit profile remove cover hover** — the "Remove cover photo" X button darkens on hover
- **Public profile close button hover** — the close button on the public profile sheet darkens on hover
- **Event action buttons focus rings** — the pin, duplicate, and note buttons on event cards now show focus rings for keyboard accessibility
- **Event action buttons cursor pointer** — the pin, duplicate, and note div-buttons now show pointer cursor on hover for clear affordance
- **Input hover borders across lazy chunks** — setup flow bio textarea, social link inputs, and edit profile cover photo URL input all darken their border on hover for pre-focus affordance
- **All organiser input hover borders** — edit profile social link inputs, dashboard community name/description inputs, event search input, and note editor input all darken their border on hover for consistent pre-focus affordance
- **Profile share button focus ring** — the share profile button shows a focus ring for keyboard accessibility
- **Leave review CTA focus ring** — the "Leave a vibe review" button shows a focus ring for keyboard accessibility
- **Vibe tag hover scale** — vibe tags on the public organiser profile scale up on hover for tactile feedback
- **Complete focus-visible audit** — all remaining buttons across the organiser dashboard and profile sheet now show focus rings for keyboard accessibility: settings, refresh, edit, switch-to-attendee, alert view/dismiss, most popular event, create event (both empty states), clear search, event card rows, create community, leave-review link, and share profile
- **Review sheet polish** — close button hover state, vibe tag buttons focus rings, comment textarea hover border, delete button red focus ring, submit button focus ring
- **Review sheet loading skeleton cascade** — skeleton elements now stagger in with individual animation delays instead of a single parent pulse, plus additional skeleton elements for the comment area
- **Review comment progress bar** — the comment textarea now shows a thin progress bar that turns amber near the 200-character limit
- **Review tag counter transition** — the "X/5 selected" counter now smoothly transitions color when tags are added or removed
- **Community section focus rings** — create community toggle, community card rows, and view all events button now show focus rings for keyboard accessibility
- **Widget settings and quick actions focus rings** — widget toggle buttons, "New Event" quick action button now show focus rings for keyboard accessibility
- **Edit profile complete focus audit** — preview toggle, close, remove cover photo, category chips, and save button all now show focus rings for keyboard accessibility
- **Setup flow complete focus audit** — close, back, continue/submit buttons all now show focus rings; display name input gets hover border for pre-focus affordance
- **Profile sheet complete focus audit** — close, follow, highlight event, event rows, community rows, and social link chips all now show focus rings for keyboard accessibility
- **Decorative elements aria-hidden** — all decorative glow/blur divs, chevron indicators, hover overlays, pulse backgrounds, and ExternalLink icons across all organiser components now have `aria-hidden="true"` to prevent screen reader noise (13 elements total)
- **Alert view button transition** — the "View" link on attention alerts now has smooth transition-all instead of instant hover underline appearance
- **Edit profile lazy images** — preview cover photo, preview avatar, and cover photo display images now have `loading="lazy"` for consistent deferred loading
- **Safe area insets** — edit profile, setup flow, and profile sheet footer/content areas now respect `env(safe-area-inset-bottom)` to prevent content being clipped by the iOS home bar
- **Branded text selection** — selecting text anywhere in the app now highlights with a warm terracotta tint instead of the default browser blue
- **Selectable organiser content** — organiser display name, bio, stats values, and event notes can now be selected and copied (overrides the global `user-select: none` for content-heavy areas)
- **Dashboard community section focus rings** — create community toggle, community card rows, and "View all events" button now show focus rings for keyboard accessibility
- **Community empty state polish** — spring-animated icon with gradient background, staggered "Engage / Grow / Connect" hint tags, subtle glow backdrop
- **Profile stat badges staggered entrance** — the upcoming/past/communities/attendees badges in the organiser header animate in with spring scale stagger instead of appearing instantly
- **Community card hover lift** — community cards in the dashboard now lift on hover and scale on tap for tactile feedback
- **Social link chip interactions** — social link chips animate in with staggered fade, scale on hover/tap, and highlight with primary color on hover
- **Dismissable attention alerts** — alerts now have an X dismiss button with exit animation; sold-out events use a Zap icon (green) instead of the generic warning triangle
- **Organiser tier badge** — profile header now shows a spring-animated tier badge (Bronze/Silver/Gold) with matching colors and icon based on events hosted
- **Milestones staggered animation** — milestone cards animate in with staggered scale + fade, unlocked icons pulse, progress bars animate from zero with current/target counts
- **Milestone unlock counter** — header now shows "X/5" completion progress alongside the section title, with accent color when all milestones are unlocked
- **Weekly activity chart enhanced** — taller chart (h-20), today's bar highlighted in accent gold, event days show green dots below labels, hover tooltips show attendee count, total weekly stats in header
- **Event note card styling** — pinned notes now display in a styled card with an icon and background instead of a plain border-left
- **Checklist mini progress bar** — each event's pre-event checklist header shows a mini progress bar with green highlight when all tasks are complete
- **Top performer fill bar and category tag** — the Top Performer card now shows an animated fill progress bar and category tag with a badge-style percentage
- **Export analytics success state** — the Export button shows a brief green checkmark + "Done" state after exporting with a tap scale animation
- **Category distribution staggered bars** — analytics category bars now cascade in with staggered slide animation; the top category is highlighted with accent gold color
- **Fill rate bar spot counts** — event fill rate bars now show attendee/spot counts alongside percentages with staggered entry animations
- **HomeTab today's events fill bars** — today's events in the organiser overview now show mini progress bars with color-coded status and a "Full" badge when sold out
- **HomeTab stat cards animation** — the organiser overview stat grid on the Home tab now has staggered spring entry, hover lift, and tap scale animations
- **Public profile event tab pill** — the Upcoming/Past event tabs on the public organiser profile now use a smooth sliding pill animation, matching the dashboard's tab design
- **Follow button animation** — the Follow/Unfollow button on public profiles now has a spring tap animation and a smooth icon+text transition when toggling state
- **Audience insights progress bars** — average per event and overall fill rate metrics now show animated progress bars for quick visual comparison
- **Community total members count** — the "My Communities" section header now displays the combined member count across all your communities
- **Revenue paid vs free split bar** — revenue insights section now shows a visual bar indicating the proportion of paid to free events, with a percentage label
- **Event filter tab sliding pill** — the Upcoming/Past event filter buttons now have a smooth animated pill that slides between options when switching
- **Dynamic motivational tagline** — the organiser dashboard greeting now shows a context-aware subtitle that adapts to your stats (events running, people reached, upcoming count, etc.)
- **Dashboard tab sliding pill** — switching between Overview and Analytics tabs now shows a smooth animated pill that slides between options instead of an instant switch
- **Setup flow step labels** — the organiser onboarding progress bar now shows step names (Identity, Categories, Details) with color-coded active state
- **Category selection counter** — step 2 of setup shows an animated "X selected" counter that scales on change and turns green when requirement is met
- **Bio character progress bar** — step 3 of setup shows an animated progress bar below the bio textarea that turns amber near the limit
- **Clickable top event on public profile** — the "Top Event" highlight on the public organiser profile is now a button that opens the event detail sheet, with fill rate percentage badge and progress bar
- **Event category and price on public profile** — event rows on the public organiser profile now show category tags and ticket price
- **Community descriptions on public profile** — community rows on the public organiser profile now display a one-line description and category tag
- **Platform-specific social link colors** — social links on the public profile use platform-specific color accents (pink for Instagram, sky for Twitter, etc.) instead of uniform gray
- **Next event countdown fill bar** — the "Next Event" widget now shows attendee count and an animated fill progress bar with color-coded status
- **Community description previews** — community rows on the organiser dashboard now show a one-line description snippet and category tag
- **Your Events carousel** — home tab now shows all upcoming RSVP'd events in a horizontally scrollable carousel, with the next-up event always first. Each card shows countdown, time, location, and attendee fill bar (FEAT-1772137506380)
- **Organiser vibe reviews** — users can now leave vibe tags (welcoming, chill, fun vibe, etc.) and optional comments on organiser profiles to share their experience (FEAT-1772137892222)
- **Review tags on organiser profiles** — public organiser profiles display aggregated vibe tags with frequency counts from all reviewers
- **Review organiser from event details** — "Review Organiser" button in the Hosted By section of event details opens the review sheet

### Changed
- **OrganiserProfileSheet lazy-loaded** — the public organiser profile sheet is now code-split into its own 17KB chunk, reducing the main bundle from 500KB to 483KB
- **Profile header stat badges** — organiser profile header now shows pill-shaped badges for upcoming events, past events, communities, and total attendees with color-coded styling
- **Validation shake on edit profile** — save button now shakes when tapped with incomplete fields (display name too short or no category selected) instead of silently doing nothing
- **4-column quick actions grid** — dashboard quick actions expanded from 3 to 4 buttons with a new "Edit Profile" shortcut, hover lift animations, and keyboard shortcut hints on all buttons (N/C/E)
- **Keyboard shortcuts for community & edit** — press "C" to open community discovery and "E" to open edit profile from the organiser dashboard
- **Clickable events on public profiles** — tapping an event on the public organiser profile now opens the event detail sheet with full info and chat
- **Clickable communities on public profiles** — tapping a community on the public organiser profile now opens the community sheet
- **"View All" events button** — dashboard event list now shows a "View all X events" toggle when there are more than 5 events, expanding to show the full list
- **Event time in dashboard rows** — event rows on the organiser dashboard now show the event time alongside the relative date
- **Event price in dashboard rows** — paid events display their ticket price inline in the event row metadata
- **Search result count** — event search bar shows the number of matching results when filtering
- **Search clear button** — event search bar now has a clear (×) button to quickly reset the search query
- **Animated stat counters** — organiser dashboard stat cards now count up from 0 to their target value with a smooth ease-out animation on load
- **Enhanced analytics empty state** — the "no analytics yet" state now features gradient background orbs, a spring-animated icon, and preview tags (Fill rates, Revenue, Audience) to hint at what's coming
- **Enhanced events empty state** — the "no events yet" state features a gradient icon container with spring animation
- **Share organiser profile** — "Share" button on public organiser profile copies the profile link to clipboard
- **Public profile fill rate bars** — event rows on the public organiser profile now show a mini fill rate bar with color-coded progress
- **Public profile total attendees** — quick stats grid expanded to 2x2 with a new "Attendees" stat showing total reach across all events
- **Public profile category icons** — category tags on the organiser profile now show matching icons from the design system
- **Public profile avg fill bar** — engagement stats row now includes an animated progress bar alongside the fill rate percentage
- **Staggered public profile sections** — profile sections (stats, bio, social links, categories, events, communities) animate in sequentially on load
- **Dashboard event row stagger** — event rows on the organiser dashboard animate in with a cascading slide effect when switching tabs or searching
- **Edit profile live preview** — toggle a real-time preview card while editing your organiser profile to see how your name, bio, categories, and cover photo will look to others
- **Edit profile unsaved changes warning** — closing the edit profile sheet with unsaved changes prompts a confirmation dialog to prevent accidental data loss
- **Collapsible social links** — social links section in the edit profile sheet now collapses by default, showing a count badge of linked platforms; expand to edit
- **Character progress bars** — display name and bio fields show animated progress bars indicating character usage, with color changes near limits
- **Category selection animation** — category chips in the edit profile now animate with a spring scale effect on selection and a pop-in checkmark
- **Inline community creation** — create a community directly from the organiser dashboard without leaving the page; quick form with name and description fields
- **Dashboard community "+" button** — new add button in the communities section header for one-tap access to the community creation form
- **Staggered community row animations** — community rows on the organiser dashboard animate in with a cascading slide effect
- **Tier badge pop-in** — organiser tier badge (Bronze/Silver/Gold) now animates with a spring pop-in when the dashboard loads
- **Countdown value animation** — next event countdown number springs into view with a scale effect
- **Staggered form section entry** — edit profile form sections animate in sequentially for a polished sheet-open experience
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
- **Cover photo editing** — edit profile sheet now lets organisers set or remove a cover photo via URL
- **Verification request** — edit profile sheet shows a "Get Verified" section that submits a verification request; verified organisers see a green badge instead
- **Trend arrows on stat cards** — OrganiserStatsCard now shows TrendingUp/TrendingDown/Minus icons alongside percentage trends for clearer visual feedback
- **Follow button on public organiser profiles** — visitors can follow/unfollow organisers from the profile sheet with a gradient CTA button and visual state toggle
- **Public profile event tabs** — events on the public organiser profile are now split into "Upcoming" and "Past" tabs with counts and animated transitions
- **Animated stats on public profiles** — quick stats (events, communities, members) now animate with a spring pop-in effect when the profile loads
- **Enhanced "Hosted By" section** — event detail sheet now shows the host with a styled organiser badge, larger avatar with border, and a card-style background
- **Time-based dashboard greeting** — organiser dashboard header now shows "Good Morning/Afternoon/Evening, [name]" based on the current time of day
- **Organiser tier badges** — dashboard displays a Bronze/Silver/Gold tier badge based on events hosted (Bronze < 5, Silver < 20, Gold 20+) with matching colors and icons
- **Dashboard keyboard shortcuts** — press N to create a new event and R to refresh the dashboard (disabled when typing in inputs); New Event button shows a keyboard hint on desktop
- **Pin events** — organisers can pin important events to the top of their dashboard event list; pinned events show a gold highlight and pin icon, persisted to localStorage
- **Revenue insights** — analytics tab shows estimated revenue, paid event count, and average ticket price for organisers with paid events
- **Audience insights** — analytics tab shows average attendees per event, overall fill rate, total reach, and highlights the most popular event
- **Duplicate event** — tap the copy icon on any dashboard event row to pre-fill the Create Event form with that event's details (title, category, location, spots, price, image)
- **Event quick notes** — tap the note icon on any event row to add a personal reminder; notes are persisted locally and shown inline below each event
- **Weekly activity chart** — overview tab shows a 7-day bar chart of attendee activity, with animated bars and day labels
- **Dashboard event search** — search bar appears when 4+ events exist, filtering by title or category in real-time
- **Community growth indicators** — community rows now show size labels (New/Starting/Growing/Large) with color-coded badges and mini member bar
- **Export analytics** — download a text summary of all organiser analytics (performance stats, events, revenue) from the analytics tab
- **Attention alerts** — dashboard shows warnings for upcoming events with low fill rates and notifications for sold-out events that may need more spots
- **Organiser milestones** — overview tab shows a horizontally scrollable milestone tracker (First Event, 5 Events, 10 Events, 50 Attendees, 100 Attendees) with unlock progress bars
- **Public profile tier badge** — organiser profile sheet now shows Bronze/Silver/Gold tier badge instead of plain "Organiser" label
- **Public profile engagement stats** — average fill rate displayed prominently on the public organiser profile
- **Public profile top event highlight** — the best-performing event is showcased with an accent card on the public profile
- **Dashboard widget settings** — gear icon opens a panel to show/hide dashboard sections (alerts, completeness, milestones, activity chart, countdown)
- **Event pre-checklist** — each upcoming event has a collapsible 4-item checklist (Confirm venue, Share on socials, Send reminders, Prepare materials) with completion tracking persisted locally

### Changed
- **Edit profile sheet lazy-loaded** — OrganiserEditProfileSheet is now loaded on demand via React.lazy(), reducing the main bundle from 504KB to 491KB (13KB saved)
- **Organiser dashboard lazy-loaded** — OrganiserDashboard is now loaded on demand via React.lazy(), reducing the main bundle from 520KB to 494KB (26KB saved) with a matching loading skeleton
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
