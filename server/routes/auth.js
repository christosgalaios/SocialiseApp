const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');

const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'socialise_secret_key_123_change_in_production';

// --- Input validation ---

const isValidEmail = (email) =>
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPassword = (pw) => typeof pw === 'string' && pw.length >= 6;
const isValidName = (name) =>
    typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;

// --- Maps a Supabase users row → public user shape (camelCase, no password) ---

const toPublicUser = (row) => {
    if (!row) return null;
    const {
        password,
        is_pro,
        is_email_verified,
        verification_code,
        verification_code_expiry,
        ...rest
    } = row;
    return {
        ...rest,
        isPro: is_pro,
        isEmailVerified: is_email_verified,
        verificationCode: verification_code,
        verificationCodeExpiry: verification_code_expiry,
    };
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid email or password format' });
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

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, user: toPublicUser(user) });
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

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (existing) {
        return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.random().toString().slice(2, 8);

    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            id: Date.now().toString(),
            email: normalizedEmail,
            password: hashedPassword,
            name: name.trim(),
            location: 'London',
            avatar: `https://i.pravatar.cc/150?u=${normalizedEmail}`,
            bio: '',
            interests: [],
            tribe: 'Newcomers',
            is_pro: false,
            is_email_verified: false,
            verification_code: verificationCode,
            verification_code_expiry: Date.now() + (10 * 60 * 1000),
        })
        .select()
        .single();

    if (error) {
        console.error('[ERROR] Failed to create user:', error.message);
        return res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY, { expiresIn: '24h' });
    const response = { token, user: toPublicUser(newUser) };
    if (process.env.NODE_ENV !== 'production') {
        response.verificationCode = verificationCode;
    }
    res.json(response);
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    const { email, code } = req.body;

    if (!isValidEmail(email) || !code) {
        return res.status(400).json({ message: 'Email and verification code required' });
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.is_email_verified) {
        return res.status(400).json({ message: 'Email is already verified' });
    }

    if (Date.now() > user.verification_code_expiry) {
        return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    if (user.verification_code !== code.toString()) {
        return res.status(400).json({ message: 'Invalid verification code' });
    }

    const { error } = await supabase
        .from('users')
        .update({ is_email_verified: true, verification_code: null, verification_code_expiry: null })
        .eq('id', user.id);

    if (error) {
        return res.status(500).json({ message: 'Failed to verify email. Please try again.' });
    }

    res.json({ message: 'Email verified successfully!' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();

    if (!user) return res.sendStatus(404);
    res.json(toPublicUser(user));
});

module.exports = { router, authenticateToken, loadUserProfile, extractUserId, toPublicUser };
