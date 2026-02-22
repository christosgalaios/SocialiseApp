const express = require('express');
const { authenticateToken } = require('./auth');

const router = express.Router();

const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'christosgalaios';
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME || 'SocialiseApp';

// POST /api/bugs — Create a GitHub Issue from an in-app bug report
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

    // Build GitHub Issue body matching the structured template
    const severityLabels = {
        P1: 'P1 - Critical (app crashes, data loss, auth broken)',
        P2: 'P2 - Major (feature broken, wrong data shown)',
        P3: 'P3 - Minor (visual glitch, edge case, typo)',
    };

    const issueBody = [
        `### Affected Area\n\n${area}`,
        `### Severity\n\n${severityLabels[severity]}`,
        `### Steps to Reproduce\n\n${steps.trim()}`,
        `### Expected Behavior\n\n${expected.trim()}`,
        `### Actual Behavior\n\n${actual.trim()}`,
        component ? `### Affected Component or File\n\n${component.trim()}` : null,
        context ? `### Additional Context\n\n${context.trim()}` : null,
        `---\n*Reported from the Socialise app by user ${req.user.id}*`,
    ].filter(Boolean).join('\n\n');

    // Construct a title from severity + area
    const issueTitle = `[BUG] [${severity}] ${area}: ${actual.trim().slice(0, 80)}${actual.trim().length > 80 ? '...' : ''}`;

    // Create GitHub Issue via API
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('[bugs POST] GITHUB_TOKEN not configured');
        return res.status(503).json({ message: 'Bug reporting is not configured. Please contact the team directly.' });
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/issues`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'Content-Type': 'application/json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
                body: JSON.stringify({
                    title: issueTitle,
                    body: issueBody,
                    labels: ['bug'],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[bugs POST] GitHub API error:', response.status, errorData);
            return res.status(502).json({ message: 'Failed to create bug report. Please try again.' });
        }

        const issue = await response.json();
        res.status(201).json({
            message: 'Bug report submitted successfully',
            issueNumber: issue.number,
            issueUrl: issue.html_url,
        });
    } catch (err) {
        console.error('[bugs POST] Error creating GitHub issue:', err);
        res.status(500).json({ message: 'Failed to submit bug report' });
    }
});

module.exports = router;
