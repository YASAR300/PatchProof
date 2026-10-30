import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const DEMO_REPO_PATH = process.env.DEMO_REPO_PATH
  ? path.resolve(process.env.DEMO_REPO_PATH)
  : path.resolve(rootDir, ".data", "demo-target");

console.log(`[demo:build] Building demo repo at: ${DEMO_REPO_PATH}`);

// Clean target directory
if (fs.existsSync(DEMO_REPO_PATH)) {
  fs.rmSync(DEMO_REPO_PATH, { recursive: true, force: true });
}
fs.mkdirSync(DEMO_REPO_PATH, { recursive: true });

function git(cmd, envExtra = {}) {
  return execSync(`git ${cmd}`, {
    cwd: DEMO_REPO_PATH,
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "PatchProof Engine",
      GIT_AUTHOR_EMAIL: "engine@patchproof.dev",
      GIT_COMMITTER_NAME: "PatchProof Engine",
      GIT_COMMITTER_EMAIL: "engine@patchproof.dev",
      ...envExtra,
    },
  }).toString().trim();
}

// 1. Initialize git repository with main branch
git("init -b main");
git("config user.name \"PatchProof Engine\"");
git("config user.email \"engine@patchproof.dev\"");
git("config commit.gpgsign false");

// Define directory structure
const srcDir = path.join(DEMO_REPO_PATH, "src");
const testsDir = path.join(DEMO_REPO_PATH, "tests");
const reproducersDir = path.join(DEMO_REPO_PATH, "security", "reproducers");
const webDir = path.join(DEMO_REPO_PATH, "web");

fs.mkdirSync(srcDir, { recursive: true });
fs.mkdirSync(testsDir, { recursive: true });
fs.mkdirSync(reproducersDir, { recursive: true });
fs.mkdirSync(webDir, { recursive: true });

// Common file: src/db.py
fs.writeFileSync(
  path.join(srcDir, "db.py"),
`import sqlite3

def get_connection():
    """Creates an in-memory SQLite database populated with demo user records."""
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    users = [
        (1, "alice", "alice@example.com", "admin"),
        (2, "bob", "bob@example.com", "developer"),
        (3, "O'Brien", "obrien@example.com", "analyst"),
        (4, "charlie", "charlie@example.com", "viewer")
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?)", users)
    conn.commit()
    return conn
`
);

// Common file: tests/test_users.py
fs.writeFileSync(
  path.join(testsDir, "test_users.py"),
`import unittest
import sys
import os

# Add root of demo target to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.db import get_connection
from src.users import find_user_by_name, list_users_sorted, get_user_case_insensitive

class TestUsers(unittest.TestCase):
    def setUp(self):
        self.conn = get_connection()

    def tearDown(self):
        self.conn.close()

    def test_normal_lookup(self):
        user = find_user_by_name(self.conn, "alice")
        self.assertIsNotNone(user, "User alice should be found")
        self.assertEqual(len(user), 1)
        self.assertEqual(user[0][1], "alice")

    def test_missing_user_returns_none(self):
        user = find_user_by_name(self.conn, "nonexistent")
        self.assertIsNone(user, "Missing user should return None")

    def test_sorted_listing(self):
        users = list_users_sorted(self.conn)
        self.assertEqual(len(users), 4)
        usernames = [u[1] for u in users]
        self.assertEqual(usernames, sorted(usernames))

    def test_case_insensitive_lookup(self):
        user = get_user_case_insensitive(self.conn, "ALICE")
        self.assertIsNotNone(user, "Case-insensitive lookup for ALICE should succeed")
        self.assertEqual(len(user), 1)
        self.assertEqual(user[0][1], "alice")

    def test_apostrophe_name_obrien_works(self):
        user = find_user_by_name(self.conn, "O'Brien")
        self.assertIsNotNone(user, "User O'Brien must not be None")
        self.assertEqual(len(user), 1, "User O'Brien must return exactly 1 row")
        self.assertEqual(user[0][1], "O'Brien")

if __name__ == "__main__":
    unittest.main()
`
);

