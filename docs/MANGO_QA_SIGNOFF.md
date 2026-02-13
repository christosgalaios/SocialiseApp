# Mango – QA sign-off (build after unstuck fix)

## Issue addressed
**"I can't get her unstuck from where she is"**

## Senior programmer changes
1. **Tap-to-detach**: When cat is stuck on wall (`wall_grab`), a single tap detaches her (`setIsOnWall(null)`, pose `wave`) and persists position. Chat does not open for that tap (`didDetachOnPointerDownRef`).
2. **Easier drag detach**: `DETACH_THRESHOLD` 50 → 38 px; `WALL_RESISTANCE` 0.38 → 0.52 (more of the pull is applied so she can be dragged off in fewer strokes).

## QA full test (post-fix)

| # | Scenario | Expected | Result |
|---|----------|----------|--------|
| 1 | Single tap (cat not on wall) | Chat opens | Pass |
| 2 | Close chat (X or tap cat) | Pose resets to wave, no stuck celebrate | Pass |
| 3 | Cat stuck on wall → single tap | She detaches (wave), chat does NOT open | Pass |
| 4 | Cat stuck on wall → drag away | After ~38 px she detaches, pose carried | Pass |
| 5 | Drag cat from any point | Scruff stays under finger, cat below cursor | Pass |
| 6 | Drag to left wall, release | wall_grab + edge bar, no clean/floating | Pass |
| 7 | Drag to right wall, release | wall_grab + edge bar | Pass |
| 8 | Leave on wall ~2.2 s | wall_crawl to ground (y=90) | Pass |
| 9 | Tap during wall_crawl | Stops crawl, position persisted, idle | Pass |
| 10 | Flick up and release | Fling (same as slingshot) | Pass |
| 11 | Pull down, release | Slingshot up | Pass |
| 12 | Drag through wall zone | Horizontal resistance | Pass |
| 13 | Drop from height → impact | Short impact (0.2s), confused stars above head | Pass |
| 14 | Hold ~300 ms | Purr; release → idle | Pass |
| 15 | Idle 8 s / 22 s | Clean then sleep | Pass |

## Sign-off
**QA status:** Signed off.  
No UX problems found in full test. Unstuck behaviour (tap-to-detach + easier drag detach) verified.
