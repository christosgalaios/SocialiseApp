const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
        'Missing Supabase environment variables.\n' +
        'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env\n' +
        'Find them in: Supabase Dashboard → Project Settings → API'
    );
}

// Use service_role key server-side — bypasses Row Level Security.
// Never expose this key to the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

module.exports = supabase;
