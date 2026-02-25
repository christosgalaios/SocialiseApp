#!/bin/bash
# SessionStart hook — sets up backend environment for /fix-bugs and other API-dependent skills
# Secrets come from Claude Code web environment variables (set once, persist across sessions)

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-/home/user/SocialiseApp}"

# ── Check required environment variables ────────────────────────────────────
missing=()
[ -z "$SUPABASE_URL" ] && missing+=("SUPABASE_URL")
[ -z "$SUPABASE_SERVICE_ROLE_KEY" ] && missing+=("SUPABASE_SERVICE_ROLE_KEY")
[ -z "$JWT_SECRET" ] && missing+=("JWT_SECRET")

if [ ${#missing[@]} -gt 0 ]; then
  echo "[session-start] Missing env vars: ${missing[*]}"
  echo "[session-start] Set them in Claude Code web environment settings for /fix-bugs to work."
  exit 0  # Don't block session — just warn
fi

# ── Create server/.env from environment variables ───────────────────────────
cat > "$PROJECT_DIR/server/.env" << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET=$JWT_SECRET
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
EOF

chmod 600 "$PROJECT_DIR/server/.env"
echo "[session-start] Created server/.env"

# ── Install server dependencies if needed ───────────────────────────────────
if [ ! -d "$PROJECT_DIR/server/node_modules" ]; then
  cd "$PROJECT_DIR/server"
  npm install --silent
  echo "[session-start] Installed server dependencies"
fi

# ── Start backend server in background ──────────────────────────────────────
cd "$PROJECT_DIR/server"
node index.js > "$PROJECT_DIR/.server.log" 2>&1 &
echo $! > "$PROJECT_DIR/.server.pid"
echo "[session-start] Backend server started (PID: $!)"

# ── Persist env vars for subsequent Bash commands in this session ────────────
if [ -n "$CLAUDE_ENV_FILE" ]; then
  cat >> "$CLAUDE_ENV_FILE" << EOF
export SUPABASE_URL=$SUPABASE_URL
export SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
export JWT_SECRET=$JWT_SECRET
export SUPABASE_ACCESS_TOKEN=${SUPABASE_ACCESS_TOKEN:-}
export SUPABASE_PROJECT_REF=${SUPABASE_URL#https://}
export SUPABASE_PROJECT_REF=\${SUPABASE_PROJECT_REF%.supabase.co}
EOF
fi

exit 0
