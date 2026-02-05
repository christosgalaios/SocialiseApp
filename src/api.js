const API_URL = 'http://localhost:3001/api';

const api = {
    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },

    async register(email, password, name) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    },

    async getMe(token) {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Session expired');
        return response.json();
    }
};

export default api;
