import {
  LayoutGrid, Footprints, Martini, Dice5, Music, Palette, GraduationCap, Dumbbell, Coffee,
} from 'lucide-react';

// --- DEFAULT AVATAR ---
// Used as fallback when a user has no profile picture
const BASE_URL = import.meta.env.BASE_URL || '/';
export const DEFAULT_AVATAR = `${BASE_URL}default-avatar.svg`;

// --- CATEGORIES ---
export const CATEGORIES = [
  { id: 'All', label: 'All', icon: LayoutGrid },
  { id: 'Food & Drinks', label: 'Food & Drinks', icon: Coffee },
  { id: 'Outdoors', label: 'Outdoors', icon: Footprints },
  { id: 'Entertainment', label: 'Entertainment', icon: Music },
  { id: 'Active', label: 'Active', icon: Dumbbell },
  { id: 'Creative', label: 'Creative', icon: Palette },
  { id: 'Learning', label: 'Learning', icon: GraduationCap },
  { id: 'Nightlife', label: 'Nightlife', icon: Martini },
  { id: 'Games', label: 'Games', icon: Dice5 },
];

// --- INCLUSIVITY TAGS ---
export const INCLUSIVITY_TAGS = [
  { id: 'dog-friendly', label: 'Dog Friendly', emoji: '🐕', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  { id: 'women-only', label: 'Women Only', emoji: '♀️', color: 'bg-pink-500/10 text-pink-700 border-pink-500/20' },
  { id: 'lgbtq', label: 'LGBTQ+ Friendly', emoji: '🏳️‍🌈', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
  { id: 'elder-friendly', label: 'Elder Friendly', emoji: '🤝', color: 'bg-teal-500/10 text-teal-700 border-teal-500/20' },
  { id: 'wheelchair', label: 'Wheelchair Accessible', emoji: '♿', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  { id: 'sober', label: 'Sober Friendly', emoji: '🍃', color: 'bg-green-500/10 text-green-700 border-green-500/20' },
];

// --- CATEGORY-SPECIFIC ATTRIBUTES ---
// Each category can define its own custom attributes shown on event detail
export const CATEGORY_ATTRIBUTES = {
  'Outdoors': [
    { key: 'difficulty', label: 'Difficulty', options: ['Easy', 'Moderate', 'Challenging', 'Expert'] },
    { key: 'distance', label: 'Distance', unit: 'km' },
    { key: 'elevation', label: 'Elevation Gain', unit: 'm' },
    { key: 'terrain', label: 'Terrain', options: ['Paved', 'Trail', 'Muddy', 'Rocky', 'Mixed'] },
    { key: 'steepness', label: 'Steepness', options: ['Flat', 'Gentle', 'Moderate', 'Steep', 'Very Steep'] },
  ],
  'Food & Drinks': [
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'dietary', label: 'Dietary Options', options: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal', 'Kosher'] },
    { key: 'dressCode', label: 'Dress Code', options: ['Casual', 'Smart Casual', 'Formal'] },
  ],
  'Active': [
    { key: 'fitnessLevel', label: 'Fitness Level', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'equipment', label: 'Equipment Needed' },
    { key: 'duration', label: 'Duration', unit: 'hrs' },
  ],
  'Nightlife': [
    { key: 'dressCode', label: 'Dress Code', options: ['Casual', 'Smart Casual', 'Formal'] },
    { key: 'musicGenre', label: 'Music Genre' },
    { key: 'ageMin', label: 'Min Age' },
  ],
  'Entertainment': [
    { key: 'genre', label: 'Genre' },
    { key: 'duration', label: 'Duration', unit: 'hrs' },
    { key: 'dressCode', label: 'Dress Code', options: ['Casual', 'Smart Casual', 'Formal'] },
  ],
  'Games': [
    { key: 'gameType', label: 'Game Type', options: ['Board Games', 'Card Games', 'Video Games', 'Trivia', 'RPG'] },
    { key: 'skillLevel', label: 'Skill Level', options: ['Beginner Friendly', 'Intermediate', 'Competitive'] },
    { key: 'gamesProvided', label: 'Games Provided', options: ['Yes', 'Bring Your Own', 'Both'] },
  ],
  'Creative': [
    { key: 'medium', label: 'Medium' },
    { key: 'skillLevel', label: 'Skill Level', options: ['Beginner', 'Intermediate', 'Advanced'] },
    { key: 'materialsIncluded', label: 'Materials Included', options: ['Yes', 'No', 'Partial'] },
  ],
  'Learning': [
    { key: 'topic', label: 'Topic' },
    { key: 'level', label: 'Level', options: ['Introductory', 'Intermediate', 'Advanced'] },
    { key: 'format', label: 'Format', options: ['Workshop', 'Lecture', 'Discussion', 'Hands-on'] },
  ],
};

// --- ADVERTISED EVENTS (video showcase) ---
export const ADVERTISED_EVENTS = [
  { id: 201, title: "Secret Rooftop Jazz", organizer: "Velvet Nights", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", thumbnail: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80", eventId: 6 },
  { id: 202, title: "Neon Run 5K", organizer: "City Striders", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail: "https://images.unsplash.com/photo-1533561023793-1628172c9183?w=800&q=80", eventId: 3 },
  { id: 203, title: "Taste of Tokyo", organizer: "Foodie Tribes", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80", eventId: 5 },
  { id: 204, title: "Underground Arcade", organizer: "Retro Gamers", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", eventId: 4 },
];

// --- XP & GAMIFICATION SYSTEM ---
export const XP_LEVELS = [
  { level: 1, title: 'Newcomer', xpRequired: 0, icon: '🌱', color: 'text-green-500' },
  { level: 2, title: 'Explorer', xpRequired: 100, icon: '🧭', color: 'text-blue-500' },
  { level: 3, title: 'Connector', xpRequired: 300, icon: '🤝', color: 'text-teal-500' },
  { level: 4, title: 'Socialite', xpRequired: 600, icon: '⭐', color: 'text-amber-500' },
  { level: 5, title: 'Trailblazer', xpRequired: 1000, icon: '🔥', color: 'text-orange-500' },
  { level: 6, title: 'Community Pillar', xpRequired: 1500, icon: '🏛️', color: 'text-purple-500' },
  { level: 7, title: 'Legend', xpRequired: 2500, icon: '👑', color: 'text-amber-600' },
  { level: 8, title: 'Luminary', xpRequired: 4000, icon: '💎', color: 'text-cyan-500' },
];

export const UNLOCKABLE_TITLES = [
  { id: 'first-event', title: 'First Steps', description: 'Join your first event', xpReward: 50, icon: '👣' },
  { id: 'social-butterfly', title: 'Social Butterfly', description: 'Join 5 events', xpReward: 100, icon: '🦋' },
  { id: 'tribe-leader', title: 'Tribe Leader', description: 'Join 3 communities', xpReward: 75, icon: '🛡️' },
  { id: 'conversation-starter', title: 'Conversation Starter', description: 'Send 10 messages', xpReward: 50, icon: '💬' },
  { id: 'explorer', title: 'Explorer', description: 'Attend events in 3 different categories', xpReward: 100, icon: '🗺️' },
  { id: 'micro-meet-maven', title: 'Micro-Meet Maven', description: 'Join 3 Micro-Meets', xpReward: 150, icon: '✨' },
  { id: 'streak-master', title: 'Streak Master', description: 'Maintain a 7-day streak', xpReward: 200, icon: '🔥' },
  { id: 'community-champion', title: 'Community Champion', description: 'Get 10 likes on posts', xpReward: 100, icon: '🏆' },
  { id: 'night-owl', title: 'Night Owl', description: 'Join a Nightlife event', xpReward: 50, icon: '🦉' },
  { id: 'early-bird', title: 'Early Bird', description: 'Join a morning event (before 10am)', xpReward: 50, icon: '🐦' },
];

export const PROFILE_STATS = [
  { key: 'socializing', label: 'Socializing', icon: '🗣️', maxLevel: 10 },
  { key: 'adventure', label: 'Adventure', icon: '⛰️', maxLevel: 10 },
  { key: 'creativity', label: 'Creativity', icon: '🎨', maxLevel: 10 },
  { key: 'leadership', label: 'Leadership', icon: '👑', maxLevel: 10 },
  { key: 'knowledge', label: 'Knowledge', icon: '📚', maxLevel: 10 },
];
