---
name: openephemeris-setup
description: Install and configure the OpenEphemeris MCP server. Use when a user wants to set up OpenEphemeris, get an API key, troubleshoot installation, or connect Claude / Cursor / Windsurf / ChatGPT to the planetary calculation API.
version: 1.0.0
updated: 2026-05-23
---

# OpenEphemeris Setup

This skill installs the OpenEphemeris MCP server, giving any compatible LLM access to 110+ astronomical and astrological computation endpoints — natal charts, transits, returns, eclipses, synastry, Human Design, Vedic, Chinese astrology, and astrocartography.

> **Platform compatibility:** The MCP server works with Claude (Desktop, Code, API), ChatGPT (one-click install from the ChatGPT app directory), Cursor, Windsurf, VS Code Copilot, Cline, Continue.dev, JetBrains AI, and Amazon Q. Claude and ChatGPT additionally render the interactive charts inline — the same build, no per-host variant. For ChatGPT *Custom GPTs* and other non-MCP platforms, use the REST API directly at `api.openephemeris.com` with the OpenAPI spec.

## Install

```bash
npx -y @openephemeris/mcp-server
```

Or add it permanently to your MCP configuration (Claude Code shown):

```bash
claude mcp add openephemeris -- npx -y @openephemeris/mcp-server
```

## Get an API Key

1. Sign up at https://openephemeris.com/login?signup=true (free, no credit card)
2. Go to Dashboard → Account → Create API Key
3. Copy the key (starts with `opene-`)
4. Set the environment variable:

```bash
# macOS / Linux
export OPENEPHEMERIS_API_KEY="opene-..."

# Windows PowerShell
$env:OPENEPHEMERIS_API_KEY = "opene-..."
```

## Verify

Ask Claude to use the `ephemeris_moon_phase` tool with `datetime` set to right now. If it returns moon phase data, setup is complete.

## What You Get

### Typed Tools

| Tool | Purpose |
|------|---------|
| `ephemeris_natal_chart` | Full natal chart |
| `ephemeris_transits` | Search transit events over a date range |
| `ephemeris_moon_phase` | Moon phase, sign, illumination |
| `ephemeris_next_eclipse` | Next eclipse visible from a location |
| `ephemeris_synastry` | Two-person compatibility |
| `ephemeris_relocation` | Relocate a chart to another city |
| `ephemeris_electional` | Find optimal timing windows |
| `human_design_chart` | Bodygraph (type, strategy, authority, profile, gates, channels) |

### Generic Proxy

For everything else (121 endpoints), use the generic proxy tools with `method` + `path`:

| Tool | Purpose |
|------|---------|
| `dev_read_api` | GET any allowlisted endpoint (44 currently on the public proxy) |
| `dev_write_api` | POST/PUT/PATCH/DELETE any allowlisted endpoint (80 currently) |
| `dev_list_allowed` | List every operation reachable via the two tools above |

## Tiers

| Tier | Price | Access |
|------|-------|--------|
| Explorer | Free (150 credits, one-time — they do not reset; top-ups from $5) | Core ephemeris, moon, transits, geocoding, synastry, composite, returns, progressions, relocation, Human Design overlays, BaZi — credits only |
| Pro | $29/mo (75,000 credits) | Astrocartography (power lines, CCG, hits, local space), electional searches (window, aspect, angle crossings) |
| Startup | $79/mo (500,000 credits) | Batch computation |
| Scale | $199/mo (2,000,000 credits) | Advanced ACG (aspects, midpoints, crossings, declinations, parans, relational) |
| Enterprise | Custom | SLAs, dedicated support |

## Tone & Framing

When delivering any reading, follow these defaults:

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; not predictions of fixed outcomes.
- **Not professional advice.** Not a substitute for medical, legal, financial, or psychotherapy guidance — recommend a professional for real-life decisions in those domains.
- **Honor the whole chart.** No single placement defines a person.
- **Be specific.** Cite the actual placement; explain in context.
- **Be balanced.** Hard aspects are growth-producing; soft aspects can become laziness.

## Cost Awareness

Most calls cost 1–5 credits; each tool's description states its price. ACG is 10. Range searches are priced by span before compute (transit search: ≤1 year 5 up to ≤40 years 70), and a span over the plan's cap is a 400 `search_span_limit` — split it. Failed calls (any 4xx/5xx) are refunded. Tell the user before running anything over ~10 credits, and confirm before batches.

## Troubleshooting

| Error | Meaning | Fix |
|-------|---------|-----|
| "OPENEPHEMERIS_API_KEY not configured" | No API key set | Set the environment variable |
| `401 Unauthorized` | Invalid or expired key | Regenerate at Dashboard → Account |
| `402 Payment Required` | Out of credits (Explorer's 150 are one-time; plan allowances renew each billing period) | Top up or upgrade — the error carries a top-up link |
| `403 Forbidden` | Endpoint requires a higher tier | Upgrade at openephemeris.com/pay |
| `429 Too Many Requests` | Rate limited | Back off; retry with exponential delay |

## Links

- Dashboard: https://openephemeris.com/dashboard
- Docs: https://openephemeris.com/docs
- Pricing: https://openephemeris.com/pay
- Status: https://status.openephemeris.com
- Support: support@openephemeris.com
