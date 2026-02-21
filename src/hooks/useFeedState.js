import { useState, useCallback } from 'react';
import api from '../api';

/**
 * Custom hook to manage feed-related state
 * Extracts feed operations from App.jsx
 */
export function useFeedState() {
  // Feed data
  const [feedPosts, setFeedPosts] = useState([]);

  // Other user profile (from feed/comment/chat click)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  // Create post (in feed context)
  const handleCreatePost = useCallback(async (text, { onSuccess, onError }) => {
    if (!text.trim()) return;

    try {
      const tempId = `temp-${Date.now()}`;
      const newPost = {
        id: tempId,
        content: text,
        timestamp: new Date().toISOString(),
        isSaving: true,
      };

      // Optimistic UI
      setFeedPosts(prev => [newPost, ...prev]);

      // API call
      const createdPost = await api.createFeedPost(text);

      // Replace temp post with actual post
      setFeedPosts(prev =>
        prev.map(p => p.id === tempId ? createdPost : p)
      );

      if (onSuccess) {
        onSuccess(createdPost);
      }
    } catch (err) {
      // Remove optimistic post
      setFeedPosts(prev => prev.filter(p => !p.id.startsWith('temp-')));

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Delete post
  const handleDeletePost = useCallback(async (postId, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setFeedPosts(prev => prev.filter(p => p.id !== postId));

      // API call
      await api.deleteFeedPost(postId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback: Re-fetch the post or keep it visible
      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // React to post with emoji
  const handleReactToPost = useCallback(async (postId, emoji, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setFeedPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
              ...p,
              reactions: {
                ...p.reactions,
                [emoji]: (p.reactions?.[emoji] || 0) + 1,
              },
            }
            : p
        )
      );

      // API call
      await api.reactToFeedPost(postId, emoji);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      setFeedPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
              ...p,
              reactions: {
                ...p.reactions,
                [emoji]: Math.max(0, (p.reactions?.[emoji] || 1) - 1),
              },
            }
            : p
        )
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  return {
    // State
    feedPosts,
    selectedUserProfile,

    // Setters
    setFeedPosts,
    setSelectedUserProfile,

    // Feed handlers
    handleCreatePost,
    handleDeletePost,
    handleReactToPost,
  };
}
