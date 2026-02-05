import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedItem = ({ post }) => (
  // Updated style to be less margin-heavy and work in grids
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="premium-card p-5 rounded-[24px] border border-secondary/5 relative overflow-hidden group hover:bg-secondary/5 transition-colors"
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-center gap-3 mb-4">
      <img src={post.avatar} className="w-10 h-10 rounded-[14px] object-cover border border-white/10 shadow-inner" alt={post.user} />
      <div>
        <h4 className="text-sm font-black tracking-tight text-secondary">{post.user}</h4>
        <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <span className="text-primary">{post.community}</span> • {post.time}
        </p>
      </div>
    </div>
    <p className="text-[15px] font-medium leading-relaxed mb-4 tracking-tight opacity-90">{post.content}</p>
    {post.image && (
      <div className="rounded-2xl overflow-hidden mb-4 border border-white/5 shadow-2xl">
        <img src={post.image} className="w-full h-56 object-cover transition-transform duration-1000 group-hover:scale-105" alt="Post content" />
      </div>
    )}
    <div className="flex items-center gap-6">
      <button className="flex items-center gap-2 text-secondary/40 hover:text-primary group transition-all">
        <div className="w-8 h-8 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
          <Heart size={16} className="group-hover:fill-current" />
        </div>
        <span className="text-xs font-black">{post.likes}</span>
      </button>
      <button className="flex items-center gap-2 text-secondary/40 hover:text-secondary group transition-all">
        <div className="w-8 h-8 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-secondary/10 transition-colors">
          <MessageCircle size={16} />
        </div>
        <span className="text-xs font-black">Comment</span>
      </button>
    </div>
  </motion.div>
);

export default FeedItem;
