const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const supabase = require('../supabase');

const router = express.Router();

// Rate limiting for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 attempts per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env var is required in production. Set it before deploying.');
}
// In dev, generate a random secret per server start — never use a predictable hardcoded fallback
const SECRET_KEY = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// --- Input validation ---

const isValidEmail = (email) =>
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPassword = (pw) => typeof pw === 'string' && pw.length >= 6;
const isValidName = (name) =>
    typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;

// --- Maps a Supabase users row → public user shape (camelCase, no password) ---

const toPublicUser = (row) => {
    if (!row) return null;
    const { password: _password, is_pro, is_email_verified: _verified, verification_code: _code, verification_code_expiry: _expiry, login_streak, last_login_date, unlocked_titles, ...rest } = row;
    return { ...rest, isPro: is_pro, loginStreak: login_streak ?? 0, lastLoginDate: last_login_date ?? null, xp: rest.xp ?? 0, unlockedTitles: unlocked_titles ?? [] };
};

// --- Login streak calculation ---

/**
 * Updates the user's login streak in the database.
 * - Same day as last login → no change
 * - Consecutive day → increment streak
 * - Gap of >1 day (or first login) → reset streak to 1
 * Returns the updated user row.
 */
const updateLoginStreak = async (userId, currentRow) => {
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' in UTC
    const lastLogin = currentRow.last_login_date;

    // Already logged in today — no update needed
    if (lastLogin === today) return currentRow;

    let newStreak;
    if (lastLogin) {
        const lastDate = new Date(lastLogin + 'T00:00:00Z');
        const todayDate = new Date(today + 'T00:00:00Z');
        const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        newStreak = diffDays === 1 ? (currentRow.login_streak ?? 0) + 1 : 1;
    } else {
        // First login ever
        newStreak = 1;
    }

    const { data: updated } = await supabase
        .from('users')
        .update({ login_streak: newStreak, last_login_date: today })
        .eq('id', userId)
        .select()
        .single();

    return updated || { ...currentRow, login_streak: newStreak, last_login_date: today };
};

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

// Enriches req.user with full profile from Supabase
const loadUserProfile = async (req, res, next) => {
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
    if (!profile) return res.sendStatus(404);
    req.userProfile = toPublicUser(profile);
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

// Demo account — blocked in production to prevent abuse of documented credentials
const DEMO_EMAIL = 'ben@demo.com';

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid email or password format' });
    }

    // Block demo account login in production
    if (process.env.NODE_ENV === 'production' && email.trim().toLowerCase() === DEMO_EMAIL) {
        return res.status(403).json({ message: 'Demo account is disabled in production' });
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const updatedUser = await updateLoginStreak(user.id, user);

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: toPublicUser(updatedUser) });
});

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!isValidName(firstName)) {
        return res.status(400).json({ message: 'First name is required' });
    }
    if (!isValidName(lastName)) {
        return res.status(400).json({ message: 'Last name is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existing) {
        return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date().toISOString().split('T')[0];

    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            id: Date.now().toString(),
            email: normalizedEmail,
            password: hashedPassword,
            name: fullName,
            location: 'London',
            avatar: '',
            bio: '',
            interests: [],
            tribe: 'Newcomers',
            is_pro: false,
            login_streak: 1,
            last_login_date: today,
            xp: 0,
            unlocked_titles: [],
        })
        .select()
        .single();

    if (error) {
        console.error('[ERROR] Failed to create user:', error.message);
        return res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: toPublicUser(newUser) });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

    if (!user) return res.sendStatus(404);

    const updatedUser = await updateLoginStreak(user.id, user);
    res.json(toPublicUser(updatedUser));
});

module.exports = { router, authenticateToken, loadUserProfile, extractUserId, toPublicUser };
