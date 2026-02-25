const express = require('express');
const { authenticateToken } = require('./auth');
const supabase = require('../supabase');
const {
    BUG_INSERT_FAILED, BUG_FETCH_FAILED, BUG_UPDATE_FAILED,
    BUG_DELETE_FAILED, BUG_NOT_FOUND, BUG_INVALID_INPUT,
} = require('../errors');

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
// Supports three modes:
//   - Create: sends full bug data (appends a new row)
//   - Update: sends { action: 'update', bug_id, status?, priority? } (updates existing row)
//   - Delete: sends { action: 'delete', bug_id } (removes the row from the sheet)
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

// POST /api/bugs — Store a bug report or feature request in Supabase + sync to Google Sheet
router.post('/', authenticateToken, async (req, res) => {
    const { description, app_version, platform, environment, type } = req.body;

    // Validate type field — defaults to 'bug' for backwards compatibility
    const validTypes = ['bug', 'feature'];
    const reportType = validTypes.includes(type) ? type : 'bug';
    const isFeature = reportType === 'feature';
    const label = isFeature ? 'Feature request' : 'Bug report';

    if (!description?.trim()) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: `${label} description is required` });
    }

    if (description.trim().length < 10) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: 'Please provide more detail (at least 10 characters)' });
    }

    if (description.trim().length > 2000) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: 'Description too long (max 2000 characters)' });
    }

    // ID prefix: FEAT- for feature requests, BUG- for bug reports
    const bugId = `${isFeature ? 'FEAT' : 'BUG'}-${Date.now()}`;
    const createdAt = new Date().toISOString();

    // Prefer client-sent environment (detected from window.location.pathname on frontend)
    // Fall back to referer header detection for older clients
    const validEnvs = ['PROD', 'DEV', 'LOCAL'];
    let env;
    if (environment && validEnvs.includes(environment)) {
        env = environment;
    } else {
        const referer = req.headers.referer || req.headers.origin || '';
        env = referer.includes('/prod') ? 'PROD' : referer.includes('/dev') ? 'DEV' : 'LOCAL';
    }

    // Sanitize user input before storing
    const sanitized = sanitizeDescription(description);

    try {
        // Base columns from migration 008 (always present)
        const baseRow = {
            bug_id: bugId,
            description: sanitized,
            status: 'open',
            priority: 'auto',
            reporter_id: req.user.id,
            environment: env,
            created_at: createdAt,
        };

        // Optional columns from later migrations (009: app_version, 010: platform, 011: type)
        // If the column doesn't exist yet (migration not applied), the insert
        // would fail with PGRST204. We try with all columns first, then fall
        // back to base columns only.
        const fullRow = {
            ...baseRow,
            app_version: app_version || null,
            platform: platform || null,
            type: reportType,
        };

        let { error } = await supabase.from('bug_reports').insert(fullRow);

        // PGRST204 = column not found in schema cache (migration not yet applied)
        if (error && error.code === 'PGRST204') {
            console.warn('[bugs POST] Column missing, retrying with base columns only:', error.message);
            ({ error } = await supabase.from('bug_reports').insert(baseRow));
        }

        if (error) {
            console.error('[bugs POST] Supabase error:', error);
            return res.status(500).json({ code: BUG_INSERT_FAILED, message: 'Failed to log bug report: database insert rejected' });
        }

        // Sync to Google Sheet (non-blocking — Supabase is source of truth)
        syncToSheet({ bug_id: bugId, description: sanitized, status: 'open', priority: 'auto', environment: env, app_version: app_version || null, platform: platform || null, type: reportType, created_at: createdAt, reporter: req.user.email });

        res.status(201).json({
            message: `${label} logged`,
            bugId,
        });
    } catch (err) {
        console.error('[bugs POST] Error storing bug report:', err);
        res.status(500).json({ code: BUG_INSERT_FAILED, message: 'Failed to log bug report: unexpected server error' });
    }
});

// GET /api/bugs — List bug reports and feature requests (for /fix-bugs skill)
router.get('/', authenticateToken, async (req, res) => {
    const { status, type } = req.query;

    try {
        let query = supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: true });

        if (status) {
            query = query.eq('status', status);
        }

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[bugs GET] Supabase error:', error);
            return res.status(500).json({ code: BUG_FETCH_FAILED, message: 'Failed to fetch bug reports: database query failed' });
        }

        res.json(data);
    } catch (err) {
        console.error('[bugs GET] Error fetching bug reports:', err);
        res.status(500).json({ code: BUG_FETCH_FAILED, message: 'Failed to fetch bug reports: unexpected server error' });
    }
});

// PUT /api/bugs/:bugId — Update bug report fields (used by /fix-bugs skill)
router.put('/:bugId', authenticateToken, async (req, res) => {
    const { bugId } = req.params;
    const { status, priority, environment, description, app_version, type } = req.body;

    if (!status && !priority && !environment && !description && !app_version && !type) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: 'Provide at least one field to update' });
    }

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (environment) updates.environment = environment;
    if (description) updates.description = description;
    if (app_version) updates.app_version = app_version;
    if (type && ['bug', 'feature'].includes(type)) updates.type = type;

    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .update(updates)
            .eq('bug_id', bugId)
            .select()
            .single();

        if (error) {
            console.error('[bugs PUT] Supabase error:', error);
            return res.status(500).json({ code: BUG_UPDATE_FAILED, message: 'Failed to update bug report: database update rejected' });
        }

        if (!data) {
            return res.status(404).json({ code: BUG_NOT_FOUND, message: 'Bug report not found' });
        }

        // Sync status/priority update to Google Sheet (non-blocking)
        syncToSheet({ action: 'update', bug_id: bugId, ...updates });

        res.json(data);
    } catch (err) {
        console.error('[bugs PUT] Error updating bug report:', err);
        res.status(500).json({ code: BUG_UPDATE_FAILED, message: 'Failed to update bug report: unexpected server error' });
    }
});

// DELETE /api/bugs/:bugId — Delete a bug report (used for duplicate consolidation)
router.delete('/:bugId', authenticateToken, async (req, res) => {
    const { bugId } = req.params;

    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .delete()
            .eq('bug_id', bugId)
            .select()
            .single();

        if (error) {
            console.error('[bugs DELETE] Supabase error:', error);
            return res.status(500).json({ code: BUG_DELETE_FAILED, message: 'Failed to delete bug report' });
        }

        if (!data) {
            return res.status(404).json({ code: BUG_NOT_FOUND, message: 'Bug report not found' });
        }

        // Sync deletion to Google Sheet (non-blocking)
        syncToSheet({ action: 'delete', bug_id: bugId });

        res.json({ deleted: true, bug_id: bugId });
    } catch (err) {
        console.error('[bugs DELETE] Error deleting bug report:', err);
        res.status(500).json({ code: BUG_DELETE_FAILED, message: 'Failed to delete bug report: unexpected server error' });
    }
});

module.exports = router;
