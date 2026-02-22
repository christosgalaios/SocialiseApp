const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./auth');

const router = express.Router();

const BUGS_FILE = path.join(__dirname, '..', '..', 'BUGS.md');

// POST /api/bugs — Append a bug report to BUGS.md
router.post('/', authenticateToken, async (req, res) => {
    const { area, severity, steps, expected, actual, component, context } = req.body;

    // Validate required fields
    if (!area || !severity || !steps?.trim() || !expected?.trim() || !actual?.trim()) {
        return res.status(400).json({ message: 'Missing required fields: area, severity, steps, expected, actual' });
    }

    // Validate severity values
    const validSeverities = ['P1', 'P2', 'P3'];
    if (!validSeverities.includes(severity)) {
        return res.status(400).json({ message: 'Invalid severity. Must be P1, P2, or P3' });
    }

    // Validate field lengths to prevent abuse
    if (steps.trim().length > 2000) return res.status(400).json({ message: 'Steps too long (max 2000 characters)' });
    if (expected.trim().length > 1000) return res.status(400).json({ message: 'Expected behavior too long (max 1000 characters)' });
    if (actual.trim().length > 1000) return res.status(400).json({ message: 'Actual behavior too long (max 1000 characters)' });
    if (component && component.length > 200) return res.status(400).json({ message: 'Component name too long (max 200 characters)' });
    if (context && context.length > 2000) return res.status(400).json({ message: 'Additional context too long (max 2000 characters)' });

    // Generate a bug ID from timestamp
    const bugId = `BUG-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const severityLabels = {
        P1: 'P1 - Critical',
        P2: 'P2 - Major',
        P3: 'P3 - Minor',
    };

    // Build markdown entry
    const entry = [
        `## ${bugId}`,
        '',
        `- **Status:** open`,
        `- **Severity:** ${severityLabels[severity]}`,
        `- **Area:** ${area}`,
        `- **Reported:** ${timestamp}`,
        `- **Reporter:** user-${req.user.id}`,
        component ? `- **Component:** ${component.trim()}` : null,
        '',
        `### Steps to Reproduce`,
        '',
        steps.trim(),
        '',
        `### Expected Behavior`,
        '',
        expected.trim(),
        '',
        `### Actual Behavior`,
        '',
        actual.trim(),
        '',
        context ? `### Additional Context\n\n${context.trim()}\n` : null,
        '---',
        '',
    ].filter(v => v !== null).join('\n');

    try {
        // Create file with header if it doesn't exist
        if (!fs.existsSync(BUGS_FILE)) {
            fs.writeFileSync(BUGS_FILE, '# Bug Reports\n\nBug reports submitted from the Socialise app. Run `/fix-bugs` to process them.\n\n---\n\n');
        }

        // Append the new bug entry
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
