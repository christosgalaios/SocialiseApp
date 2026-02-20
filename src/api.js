const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function parseJson(response) {
    const text = await response.text();
    if (!text.trim()) return null;
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(response.ok ? 'Invalid response from server' : 'Server error');
    }
}

const api = {
    async login(email, password) {
        let response;
        try {
            response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
        } catch (e) {
            throw new Error(e.message || 'Network error');
        }
        const data = await parseJson(response);
        if (!response.ok) {
            throw new Error(data?.message || 'Login failed');
        }
        return data;
    },

    async register(email, password, name) {
        let response;
        try {
            response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
        } catch (e) {
            throw new Error(e.message || 'Network error');
        }
        const data = await parseJson(response);
        if (!response.ok) {
            throw new Error(data?.message || 'Registration failed');
        }
        return data;
    },

    async getMe(token) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        let response;
        try {
            response = await fetch(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
                signal: controller.signal
            });
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') throw new Error('Network timeout');
            throw new Error(e.message || 'Network error');
        }
        clearTimeout(timeoutId);
        const data = await parseJson(response);
        if (!response.ok) {
            throw new Error('Session expired');
        }
        return data;
    }
};

export default api;
