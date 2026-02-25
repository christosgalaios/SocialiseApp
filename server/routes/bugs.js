const express = require('express');
const { authenticateToken } = require('./auth');
const supabase = require('../supabase');
const {
    BUG_INSERT_FAILED, BUG_FETCH_FAILED, BUG_UPDATE_FAILED,
    BUG_DELETE_FAILED, BUG_NOT_FOUND, BUG_INVALID_INPUT,
    BUG_BATCH_FAILED, BUG_AUTH_FAILED,
} = require('../errors');

const router = express.Router();

// --- Service token auth for /fix-bugs skill ---
// Accepts either a JWT (Authorization: Bearer ...) or a service key (X-Service-Key: ...).
// The service key is a shared secret set via BUGS_SERVICE_KEY env var.
// This eliminates the need to register throwaway users for automated bug processing.
function authenticateTokenOrServiceKey(req, res, next) {
    const serviceKey = req.headers['x-service-key'];
    const configuredKey = process.env.BUGS_SERVICE_KEY;

    if (serviceKey && configuredKey && serviceKey === configuredKey) {
        req.user = { id: 'service-bot', email: 'claude-bot@service.local' };
        return next();
    }

    // Fall back to standard JWT auth
    return authenticateToken(req, res, next);
}

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
// Returns a promise that resolves to true/false indicating sync success.
// Supports three modes:
//   - Create: sends full bug data (appends a new row)
//   - Update: sends { action: 'update', bug_id, status?, priority? } (updates existing row)
//   - Delete: sends { action: 'delete', bug_id } (removes the row from the sheet)
async function syncToSheet(row) {
    const webhookUrl = process.env.BUGS_SHEET_WEBHOOK_URL;
    if (!webhookUrl) return false;

    try {
        const resp = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(row),
        });
        return resp.ok;
    } catch (err) {
        // Non-fatal — Supabase is source of truth
        console.warn('[bugs] Sheet sync failed (non-fatal):', err.message);
        return false;
    }
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

// GET /api/bugs — List bug reports and feature requests (primary data source for /fix-bugs skill)
router.get('/', authenticateTokenOrServiceKey, async (req, res) => {
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

// Helper: apply a single bug update to Supabase + sheet.
// Returns { data, error, sheetSynced } or throws.
async function applyBugUpdate(bugId, fields) {
    const updates = {};
    if (fields.status) updates.status = fields.status;
    if (fields.priority) updates.priority = fields.priority;
    if (fields.environment) updates.environment = fields.environment;
    if (fields.description) updates.description = fields.description;
    if (fields.app_version) updates.app_version = fields.app_version;
    if (fields.fix_notes !== undefined) updates.fix_notes = fields.fix_notes;
    if (fields.component !== undefined) updates.component = fields.component;
    if (fields.type && ['bug', 'feature'].includes(fields.type)) updates.type = fields.type;

    if (Object.keys(updates).length === 0) {
        return { data: null, error: 'No valid fields to update', sheetSynced: false };
    }

    const { data, error } = await supabase
        .from('bug_reports')
        .update(updates)
        .eq('bug_id', bugId)
        .select()
        .single();

    if (error || !data) {
        return { data: null, error: error || 'Bug report not found', sheetSynced: false };
    }

    // Sync to Google Sheet (awaited to report sync status)
    const sheetSynced = await syncToSheet({ action: 'update', bug_id: bugId, ...updates });

    return { data, error: null, sheetSynced };
}

// POST /api/bugs/full-sync — Push all Supabase bug reports to Google Sheet.
// Clears the sheet and rebuilds it from Supabase (source of truth → sheet).
// Use this after direct Supabase edits or to recover from sync drift.
// IMPORTANT: This route MUST be registered before /:bugId to avoid "full-sync" matching as a bugId param.
router.post('/full-sync', authenticateTokenOrServiceKey, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bug_reports')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[bugs FULL-SYNC] Supabase error:', error);
            return res.status(500).json({ code: BUG_FETCH_FAILED, message: 'Failed to fetch bug reports for sync' });
        }

        if (!data || data.length === 0) {
            return res.json({ synced: 0, sheetSynced: false, message: 'No bugs to sync' });
        }

        // Map Supabase rows to sheet-friendly format
        const bugs = data.map(bug => ({
            bug_id: bug.bug_id,
            description: bug.description,
            status: bug.status,
            priority: bug.priority,
            environment: bug.environment,
            created_at: bug.created_at,
            app_version: bug.app_version || '',
            platform: bug.platform || '',
            type: bug.type || 'bug',
            reporter: bug.reporter_id || '',
            fix_notes: bug.fix_notes || '',
            component: bug.component || '',
            reports: 1,
        }));

        const sheetSynced = await syncToSheet({ action: 'full-sync', bugs });

        res.json({ synced: bugs.length, sheetSynced });
    } catch (err) {
        console.error('[bugs FULL-SYNC] Error:', err);
        res.status(500).json({ code: BUG_FETCH_FAILED, message: 'Failed to perform full sync' });
    }
});

