# Socialise App: Micro-Meets Matching Algorithm

## Overview

The matching algorithm calculates personalized compatibility scores between users and micro-meet events. It uses a multi-factor weighted scoring system to recommend events most likely to create meaningful connections.

**Score Range:** 0-100%
**Recommendation Threshold:** 40% (only matches above this show in recommendations)

---

## Scoring Factors

### 1. Interest Overlap (40 points max)

**Purpose:** Match user interests with event category keywords

**How it works:**
- Each event category maps to a set of interest keywords
- User's interests array is compared against event keywords
- Points awarded per matching interest (15 points per match, capped at 40)

**Example:**
```
User interests: ["Tech", "Music", "Food"]
Event: "Food & Drinks" category
Keywords: ["Food", "Cooking", "Wine", "Dining"]

Matches: "Food" → +15 points
Total: 15 points
```

**Category Mapping:**
```
Food & Drinks → ["Food", "Cooking", "Wine", "Dining"]
Outdoors → ["Nature", "Hiking", "Fitness", "Sports"]
Tech → ["Tech", "Programming", "Innovation", "AI"]
Arts → ["Art", "Design", "Music", "Creative"]
Games → ["Games", "Gaming", "Strategy", "Fun"]
Entertainment → ["Music", "Entertainment", "Nightlife", "Party"]
Nightlife → ["Music", "Nightlife", "Party", "Entertainment"]
Networking → ["Tech", "Business", "Entrepreneurship", "Networking"]
```

### 2. Location Proximity (30 points max)

**Purpose:** Boost events geographically closer to the user

**How it works:**
- Compares user location with event location (string similarity)
- Calculates similarity score (0-1)
- Awards up to 30 points based on proximity

**Rules:**
- Exact city match: 1.0 → 30 points
- Partial match (shared city name): 0.7 → 21 points
- General area match: 0.3 → 9 points
- No match: 0 → 0 points

**Tags Added:**
- 0.7+: "Near you"
- 0.3-0.7: "In your area"

### 3. Group Size Preference (15 points max)

**Purpose:** Reward users who value intimate connections

**How it works:**
- Events with ≤8 spots are considered micro-meets
- If user has "Intimate", "Community", "Connection", or "Deep" in interests:
  - +15 points and tag: "Perfect for meaningful connections"
- Otherwise: +8 points

**Rationale:** Micro-meets are designed for intimate groups, so users with explicit connection-seeking interests get higher matches.

### 4. Price Compatibility (15 points max)

**Purpose:** Encourage participation by rewarding accessible events

**Rules:**
- Free events (£0): +10 points + tag "Free event"
- Budget-friendly (£1-20): +8 points + tag "Great value"
- Premium events (£20+): +12 points if user is Pro subscriber

**Rationale:** Lower price barriers increase participation. Pro subscribers can afford premium experiences.

### 5. Event Timing (5 points max)

**Purpose:** Give small boost to soon-happening events

**Rules:**
- Events within 7 days: +5 points + tag "Coming up soon"
- Past/far-future events: 0 points

**Rationale:** Recent events create urgency and better user experience.

---

## Match Tags

Tags explain to users why an event was recommended. Each event can have up to 2 tags, chosen in priority order:

### Common Tags

| Tag | Triggered By | Condition |
|-----|---|---|
| "Matches your X & Y interests" | Interest overlap | 2+ matching interests |
| "Could expand your horizons" | No interest match but user active | User has interests set |
| "Near you" | Location proximity | >70% location match |
| "In your area" | Location proximity | 30-70% location match |
| "Perfect for meaningful connections" | Group size + interests | Small group + intimacy keywords |
| "Free event" | Price | £0 |
| "Great value" | Price | £1-20 |
| "Coming up soon" | Event timing | Within 7 days |
| "Check it out" | Fallback | No other tags apply |

---

## Example Calculations

### Example 1: Sarah

```
Profile:
- Interests: ["Food", "Wine", "Health"]
- Location: "London, UK"
- isPro: false

Event: "Wine Tasting Dinner" (Micro-Meet)
- Category: "Food & Drinks"
- Location: "London, UK"
- Price: £25
- Spots: 6
- Date: "2026-02-25" (in 6 days)

Scoring:
1. Interest overlap: "Food" matches, "Wine" matches → 2 matches × 15 = 30 pts
2. Location: Exact city match → 30 pts
3. Group size: 6 spots, no intimacy keywords → 8 pts
4. Price: £25 (not free/cheap, not Pro) → 0 pts
5. Timing: 6 days away → 5 pts

Total: 30 + 30 + 8 + 0 + 5 = 73%

Tags: ["Matches your Food & Wine interests", "Near you", "Coming up soon"]
→ Limited to top 2: ["Matches your Food & Wine interests", "Near you"]
```

### Example 2: Marcus

```
Profile:
- Interests: ["Tech", "AI", "Startups"]
- Location: "Bristol, UK"
- isPro: true

Event: "Coffee Chat: Founders" (Micro-Meet)
- Category: "Networking"
- Location: "London, UK"
- Price: £0
- Spots: 4
- Date: "2026-03-15" (in 24 days)

Scoring:
1. Interest overlap: "Tech" matches, "Startups" → "Entrepreneurship" → 2 matches × 15 = 30 pts
2. Location: Different cities, some word overlap → ~0.4 → 12 pts
3. Group size: 4 spots, no intimacy keywords → 8 pts
4. Price: £0 (free) → 10 pts
5. Timing: 24 days away → 0 pts

Total: 30 + 12 + 8 + 10 + 0 = 60%

Tags: ["Matches your Tech interests", "Free event"]
```

