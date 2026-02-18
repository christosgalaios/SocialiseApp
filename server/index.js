const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// JWT secret — must be set via environment variable in production
const SECRET_KEY = process.env.JWT_SECRET || 'socialise_secret_key_123_change_in_production';
if (!process.env.JWT_SECRET) {
    console.warn('[WARN] JWT_SECRET env var not set. Using insecure default. Set JWT_SECRET before deploying.');
}

const USERS_FILE = path.join(__dirname, 'users.json');

// CORS — restrict to known origins in production via ALLOWED_ORIGINS env var
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:3000',
        'https://christosgalaios.github.io',
      ];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, mobile apps, same-origin)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
}));

app.use(bodyParser.json());

// --- File helpers ---

const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
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

// --- Auth middleware ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Input validation helpers ---

const isValidEmail = (email) => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isValidPassword = (pw) => typeof pw === 'string' && pw.length >= 6;
const isValidName = (name) => typeof name === 'string' && name.trim().length >= 1 && name.trim().length <= 100;

// --- Routes ---

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!isValidEmail(email) || !isValidPassword(password)) {
        return res.status(400).json({ message: 'Invalid email or password format' });
    }

    const users = readUsers();
    const user = users.find(u => u.email === email.trim().toLowerCase());

    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Demo user bypass for development convenience
    const isMatch = (email === 'ben@demo.com' && password === 'password') ||
        await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
});

app.post('/api/auth/register', async (req, res) => {
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
        bio: 'New Socialiser!',
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

app.get('/api/auth/me', authenticateToken, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.sendStatus(404);
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// Stub — events will come from DB in production
app.get('/api/events', (req, res) => {
    res.json({ message: 'Events endpoint ready' });
});

app.listen(PORT, () => {
    console.log(`Socialise backend running on http://localhost:${PORT}`);
});
