# Mango behaviour – test and improvement notes

Use this file to record manual test results and improvement ideas. See the test matrix in the plan (`.cursor/plans/` or project docs).

## Format for each test run

| Date / build | Scenario | Result | Notes | Suggested change |
|--------------|----------|--------|-------|------------------|
| (e.g. 2025-02-11) | (e.g. Wall left – stick and crawl) | pass / fail / partial | (e.g. Detach felt too easy on right wall) | (e.g. Increase DETACH_THRESHOLD for right wall) |

---

## Test runs

_Add rows below as you run tests._

| Date / build | Scenario | Result | Notes | Suggested change |
|--------------|----------|--------|-------|------------------|
| 2025-02-13 | Tap behaviour | pass | Was: single tap opened chat (unusable). Fixed: single=playful bounce, double=chat. | — |

---

## Implemented improvements (from plan)

- **Crawl interrupt**: Tap during `wall_crawl` stops the crawl, returns to idle, and does not open chat (`didDetachOnPointerDownRef`).
- **Unmount cleanup**: `yAnimRef` is stopped in the existing cleanup effect.
- **Crawl y-clamp**: Crawl target y is clamped to `Math.min(PULL_DOWN_FIRM, 0)` so she does not sit under the bottom nav.
- **Visual cling**: Subtle scale (1.02) when stuck on wall (`wall_grab` / `wall_crawl`) for feedback.

## Constants to tune (in `src/components/Mango.jsx`)

- `WALL_THRESHOLD = 28` – stickiness zone; larger = easier to stick.
- `DETACH_THRESHOLD = 50` – distance off wall to detach; larger = harder to peel off.
- `WALL_RESISTANCE = 0.38` – left-wall pull-back; right uses `1 - 0.38`.
- `CRAWL_DELAY_MS = 2200` – wait before starting crawl.
- `CRAWL_DISTANCE = 110` – how far she moves down (px); final y is clamped to `PULL_DOWN_FIRM`.
