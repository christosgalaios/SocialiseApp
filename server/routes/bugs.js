const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./auth');

const router = express.Router();

const BUGS_FILE = path.join(__dirname, '..', '..', 'BUGS.md');

// POST /api/bugs — Append a bug report to BUGS.md
router.post('/', authenticateToken, async (req, res) => {
    const { description } = req.body;

    if (!description?.trim()) {
        return res.status(400).json({ message: 'Bug description is required' });
    }

    if (description.trim().length < 10) {
        return res.status(400).json({ message: 'Please provide more detail (at least 10 characters)' });
    }

    if (description.trim().length > 2000) {
        return res.status(400).json({ message: 'Description too long (max 2000 characters)' });
    }

    const bugId = `BUG-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Build markdown entry — priority will be inferred by /fix-bugs agent
    const entry = [
        `## ${bugId}`,
        '',
        `- **Status:** open`,
        `- **Priority:** auto`,
        `- **Reported:** ${timestamp}`,
        `- **Reporter:** user-${req.user.id}`,
        '',
        `### Description`,
        '',
        description.trim(),
        '',
        '---',
        '',
    ].join('\n');

    try {
        if (!fs.existsSync(BUGS_FILE)) {
            fs.writeFileSync(BUGS_FILE, '# Bug Reports\n\nBug reports submitted from the Socialise app. Run `/fix-bugs` to process them.\n\n---\n\n');
        }

        fs.appendFileSync(BUGS_FILE, entry);

        res.status(201).json({
            message: 'Bug report logged',
            bugId,
        });
    } catch (err) {
        console.error('[bugs POST] Error writing to BUGS.md:', err);
        res.status(500).json({ message: 'Failed to log bug report' });
    }
});

module.exports = router;
