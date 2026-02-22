import { useState, useCallback } from 'react';
import api from '../api';

/**
 * Custom hook to manage community/tribe-related state
 * Extracts community operations from App.jsx
 */
export function useCommunitiesState() {
  // Community data
  const [communities, setCommunities] = useState([]);
  const [selectedTribe, setSelectedTribe] = useState(null);
  const [showTribeDiscovery, setShowTribeDiscovery] = useState(false);

  // User's joined tribes (from localStorage)
  const [userTribes, setUserTribes] = useState(() => {
    const jsonValue = localStorage.getItem('socialise_tribes');
    if (jsonValue != null) {
      try {
        return JSON.parse(jsonValue);
      } catch {
        localStorage.removeItem('socialise_tribes');
      }
    }
    return [];
  });

  // Community chat messages
  const [communityChatMessages, setCommunityChatMessages] = useState({});

  // Persist user tribes to localStorage
  const persistUserTribes = useCallback((tribes) => {
    setUserTribes(tribes);
    localStorage.setItem('socialise_tribes', JSON.stringify(tribes));
  }, []);

  // Join tribe
  const handleJoinTribe = useCallback(async (tribe, { onSuccess, onError }) => {
    if (userTribes.includes(tribe.id)) return;

    try {
      // Optimistic UI
      persistUserTribes([...userTribes, tribe.id]);
      setCommunities(prev =>
        prev.map(c => c.id === tribe.id ? { ...c, isJoined: true } : c)
      );

      // API call
      await api.joinCommunity(tribe.id);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      persistUserTribes(userTribes.filter(id => id !== tribe.id));
      setCommunities(prev =>
        prev.map(c => c.id === tribe.id ? { ...c, isJoined: false } : c)
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [userTribes, persistUserTribes]);

  // Leave tribe
  const handleLeaveTribe = useCallback(async (tribeId, { onSuccess, onError }) => {
    communities.find(c => c.id === tribeId);

    try {
      // Optimistic UI
      persistUserTribes(userTribes.filter(id => id !== tribeId));
      setSelectedTribe(null);
      setCommunities(prev =>
        prev.map(c => c.id === tribeId ? { ...c, isJoined: false } : c)
      );

      // API call
      await api.leaveCommunity(tribeId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      persistUserTribes([...userTribes, tribeId]);
      setCommunities(prev =>
        prev.map(c => c.id === tribeId ? { ...c, isJoined: true } : c)
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, [userTribes, communities, persistUserTribes]);

  // Send community chat message
  const handleSendCommunityMessage = useCallback(async (tribeId, text, { currentUser, onSuccess, onError }) => {
    if (!text.trim()) return;

    try {
      const newMessage = {
        id: `temp-${Date.now()}`,
        user: currentUser.name || 'Guest',
        avatar: currentUser.avatar || '',
        message: text,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
      };

      // Optimistic UI
      setCommunityChatMessages(prev => ({
        ...prev,
        [tribeId]: [...(prev[tribeId] || []), newMessage],
      }));

      // API call
      await api.sendCommunityChatMessage(tribeId, text);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Remove optimistic message
      setCommunityChatMessages(prev => ({
        ...prev,
        [tribeId]: (prev[tribeId] || []).filter(m => !m.id.startsWith('temp-')),
      }));

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Fetch community chat messages
  const fetchCommunityChat = useCallback(async (tribeId) => {
    try {
      const messages = await api.getCommunityChat(tribeId);
      setCommunityChatMessages(prev => ({
        ...prev,
        [tribeId]: messages,
      }));
    } catch (err) {
      console.error('Failed to fetch community chat:', err);
    }
  }, []);

  return {
    // State
    communities,
    selectedTribe,
    showTribeDiscovery,
    userTribes,
    communityChatMessages,

    // Setters
    setCommunities,
    setSelectedTribe,
    setShowTribeDiscovery,
    setCommunityChatMessages,

    // Community handlers
    handleJoinTribe,
    handleLeaveTribe,
    handleSendCommunityMessage,
    fetchCommunityChat,
  };
}