// Common file: security/reproducers/sqli_find_user.py
fs.writeFileSync(
  path.join(reproducersDir, "sqli_find_user.py"),
`import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

try:
    from src.db import get_connection
    from src.users import find_user_by_name
except Exception as e:
    print(f"[REPRODUCER] Import failed: {e}", file=sys.stderr)
    sys.exit(1)

def run_reproducer():
    print("[REPRODUCER] Initializing in-memory SQLite demo database...")
    conn = get_connection()
    precondition_ok = True

    try:
        baseline_check = find_user_by_name(conn, "alice")
        if not baseline_check or len(baseline_check) != 1:
            precondition_ok = False
            print("[REPRODUCER] Precondition check failed: 'alice' not found.", file=sys.stderr)
    except Exception as e:
        print(f"[REPRODUCER] Precondition execution error: {e}", file=sys.stderr)
        conn.close()
        sys.exit(1)

    print("[REPRODUCER] Testing uppercase SQL injection payload: ' OR '1'='1")
    payload_upper = "' OR '1'='1"
    rows_upper = []
    try:
        res = find_user_by_name(conn, payload_upper)
        rows_upper = res if res is not None else []
        print(f"[REPRODUCER] Uppercase payload returned {len(rows_upper)} row(s).")
    except Exception as e:
        print(f"[REPRODUCER] Query raised exception on uppercase payload: {e}")

    print("[REPRODUCER] Testing lowercase SQL injection payload: ' or '1'='1")
    payload_lower = "' or '1'='1"
    rows_lower = []
    try:
        res = find_user_by_name(conn, payload_lower)
        rows_lower = res if res is not None else []
        print(f"[REPRODUCER] Lowercase payload returned {len(rows_lower)} row(s).")
    except Exception as e:
        print(f"[REPRODUCER] Query raised exception on lowercase payload: {e}")

    conn.close()

    # Exploit reproduced if payload returns multiple records (bypassing the username filter)
    reproduced_upper = len(rows_upper) > 1
    reproduced_lower = len(rows_lower) > 1
    reproduced = reproduced_upper or reproduced_lower

    if reproduced_upper and reproduced_lower:
        reason = "Both uppercase and lowercase tautology payloads returned all table records (SQL injection active)."
    elif reproduced_lower and not reproduced_upper:
        reason = "Lowercase payload bypasses naive blacklist; returned all table records (SQL injection active)."
    elif reproduced_upper:
        reason = "Uppercase payload returned all table records (SQL injection active)."
    else:
        reason = "Queries safely parameterized; no unauthorized rows returned."

    print(f"[REPRODUCER] Verdict: reproduced={reproduced}, reason={reason}")

    # Final line MUST be machine-parseable JSON oracle contract
    oracle_contract = {
        "reproduced": bool(reproduced),
        "reason": reason,
        "precondition_ok": bool(precondition_ok)
    }
    print(json.dumps(oracle_contract))
    sys.exit(0)

if __name__ == "__main__":
    run_reproducer()
`
);

// Common dependency files (never installed or imported, only scanned)
fs.writeFileSync(
  path.join(DEMO_REPO_PATH, "requirements.txt"),
`requests==2.20.0
flask==1.0.2
`
);

fs.writeFileSync(
  path.join(webDir, "package.json"),
`{
  "name": "demo-target-web",
  "version": "1.0.0",
  "description": "Demo target front-end dependency manifest",
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.15"
  }
}
`
);

// Deterministic package-lock.json with express 4.17.1 and lodash 4.17.15
fs.writeFileSync(
  path.join(webDir, "package-lock.json"),
`{
  "name": "demo-target-web",
  "version": "1.0.0",
  "lockfileVersion": 2,
  "requires": true,
  "packages": {
    "": {
      "name": "demo-target-web",
      "version": "1.0.0",
      "dependencies": {
        "express": "4.17.1",
        "lodash": "4.17.15"
      }
    },
    "node_modules/express": {
      "version": "4.17.1",
      "resolved": "https://registry.npmjs.org/express/-/express-4.17.1.tgz",
      "integrity": "sha512-mHJ9O79RqluphRrcw2X/GTh3k9tVv8YcoyY4Kkh4WDMJwKRkDTucXOmqEkDA79br2egZOy3z64d0CgOzQpJh2Q=="
    },
    "node_modules/lodash": {
      "version": "4.17.15",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",
      "integrity": "sha512-8xOcRHvCjnocdS5cpwXQXVzcnhFIeTQ56gnTXNX5dVWedb8XXOwLF8vblksZRgUcdVZJCZGMAxeFPRhUzNx3ow=="
    }
  },
  "dependencies": {
    "express": {
      "version": "4.17.1",
      "resolved": "https://registry.npmjs.org/express/-/express-4.17.1.tgz",
      "integrity": "sha512-mHJ9O79RqluphRrcw2X/GTh3k9tVv8YcoyY4Kkh4WDMJwKRkDTucXOmqEkDA79br2egZOy3z64d0CgOzQpJh2Q=="
    },
    "lodash": {
      "version": "4.17.15",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.15.tgz",
      "integrity": "sha512-8xOcRHvCjnocdS5cpwXQXVzcnhFIeTQ56gnTXNX5dVWedb8XXOwLF8vblksZRgUcdVZJCZGMAxeFPRhUzNx3ow=="
    }
  }
}
`
);

