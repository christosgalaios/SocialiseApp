# Mango – Senior UX QA Report

**Scope:** All interactions and transitions for the Mango cat component (tap, hold, drag, wall, crawl, idle, fling, fall).  
**Type:** Code review + stress/edge-case analysis.

---

## 1. Bugs (must fix)

### BUG-1: Position not persisted when crawl is interrupted by tap
**Where:** `handlePointerDown` – when `currentPose === 'wall_crawl'` we call `stopYAnimation()`, `setIsOnWall(null)`, `enterIdle()` but never `onPositionChange({ x, y })`.  
**Effect:** Cat visually stops at current (x, y). After refresh or tab switch, `initialCoords` are still the last persisted value (e.g. when she stuck to the wall), so she jumps back.  
**Repro:** Stick cat to wall, wait for crawl to start, tap to interrupt mid-crawl, refresh or switch tab and return – cat jumps.

### BUG-2: Pose stays `wall_grab` when dragging back off the wall
**Where:** `handleDrag` – we set `wall_grab` when bounds enter wall zone but never set pose back to `carried` when bounds leave the wall zone.  
**Effect:** User drags to wall (wall_grab), then drags back to center – cat still shows wall_grab pose in the middle of the screen until release.  
**Repro:** Drag to right edge (wall_grab), drag back to center without releasing – wrong pose.

---

## 2. Behaviour / UX issues (should fix)

### UX-1: Tap while stuck on wall does not detach
**Current:** Tap (no drag) while in `wall_grab` only clears the crawl timer; cat stays stuck.  
**Effect:** User may expect “tap to detach”; currently they must drag.  
**Suggestion:** On pointer down, if `isOnWall` and not dragging, optionally detach (clear `isOnWall`, persist position) so tap = “let go”. Or document that only drag detaches.

### UX-2: No transition when switching from wall_grab to wall_crawl
**Current:** After CRAWL_DELAY_MS we set `currentPose` to `wall_crawl` with no transition.  
**Effect:** Pose change is instant; could feel abrupt.  
**Suggestion:** Low priority – consider a very short delay or pose blend if we add more poses later.

---

## 3. Transitions and sequences (verified)

| Transition | Result |
|------------|--------|
| Tap → playful → idle (800ms) | OK |
| Hold 300ms → purr; release → idle | OK |
| Drag start → carried; release on ground → idle | OK |
| Release above ground → fall → impact → sideeye_angry → idle | OK |
| Pull down then release → fling → float → fall → impact → sideeye_angry → idle | OK |
| Release on wall → wall_grab → (2.2s) wall_crawl → idle | OK (crawl target y clamped) |
| Tap during wall_crawl → idle at current position | Logic OK; position not persisted (BUG-1) |
| Idle 8s → clean; idle 8+14s → sleep | OK (guards prevent during wall/sequence) |
| Double-tap < 400ms → chat open | OK |

---

## 4. Stress / edge cases

- **Rapid tap then drag:** holdTimer cleared on drag start; pose becomes carried. OK.
- **Drag to wall, release, immediately drag again:** New drag clears crawl timer; carried pose. OK.
- **Tab switch during wall_crawl:** Unmount clears `wallCrawlTimeoutRef` and `stopYAnimation()`. OK.
- **Sync initialCoords:** useEffect syncs x,y from `initialCoords`; if parent passes new coords, cat jumps. Expected for “restore position”.
- **Slingshot + wall:** If release is both “on wall” and y ≥ SLINGSHOT_THRESHOLD, wall branch runs first (wall wins). Documented; OK.

---

## 5. Summary

- **Must fix:** 2 bugs (persist position on crawl interrupt; reset pose to carried when leaving wall zone during drag).
- **Should consider:** Tap-to-detach when stuck; optional softer transition wall_grab → wall_crawl.
- **Transitions and stress:** No other bugs found; cleanup and sequence guards look correct.
