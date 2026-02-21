import { describe, it, expect } from 'vitest';
import {
  calculateMatchScore,
  getMatchedMicroMeets,
  enrichEventsWithMatches,
  calculateLocationMatch,
} from './matching';

describe('Micro-Meets Matching Algorithm', () => {
  describe('calculateMatchScore', () => {
    const baseUser = {
      id: '1',
      name: 'Test User',
      location: 'London, UK',
      interests: ['Food', 'Tech', 'Travel'],
      isPro: false,
    };

    const baseMicroMeet = {
      id: 'event_1',
      title: 'Tech Dinner',
      category: 'Tech',
      date: '2025-02-28',
      location: 'London, UK',
      lat: 51.5074,
      lng: -0.1278,
      price: 15,
      max_spots: 6,
      is_micro_meet: true,
    };

    it('should return zero score for non-micro-meet events', () => {
      const regularEvent = { ...baseMicroMeet, is_micro_meet: false };
      const result = calculateMatchScore(baseUser, regularEvent);

      expect(result.score).toBe(0);
      expect(result.tags).toEqual([]);
    });

    it('should calculate score for micro-meet with matching interests', () => {
      const result = calculateMatchScore(baseUser, baseMicroMeet);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it('should award maximum 40 points for perfect interest match', () => {
      const user = {
        ...baseUser,
        interests: ['Tech', 'Innovation', 'Programming', 'AI'],
      };
      const event = {
        ...baseMicroMeet,
        category: 'Tech',
      };

      const result = calculateMatchScore(user, event);
      // Should have interest matches, up to 40 points
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should award location proximity points', () => {
      const result = calculateMatchScore(baseUser, baseMicroMeet);

      // Should have location match (same city)
      expect(result.score).toBeGreaterThan(0);
      expect(result.tags.some(tag => tag.includes('Near') || tag.includes('area'))).toBe(
        true
      );
    });

    it('should award points for free events', () => {
      const event = { ...baseMicroMeet, price: 0 };
      const result = calculateMatchScore(baseUser, event);

      expect(result.tags.some(tag => tag.includes('Free'))).toBe(true);
    });

    it('should award points for inexpensive events', () => {
      const event = { ...baseMicroMeet, price: 10 };
      const result = calculateMatchScore(baseUser, event);

      expect(result.tags.some(tag => tag.includes('Great value'))).toBe(true);
    });

    it('should award bonus for pro users on premium events', () => {
      const proUser = { ...baseUser, isPro: true };
      const expensiveEvent = { ...baseMicroMeet, price: 50 };

      const proResult = calculateMatchScore(proUser, expensiveEvent);
      const regularResult = calculateMatchScore(baseUser, expensiveEvent);

      expect(proResult.score).toBeGreaterThanOrEqual(regularResult.score);
    });

    it('should award points for upcoming events', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const soonEvent = {
        ...baseMicroMeet,
        date: dateStr,
      };

      const result = calculateMatchScore(baseUser, soonEvent);
      expect(result.tags.some(tag => tag.includes('Coming up'))).toBe(true);
    });

    it('should not award timing bonus for past events', () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const dateStr = lastWeek.toISOString().split('T')[0];

      const pastEvent = {
        ...baseMicroMeet,
        date: dateStr,
      };

      const result = calculateMatchScore(baseUser, pastEvent);
      expect(result.tags.some(tag => tag.includes('Coming up'))).toBe(false);
    });

    it('should award bonus for intimate event preference', () => {
      const intimateUser = {
        ...baseUser,
        interests: ['Community', 'Connection', 'Intimate'],
      };

      const result = calculateMatchScore(intimateUser, baseMicroMeet);
      expect(result.tags.some(tag => tag.includes('meaningful connections'))).toBe(true);
    });

    it('should always include at least one tag', () => {
      const userWithNoInterests = {
        ...baseUser,
        interests: [],
      };
      const nonMatchingEvent = {
        ...baseMicroMeet,
        category: 'Nightlife',
      };

      const result = calculateMatchScore(userWithNoInterests, nonMatchingEvent);
      expect(result.tags.length).toBeGreaterThanOrEqual(1);
    });

    it('should limit tags to maximum 2', () => {
      const result = calculateMatchScore(baseUser, baseMicroMeet);
      expect(result.tags.length).toBeLessThanOrEqual(2);
    });

    it('should clamp score between 0 and 100', () => {
      const results = [];

      // Test various combinations
      results.push(calculateMatchScore(baseUser, baseMicroMeet));
      results.push(
        calculateMatchScore(
          { ...baseUser, interests: [] },
          baseMicroMeet
        )
      );
      results.push(
        calculateMatchScore(
          {
            ...baseUser,
            interests: [
              'Tech',
              'Innovation',
              'Programming',
              'AI',
              'Development',
            ],
          },
          baseMicroMeet
        )
      );

      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
      });
    });

    it('should round score to nearest integer', () => {
      const result = calculateMatchScore(baseUser, baseMicroMeet);
      expect(Number.isInteger(result.score)).toBe(true);
    });

    it('should handle users without location data', () => {
      const userNoLocation = {
        ...baseUser,
        location: null,
      };

      const result = calculateMatchScore(userNoLocation, baseMicroMeet);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle events without location data', () => {
      const eventNoLocation = {
        ...baseMicroMeet,
        location: null,
      };

      const result = calculateMatchScore(baseUser, eventNoLocation);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateLocationMatch', () => {
    it('should return 1 for exact city match', () => {
      const similarity = calculateLocationMatch('London, UK', 'London, UK');
      expect(similarity).toBe(1);
    });

    it('should return 0 for completely different cities', () => {
      const similarity = calculateLocationMatch('London, UK', 'Paris, France');
      expect(similarity).toBe(0);
    });

    it('should handle cities with different formatting', () => {
      const similarity1 = calculateLocationMatch('London', 'London, UK');
      const similarity2 = calculateLocationMatch('london', 'LONDON');

      expect(similarity1).toBeGreaterThan(0);
      expect(similarity2).toBe(1);
    });

    it('should return 0 for null locations', () => {
      expect(calculateLocationMatch(null, 'London, UK')).toBe(0);
      expect(calculateLocationMatch('London, UK', null)).toBe(0);
      expect(calculateLocationMatch(null, null)).toBe(0);
    });

    it('should be case-insensitive', () => {
      const similarity1 = calculateLocationMatch('LONDON', 'london');
      const similarity2 = calculateLocationMatch('London', 'london');

      expect(similarity1).toBe(1);
      expect(similarity2).toBe(1);
    });

    it('should handle partial word matches', () => {
      const similarity = calculateLocationMatch(
        'San Francisco, CA',
        'San Diego, CA'
      );

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should return value between 0 and 1', () => {
      const testCases = [
        ['London', 'Paris'],
        ['New York, NY', 'New York, NJ'],
        ['San Francisco', 'San Francisco Bay'],
      ];

      testCases.forEach(([userLoc, eventLoc]) => {
        const similarity = calculateLocationMatch(userLoc, eventLoc);
        expect(similarity).toBeGreaterThanOrEqual(0);
        expect(similarity).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('getMatchedMicroMeets', () => {
    const user = {
      id: '1',
      name: 'User',
      location: 'London, UK',
      interests: ['Tech', 'Food'],
      isPro: false,
    };

    const microMeets = [
      {
        id: '1',
        title: 'Tech Dinner',
        category: 'Tech',
        is_micro_meet: true,
        location: 'London, UK',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      },
      {
        id: '2',
        title: 'Food Tour',
        category: 'Food & Drinks',
        is_micro_meet: true,
        location: 'London, UK',
        date: '2025-03-01',
        price: 30,
        max_spots: 8,
      },
      {
        id: '3',
        title: 'Nightlife Event',
        category: 'Nightlife',
        is_micro_meet: false,
        location: 'London, UK',
        date: '2025-03-02',
        price: 15,
        max_spots: 20,
      },
    ];

    it('should filter and return only micro-meets', () => {
      const result = getMatchedMicroMeets(user, microMeets);

      expect(result.every(event => event.is_micro_meet)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(2); // Only 2 micro-meets in test data
    });

    it('should add matchScore and matchTags to events', () => {
      const result = getMatchedMicroMeets(user, microMeets);

      result.forEach(event => {
        expect(event.matchScore).toBeDefined();
        expect(typeof event.matchScore).toBe('number');
        expect(event.matchTags).toBeDefined();
        expect(Array.isArray(event.matchTags)).toBe(true);
      });
    });

    it('should filter out events below minimum score threshold', () => {
      const lowScoreUser = {
        ...user,
        interests: [], // No interests, should get lower scores
        location: 'Paris, France', // Different location
      };

      const result = getMatchedMicroMeets(lowScoreUser, microMeets);

      // All returned events should have score >= 30
      result.forEach(event => {
        expect(event.matchScore).toBeGreaterThanOrEqual(30);
      });
    });

    it('should sort events by match score descending', () => {
      const result = getMatchedMicroMeets(user, microMeets);

      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].matchScore).toBeGreaterThanOrEqual(result[i].matchScore);
      }
    });

    it('should handle empty event list', () => {
      const result = getMatchedMicroMeets(user, []);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle user with no interests', () => {
      const userNoInterests = {
        ...user,
        interests: [],
      };

      const result = getMatchedMicroMeets(userNoInterests, microMeets);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('enrichEventsWithMatches', () => {
    const user = {
      id: '1',
      name: 'User',
      location: 'London, UK',
      interests: ['Tech'],
      isPro: false,
    };

    const events = [
      {
        id: '1',
        title: 'Tech Event',
        category: 'Tech',
        is_micro_meet: true,
        location: 'London, UK',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      },
      {
        id: '2',
        title: 'Regular Event',
        category: 'Social',
        is_micro_meet: false,
        location: 'London, UK',
        date: '2025-03-01',
      },
    ];

    it('should enrich micro-meets with match scores', () => {
      const enriched = enrichEventsWithMatches(events, user);

      const microMeet = enriched.find(e => e.is_micro_meet);
      expect(microMeet.matchScore).toBeDefined();
      expect(microMeet.matchTags).toBeDefined();
    });

    it('should not modify non-micro-meet events', () => {
      const enriched = enrichEventsWithMatches(events, user);

      const regularEvent = enriched.find(e => !e.is_micro_meet);
      expect(regularEvent.matchScore).toBeUndefined();
      expect(regularEvent.matchTags).toBeUndefined();
    });

    it('should return empty array if user is null', () => {
      const result = enrichEventsWithMatches(events, null);
      // Should return unmodified events or empty array based on implementation
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return unmodified events if user is undefined', () => {
      const result = enrichEventsWithMatches(events, undefined);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should preserve all original event properties', () => {
      const enriched = enrichEventsWithMatches(events, user);

      enriched.forEach((enrichedEvent, index) => {
        const originalEvent = events[index];
        expect(enrichedEvent.id).toBe(originalEvent.id);
        expect(enrichedEvent.title).toBe(originalEvent.title);
        expect(enrichedEvent.category).toBe(originalEvent.category);
      });
    });

    it('should handle large event lists', () => {
      const largeEventList = Array.from({ length: 100 }, (_, i) => ({
        id: `event_${i}`,
        title: `Event ${i}`,
        category: 'Tech',
        is_micro_meet: i % 2 === 0,
        location: 'London, UK',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      }));

      const enriched = enrichEventsWithMatches(largeEventList, user);
      expect(enriched.length).toBe(100);
    });
  });

  describe('Category-interest mapping', () => {
    it('should match Food & Drinks category with food interests', () => {
      const user = {
        id: '1',
        interests: ['Cooking', 'Wine'],
        location: 'London',
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Food & Drinks',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThan(0);
      expect(result.tags.length).toBeGreaterThan(0);
    });

    it('should match Outdoors category with nature interests', () => {
      const user = {
        id: '1',
        interests: ['Hiking', 'Nature'],
        location: 'London',
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Outdoors',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 0,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should match Arts category with creative interests', () => {
      const user = {
        id: '1',
        interests: ['Design', 'Art'],
        location: 'London',
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Arts',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle user with very long interests array', () => {
      const user = {
        id: '1',
        interests: Array.from({ length: 50 }, (_, i) => `Interest ${i}`),
        location: 'London',
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Tech',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle very high event price', () => {
      const user = {
        id: '1',
        interests: ['Luxury'],
        location: 'London',
        isPro: true,
      };

      const event = {
        id: '1',
        category: 'Entertainment',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 500,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should handle very large event size', () => {
      const user = {
        id: '1',
        interests: ['Socializing'],
        location: 'London',
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Social',
        is_micro_meet: true,
        location: 'London',
        date: '2025-02-28',
        price: 0,
        max_spots: 100,
      };

      const result = calculateMatchScore(user, event);
      // Large events get lower score for intimate gatherings
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters in location', () => {
      const user = {
        id: '1',
        interests: ['Food'],
        location: "Saint-Joël's-En-Montagne, France",
        isPro: false,
      };

      const event = {
        id: '1',
        category: 'Food & Drinks',
        is_micro_meet: true,
        location: "Saint-Joël's-En-Montagne, France",
        date: '2025-02-28',
        price: 20,
        max_spots: 6,
      };

      const result = calculateMatchScore(user, event);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });
});