// PUT /api/bugs/batch — Batch update and/or delete multiple bug reports in one call.
// IMPORTANT: This route MUST be registered before /:bugId to avoid "batch" matching as a bugId param.
// Accepts { updates: [{ bugId, ...fields }], deletions: ["BUG-123", ...] }
// Returns { results: [{ bugId, success, sheetSynced, error? }] }
router.put('/batch', authenticateTokenOrServiceKey, async (req, res) => {
    const { updates, deletions } = req.body;

    if ((!updates || updates.length === 0) && (!deletions || deletions.length === 0)) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: 'Provide at least one update or deletion' });
    }

    const results = [];

    try {
        // Process updates
        if (updates && Array.isArray(updates)) {
            for (const entry of updates) {
                const { bugId, ...fields } = entry;
                if (!bugId) {
                    results.push({ bugId: null, success: false, sheetSynced: false, error: 'Missing bugId' });
                    continue;
                }
                try {
                    const result = await applyBugUpdate(bugId, fields);
                    if (result.error) {
                        results.push({ bugId, success: false, sheetSynced: false, error: String(result.error) });
                    } else {
                        results.push({ bugId, success: true, sheetSynced: result.sheetSynced });
                    }
                } catch (err) {
                    results.push({ bugId, success: false, sheetSynced: false, error: err.message });
                }
            }
        }

        // Process deletions
        if (deletions && Array.isArray(deletions)) {
            for (const bugId of deletions) {
                try {
                    const { data, error } = await supabase
                        .from('bug_reports')
                        .delete()
                        .eq('bug_id', bugId)
                        .select()
                        .single();

                    if (error || !data) {
                        results.push({ bugId, success: false, sheetSynced: false, action: 'delete', error: error?.message || 'Not found' });
                    } else {
                        const sheetSynced = await syncToSheet({ action: 'delete', bug_id: bugId });
                        results.push({ bugId, success: true, sheetSynced, action: 'delete' });
                    }
                } catch (err) {
                    results.push({ bugId, success: false, sheetSynced: false, action: 'delete', error: err.message });
                }
            }
        }

        const allSucceeded = results.every(r => r.success);
        res.status(allSucceeded ? 200 : 207).json({ results });
    } catch (err) {
        console.error('[bugs BATCH] Error processing batch:', err);
        res.status(500).json({ code: BUG_BATCH_FAILED, message: 'Failed to process batch: unexpected server error' });
    }
});

// PUT /api/bugs/:bugId — Update bug report fields (used by /fix-bugs skill)
router.put('/:bugId', authenticateTokenOrServiceKey, async (req, res) => {
    const { bugId } = req.params;
    const { status, priority, environment, description, app_version, type, fix_notes, component } = req.body;

    if (!status && !priority && !environment && !description && !app_version && !type && fix_notes === undefined && component === undefined) {
        return res.status(400).json({ code: BUG_INVALID_INPUT, message: 'Provide at least one field to update' });
    }

    try {
        const result = await applyBugUpdate(bugId, { status, priority, environment, description, app_version, type, fix_notes, component });

        if (result.error) {
            if (typeof result.error === 'string' && result.error === 'Bug report not found') {
                return res.status(404).json({ code: BUG_NOT_FOUND, message: 'Bug report not found' });
            }
            console.error('[bugs PUT] Supabase error:', result.error);
            return res.status(500).json({ code: BUG_UPDATE_FAILED, message: 'Failed to update bug report: database update rejected' });
        }

        res.json({ ...result.data, sheetSynced: result.sheetSynced });
    } catch (err) {
        console.error('[bugs PUT] Error updating bug report:', err);
        res.status(500).json({ code: BUG_UPDATE_FAILED, message: 'Failed to update bug report: unexpected server error' });
    }
});

// DELETE /api/bugs/:bugId — Delete a bug report (used for duplicate consolidation)
router.delete('/:bugId', authenticateTokenOrServiceKey, async (req, res) => {
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

        // Sync deletion to Google Sheet
        const sheetSynced = await syncToSheet({ action: 'delete', bug_id: bugId });

        res.json({ deleted: true, bug_id: bugId, sheetSynced });
    } catch (err) {
        console.error('[bugs DELETE] Error deleting bug report:', err);
        res.status(500).json({ code: BUG_DELETE_FAILED, message: 'Failed to delete bug report: unexpected server error' });
    }
});

module.exports = router;