// Variations of src/users.py for each commit:

const usersCodeBaseline = `import sqlite3

def find_user_by_name(conn, name):
    cursor = conn.cursor()
    # Vulnerable: string concatenation directly in SQL statement
    query = f"SELECT id, username, email, role FROM users WHERE username = '{name}'"
    try:
        rows = cursor.execute(query).fetchall()
        return rows if rows else None
    except sqlite3.OperationalError:
        # Fallback to handle names with apostrophes (e.g. O'Brien)
        escaped = name.replace("'", "''")
        rows = cursor.execute(f"SELECT id, username, email, role FROM users WHERE username = '{escaped}'").fetchall()
        return rows if rows else None

def list_users_sorted(conn):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users ORDER BY username ASC").fetchall()

def get_user_case_insensitive(conn, name):
    cursor = conn.cursor()
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE LOWER(username) = LOWER(?)", (name,)).fetchall()
    return rows if rows else None
`;

const usersCodeFixGood = `def find_user_by_name(conn, name):
    cursor = conn.cursor()
    # Verified fix: parameterized query prevents SQL injection
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE username = ?", (name,)).fetchall()
    return rows if rows else None

def list_users_sorted(conn):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users ORDER BY username ASC").fetchall()

def get_user_case_insensitive(conn, name):
    cursor = conn.cursor()
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE LOWER(username) = LOWER(?)", (name,)).fetchall()
    return rows if rows else None
`;

const usersCodeFixIncomplete = `import sqlite3

def find_user_by_name(conn, name):
    cursor = conn.cursor()
    # Incomplete fix: naive uppercase-only blacklist bypassable by lowercase 'or'
    sanitized = name.replace("' OR ", "")
    query = f"SELECT id, username, email, role FROM users WHERE username = '{sanitized}'"
    try:
        rows = cursor.execute(query).fetchall()
        return rows if rows else None
    except sqlite3.OperationalError:
        escaped = sanitized.replace("'", "''")
        rows = cursor.execute(f"SELECT id, username, email, role FROM users WHERE username = '{escaped}'").fetchall()
        return rows if rows else None

def list_users_sorted(conn):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users ORDER BY username ASC").fetchall()

def get_user_case_insensitive(conn, name):
    cursor = conn.cursor()
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE LOWER(username) = LOWER(?)", (name,)).fetchall()
    return rows if rows else None
`;

const usersCodeFixRegression = `def find_user_by_name(conn, name):
    cursor = conn.cursor()
    # Flawed fix: wrongly rejects names with an apostrophe, breaking legitimate users like O'Brien
    if "'" in name:
        return None
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE username = ?", (name,)).fetchall()
    return rows if rows else None

def list_users_sorted(conn):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users ORDER BY username ASC").fetchall()

def get_user_case_insensitive(conn, name):
    cursor = conn.cursor()
    rows = cursor.execute("SELECT id, username, email, role FROM users WHERE LOWER(username) = LOWER(?)", (name,)).fetchall()
    return rows if rows else None
`;

const usersCodeBrokenBuild = `def find_user_by_name(conn, name):
    # Broken build: syntax error breaks compilation and test harness
    cursor = conn.cursor( SYNTAX_ERROR_BROKEN_BUILD
    return cursor.execute("SELECT id, username, email, role FROM users WHERE username = ?", (name,)).fetchall()

def list_users_sorted(conn):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users ORDER BY username ASC").fetchall()

def get_user_case_insensitive(conn, name):
    cursor = conn.cursor()
    return cursor.execute("SELECT id, username, email, role FROM users WHERE LOWER(username) = LOWER(?)", (name,)).fetchall()
`;

