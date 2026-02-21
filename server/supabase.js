const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn(
        '[WARN] Missing Supabase environment variables.\n' +
        'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env or Railway.\n' +
        'Database queries will fail until these are set.'
    );
}

// Use service_role key server-side — bypasses Row Level Security.
// Never expose this key to the browser.
const supabaseUrl = SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

module.exports = supabase;
