import { create } from 'zustand';
import api from '../api';

const useEventStore = create((set, get) => ({
  // State
  events: [],
  joinedEvents: [],
  savedEvents: [],
  selectedEvent: null,
  showCreate: false,
  chatMessages: {},
  showMatchModal: null,

  // Setters
  setEvents: (eventsOrUpdater) => {
    if (typeof eventsOrUpdater === 'function') {
      set((state) => ({ events: eventsOrUpdater(state.events) }));
    } else {
      set({ events: eventsOrUpdater });
    }
  },

  setJoinedEvents: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ joinedEvents: updater(state.joinedEvents) }));
    } else {
      set({ joinedEvents: updater });
    }
  },

  setSavedEvents: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ savedEvents: updater(state.savedEvents) }));
    } else {
      set({ savedEvents: updater });
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setShowCreate: (show) => set({ showCreate: show }),
  setChatMessages: (updater) => {
    if (typeof updater === 'function') {
      set((state) => ({ chatMessages: updater(state.chatMessages) }));
    } else {
      set({ chatMessages: updater });
    }
  },
  setShowMatchModal: (modal) => set({ showMatchModal: modal }),

  // Actions
  handleJoinEvent: async (eventId, { onSuccess, onError } = {}) => {
    const prevJoined = get().joinedEvents;
    const prevEvents = get().events;

    try {
      // Optimistic UI
      set((state) => ({
        joinedEvents: [...state.joinedEvents, eventId],
        events: state.events.map(e =>
          e.id === eventId ? { ...e, isJoined: true, attendees: (e.attendees || 0) + 1 } : e
        ),
      }));

      await api.joinEvent(eventId);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Rollback
      set({ joinedEvents: prevJoined, events: prevEvents });
      if (onError) onError(err);
      throw err;
    }
  },

  handleLeaveEvent: async (eventId, { onSuccess, onError } = {}) => {
    const prevJoined = get().joinedEvents;
    const prevEvents = get().events;

    try {
      set((state) => ({
        joinedEvents: state.joinedEvents.filter(id => id !== eventId),
        events: state.events.map(e =>
          e.id === eventId ? { ...e, isJoined: false, attendees: Math.max(0, (e.attendees || 1) - 1) } : e
        ),
      }));

      await api.leaveEvent(eventId);
      if (onSuccess) onSuccess();
    } catch (err) {
      set({ joinedEvents: prevJoined, events: prevEvents });
      if (onError) onError(err);
      throw err;
    }
  },

  handleSaveEvent: async (eventId, { onSuccess, onError } = {}) => {
    const prevSaved = get().savedEvents;
    const prevEvents = get().events;

    try {
      set((state) => ({
        savedEvents: [...state.savedEvents, eventId],
        events: state.events.map(e => e.id === eventId ? { ...e, isSaved: true } : e),
      }));

      await api.saveEvent(eventId);
      if (onSuccess) onSuccess();
    } catch (err) {
      set({ savedEvents: prevSaved, events: prevEvents });
      if (onError) onError(err);
      throw err;
    }
  },

  handleUnsaveEvent: async (eventId, { onSuccess, onError } = {}) => {
    const prevSaved = get().savedEvents;
    const prevEvents = get().events;

    try {
      set((state) => ({
        savedEvents: state.savedEvents.filter(id => id !== eventId),
        events: state.events.map(e => e.id === eventId ? { ...e, isSaved: false } : e),
      }));

      await api.unsaveEvent(eventId);
      if (onSuccess) onSuccess();
    } catch (err) {
      set({ savedEvents: prevSaved, events: prevEvents });
      if (onError) onError(err);
      throw err;
    }
  },

  fetchEventChat: async (eventId, userId) => {
    try {
      const messages = await api.getEventChat(eventId);
      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [eventId]: (messages || []).map(m => ({
            id: m.id,
            user: m.user_name,
            avatar: m.user_avatar,
            message: m.message,
            time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            isMe: m.user_id === userId,
            isHost: m.is_host,
            isSystem: m.is_system,
          })),
        },
      }));
    } catch (err) {
      console.error('Failed to fetch chat:', err);
    }
  },

  sendMessage: async (eventId, text, currentUser) => {
    if (!text.trim()) return;
    const name = currentUser?.name ?? 'Guest';
    const parts = name.split(' ');
    const optimisticId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: optimisticId,
      user: `${parts[0] ?? ''} ${parts[1]?.[0] ?? ''}.`.trim() || 'Guest',
      avatar: currentUser?.avatar ?? '',
      message: text,
      time: 'Just now',
      isMe: true,
    };

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [eventId]: [...(state.chatMessages[eventId] || []), optimisticMsg],
      },
    }));

    try {
      await api.sendEventMessage(eventId, text);
    } catch {
      // Remove optimistic message on failure - caller should show error
      set((state) => ({
        chatMessages: {
          ...state.chatMessages,
          [eventId]: (state.chatMessages[eventId] || []).filter(m => m.id !== optimisticId),
        },
      }));
      throw new Error('Failed to send message');
    }
  },

  createEvent: async (data) => {
    const newEvent = await api.createEvent(data);
    set((state) => ({
      events: [newEvent, ...state.events],
      showCreate: false,
    }));
    return newEvent;
  },
}));

export default useEventStore;
