import {
  LayoutGrid, Footprints, Martini, Dice5, Utensils, Zap, Music, Palette, GraduationCap, Dumbbell, Coffee, PartyPopper,
  Dog, Shield, Heart, Users as UsersIcon, Accessibility
} from 'lucide-react';

// --- CONSTANTS ---
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

// --- MOCK DATA ---
export const INITIAL_EVENTS = [
  { id: 1, title: "Friday Social Drinks", date: "Feb 7", time: "19:00", location: "The Golden Lion, Soho", price: 0, spots: 25, image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80", category: "Food & Drinks", attendees: 18, host: "Super Socialisers", tags: ['lgbtq', 'sober'], categoryAttrs: { cuisine: 'Pub Classics', dietary: ['Vegan', 'Vegetarian'], dressCode: 'Casual' } },
  { id: 2, title: "90s vs 00s Party Night", date: "Feb 14", time: "22:00", location: "Electric Brixton", price: 15, spots: 150, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", category: "Nightlife", attendees: 89, host: "The Party Crew", tags: ['lgbtq'], categoryAttrs: { dressCode: 'Smart Casual', musicGenre: '90s Pop / 00s R&B', ageMin: '18+' } },
  { id: 3, title: "Winter Countryside Hike", date: "Feb 15", time: "10:00", location: "Box Hill, Surrey", price: 8, spots: 30, image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", category: "Outdoors", attendees: 22, host: "Wild Walkers", tags: ['dog-friendly', 'elder-friendly'], categoryAttrs: { difficulty: 'Moderate', distance: '12', elevation: '275', terrain: 'Muddy', steepness: 'Moderate' } },
  { id: 4, title: "Board Games & Pizza", date: "Feb 20", time: "19:30", location: "Draughts, Waterloo", price: 5, spots: 20, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80", category: "Games", attendees: 14, host: "Tabletop London", tags: ['lgbtq', 'elder-friendly', 'wheelchair'], categoryAttrs: { gameType: 'Board Games', skillLevel: 'Beginner Friendly', gamesProvided: 'Yes' } },
  { id: 5, title: "Bottomless Brunch", date: "Feb 22", time: "11:00", location: "The Breakfast Club", price: 35, spots: 12, image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80", category: "Food & Drinks", attendees: 10, host: "Brunch Club", tags: ['women-only'], categoryAttrs: { cuisine: 'British Brunch', dietary: ['Vegan', 'Gluten-Free'], dressCode: 'Smart Casual' } },
  { id: 6, title: "Live Jazz Night", date: "Feb 23", time: "20:00", location: "Ronnie Scott's", price: 25, spots: 40, image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80", category: "Entertainment", attendees: 35, host: "Jazz Lovers", tags: ['elder-friendly', 'wheelchair'], categoryAttrs: { genre: 'Jazz / Blues', duration: '3', dressCode: 'Smart Casual' } },
];

export const ADVERTISED_EVENTS = [
  { id: 201, title: "Secret Rooftop Jazz", organizer: "Velvet Nights", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", thumbnail: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=800&q=80", eventId: 6 },
  { id: 202, title: "Neon Run 5K", organizer: "City Striders", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail: "https://images.unsplash.com/photo-1533561023793-1628172c9183?w=800&q=80", eventId: 3 },
  { id: 203, title: "Taste of Tokyo", organizer: "Foodie Tribes", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", thumbnail: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80", eventId: 5 },
  { id: 204, title: "Underground Arcade", organizer: "Retro Gamers", video: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", eventId: 4 },
];

export const INITIAL_MICRO_MEETS = [
  { id: 101, title: "Dinner for 6", type: "dinner", date: "Feb 8", time: "19:30", location: "Dishoom, Covent Garden", price: 0, matchScore: 94, theme: "Tech & Travel", avatars: ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=3", "https://i.pravatar.cc/150?u=4"], spotsLeft: 2, isMicroMeet: true, category: "Curated", matchTags: ["FinTech", "Hiking", "Travel", "Python"], image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80" },
  { id: 102, title: "Hike for 4", type: "hike", date: "Feb 9", time: "09:00", location: "Hampstead Heath", price: 0, matchScore: 88, theme: "Nature Lovers", avatars: ["https://i.pravatar.cc/150?u=5", "https://i.pravatar.cc/150?u=6"], spotsLeft: 2, isMicroMeet: true, category: "Curated", matchTags: ["Outdoors", "Coffee", "Dogs", "Photography"], image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80" },
  { id: 103, title: "Coffee Chat", type: "coffee", date: "Feb 6", time: "11:00", location: "Monmouth Coffee", price: 0, matchScore: 91, theme: "Startup Founders", avatars: ["https://i.pravatar.cc/150?u=7", "https://i.pravatar.cc/150?u=8", "https://i.pravatar.cc/150?u=9"], spotsLeft: 1, isMicroMeet: true, category: "Curated", matchTags: ["SaaS", "Ventures", "AI", "Strategy"], image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80" },
];

export const COMMUNITIES = [
  { id: 1, name: "London Tech Socials", members: 1240, lastMessage: "Anyone up for pub quiz tonight?", unread: 3, avatar: "🚀", description: "Weekly meetups for tech enthusiasts. From startups to big tech, everyone's welcome.", memberAvatars: ["https://i.pravatar.cc/150?u=tech1", "https://i.pravatar.cc/150?u=tech2", "https://i.pravatar.cc/150?u=tech3", "https://i.pravatar.cc/150?u=tech4"], category: "Tech", isJoined: true, isCurated: true, rating: 4.8, reviewCount: 156, followers: 2340 },
  { id: 2, name: "Hiking Enthusiasts", members: 890, lastMessage: "Photos from last week's hike!", unread: 0, avatar: "🥾", description: "Exploring the UK's best trails together. All fitness levels welcome.", memberAvatars: ["https://i.pravatar.cc/150?u=hike1", "https://i.pravatar.cc/150?u=hike2", "https://i.pravatar.cc/150?u=hike3"], category: "Outdoors", isJoined: true, isCurated: false, rating: 4.6, reviewCount: 89, followers: 1560 },
  { id: 3, name: "Board Game Night", members: 445, lastMessage: "New games arriving Thursday", unread: 1, avatar: "🎲", description: "Monthly game nights across London. Strategy, party games, and more!", memberAvatars: ["https://i.pravatar.cc/150?u=game1", "https://i.pravatar.cc/150?u=game2", "https://i.pravatar.cc/150?u=game3", "https://i.pravatar.cc/150?u=game4"], category: "Games", isJoined: true, isCurated: true, rating: 4.9, reviewCount: 67, followers: 890 },
];

export const SUGGESTED_COMMUNITIES = [
  { id: 101, name: "Foodies United", members: 2100, avatar: "🍜", description: "Restaurant hopping, supper clubs, and culinary adventures.", memberAvatars: ["https://i.pravatar.cc/150?u=food1", "https://i.pravatar.cc/150?u=food2", "https://i.pravatar.cc/150?u=food3"], category: "Food & Drinks", matchReason: "Based on your interests" },
  { id: 102, name: "Creative Collective", members: 780, avatar: "🎨", description: "Artists, designers, and makers sharing inspiration.", memberAvatars: ["https://i.pravatar.cc/150?u=art1", "https://i.pravatar.cc/150?u=art2"], category: "Creative", matchReason: "Popular in Bristol" },
  { id: 103, name: "Book Club London", members: 560, avatar: "📚", description: "Monthly reads and lively discussions. Fiction and non-fiction.", memberAvatars: ["https://i.pravatar.cc/150?u=book1", "https://i.pravatar.cc/150?u=book2", "https://i.pravatar.cc/150?u=book3"], category: "Learning", matchReason: "Trending this week" },
  { id: 104, name: "Run Club UK", members: 3200, avatar: "🏃", description: "Weekly group runs, from 5K to marathons. All paces welcome.", memberAvatars: ["https://i.pravatar.cc/150?u=run1", "https://i.pravatar.cc/150?u=run2", "https://i.pravatar.cc/150?u=run3", "https://i.pravatar.cc/150?u=run4"], category: "Active", matchReason: "Based on your interests" },
  { id: 105, name: "Wine & Dine", members: 920, avatar: "🍷", description: "Tastings, vineyard trips, and pairing dinners.", memberAvatars: ["https://i.pravatar.cc/150?u=wine1", "https://i.pravatar.cc/150?u=wine2"], category: "Nightlife", matchReason: "Friends are members" },
];

export const INITIAL_MESSAGES = {
  1: [
    { id: 1, user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", message: "Can't wait for Friday! Who's bringing the good vibes? 🎉", time: "2h ago" },
    { id: 2, user: "James M.", avatar: "https://i.pravatar.cc/150?u=james", message: "Just RSVPd! First time joining, any tips?", time: "1h ago" },
    { id: 3, user: "Host", avatar: "https://i.pravatar.cc/150?u=host", message: "Welcome James! Just bring yourself and an open mind 😊", time: "45m ago", isHost: true },
  ]
};

/** Chats pulled from each community (group chat per community). Used by Group Chats when connected to a community. */
export const COMMUNITY_CHATS = {
  1: [
    { id: 1, user: "Marcus V.", avatar: "https://i.pravatar.cc/150?u=marcus", message: "Great session yesterday on AI Agents! Anyone caught the recording?", time: "2h ago", isMe: false },
    { id: 2, user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", message: "Yes! Will share the link in a sec", time: "1h ago", isMe: false },
    { id: 3, user: "James M.", avatar: "https://i.pravatar.cc/150?u=james", message: "Anyone up for pub quiz tonight?", time: "45m ago", isMe: false },
  ],
  2: [
    { id: 1, user: "Elena P.", avatar: "https://i.pravatar.cc/150?u=elena", message: "Photos from last week's hike! ⛰️", time: "3h ago", isMe: false },
    { id: 2, user: "Alex", avatar: "https://i.pravatar.cc/150?u=alex", message: "Stunning! Where was this?", time: "2h ago", isMe: false },
  ],
  3: [
    { id: 1, user: "Tom H.", avatar: "https://i.pravatar.cc/150?u=tom", message: "Who's coming to the Wingspan tournament next week? Still have 2 spots!", time: "1h ago", isMe: false },
    { id: 2, user: "Host", avatar: "https://i.pravatar.cc/150?u=host", message: "New games arriving Thursday", time: "30m ago", isMe: false },
  ],
};

export const FEED_POSTS = [
  { id: 1, user: "Marcus V.", avatar: "https://i.pravatar.cc/150?u=marcus", community: "London Tech Socials", communityId: 1, content: "Great session yesterday on AI Agents! Anyone caught the recording?", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", time: "12m ago", likes: 8, comments: 3 },
  { id: 2, user: "Elena P.", avatar: "https://i.pravatar.cc/150?u=elena", community: "Hiking Enthusiasts", communityId: 2, content: "View from the summit today! ⛰️", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", time: "1h ago", likes: 24, comments: 7 },
  { id: 3, user: "Tom H.", avatar: "https://i.pravatar.cc/150?u=tom", community: "Board Game Night", communityId: 3, content: "Who's coming to the Wingspan tournament next week? Still have 2 spots!", time: "3h ago", likes: 12, comments: 15 },
  { id: 4, user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", community: "London Tech Socials", communityId: 1, content: "Just landed a new role thanks to connections made here! 🎉 This community is amazing.", time: "5h ago", likes: 45, comments: 22 },
];

// --- COMMUNITY REVIEWS ---
export const COMMUNITY_REVIEWS = {
  1: [
    { id: 1, user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", rating: 5, text: "Best tech community in London! Made some incredible connections here.", time: "2 weeks ago", helpful: 12 },
    { id: 2, user: "James M.", avatar: "https://i.pravatar.cc/150?u=james", rating: 5, text: "The pub quiz nights are legendary. Super welcoming group.", time: "1 month ago", helpful: 8 },
    { id: 3, user: "Priya D.", avatar: "https://i.pravatar.cc/150?u=priya", rating: 4, text: "Great events but wish they had more weekend meetups.", time: "1 month ago", helpful: 5 },
  ],
  2: [
    { id: 1, user: "Alex T.", avatar: "https://i.pravatar.cc/150?u=alex", rating: 5, text: "Perfect mix of challenging and fun hikes. Leaders are very experienced.", time: "1 week ago", helpful: 15 },
    { id: 2, user: "Elena P.", avatar: "https://i.pravatar.cc/150?u=elena", rating: 4, text: "Beautiful routes, but sometimes the pace is a bit fast for beginners.", time: "3 weeks ago", helpful: 7 },
  ],
  3: [
    { id: 1, user: "Tom H.", avatar: "https://i.pravatar.cc/150?u=tom", rating: 5, text: "Amazing game selection and the pizza is actually great!", time: "5 days ago", helpful: 10 },
    { id: 2, user: "Jordan K.", avatar: "https://i.pravatar.cc/150?u=jordan", rating: 5, text: "So fun and such a welcoming crowd. I've been every month since joining.", time: "2 weeks ago", helpful: 6 },
  ],
};

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

export const DEMO_USER = {
  name: "Ben Barnes",
  location: "Bristol",
  avatar: "/ben-avatar.png",
  bio: "Lover of deep house, fine dining, and community building. Bristol local.",
  interests: ["Tech", "Music", "Food", "Networking"],
  tribe: "The Pioneers",
  isPro: true,
  followers: 142,
  following: 89,
  xp: 750,
  level: 4,
  selectedTitle: 'Social Butterfly',
  unlockedTitles: ['first-event', 'social-butterfly', 'tribe-leader', 'conversation-starter', 'night-owl'],
  stats: { socializing: 7, adventure: 4, creativity: 3, leadership: 5, knowledge: 6 },
};
