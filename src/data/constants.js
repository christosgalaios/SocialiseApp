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

// --- SKILLS SYSTEM ---
// Each skill has individual XP, 10 levels, and 4 milestone badges.
// All skills together contribute to the overall Fame Score.

// XP thresholds to reach each level (cumulative from 0)
export const SKILL_LEVEL_THRESHOLDS = [0, 50, 130, 250, 400, 590, 820, 1100, 1440, 1850];
// Max XP per skill = 1850 (level 10), so max total Fame XP = 5 × 1850 = 9250

export const SKILLS = [
  {
    key: 'social_spark',
    label: 'Social Spark',
    icon: '🗣️',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    barFrom: 'from-rose-400',
    barTo: 'to-primary',
    description: 'Connecting, chatting & lighting up the room',
    categories: ['Food & Drinks', 'Entertainment', 'Nightlife', 'Games'],
    badges: [
      { level: 3, id: 'icebreaker', name: 'Icebreaker', icon: '🤝', description: 'First connections made', isStamp: false },
      { level: 5, id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', description: 'Always fluttering to new people', isStamp: true },
      { level: 7, id: 'life_of_party', name: 'Life of the Party', icon: '🎉', description: 'Everyone knows your name', isStamp: false },
      { level: 10, id: 'golden_circle', name: 'Golden Circle', icon: '🥇', description: 'Inner circle status', isStamp: true },
    ],
  },
  {
    key: 'adventure_spirit',
    label: 'Adventure Spirit',
    icon: '⛰️',
    color: 'text-teal-600',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    barFrom: 'from-teal-400',
    barTo: 'to-secondary',
    description: 'Outdoor thrills, new places & bold choices',
    categories: ['Outdoors', 'Active'],
    badges: [
      { level: 3, id: 'day_tripper', name: 'Day Tripper', icon: '🎒', description: 'First steps into adventure', isStamp: false },
      { level: 5, id: 'hiking_boots', name: 'Hiking Boots', icon: '🥾', description: 'Trail-tested and ready', isStamp: true },
      { level: 7, id: 'summit_seeker', name: 'Summit Seeker', icon: '⛰️', description: 'Reaching new heights', isStamp: false },
      { level: 10, id: 'mountaineer', name: 'Mountaineer', icon: '🏔️', description: 'The mountain bows to you', isStamp: true },
    ],
  },
  {
    key: 'creative_soul',
    label: 'Creative Soul',
    icon: '🎨',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    barFrom: 'from-purple-400',
    barTo: 'to-accent',
    description: 'Art, music, making & self-expression',
    categories: ['Creative'],
    badges: [
      { level: 3, id: 'dabbler', name: 'Dabbler', icon: '🖌️', description: 'First brush strokes on life', isStamp: false },
      { level: 5, id: 'artisan', name: 'Artisan', icon: '🎭', description: 'Craft has become second nature', isStamp: true },
      { level: 7, id: 'muse', name: 'The Muse', icon: '✨', description: 'Inspiring others with your creativity', isStamp: false },
      { level: 10, id: 'renaissance_soul', name: 'Renaissance Soul', icon: '🌟', description: 'Master of all arts', isStamp: true },
    ],
  },
  {
    key: 'community_leader',
    label: 'Community Leader',
    icon: '👑',
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    barFrom: 'from-amber-400',
    barTo: 'to-accent',
    description: 'Hosting, organising & building tribes',
    categories: [],
    badges: [
      { level: 3, id: 'spark_plug', name: 'Spark Plug', icon: '⚡', description: 'Igniting community energy', isStamp: false },
      { level: 5, id: 'tribe_builder', name: 'Tribe Builder', icon: '🛡️', description: 'Communities form around you', isStamp: true },
      { level: 7, id: 'culture_keeper', name: 'Culture Keeper', icon: '🌿', description: 'Shaping the community vibe', isStamp: false },
      { level: 10, id: 'community_pillar', name: 'Community Pillar', icon: '🏛️', description: 'The foundation of it all', isStamp: true },
    ],
  },
  {
    key: 'knowledge_seeker',
    label: 'Knowledge Seeker',
    icon: '📚',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    barFrom: 'from-blue-400',
    barTo: 'to-secondary',
    description: 'Talks, workshops & growing your mind',
    categories: ['Learning'],
    badges: [
      { level: 3, id: 'curious_mind', name: 'Curious Mind', icon: '💡', description: 'Always asking why', isStamp: false },
      { level: 5, id: 'scholar', name: 'Scholar', icon: '📖', description: 'Knowledge is your superpower', isStamp: true },
      { level: 7, id: 'thought_leader', name: 'Thought Leader', icon: '🔭', description: 'Others seek your perspective', isStamp: false },
      { level: 10, id: 'sage', name: 'The Sage', icon: '🎓', description: 'Wisdom incarnate', isStamp: true },
    ],
  },
];

// Helper: get skill level (1-10) from raw XP
export function getSkillLevel(xp) {
  let level = 1;
  for (let i = 0; i < SKILL_LEVEL_THRESHOLDS.length; i++) {
    if (xp >= SKILL_LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(level, 10);
}

// Helper: get progress % within current level
export function getSkillLevelProgress(xp) {
  const level = getSkillLevel(xp);
  if (level >= 10) return 100;
  const current = SKILL_LEVEL_THRESHOLDS[level - 1];
  const next = SKILL_LEVEL_THRESHOLDS[level];
  return Math.min(((xp - current) / (next - current)) * 100, 100);
}

// XP awarded per action — maps to skill keys
export const SKILL_XP_ACTIONS = {
  // Category-mapped event joins
  join_event_social: { social_spark: 20 },
  join_event_outdoors: { adventure_spirit: 25, social_spark: 5 },
  join_event_active: { adventure_spirit: 20, social_spark: 5 },
  join_event_creative: { creative_soul: 25, social_spark: 5 },
  join_event_learning: { knowledge_seeker: 25, social_spark: 5 },
  join_community: { community_leader: 25 },
  host_event: { community_leader: 35, social_spark: 10 },
  send_message: { social_spark: 3 },
  daily_login: { social_spark: 5 },
};

// Maps event categories to action keys
export const CATEGORY_TO_ACTION = {
  'Outdoors': 'join_event_outdoors',
  'Active': 'join_event_active',
  'Creative': 'join_event_creative',
  'Learning': 'join_event_learning',
};

// --- FAME SCORE (overall level from total skill XP) ---
// Max total skill XP = 9250 (5 skills × 1850 max each)
export const FAME_SCORE_LEVELS = [
  { level: 1,  title: 'Newcomer',         icon: '🌱', color: 'text-green-500',  totalXpRequired: 0 },
  { level: 2,  title: 'Rising Star',      icon: '🌟', color: 'text-sky-500',    totalXpRequired: 150 },
  { level: 3,  title: 'Social Explorer',  icon: '🧭', color: 'text-blue-500',   totalXpRequired: 400 },
  { level: 4,  title: 'Scene Regular',    icon: '⭐', color: 'text-teal-500',   totalXpRequired: 800 },
  { level: 5,  title: 'Socialite',        icon: '🔥', color: 'text-amber-500',  totalXpRequired: 1500 },
  { level: 6,  title: 'Trendsetter',      icon: '💫', color: 'text-orange-500', totalXpRequired: 2500 },
  { level: 7,  title: 'Community Pillar', icon: '🏛️', color: 'text-purple-500', totalXpRequired: 4000 },
  { level: 8,  title: 'Legend',           icon: '👑', color: 'text-amber-600',  totalXpRequired: 5800 },
  { level: 9,  title: 'Icon',             icon: '💎', color: 'text-cyan-500',   totalXpRequired: 7500 },
  { level: 10, title: 'Luminary',         icon: '✦',  color: 'text-rose-400',   totalXpRequired: 9000 },
];

// Helper: get Fame Score level object from total XP
export function getFameLevel(totalXP) {
  return FAME_SCORE_LEVELS.filter(l => l.totalXpRequired <= totalXP).pop() || FAME_SCORE_LEVELS[0];
}

// Helper: get Fame Score progress % within current level
export function getFameLevelProgress(totalXP) {
  const current = getFameLevel(totalXP);
  const nextLevel = FAME_SCORE_LEVELS.find(l => l.totalXpRequired > totalXP);
  if (!nextLevel) return 100;
  const xpIn = totalXP - current.totalXpRequired;
  const xpNeeded = nextLevel.totalXpRequired - current.totalXpRequired;
  return Math.min((xpIn / xpNeeded) * 100, 100);
}

// --- LEGACY COMPAT: XP_LEVELS kept as alias for Fame Score levels ---
// Some components may still reference XP_LEVELS — this bridges the gap
export const XP_LEVELS = FAME_SCORE_LEVELS.map(l => ({
  ...l,
  xpRequired: l.totalXpRequired,
}));

// --- LEGACY: UNLOCKABLE_TITLES (kept for profile display of old badges) ---
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

// Legacy alias used by some components
export const PROFILE_STATS = SKILLS.map(s => ({
  key: s.key,
  label: s.label,
  icon: s.icon,
  maxLevel: 10,
}));
