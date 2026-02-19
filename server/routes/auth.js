const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'socialise_secret_key_123_change_in_production';
const USERS_FILE = path.join(__dirname, '..', 'users.json');

// --- File helpers ---

const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (err) {
        console.error('[ERROR] Failed to read users file:', err.message);
        return [];
    }
};

const writeUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
        console.error('[ERROR] Failed to write users file:', err.message);
        throw new Error('Failed to persist user data');
    }
};

// --- Input validation ---

const isValidEmail = (email) =>
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPassword = (pw) => typeof pw === 'string' && pw.length >= 6;
const isValidName = (name) =>
    typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;

// --- Auth middleware (exported for use in other routes) ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, payload) => {
        if (err) return res.sendStatus(403);
        req.user = payload;
        next();
    });
};

// Enriches req.user with full profile from users.json
const loadUserProfile = (req, res, next) => {
    const users = readUsers();
    const profile = users.find(u => u.id === req.user.id);
    if (!profile) return res.sendStatus(404);
    const { password: _, ...safe } = profile;
    req.userProfile = safe;
    next();
};

// Optional JWT extraction — returns userId if valid token present, null otherwise
const extractUserId = (authHeader) => {
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
        const payload = jwt.verify(token, SECRET_KEY);
        return payload.id;
    } catch {
        return null;
    }
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid email or password format' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!isValidName(name)) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.find(u => u.email === normalizedEmail)) {
        return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now().toString(),
        email: normalizedEmail,
        password: hashedPassword,
        name: name.trim(),
        location: 'London',
        avatar: `https://i.pravatar.cc/150?u=${normalizedEmail}`,
        bio: '',
        interests: [],
        tribe: 'Newcomers',
        isPro: false,
    };

    try {
        users.push(newUser);
        writeUsers(users);
    } catch {
        return res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ token, user: userWithoutPassword });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.sendStatus(404);
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

module.exports = { router, authenticateToken, loadUserProfile, extractUserId, readUsers, writeUsers };
