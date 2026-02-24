/**
 * Error formatting and automatic bug reporting utilities.
 *
 * Every API error that hits the user gets:
 *   1. Formatted with its error code for display
 *   2. Auto-reported as a bug report (fire-and-forget) — so devs know about it
 *      without users having to manually file anything.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Codes that are user-caused (not bugs) — don't auto-report these
const USER_ERROR_CODES = new Set([
    'ERR_AUTH_INVALID_INPUT',
    'ERR_AUTH_INVALID_CREDENTIALS',
    'ERR_AUTH_DUPLICATE_EMAIL',
    'ERR_AUTH_DEMO_BLOCKED',
    'ERR_EVENT_INVALID_INPUT',
    'ERR_EVENT_FULL',
    'ERR_EVENT_INACTIVE',
    'ERR_EVENT_FORBIDDEN',
    'ERR_COMMUNITY_INVALID_INPUT',
    'ERR_COMMUNITY_DUPLICATE_NAME',
    'ERR_COMMUNITY_FOUNDER_LEAVE',
    'ERR_FEED_INVALID_INPUT',
    'ERR_FEED_FORBIDDEN',
    'ERR_USER_INVALID_INPUT',
    'ERR_USER_AVATAR_FAILED',
    'ERR_BUG_INVALID_INPUT',
    'ERR_AUTH_RATE_LIMITED',
    'ERR_RATE_LIMITED',
]);

// Prevent infinite loops — don't report errors from the bug reporting endpoint itself
let isReporting = false;

/**
 * Fire-and-forget: sends the error as an automatic bug report.
 * Skips user-caused errors (validation, auth, rate limits).
 * Silently swallows failures — this must never break the app.
 */
function autoReportError(err) {
    if (isReporting) return;
    if (!err) return;

    const code = err.code || '';

    // Don't report user-caused errors
    if (USER_ERROR_CODES.has(code)) return;

    // Don't report if user isn't logged in (no token = can't call /bugs)
    const token = localStorage.getItem('socialise_token');
    if (!token) return;

    const description = [
        `[AUTO-REPORT] Error code: ${code || 'NONE'}`,
        `Message: ${err.message || 'Unknown error'}`,
        `URL: ${window.location.href}`,
        `Timestamp: ${new Date().toISOString()}`,
        `UserAgent: ${navigator.userAgent}`,
    ].join('\n');

    const appVersion = import.meta.env.VITE_APP_VERSION || '0.1.dev';

    isReporting = true;
    fetch(`${API_URL}/bugs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            description,
            app_version: appVersion,
            platform: `${navigator.platform || 'Unknown'} / Auto-reported`,
        }),
    })
        .catch(() => {
            // Silently swallow — auto-reporting must never break the app
        })
        .finally(() => {
            isReporting = false;
        });
}

/**
 * Formats an error for user-facing display.
 * Includes the error code when available so users/devs always know
 * exactly what went wrong and where.
 *
 * Also fires an automatic bug report for server/unexpected errors.
 *
 * Examples:
 *   formatError(apiError)  → "[ERR_BUG_INSERT_FAILED] Failed to log bug report: database insert rejected"
 *   formatError(plainError) → "Something went wrong"
 *   formatError(apiError)  → "[ERR_NETWORK] Failed to fetch"  (network errors)
 */
export function formatError(err, fallback = 'Something went wrong') {
    if (!err) return fallback;

    // Auto-report to the bug tracking sheet (fire-and-forget)
    autoReportError(err);

    const message = err.message || fallback;
    const code = err.code;

    if (code && code !== 'ERR_UNKNOWN') {
        return `[${code}] ${message}`;
    }

    return message;
}