---

## API Integration

### Events Enrichment

Every event returned from `/api/events/*` endpoints automatically includes match scores:

**Request:**
```bash
GET /api/events?category=Food%20%26%20Drinks&size=micro
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Wine Tasting Dinner",
  "category": "Food & Drinks",
  "is_micro_meet": true,
  "matchScore": 73,
  "matchTags": ["Matches your Food & Wine interests", "Near you"],
  "attendees": 2,
  "spots": 6,
  "price": 25,
  "date": "2026-02-25",
  "time": "19:00",
  "location": "London, UK",
  ...
}
```

### Recommendations Endpoint

Get personalized recommendations sorted by score:

**Request:**
```bash
GET /api/events/recommendations/for-you?limit=10
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid1",
    "title": "Wine Tasting Dinner",
    "matchScore": 73,
    "matchTags": ["Matches your Food & Wine interests", "Near you"],
    ...
  },
  {
    "id": "uuid2",
    "title": "Tech Founders Coffee",
    "matchScore": 60,
    "matchTags": ["Matches your Tech interests", "Free event"],
    ...
  }
]
```

---

## Frontend Implementation

### Displaying Scores

The `MicroMeetCard` component displays match scores when available:

```jsx
{meet.matchScore !== undefined && (
  <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
    <Wand2 className="text-accent" size={12} />
    <span className="text-[10px] font-black text-accent uppercase">
      {meet.matchScore}% Match
    </span>
  </div>
)}
```

### Sorting Micro-Meets

The Explore tab sorts micro-meets by match score in descending order:

```jsx
{events
  .filter(e => e.isMicroMeet || e.is_micro_meet)
  .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  .map(meet => <MicroMeetCard meet={meet} onClick={setSelectedEvent} />)
}
```

---

## Algorithm Design Rationale

### Multi-Factor Weighting

The algorithm considers multiple dimensions because:
- **Interests alone** would miss people who are open to exploring
- **Location alone** would recommend irrelevant local events
- **Price alone** would recommend free events users don't want
- **Combined**, they create a holistic compatibility picture

### Threshold of 40%

Events scoring below 40% are filtered out from recommendations because:
- 40% = At least 1 interest match + some bonus points
- Prevents "generic" recommendations with no clear value
- Keeps recommendation list focused and high-quality

### Tag Limitation (2 tags)

Limiting to 2 tags because:
- UI space constraints on mobile
- Prevents cognitive overload
- Forces prioritization of most important factors

---

## Future Improvements

### 1. Event Attendance History
- Track which events user has attended
- Boost recommendations from similar event hosts
- Learn from past positive interactions

### 2. Social Network
- Factor in if friends are attending
- Recommend events popular in user's network
- Add "Friends attending" tag

### 3. Temporal Patterns
- Learn user's preferred times of week/day
- Recommend events matching historical attendance
- Weekend vs. weekday preferences

### 4. Machine Learning
- Replace rule-based algorithm with ML model
- Train on user interactions (join, skip, rate)
- Auto-discover optimal weights

### 5. Diversity Boost
- Ensure recommendations aren't too homogeneous
- Periodically boost lower-match but novel recommendations
- Help users discover new interests

### 6. Collaborative Filtering
- Recommend events popular with similar users
- "Users like you enjoyed..." approach
- Cross-pollinate interests across user base

---

## Testing the Algorithm

### Manual Testing

1. **Create a test micro-meet event:**
   ```sql
   INSERT INTO events (title, category, location, date, time, is_micro_meet, host_id, host_name, max_spots)
   VALUES ('Test Dinner', 'Food & Drinks', 'London', '2026-02-25', '19:00', true, 'test-user', 'Test Host', 6);
   ```

2. **Create a test user with interests:**
   - Update `server/users.json` with interests: `["Food", "Wine"]`

3. **Fetch events with matching:**
   ```bash
   curl -H "Authorization: Bearer {token}" http://localhost:3001/api/events
   ```

4. **Verify:**
   - Event has `matchScore` field
   - Score reflects interest overlap + location bonus
   - Tags are present and accurate

### Unit Tests (Recommended)

Create `server/matching.test.js`:
```javascript
const { calculateMatchScore } = require('./matching');

test('interest overlap scoring', () => {
  const user = { interests: ['Food', 'Wine'] };
  const event = {
    title: 'Dinner',
    category: 'Food & Drinks',
    location: 'London',
    is_micro_meet: true,
    max_spots: 6,
    price: 25
  };

  const { score, tags } = calculateMatchScore(user, event);

  expect(score).toBeGreaterThan(30);
  expect(tags).toContain(expect.stringContaining('Food'));
});
```

---

## Performance Considerations

### Calculation Timing
- Algorithm runs **per-event** on API response
- Complex calculation: ~1-2ms per event
- 100 events → 100-200ms total

### Optimization Strategies
1. **Cache matching results:** Store in Redis keyed by `(userId, eventId)`
2. **Batch calculation:** Pre-calculate for popular events
3. **Database-side filtering:** Move some logic to SQL (future)
4. **Lazy evaluation:** Only calculate when user views recommendations

### Current Implementation
- Simple JavaScript, no external dependencies
- Runs server-side on API calls
- Minimal performance impact for typical user loads

---

## Conclusion

The matching algorithm successfully bridges between cold algorithmic matching and warm human connection. By considering multiple factors holistically, it increases the probability users attend relevant events and form meaningful connections.

The system is intentionally conservative (40% threshold) to ensure quality over quantity, while remaining extensible for future ML-driven improvements.
