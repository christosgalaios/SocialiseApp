#!/usr/bin/env node

/**
 * Migration Runner for Socialise App
 *
 * Executes SQL migrations from the migrations/ directory
 * Safe to re-run: migrations use CREATE TABLE IF NOT EXISTS
 *
 * Usage:
 *   node migrate.js
 *
 * Note: This script executes raw SQL. For production, consider using
 * Supabase Migrations via CLI or migrations tool of your choice.
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables.');
    console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function runMigrations() {
    console.log('🚀 Running migrations...\n');

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Run in order (001, 002, etc.)

    if (files.length === 0) {
        console.log('⚠️  No migration files found');
        return;
    }

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`📝 Running migration: ${file}`);

        try {
            // Split SQL by semicolon and execute each statement
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                const { error, data } = await supabase.rpc('exec', { request: statement });

                if (error && error.message.includes('function exec')) {
                    // If exec RPC doesn't exist, fall back to using .from().select()
                    // This is a limitation of Supabase - raw SQL execution requires
                    // either the SQL Editor or an RPC function
                    console.warn('⚠️  Cannot execute raw SQL via RPC function.');
                    console.warn('   Falling back: Copy SQL to Supabase Dashboard → SQL Editor');
                    console.warn(`   File: ${filePath}`);
                    console.warn('   Then re-run this script.\n');
                    return;
                }

                if (error) {
                    console.error(`   ❌ Error: ${error.message}`);
                    throw error;
                }
            }

            console.log(`   ✅ Migration complete\n`);
        } catch (err) {
            console.error(`\n❌ Migration failed: ${file}`);
            console.error(err.message);
            process.exit(1);
        }
    }

    console.log('✅ All migrations complete!');
}

runMigrations();
