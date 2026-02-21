import { useState, useCallback } from 'react';
import api from '../api';

/**
 * Custom hook to manage event-related state and handlers
 * Extracts event operations from App.jsx
 */
export function useEventsState() {
  // Event data
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  // Event chat messages
  const [chatMessages, setChatMessages] = useState({});

  // Event detail modal/match modal
  const [showMatchModal, setShowMatchModal] = useState(null);

  // Join event
  const handleJoinEvent = useCallback(async (eventId, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setJoinedEvents(prev => [...prev, eventId]);
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, isJoined: true, attendees: (e.attendees || 0) + 1 } : e
        )
      );

      // API call
      await api.joinEvent(eventId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      setJoinedEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, isJoined: false, attendees: (e.attendees || 1) - 1 } : e
        )
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Leave event
  const handleLeaveEvent = useCallback(async (eventId, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setJoinedEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, isJoined: false, attendees: Math.max(0, (e.attendees || 1) - 1) } : e
        )
      );

      // API call
      await api.leaveEvent(eventId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      setJoinedEvents(prev => [...prev, eventId]);
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId ? { ...e, isJoined: true, attendees: (e.attendees || 0) + 1 } : e
        )
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Save event
  const handleSaveEvent = useCallback(async (eventId, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setSavedEvents(prev => [...prev, eventId]);
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, isSaved: true } : e)
      );

      // API call
      await api.saveEvent(eventId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      setSavedEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, isSaved: false } : e)
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Unsave event
  const handleUnsaveEvent = useCallback(async (eventId, { onSuccess, onError }) => {
    try {
      // Optimistic UI
      setSavedEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, isSaved: false } : e)
      );

      // API call
      await api.unsaveEvent(eventId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Rollback optimistic UI
      setSavedEvents(prev => [...prev, eventId]);
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, isSaved: true } : e)
      );

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Send chat message
  const handleSendMessage = useCallback(async (eventId, text, { currentUser, onSuccess, onError }) => {
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
      setChatMessages(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), newMessage],
      }));

      // API call
      await api.sendEventChatMessage(eventId, text);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Remove optimistic message
      setChatMessages(prev => ({
        ...prev,
        [eventId]: (prev[eventId] || []).filter(m => !m.id.startsWith('temp-')),
      }));

      if (onError) {
        onError(err);
      }
      throw err;
    }
  }, []);

  // Fetch event chat messages
  const fetchEventChat = useCallback(async (eventId) => {
    try {
      const messages = await api.getEventChat(eventId);
      setChatMessages(prev => ({
        ...prev,
        [eventId]: messages,
      }));
    } catch (err) {
      console.error('Failed to fetch event chat:', err);
    }
  }, []);

  return {
    // State
    events,
    joinedEvents,
    savedEvents,
    selectedEvent,
    showCreate,
    chatMessages,
    showMatchModal,

    // Setters
    setEvents,
    setJoinedEvents,
    setSavedEvents,
    setSelectedEvent,
    setShowCreate,
    setChatMessages,
    setShowMatchModal,

    // Event handlers
    handleJoinEvent,
    handleLeaveEvent,
    handleSaveEvent,
    handleUnsaveEvent,
    handleSendMessage,
    fetchEventChat,
  };
}
