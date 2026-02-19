const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
    console.warn('[WARN] JWT_SECRET env var not set. Using insecure default. Set JWT_SECRET before deploying.');
}

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
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
}));

app.use(bodyParser.json());

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
});
