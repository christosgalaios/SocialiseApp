/**
 * Micro-Meets Matching Algorithm
 * Calculates compatibility score between users and micro-meet events
 */

/**
 * Calculate match score between a user and a micro-meet event
 * Returns { score: 0-100, tags: string[] }
 */
function calculateMatchScore(user, event) {
    if (!event.is_micro_meet) {
        return { score: 0, tags: [] };
    }

    let score = 0;
    const tags = [];

    // 1. INTEREST OVERLAP (weight: 40 points max)
    // Map event categories to interest keywords
    const categoryKeywords = {
        'Food & Drinks': ['Food', 'Cooking', 'Wine', 'Dining'],
        'Outdoors': ['Nature', 'Hiking', 'Fitness', 'Sports'],
        'Tech': ['Tech', 'Programming', 'Innovation', 'AI'],
        'Arts': ['Art', 'Design', 'Music', 'Creative'],
        'Games': ['Games', 'Gaming', 'Strategy', 'Fun'],
        'Entertainment': ['Music', 'Entertainment', 'Nightlife', 'Party'],
        'Nightlife': ['Music', 'Nightlife', 'Party', 'Entertainment'],
        'Networking': ['Tech', 'Business', 'Entrepreneurship', 'Networking'],
    };

    const eventKeywords = categoryKeywords[event.category] || [event.category];
    const userInterests = user.interests || [];

    const interestMatches = userInterests.filter(interest =>
        eventKeywords.some(keyword =>
            interest.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(interest.toLowerCase())
        )
    );

    const interestScore = Math.min(40, interestMatches.length * 15);
    score += interestScore;

    if (interestMatches.length > 0) {
        const matchedInterests = interestMatches.slice(0, 2).join(' & ');
        tags.push(`Matches your ${matchedInterests} interests`);
    } else if (userInterests.length > 0) {
        // Give small bonus if user actively has interests set
        score += 5;
        tags.push('Could expand your horizons');
    }

    // 2. LOCATION PROXIMITY (weight: 30 points max)
    // If both have location data, calculate proximity score
    if (user.location && event.location && event.lat && event.lng) {
        const locationSimilarity = calculateLocationMatch(user.location, event.location);
        const proximityScore = Math.min(30, locationSimilarity * 30);
        score += proximityScore;

        if (locationSimilarity > 0.7) {
            tags.push('Near you');
        } else if (locationSimilarity > 0.3) {
            tags.push('In your area');
        }
    }

    // 3. GROUP SIZE PREFERENCE (weight: 15 points max)
    // Micro-meets are small (4-8 people), so we favor users without huge friend groups
    // and users who value intimate connections
    const eventSize = event.max_spots || 6;
    if (eventSize <= 8) {
        // Check if user has indicated preference for small groups
        const intimacyKeywords = ['Intimate', 'Community', 'Connection', 'Deep'];
        const hasIntimacyPreference = userInterests.some(interest =>
            intimacyKeywords.some(keyword =>
                interest.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (hasIntimacyPreference) {
            score += 15;
            tags.push('Perfect for meaningful connections');
        } else {
            score += 8;
        }
    }

    // 4. PRICE COMPATIBILITY (weight: 15 points max)
    // Free/cheap events boost score for all users
    if (event.price === 0) {
        score += 10;
        tags.push('Free event');
    } else if (event.price <= 20) {
        score += 8;
        tags.push('Great value');
    } else if (user.isPro) {
        // Pro users more likely to engage with premium micro-meets
        score += 12;
    }

    // 5. TIMING BOOST (weight: up to 5 points)
    // Upcoming events (within 7 days) get a small boost
    if (event.date) {
        const eventDate = new Date(event.date);
        const today = new Date();
        const daysUntilEvent = Math.floor((eventDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilEvent >= 0 && daysUntilEvent <= 7) {
            score += 5;
            tags.push('Coming up soon');
        }
    }

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Always include at least one tag
    if (tags.length === 0) {
        tags.push('Check it out');
    }

    return {
        score: Math.round(score),
        tags: tags.slice(0, 2) // Limit to top 2 tags for UI
    };
}

/**
 * Calculate location match score (0-1)
 * Simple string similarity matching (can be enhanced with geolocation)
 */
function calculateLocationMatch(userLocation, eventLocation) {
    if (!userLocation || !eventLocation) return 0;

    const userCity = userLocation.toLowerCase().split(',')[0].trim();
    const eventCity = eventLocation.toLowerCase().split(',')[0].trim();

    // Exact match
    if (userCity === eventCity) return 1;

    // Partial match (same word in location)
    const userWords = userCity.split(' ');
    const eventWords = eventCity.split(' ');

    const commonWords = userWords.filter(word =>
        eventWords.some(eWord => eWord.includes(word) || word.includes(eWord))
    ).length;

    const similarity = commonWords / Math.max(userWords.length, eventWords.length);
    return Math.max(0, Math.min(1, similarity));
}

/**
 * Get all matched micro-meets for a user, sorted by score
 * Returns array of { event, matchScore, matchTags }
 */
function getMatchedMicroMeets(user, microMeets) {
    return microMeets
        .filter(event => event.is_micro_meet)
        .map(event => {
            const { score, tags } = calculateMatchScore(user, event);
            return {
                ...event,
                matchScore: score,
                matchTags: tags,
            };
        })
        .filter(event => event.matchScore >= 30) // Only return meaningful matches
        .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Enrich events with match scores for a given user
 * Used by API endpoints to attach matchScore/matchTags to event responses
 */
function enrichEventsWithMatches(events, user) {
    if (!user) return events;

    return events.map(event => {
        if (event.is_micro_meet) {
            const { score, tags } = calculateMatchScore(user, event);
            return {
                ...event,
                matchScore: score,
                matchTags: tags,
            };
        }
        return event;
    });
}

module.exports = {
    calculateMatchScore,
    getMatchedMicroMeets,
    enrichEventsWithMatches,
    calculateLocationMatch,
};
