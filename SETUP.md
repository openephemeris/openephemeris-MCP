# OpenEphemeris MCP — Setup Guide

**No API key needed. Just install and go.**

---

## Quick Start (Zero Config)

### Claude Desktop (Mac / Windows)

1. Open Claude Desktop
2. Go to **Settings → Developer → Edit Config**
3. Paste this — **no API key required:**

```json
{
  "mcpServers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"]
    }
  }
}
```

4. Save and restart Claude Desktop
5. Ask Claude anything about astrology — the first time, it will prompt you to connect your account:

> **🔗 Visit openephemeris.com/link and enter code: ABCD-1234**

6. Open the link, log in (or create a free account), enter the code
7. Done! All usage automatically tracks to your account.

---

### Claude Code (Terminal)

```bash
claude mcp add openephemeris -- npx -y @openephemeris/mcp-server
```

---

### Cursor (AI Code Editor)

**Option A — One click:**
```
cursor://anysphere.cursor-deeplink/mcp/install?name=openephemeris&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBvcGVuZXBoZW1lcmlzL21jcC1zZXJ2ZXIiXX0=
```

> 💡 **After installing, start a new Composer chat** (`Ctrl+N` / `Cmd+N`). Cursor loads MCP tools when a chat is created — an already-open chat won't see newly added servers.

**Option B — Manual:**
1. Open `~/.cursor/mcp.json`
2. Paste the JSON from the Claude Desktop section above
3. Restart Cursor

---

### Windsurf

1. Open `~/.codeium/windsurf/mcp_config.json`
2. Paste the JSON from the Claude Desktop section above
3. Restart Windsurf

---

### VS Code with Copilot

1. Open VS Code Settings (JSON): `Cmd/Ctrl + Shift + P` → "Preferences: Open Settings (JSON)"
2. Add:
```json
"mcp": {
  "servers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"]
    }
  }
}
```
3. Reload VS Code

---

### Remote / Hosted Endpoint (Claude Web & All Remote Clients)

For any client that accepts a hosted MCP URL (Claude Web, Smithery, custom AI agents), use the **Streamable HTTP** endpoint directly — no download, no Node.js:

**MCP URL:** `https://mcp.openephemeris.com/mcp`

Pass your API key as a request header:

```
X-API-Key: YOUR_API_KEY
```

