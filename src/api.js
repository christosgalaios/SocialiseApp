const API_URL = 'http://localhost:3001/api';

async function parseJson(response) {
    const text = await response.text();
    if (!text.trim()) return null;
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(response.ok ? 'Invalid response from server' : 'Server error');
    }
}

// Authenticated fetch helper — attaches Bearer token from localStorage
async function fetchWithAuth(endpoint, { method = 'GET', body, headers = {} } = {}) {
    const token = localStorage.getItem('socialise_token');
    const reqHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
    };

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: reqHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (e) {
        throw new Error(e.message || 'Network error');
    }

    const data = await parseJson(response);
    if (!response.ok) {
        throw new Error(data?.message || 'Request failed');
    }
    return data;
}

const api = {
    // ── Auth ────────────────────────────────────────────────────────────────

    async login(email, password) {
        let response;
        try {
            response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
        } catch (e) {
            throw new Error(e.message || 'Network error');
        }
        const data = await parseJson(response);
        if (!response.ok) throw new Error(data?.message || 'Login failed');
        return data;
    },

    async register(email, password, name) {
        let response;
        try {
            response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
        } catch (e) {
            throw new Error(e.message || 'Network error');
        }
        const data = await parseJson(response);
        if (!response.ok) throw new Error(data?.message || 'Registration failed');
        return data;
    },

    async getMe(token) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        let response;
        try {
            response = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
            });
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') throw new Error('Network timeout');
            throw new Error(e.message || 'Network error');
        }
        clearTimeout(timeoutId);
        const data = await parseJson(response);
        if (!response.ok) throw new Error('Session expired');
        return data;
    },

    // ── Events ──────────────────────────────────────────────────────────────

    getEvents(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return fetchWithAuth(`/events${qs ? '?' + qs : ''}`);
    },

    getEvent(id) {
        return fetchWithAuth(`/events/${id}`);
    },

    createEvent(data) {
        return fetchWithAuth('/events', { method: 'POST', body: data });
    },

    updateEvent(id, data) {
        return fetchWithAuth(`/events/${id}`, { method: 'PUT', body: data });
    },

    deleteEvent(id) {
        return fetchWithAuth(`/events/${id}`, { method: 'DELETE' });
    },

    joinEvent(id) {
        return fetchWithAuth(`/events/${id}/join`, { method: 'POST' });
    },

    leaveEvent(id) {
        return fetchWithAuth(`/events/${id}/leave`, { method: 'POST' });
    },

    saveEvent(id) {
        return fetchWithAuth(`/events/${id}/save`, { method: 'POST' });
    },

    unsaveEvent(id) {
        return fetchWithAuth(`/events/${id}/unsave`, { method: 'POST' });
    },

    getEventChat(id, params = {}) {
        const qs = new URLSearchParams(params).toString();
        return fetchWithAuth(`/events/${id}/chat${qs ? '?' + qs : ''}`);
    },

    sendEventMessage(id, message) {
        return fetchWithAuth(`/events/${id}/chat`, { method: 'POST', body: { message } });
    },

    // ── Communities ─────────────────────────────────────────────────────────

    getCommunities(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return fetchWithAuth(`/communities${qs ? '?' + qs : ''}`);
    },

    getCommunity(id) {
        return fetchWithAuth(`/communities/${id}`);
    },

    createCommunity(data) {
        return fetchWithAuth('/communities', { method: 'POST', body: data });
    },

    joinCommunity(id) {
        return fetchWithAuth(`/communities/${id}/join`, { method: 'POST' });
    },

    leaveCommunity(id) {
        return fetchWithAuth(`/communities/${id}/leave`, { method: 'POST' });
    },

    getCommunityChat(id, params = {}) {
        const qs = new URLSearchParams(params).toString();
        return fetchWithAuth(`/communities/${id}/chat${qs ? '?' + qs : ''}`);
    },

    sendCommunityMessage(id, message) {
        return fetchWithAuth(`/communities/${id}/chat`, { method: 'POST', body: { message } });
    },

    // ── Feed ────────────────────────────────────────────────────────────────

    getFeed(params = {}) {
        const qs = new URLSearchParams(params).toString();
        return fetchWithAuth(`/feed${qs ? '?' + qs : ''}`);
    },

    createPost(data) {
        return fetchWithAuth('/feed', { method: 'POST', body: data });
    },

    deletePost(id) {
        return fetchWithAuth(`/feed/${id}`, { method: 'DELETE' });
    },

    reactToPost(id, emoji) {
        return fetchWithAuth(`/feed/${id}/react`, { method: 'POST', body: { emoji } });
    },

    // ── Users ───────────────────────────────────────────────────────────────

    updateProfile(data) {
        return fetchWithAuth('/users/me', { method: 'PUT', body: data });
    },

    getMyEvents() {
        return fetchWithAuth('/users/me/events');
    },

    getMySaved() {
        return fetchWithAuth('/users/me/saved');
    },

    getMyCommunities() {
        return fetchWithAuth('/users/me/communities');
    },
};

export default api;
