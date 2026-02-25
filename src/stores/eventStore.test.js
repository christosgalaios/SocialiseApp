import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';

// Mock api
vi.mock('../api', () => ({
  default: {
    joinEvent: vi.fn(),
    leaveEvent: vi.fn(),
    saveEvent: vi.fn(),
    unsaveEvent: vi.fn(),
    getEventChat: vi.fn(),
    sendEventMessage: vi.fn(),
  },
}));

import api from '../api';
import useEventStore from './eventStore';

describe('eventStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    act(() => {
      useEventStore.setState({
        events: [],
        joinedEvents: [],
        savedEvents: [],
        selectedEvent: null,
        chatMessages: {},
        showMatchModal: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have empty events array', () => {
      expect(useEventStore.getState().events).toEqual([]);
    });

    it('should have empty joinedEvents', () => {
      expect(useEventStore.getState().joinedEvents).toEqual([]);
    });

    it('should have empty savedEvents', () => {
      expect(useEventStore.getState().savedEvents).toEqual([]);
    });

    it('should have null selectedEvent', () => {
      expect(useEventStore.getState().selectedEvent).toBeNull();
    });
  });

  describe('setters', () => {
    it('should set events directly', () => {
      const events = [{ id: '1', title: 'Test Event' }];
      act(() => useEventStore.getState().setEvents(events));
      expect(useEventStore.getState().events).toEqual(events);
    });

    it('should set events with updater function', () => {
      act(() => useEventStore.getState().setEvents([{ id: '1' }]));
      act(() => useEventStore.getState().setEvents(prev => [...prev, { id: '2' }]));
      expect(useEventStore.getState().events).toHaveLength(2);
    });

    it('should set joinedEvents directly', () => {
      act(() => useEventStore.getState().setJoinedEvents(['1', '2']));
      expect(useEventStore.getState().joinedEvents).toEqual(['1', '2']);
    });

    it('should set joinedEvents with updater function', () => {
      act(() => useEventStore.getState().setJoinedEvents(['1']));
      act(() => useEventStore.getState().setJoinedEvents(prev => [...prev, '2']));
      expect(useEventStore.getState().joinedEvents).toEqual(['1', '2']);
    });

    it('should set savedEvents directly', () => {
      act(() => useEventStore.getState().setSavedEvents(['3']));
      expect(useEventStore.getState().savedEvents).toEqual(['3']);
    });

    it('should set savedEvents with updater function', () => {
      act(() => useEventStore.getState().setSavedEvents(['1']));
      act(() => useEventStore.getState().setSavedEvents(prev => prev.filter(id => id !== '1')));
      expect(useEventStore.getState().savedEvents).toEqual([]);
    });

    it('should set selectedEvent', () => {
      const event = { id: '1', title: 'Test' };
      act(() => useEventStore.getState().setSelectedEvent(event));
      expect(useEventStore.getState().selectedEvent).toEqual(event);
    });

    it('should set chatMessages directly', () => {
      act(() => useEventStore.getState().setChatMessages({ '1': [{ id: 'm1' }] }));
      expect(useEventStore.getState().chatMessages).toEqual({ '1': [{ id: 'm1' }] });
    });

    it('should set chatMessages with updater function', () => {
      act(() => useEventStore.getState().setChatMessages({ '1': [] }));
      act(() => useEventStore.getState().setChatMessages(prev => ({
        ...prev,
        '1': [...prev['1'], { id: 'm1' }],
      })));
      expect(useEventStore.getState().chatMessages['1']).toHaveLength(1);
    });

    it('should set showMatchModal', () => {
      const event = { id: '1' };
      act(() => useEventStore.getState().setShowMatchModal(event));
      expect(useEventStore.getState().showMatchModal).toEqual(event);
    });
  });

  describe('handleJoinEvent', () => {
    it('should optimistically add event to joinedEvents', async () => {
      api.joinEvent.mockResolvedValue({});
      act(() => useEventStore.getState().setEvents([{ id: '1', attendees: 5 }]));

      await act(async () => {
        await useEventStore.getState().handleJoinEvent('1');
      });

      expect(useEventStore.getState().joinedEvents).toContain('1');
      expect(useEventStore.getState().events[0].attendees).toBe(6);
    });

    it('should call api.joinEvent', async () => {
      api.joinEvent.mockResolvedValue({});

      await act(async () => {
        await useEventStore.getState().handleJoinEvent('1');
      });

      expect(api.joinEvent).toHaveBeenCalledWith('1');
    });

    it('should call onSuccess callback', async () => {
      api.joinEvent.mockResolvedValue({});
      const onSuccess = vi.fn();

      await act(async () => {
        await useEventStore.getState().handleJoinEvent('1', { onSuccess });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should rollback on API failure', async () => {
      api.joinEvent.mockRejectedValue(new Error('Server error'));
      act(() => useEventStore.getState().setEvents([{ id: '1', attendees: 5 }]));

      await expect(
        act(async () => {
          await useEventStore.getState().handleJoinEvent('1');
        })
      ).rejects.toThrow('Server error');

      expect(useEventStore.getState().joinedEvents).not.toContain('1');
      expect(useEventStore.getState().events[0].attendees).toBe(5);
    });

    it('should call onError callback on failure', async () => {
      api.joinEvent.mockRejectedValue(new Error('Server error'));
      const onError = vi.fn();

      try {
        await act(async () => {
          await useEventStore.getState().handleJoinEvent('1', { onError });
        });
      } catch {
        // expected
      }

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('handleLeaveEvent', () => {
    it('should optimistically remove event from joinedEvents', async () => {
      api.leaveEvent.mockResolvedValue({});
      act(() => {
        useEventStore.getState().setJoinedEvents(['1']);
        useEventStore.getState().setEvents([{ id: '1', attendees: 5 }]);
      });

      await act(async () => {
        await useEventStore.getState().handleLeaveEvent('1');
      });

      expect(useEventStore.getState().joinedEvents).not.toContain('1');
      expect(useEventStore.getState().events[0].attendees).toBe(4);
    });

    it('should rollback on API failure', async () => {
      api.leaveEvent.mockRejectedValue(new Error('Server error'));
      act(() => {
        useEventStore.getState().setJoinedEvents(['1']);
        useEventStore.getState().setEvents([{ id: '1', attendees: 5 }]);
      });

      try {
        await act(async () => {
          await useEventStore.getState().handleLeaveEvent('1');
        });
      } catch {
        // expected
      }

      expect(useEventStore.getState().joinedEvents).toContain('1');
      expect(useEventStore.getState().events[0].attendees).toBe(5);
    });

    it('should not go below 0 attendees', async () => {
      api.leaveEvent.mockResolvedValue({});
      act(() => {
        useEventStore.getState().setJoinedEvents(['1']);
        useEventStore.getState().setEvents([{ id: '1', attendees: 0 }]);
      });

      await act(async () => {
        await useEventStore.getState().handleLeaveEvent('1');
      });

      expect(useEventStore.getState().events[0].attendees).toBe(0);
    });
  });

  describe('handleSaveEvent', () => {
    it('should optimistically add to savedEvents', async () => {
      api.saveEvent.mockResolvedValue({});
      act(() => useEventStore.getState().setEvents([{ id: '1' }]));

      await act(async () => {
        await useEventStore.getState().handleSaveEvent('1');
      });

      expect(useEventStore.getState().savedEvents).toContain('1');
      expect(useEventStore.getState().events[0].isSaved).toBe(true);
    });

    it('should rollback on API failure', async () => {
      api.saveEvent.mockRejectedValue(new Error('Failed'));
      act(() => useEventStore.getState().setEvents([{ id: '1' }]));

      try {
        await act(async () => {
          await useEventStore.getState().handleSaveEvent('1');
        });
      } catch {
        // expected
      }

      expect(useEventStore.getState().savedEvents).not.toContain('1');
    });
  });

  describe('handleUnsaveEvent', () => {
    it('should optimistically remove from savedEvents', async () => {
      api.unsaveEvent.mockResolvedValue({});
      act(() => {
        useEventStore.getState().setSavedEvents(['1']);
        useEventStore.getState().setEvents([{ id: '1', isSaved: true }]);
      });

      await act(async () => {
        await useEventStore.getState().handleUnsaveEvent('1');
      });

      expect(useEventStore.getState().savedEvents).not.toContain('1');
      expect(useEventStore.getState().events[0].isSaved).toBe(false);
    });

    it('should rollback on API failure', async () => {
      api.unsaveEvent.mockRejectedValue(new Error('Failed'));
      act(() => {
        useEventStore.getState().setSavedEvents(['1']);
        useEventStore.getState().setEvents([{ id: '1', isSaved: true }]);
      });

      try {
        await act(async () => {
          await useEventStore.getState().handleUnsaveEvent('1');
        });
      } catch {
        // expected
      }

      expect(useEventStore.getState().savedEvents).toContain('1');
    });
  });

  describe('fetchEventChat', () => {
    it('should fetch and transform chat messages', async () => {
      const mockMessages = [
        {
          id: 'm1',
          user_name: 'Alice',
          user_avatar: 'alice.jpg',
          message: 'Hello!',
          created_at: '2026-01-01T12:00:00Z',
          user_id: 'user-1',
          is_host: true,
          is_system: false,
        },
      ];
      api.getEventChat.mockResolvedValue(mockMessages);

      await act(async () => {
        await useEventStore.getState().fetchEventChat('event-1', 'user-1');
      });

      const messages = useEventStore.getState().chatMessages['event-1'];
      expect(messages).toHaveLength(1);
      expect(messages[0].user).toBe('Alice');
      expect(messages[0].isMe).toBe(true);
      expect(messages[0].isHost).toBe(true);
    });

    it('should handle empty response', async () => {
      api.getEventChat.mockResolvedValue(null);

      await act(async () => {
        await useEventStore.getState().fetchEventChat('event-1', 'user-1');
      });

      expect(useEventStore.getState().chatMessages['event-1']).toEqual([]);
    });

    it('should handle API error gracefully', async () => {
      api.getEventChat.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await useEventStore.getState().fetchEventChat('event-1', 'user-1');
      });

      // Should not crash, chatMessages should not be updated
      expect(useEventStore.getState().chatMessages['event-1']).toBeUndefined();
    });
  });

  describe('sendMessage', () => {
    it('should add optimistic message to chat', async () => {
      api.sendEventMessage.mockResolvedValue({});

      await act(async () => {
        await useEventStore.getState().sendMessage('event-1', 'Hello!', { name: 'John Doe', avatar: 'john.jpg' });
      });

      const messages = useEventStore.getState().chatMessages['event-1'];
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hello!');
      expect(messages[0].user).toBe('John D.');
      expect(messages[0].isMe).toBe(true);
      expect(messages[0].time).toBe('Just now');
    });

    it('should not send empty messages', async () => {
      await act(async () => {
        await useEventStore.getState().sendMessage('event-1', '   ', { name: 'John' });
      });

      expect(api.sendEventMessage).not.toHaveBeenCalled();
    });

    it('should remove optimistic message on API failure', async () => {
      api.sendEventMessage.mockRejectedValue(new Error('Failed'));

      try {
        await act(async () => {
          await useEventStore.getState().sendMessage('event-1', 'Hello!', { name: 'John' });
        });
      } catch {
        // expected
      }

      expect(useEventStore.getState().chatMessages['event-1']).toEqual([]);
    });

    it('should use Guest fallback for missing user name', async () => {
      api.sendEventMessage.mockResolvedValue({});

      await act(async () => {
        await useEventStore.getState().sendMessage('event-1', 'Hello!', null);
      });

      const messages = useEventStore.getState().chatMessages['event-1'];
      // name = 'Guest', parts = ['Guest'], format: "Guest ." -> trimmed or as-is
      expect(messages[0].user).toBe('Guest .');
    });
  });

});
