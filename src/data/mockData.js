import {
  Sparkles, Footprints, Martini, Dice5, Utensils, Zap
} from 'lucide-react';

// --- CONSTANTS ---
export const CATEGORIES = [
  { id: 'All', label: 'All Events', icon: Sparkles },
  { id: 'Walks and hikes', label: 'Walks & Hikes', icon: Footprints },
  { id: 'Nights out', label: 'Nights Out', icon: Martini },
  { id: 'Games nights', label: 'Games Nights', icon: Dice5 },
  { id: 'Brunch', label: 'Brunch', icon: Utensils },
  { id: 'Music', label: 'Music', icon: Zap },
];

// --- MOCK DATA ---
export const INITIAL_EVENTS = [
  { id: 1, title: "Friday Social Drinks", date: "Feb 7", time: "19:00", location: "The Golden Lion, Soho", price: 0, spots: 25, image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80", category: "Nights out", attendees: 18, host: "Super Socialisers" },
  { id: 2, title: "90s vs 00s Party Night", date: "Feb 14", time: "22:00", location: "Electric Brixton", price: 15, spots: 150, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80", category: "Nights out", attendees: 89, host: "The Party Crew" },
  { id: 3, title: "Winter Countryside Hike", date: "Feb 15", time: "10:00", location: "Box Hill, Surrey", price: 8, spots: 30, image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80", category: "Walks and hikes", attendees: 22, host: "Wild Walkers" },
  { id: 4, title: "Board Games & Pizza", date: "Feb 20", time: "19:30", location: "Draughts, Waterloo", price: 5, spots: 20, image: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800&q=80", category: "Games nights", attendees: 14, host: "Tabletop London" },
  { id: 5, title: "Bottomless Brunch", date: "Feb 22", time: "11:00", location: "The Breakfast Club", price: 35, spots: 12, image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80", category: "Brunch", attendees: 10, host: "Brunch Club" },
  { id: 6, title: "Live Jazz Night", date: "Feb 23", time: "20:00", location: "Ronnie Scott's", price: 25, spots: 40, image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80", category: "Music", attendees: 35, host: "Jazz Lovers" },
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
  { id: 1, name: "London Tech Socials", members: 1240, lastMessage: "Anyone up for pub quiz tonight?", unread: 3, avatar: "🚀" },
  { id: 2, name: "Hiking Enthusiasts", members: 890, lastMessage: "Photos from last week's hike!", unread: 0, avatar: "🥾" },
  { id: 3, name: "Board Game Night", members: 445, lastMessage: "New games arriving Thursday", unread: 1, avatar: "🎲" },
];

export const INITIAL_MESSAGES = {
  1: [
    { id: 1, user: "Sarah K.", avatar: "https://i.pravatar.cc/150?u=sarah", message: "Can't wait for Friday! Who's bringing the good vibes? 🎉", time: "2h ago" },
    { id: 2, user: "James M.", avatar: "https://i.pravatar.cc/150?u=james", message: "Just RSVPd! First time joining, any tips?", time: "1h ago" },
    { id: 3, user: "Host", avatar: "https://i.pravatar.cc/150?u=host", message: "Welcome James! Just bring yourself and an open mind 😊", time: "45m ago", isHost: true },
  ]
};

export const FEED_POSTS = [
  { id: 1, user: "Marcus V.", avatar: "https://i.pravatar.cc/150?u=marcus", community: "London Tech Socials", content: "Great session yesterday on AI Agents! Anyone caught the recording?", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", time: "12m ago", likes: 8 },
  { id: 2, user: "Elena P.", avatar: "https://i.pravatar.cc/150?u=elena", community: "Hiking Enthusiasts", content: "View from the summit today! ⛰️", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", time: "1h ago", likes: 24 },
];

export const DEMO_USER = {
  name: "Ben Barnes",
  location: "Bristol",
  avatar: "/ben-avatar.png",
  bio: "Lover of deep house, fine dining, and community building. Bristol local.",
  interests: ["Tech", "Music", "Food", "Networking"],
  tribe: "The Pioneers",
  isPro: true
};
