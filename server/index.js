const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const SECRET_KEY = 'socialise_secret_key_123';
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());

// Helper to read users
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

// Helper to write users
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Auth Middleware
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

// Routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    // For demo purposes, we'll allow 'password' as the password if it's the demo user
    const isMatch = (email === 'ben@demo.com' && password === 'password') || await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
});

app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    const users = readUsers();

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name,
        location: 'London',
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        bio: 'New Socialiser!',
        interests: [],
        tribe: 'Newcomers',
        isPro: false
    };

    users.push(newUser);
    writeUsers(users);

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

// App Data Routes (Mocking persistence for now)
app.get('/api/events', (req, res) => {
    // In a real app, these would come from DB
    res.json({ message: 'Events endpoint ready' });
});

app.listen(PORT, () => {
    console.log(`Socialise Backend running on http://localhost:${PORT}`);
});