// Helper to write file and commit with fixed date
function commitStep(tag, message, dateStr, usersCode) {
  fs.writeFileSync(path.join(srcDir, "users.py"), usersCode);
  git("add -A");
  const env = {
    GIT_AUTHOR_DATE: dateStr,
    GIT_COMMITTER_DATE: dateStr,
  };
  git(`commit -m "${message}"`, env);
  git(`tag -a ${tag} -m "Release ${tag}"`, env);
  const sha = git(`rev-parse ${tag}`);
  console.log(`[demo:build] Tagged ${tag} -> ${sha.slice(0, 7)}: ${message}`);
  return sha;
}

// Fixed deterministic timestamps (spaced by 10 minutes)
const t1 = "2026-01-01T12:00:00Z";
const t2 = "2026-01-01T12:10:00Z";
const t3 = "2026-01-01T12:20:00Z";
const t4 = "2026-01-01T12:30:00Z";
const t5 = "2026-01-01T12:40:00Z";

const shaBaseline = commitStep(
  "baseline",
  "feat: initial users service with vulnerable SQL concatenation",
  t1,
  usersCodeBaseline
);

const shaFixGood = commitStep(
  "fix-good",
  "fix(security): sanitize user query using parameterized sqlite statements",
  t2,
  usersCodeFixGood
);

const shaFixIncomplete = commitStep(
  "fix-incomplete",
  "fix(security): strip uppercase OR tautology keywords from input",
  t3,
  usersCodeFixIncomplete
);

const shaFixRegression = commitStep(
  "fix-regression",
  "fix(security): reject any input containing apostrophe quotes",
  t4,
  usersCodeFixRegression
);

const shaBrokenBuild = commitStep(
  "broken-build",
  "refactor(users): introduce experimental cursor parser (broken)",
  t5,
  usersCodeBrokenBuild
);

// Checkout main at baseline so initial repo status is clean baseline
git("checkout baseline");

// Build demo-manifest.json
const manifest = {
  repository: "demo-target",
  defaultBranch: "main",
  language: "Python",
  regressionCommand: "python -m unittest discover tests",
  reproducerCommand: "python security/reproducers/sqli_find_user.py",
  reproducerId: "pp-repro-sqli-01",
  reproducerPath: "security/reproducers/sqli_find_user.py",
  tags: [
    {
      name: "baseline",
      sha: shaBaseline,
      description: "Vulnerable baseline: string concatenation in SQL query",
      expectedOutcome: {
        reproduced: true,
        regressionPassed: true,
        reproducerExitCode: 0,
        regressionExitCode: 0,
      },
    },
    {
      name: "fix-good",
      sha: shaFixGood,
      description: "Clean fix: parameterized queries prevent injection without regressions",
      expectedOutcome: {
        reproduced: false,
        regressionPassed: true,
        reproducerExitCode: 0,
        regressionExitCode: 0,
      },
    },
    {
      name: "fix-incomplete",
      sha: shaFixIncomplete,
      description: "Incomplete fix: naive uppercase-only blacklist bypassable with lowercase payload",
      expectedOutcome: {
        reproduced: true,
        regressionPassed: true,
        reproducerExitCode: 0,
        regressionExitCode: 0,
      },
    },
    {
      name: "fix-regression",
      sha: shaFixRegression,
      description: "Regression fix: blocks SQLi but incorrectly rejects apostrophes, breaking O'Brien",
      expectedOutcome: {
        reproduced: false,
        regressionPassed: false,
        reproducerExitCode: 0,
        regressionExitCode: 1,
      },
    },
    {
      name: "broken-build",
      sha: shaBrokenBuild,
      description: "Broken build: syntax error in users module prevents execution",
      expectedOutcome: {
        reproduced: false,
        regressionPassed: false,
        reproducerExitCode: 1,
        regressionExitCode: 1,
      },
    },
  ],
};

const manifestPath = path.resolve(rootDir, "demo-manifest.json");
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[demo:build] demo-manifest.json written successfully to ${manifestPath}`);