Get a key from [openephemeris.com/dashboard](https://openephemeris.com/dashboard) → API Keys tab.

> 💡 This is the MCP 2025-11-25 Streamable HTTP spec — supported by Claude Web, Smithery, and modern agents.
> The legacy SSE endpoint was retired in 3.20.0 — all clients should use Streamable HTTP at `/mcp`.

---

### ChatGPT — MCP (Developer Mode)

> **Requires:** ChatGPT Plus, Pro, Team, or Enterprise plan.

ChatGPT natively supports remote MCP servers via Developer Mode — no Custom GPT needed:

1. Go to **Settings → Apps → Advanced** and toggle **Developer Mode** on
2. Click **Create app**, name it `Open Ephemeris`
3. Enter the MCP URL: `https://mcp.openephemeris.com/mcp`
4. Set authentication: **API Key** → header name `X-API-Key` → paste your key
5. Save — tools are registered automatically
6. In any new chat, click **+** → **More** → select **Open Ephemeris** to enable

```
MCP URL:  https://mcp.openephemeris.com/mcp
Header:   X-API-Key: YOUR_API_KEY
```

> 💡 Get a free API key at [openephemeris.com/dashboard](https://openephemeris.com/dashboard) → API Keys tab.

---

### ChatGPT — Custom GPT Action (Legacy)

Alternatively, add OpenEphemeris to a custom GPT as an Action (works on all plan tiers, but requires an API key):

1. Go to [chatgpt.com/gpts/editor](https://chatgpt.com/gpts/editor)
2. Create new GPT → **Configure** → **Actions** → **Import from URL**
3. Enter: `https://api.openephemeris.com/openapi.json`
4. Set authentication: **API Key** → Header name: `X-OpenEphemeris-API-Key`
5. Paste your API key as the value
6. Save and publish

> ⚠️ ChatGPT Custom GPTs don't support the device auth flow. You'll need an API key for this option.

---

### Gemini CLI

Google's Gemini CLI supports remote MCP servers natively via `~/.gemini/settings.json`:

1. Install Gemini CLI if needed:
   ```bash
   npm install -g @google/gemini-cli
   # or: brew install gemini
   ```
2. Create or open `~/.gemini/settings.json` and add:
   ```json
   {
     "mcpServers": {
       "openephemeris": {
         "httpUrl": "https://mcp.openephemeris.com/mcp",
         "headers": {
           "X-API-Key": "YOUR_API_KEY"
         }
       }
     }
   }
   ```
3. Replace `YOUR_API_KEY` with a key from [openephemeris.com/dashboard](https://openephemeris.com/dashboard)
4. Run `gemini` and type `/mcp` to confirm the server is connected and list available tools

> 💡 For project-scoped config, use `.gemini/settings.json` in your project root instead of `~/.gemini/settings.json`.

---

## Try It!

Ask your AI any of these:

| Query | What happens |
|-------|-------------|
| "What's the moon phase right now?" | Returns current phase, sign, and illumination |
| "Calculate a natal chart for July 4, 1776 at noon in Philadelphia" | Full chart with planetary positions and aspects |
| "Find the next solar eclipse visible from Tokyo" | Eclipse date, type, and local contact times |
| "What transits are hitting my natal Sun this month?" | Transit event timeline |
| "Generate a Human Design chart for my birth data" | Type, Strategy, Authority, Profile, Gates |

---

## Advanced: API Key Method

For CI/CD pipelines, server-to-server integrations, or ChatGPT Custom GPTs, you can set a traditional API key instead of using the interactive device auth flow:

1. Go to **[openephemeris.com/dashboard](https://openephemeris.com/dashboard)** → **Account** tab
2. Click **"Create API Key"** and copy it (starts with `oe_...`)
3. Add it to your config:

```json
{
  "mcpServers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"],
      "env": {
        "OPENEPHEMERIS_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

> 💡 When an API key is set, it takes priority over device auth. Both methods work simultaneously.

---

## Advanced: Choose Your Tool Surface

Tool definitions are re-sent to the model on every message, so the server advertises a curated default set rather than the whole catalog. If you work in one tradition, ask for it by name and pay a fraction of the context:

```json
{
  "mcpServers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"],
      "env": { "OPENEPHEMERIS_TOOLS": "hd" }
    }
  }
}
```

On the hosted endpoint, append `?profile=` to the URL instead: `https://mcp.openephemeris.com/mcp?profile=hd,bazi`

Available toolsets: `astrology`, `moon`, `hd` (Human Design), `bazi`, `vedic`, `acg` (astrocartography), `electional`, `venus` — combine with commas. `full` advertises everything; unset gives the curated default. Geocoding, account usage, and the API escape hatch are always included, and every tool stays callable by name regardless of surface.

---

## Auth Tools

The MCP server includes three authentication tools that AI assistants can use:

| Tool | Purpose |
|------|---------|
| `auth.login` | Start the device login flow — returns a URL and code |
| `auth.status` | Check current auth state (method, user, expiry) |
| `auth.logout` | Disconnect and clear cached credentials |

Credentials are cached in `~/.openephemeris/credentials.json` and auto-refresh when expired.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Visit openephemeris.com/link…" keeps appearing | Complete the login flow in your browser, or set an API key |
| "Unauthorized (401)" | Your credentials may be invalid — run `auth.login` or regenerate your API key |
| "Tier-gated (403)" | The endpoint requires a higher plan — upgrade at /pay |
| "Rate limited (429)" | Wait a moment and retry, or check Dashboard for usage |
| Tool not showing up | Restart the app after editing config |
| Tools green in settings but agent can't use them | Start a **new** Composer/Agent chat — Cursor loads tool lists at chat creation, not mid-conversation |
| `npx` not found | Install Node.js from [nodejs.org](https://nodejs.org) |

---

## Need Help?

- **Docs:** [openephemeris.com/docs](https://openephemeris.com/docs)
- **Dashboard:** [openephemeris.com/dashboard](https://openephemeris.com/dashboard)
- **Email:** support@openephemeris.com
