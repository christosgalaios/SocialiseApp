# Mango – Dev tasks (from QA report)

**Source:** [MANGO_UX_QA_REPORT.md](./MANGO_UX_QA_REPORT.md)

---

## Task 1 – BUG-1: Persist position when crawl is interrupted by tap
**Priority:** P1  
**File:** `src/components/Mango.jsx`  
**Description:** In `handlePointerDown`, when `currentPose === 'wall_crawl'`, after stopping the animation and before `enterIdle()`, call `onPositionChange({ x: x.get(), y: y.get() })` so the interrupted crawl position is persisted.  
**Acceptance:** After interrupting a wall crawl with a tap, refresh or tab switch and return – cat remains at the interrupted position.

---

## Task 2 – BUG-2: Reset pose to carried when dragging off the wall
**Priority:** P1  
**File:** `src/components/Mango.jsx`  
**Description:** In `handleDrag`, when not in `isOnWall` state and current bounds are *not* in the wall zone (bounds.left > WALL_THRESHOLD and bounds.right < winW - WALL_THRESHOLD), set pose back to `'carried'` so the cat does not show wall_grab in the center.  
**Acceptance:** Drag to wall (wall_grab), then drag back to center – pose switches to carried before release.

---

## Task 3 – UX-1 (optional): Tap to detach from wall
**Priority:** P2  
**File:** `src/components/Mango.jsx`  
**Description:** In `handlePointerDown`, when `isOnWall` is set and user is not yet dragging, treat tap as detach: clear crawl timer, set `isOnWall` to null, call `onPositionChange({ x: x.get(), y: y.get() })`, keep current pose or call `enterIdle()`. Ensure this does not conflict with hold-to-purr (e.g. only detach on quick tap, or detach after clearing crawl timer).  
**Acceptance:** Cat stuck on wall; single tap detaches her and she stays at same position (idle).

---

## Task 4 – UX-2 (optional): Softer wall_grab → wall_crawl transition
**Priority:** P3  
**Description:** Deferred unless product requests it. No implementation in this pass.
