require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const { RATE_LIMITED, CORS_BLOCKED } = require('./errors');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS — always allow GitHub Pages + dev origins; extend with ALLOWED_ORIGINS env var
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://christosgalaios.github.io',
];

const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Key'],
};

// Handle preflight OPTIONS requests for all routes before auth/validation
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '500kb' }));

// Rate limiting for mutation endpoints (POST/PUT/DELETE) — prevents abuse
// Auth routes have their own stricter limiter (15 req/15 min); this covers everything else
const mutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 mutations per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { code: RATE_LIMITED, message: 'Too many requests. Please try again later.' },
    skip: (req) => req.method === 'GET' || req.method === 'OPTIONS',
});
app.use('/api/events', mutationLimiter);
app.use('/api/communities', mutationLimiter);
app.use('/api/feed', mutationLimiter);
app.use('/api/users', mutationLimiter);

// Healthcheck — used by Railway; must return 200 with no auth
app.get('/api/health', (_req, res) => res.sendStatus(200));

// --- Routes ---

const { router: authRouter } = require('./routes/auth');
const eventsRouter = require('./routes/events');
const communitiesRouter = require('./routes/communities');
const feedRouter = require('./routes/feed');
const usersRouter = require('./routes/users');
const bugsRouter = require('./routes/bugs');

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/feed', feedRouter);
app.use('/api/users', usersRouter);
app.use('/api/bugs', bugsRouter);

// --- Global error handler (CORS rejections, JSON parse errors, etc.) ---
// Express error-handling middleware must have exactly 4 params
app.use((err, _req, res, _next) => {
    // CORS errors from the origin callback
    if (err.message && err.message.includes('CORS')) {
        return res.status(403).json({ code: CORS_BLOCKED, message: err.message });
    }
    // Fallback for unexpected errors
    console.error('[server] Unhandled error:', err);
    res.status(500).json({ code: 'ERR_INTERNAL', message: 'Internal server error' });
});

// --- Start ---

app.listen(PORT, () => {
    console.log(`Socialise backend running on http://localhost:${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
