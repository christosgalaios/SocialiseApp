import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import useCommunityStore from '../stores/communityStore';
import useFeedStore from '../stores/feedStore';
import FeedItem from './FeedItem';
import { playCardPress, playTap, hapticTap } from '../utils/feedback';

export default function HubTab() {
  const user = useAuthStore((s) => s.user);
  const communities = useCommunityStore((s) => s.communities);
  const userTribes = useCommunityStore((s) => s.userTribes);
  const setSelectedTribe = useCommunityStore((s) => s.setSelectedTribe);
  const setShowTribeDiscovery = useCommunityStore((s) => s.setShowTribeDiscovery);
  const feedPosts = useFeedStore((s) => s.feedPosts);
  const setSelectedUserProfile = useFeedStore((s) => s.setSelectedUserProfile);

  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 md:p-10 max-w-7xl mx-auto pb-32"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter mb-2 text-primary">Community Hub<span className="text-accent">.</span></h1>
        <p className="text-secondary/60 font-medium">Your tribes and local buzz.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Live Feed */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Live Pulse<span className="text-accent">.</span></h3>
          {feedPosts.length > 0 ? feedPosts.map(post => (
            <FeedItem key={post.id} post={{
              ...post,
              user: post.user_name || post.user,
              avatar: post.user_avatar || post.avatar,
              community: post.community_name || post.community,
              communityId: post.community_id || post.communityId,
              time: post.created_at ? new Date(post.created_at).toLocaleDateString() : post.time,
              likes: Object.values(post.reactions || {}).reduce((a, b) => a + b, 0),
              comments: 0,
            }} currentUser={{ name: user?.name ?? 'Guest', avatar: user?.avatar ?? '' }} onOpenProfile={setSelectedUserProfile} />
          )) : (
            <div className="text-center text-secondary/40 text-sm font-medium py-8">No posts yet. Be the first!</div>
          )}
        </div>

        {/* Local Tribes */}
        <div>
          <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Your Tribes<span className="text-accent">.</span></h3>
          <div className="space-y-4">
            {communities.filter(c => userTribes.includes(c.id)).map(comm => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={comm.id}
                onClick={() => { playCardPress(); hapticTap(); setSelectedTribe(comm); }}
                className="premium-card p-4 flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-[18px] bg-secondary/10 flex items-center justify-center text-2xl border border-secondary/20 shadow-inner group-hover:bg-secondary/20 transition-colors">
                  {comm.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-sm truncate">{comm.name}</h4>
                  </div>
                  <p className="text-[11px] text-secondary/60 truncate">{comm.members || 0} members</p>
                </div>
              </motion.div>
            ))}
            <button
              onClick={() => { playTap(); setShowTribeDiscovery(true); }}
              className="w-full py-4 border border-dashed border-primary/30 rounded-[20px] text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary/50 transition-all uppercase tracking-widest"
            >
              + Find New Tribe
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
