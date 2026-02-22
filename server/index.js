require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight OPTIONS requests for all routes before auth/validation
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '500kb' }));

// Healthcheck — used by Railway; must return 200 with no auth
app.get('/api/health', (_req, res) => res.sendStatus(200));

// --- Routes ---

const { router: authRouter } = require('./routes/auth');
const eventsRouter = require('./routes/events');
const communitiesRouter = require('./routes/communities');
const feedRouter = require('./routes/feed');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/feed', feedRouter);
app.use('/api/users', usersRouter);

// --- Start ---

app.listen(PORT, () => {
    console.log(`Socialise backend running on http://localhost:${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
