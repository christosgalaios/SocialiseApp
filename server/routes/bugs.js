const express = require('express');
const { authenticateToken } = require('./auth');
const supabase = require('../supabase');

const router = express.Router();

// --- Input sanitization for bug descriptions ---
// User descriptions are stored in Supabase and synced to Google Sheets.
// We must prevent: (1) prompt injection attempts, (2) metadata spoofing.
function sanitizeDescription(raw) {
    let text = raw.trim();

    // Strip markdown headings that could confuse parsing
    text = text.replace(/^#{1,6}\s/gm, '');

    // Strip horizontal rules
    text = text.replace(/^[-*_]{3,}\s*$/gm, '');

    // Strip metadata patterns that could spoof bug entry fields
    text = text.replace(/^-\s*\*\*\s*(Status|Priority|Reported|Reporter|Environment)\s*:\*\*/gim, '');

    // Strip HTML comments (could hide instructions from human review)
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Collapse multiple blank lines to one (prevents structure manipulation)
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

// Fire-and-forget sync to Google Sheet via Apps Script webhook.
// If BUGS_SHEET_WEBHOOK_URL is not set, silently skips — sheet sync is optional.
// Supports two modes:
//   - Create: sends full bug data (appends a new row)
//   - Update: sends { action: 'update', bug_id, status?, priority? } (updates existing row)
function syncToSheet(row) {
    const webhookUrl = process.env.BUGS_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return;

    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
    }).catch(err => {
        // Non-fatal — Supabase is source of truth
        console.warn('[bugs] Sheet sync failed (non-fatal):', err.message);
    });
}

// POST /api/bugs — Store a bug report in Supabase + sync to Google Sheet
router.post('/', authenticateToken, async (req, res) => {
    const { description, app_version } = req.body;

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
    const createdAt = new Date().toISOString();

    // Detect environment from request origin
    const origin = req.headers.origin || req.headers.referer || '';
    const env = origin.includes('/prod') ? 'production' : origin.includes('/dev') ? 'development' : 'local';

    // Sanitize user input before storing
    const sanitized = sanitizeDescription(description);

    try {
        const { error } = await supabase
            .from('bug_reports')
            .insert({
                bug_id: bugId,
                description: sanitized,
                status: 'open',
                priority: 'auto',
                reporter_id: req.user.id,
                environment: env,
                app_version: app_version || null,
                created_at: createdAt,
            });

        if (error) {
            console.error('[bugs POST] Supabase error:', error);
            return res.status(500).json({ message: 'Failed to log bug report' });
        }

        // Sync to Google Sheet (non-blocking — Supabase is source of truth)
        syncToSheet({ bug_id: bugId, description: sanitized, status: 'open', priority: 'auto', environment: env, app_version: app_version || null, created_at: createdAt });

        res.status(201).json({
            message: 'Bug report logged',
            bugId,
        });
    } catch (err) {
        console.error('[bugs POST] Error storing bug report:', err);
        res.status(500).json({ message: 'Failed to log bug report' });
    }
});

// GET /api/bugs — List bug reports (for /fix-bugs skill)
router.get('/', authenticateToken, async (req, res) => {
    const { status } = req.query;

    try {
        let query = supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: true });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[bugs GET] Supabase error:', error);
            return res.status(500).json({ message: 'Failed to fetch bug reports' });
        }

        res.json(data);
    } catch (err) {
        console.error('[bugs GET] Error fetching bug reports:', err);
        res.status(500).json({ message: 'Failed to fetch bug reports' });
    }
});

// PUT /api/bugs/:bugId — Update bug status/priority (used by /fix-bugs skill)
router.put('/:bugId', authenticateToken, async (req, res) => {
    const { bugId } = req.params;
    const { status, priority } = req.body;

    if (!status && !priority) {
        return res.status(400).json({ message: 'Provide status or priority to update' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .update(updates)
            .eq('bug_id', bugId)
            .select()
            .single();

        if (error) {
            console.error('[bugs PUT] Supabase error:', error);
            return res.status(500).json({ message: 'Failed to update bug report' });
        }

        if (!data) {
            return res.status(404).json({ message: 'Bug report not found' });
        }

        // Sync status/priority update to Google Sheet (non-blocking)
        syncToSheet({ action: 'update', bug_id: bugId, ...updates });

        res.json(data);
    } catch (err) {
        console.error('[bugs PUT] Error updating bug report:', err);
        res.status(500).json({ message: 'Failed to update bug report' });
    }
});

module.exports = router;
