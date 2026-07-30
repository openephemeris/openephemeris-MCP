# OpenEphemeris MCP Server

[![smithery badge](https://smithery.ai/badge/open-ephemeris/openephemeris)](https://smithery.ai/servers/open-ephemeris/openephemeris)
[![npm version](https://img.shields.io/npm/v/@openephemeris/mcp-server)](https://www.npmjs.com/package/@openephemeris/mcp-server)
[![System Status](https://img.shields.io/badge/Status-Operational-brightgreen)](https://status.openephemeris.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Ephemeris: JPL DE440](https://img.shields.io/badge/Ephemeris-JPL%20DE440-6f42c1)](https://ssd.jpl.nasa.gov/planets/eph_export.html)

![OpenEphemeris in Claude — ask in plain language, get a real computed chart](https://raw.githubusercontent.com/openephemeris/openephemeris-MCP/main/assets/hero-demo.gif)

Model Context Protocol server for OpenEphemeris — typed astrology tools powered by the NASA JPL DE440 ephemeris. Zero hallucination on planetary positions, dates, and degrees. Covers 1,100 years of astronomical data.

**Hosted endpoint:** `https://mcp.openephemeris.com/mcp` (Streamable HTTP, MCP 2025-11-25 spec)

## Quick Start

### Install via Smithery (recommended)

The fastest way to connect any MCP-compatible client:

```bash
npx -y @smithery/cli install @open-ephemeris/openephemeris --client claude
```

Or browse the listing and copy connection snippets: **[smithery.ai/servers/open-ephemeris/openephemeris](https://smithery.ai/servers/open-ephemeris/openephemeris)**

---

### Connect via AI SDK (Vercel AI SDK)

```typescript
import Smithery from "@smithery/api"
import { createMCPClient } from "@ai-sdk/mcp"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createConnection } from "@smithery/api/mcp"

const smithery = new Smithery()

const conn = await smithery.connections.create("{your-namespace}", {
  mcpUrl: "https://server.smithery.ai/open-ephemeris/openephemeris",
  headers: {
    apiKey: "your-openephemeris-api-key", // get one free at openephemeris.com/dashboard
  },
})

const { transport } = await createConnection({
  client: smithery,
  namespace: "{your-namespace}",
  connectionId: conn.connectionId,
})

const mcpClient = await createMCPClient({ transport })
const tools = await mcpClient.tools()

const { text } = await generateText({
  model: anthropic("claude-sonnet-4-20250514"),
  tools,
  prompt: "Calculate a natal chart for someone born April 15, 1990 at 2:30 PM in Chicago.",
})

await mcpClient.close()
```

### Connect via MCP SDK (TypeScript)

```typescript
import Smithery from "@smithery/api"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { createConnection } from "@smithery/api/mcp"

const smithery = new Smithery()

const conn = await smithery.connections.create("{your-namespace}", {
  mcpUrl: "https://server.smithery.ai/open-ephemeris/openephemeris",
  headers: {
    apiKey: "your-openephemeris-api-key",
  },
})

const { transport } = await createConnection({
  client: smithery,
  namespace: "{your-namespace}",
  connectionId: conn.connectionId,
})

const mcpClient = new Client(
  { name: "my-app", version: "1.0.0" },
  { capabilities: {} }
)
await mcpClient.connect(transport)

const { tools } = await mcpClient.listTools()
const result = await mcpClient.callTool({
  name: "ephemeris_natal_chart",
  // A datetime that states a clock time must state its zone: either pass
  // `timezone` alongside the local time, or put a Z/±HH:MM offset on the value.
  arguments: {
    datetime: "1990-04-15T14:30:00",
    timezone: "America/Chicago",
    latitude: 41.8781,
    longitude: -87.6298,
    format: "llm",
  },
})
```

### Connect directly (Streamable HTTP, no Smithery)

```typescript
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"

const transport = new StreamableHTTPClientTransport(
  new URL("https://mcp.openephemeris.com/mcp"),
  { requestInit: { headers: { "X-API-Key": "your-openephemeris-api-key" } } }
)

const client = new Client({ name: "my-app", version: "1.0.0" }, { capabilities: {} })
await client.connect(transport)
```

---

### One-click install (Cursor)

<!-- GENERATED:CURSOR_INSTALL:BEGIN -->
[![Install in Cursor](https://img.shields.io/badge/Install%20in-Cursor-1f6feb)](cursor://anysphere.cursor-deeplink/mcp/install?name=openephemeris&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBvcGVuZXBoZW1lcmlzL21jcC1zZXJ2ZXIiXSwiZW52Ijp7Ik9QRU5FUEhFTUVSSVNfUFJPRklMRSI6ImRldiIsIk9QRU5FUEhFTUVSSVNfQkFDS0VORF9VUkwiOiJodHRwczovL2FwaS5vcGVuZXBoZW1lcmlzLmNvbSIsIk9QRU5FUEhFTUVSSVNfQVBJX0tFWSI6IllPVVJfQVBJX0tFWV9IRVJFIn19)

> Replace `YOUR_API_KEY_HERE` in Cursor MCP settings with your API key from https://openephemeris.com/dashboard.

Cursor deeplink payload:
```json
{
  "command": "npx",
  "args": [
    "-y",
    "@openephemeris/mcp-server"
  ],
  "env": {
    "OPENEPHEMERIS_PROFILE": "dev",
    "OPENEPHEMERIS_BACKEND_URL": "https://api.openephemeris.com",
    "OPENEPHEMERIS_API_KEY": "YOUR_API_KEY_HERE"
  }
}
```
<!-- GENERATED:CURSOR_INSTALL:END -->

### Manual install (stdio MCP clients)

```json
{
  "mcpServers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"],
      "env": {
        "OPENEPHEMERIS_PROFILE": "dev",
        "OPENEPHEMERIS_BACKEND_URL": "https://api.openephemeris.com",
        "OPENEPHEMERIS_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Platform guide

> **Detailed setup walkthroughs** for each platform are in [SETUP.md](./SETUP.md).

| Client | Install mode | Config location |
|---|---|---|
| Smithery | One-click | [smithery.ai](https://smithery.ai/servers/open-ephemeris/openephemeris) |
| Cursor | One-click deeplink or manual | `~/.cursor/mcp.json` |
| Claude Desktop (macOS) | Manual | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Desktop (Windows) | Manual | `%APPDATA%\Claude\claude_desktop_config.json` |
| Windsurf | Manual | `~/.codeium/windsurf/mcp_config.json` (or legacy `~/.codeium/mcp_config.json`) |
| Claude Web / ChatGPT / remote clients | Hosted URL | `https://mcp.openephemeris.com/mcp` |

### Client install walkthroughs

1. Cursor
   - Click the "Install in Cursor" button above, then replace `YOUR_API_KEY_HERE` in Cursor MCP settings.
   - If you prefer manual setup, paste the `mcpServers.openephemeris` block from "Manual install" into `~/.cursor/mcp.json`.
2. Claude Desktop (macOS/Windows)
   - Open the platform config file from the table above.
   - Add the same `mcpServers.openephemeris` block from "Manual install".
   - Restart Claude Desktop.
3. Windsurf
   - Open `~/.codeium/windsurf/mcp_config.json` (or the legacy `~/.codeium/mcp_config.json` path).
   - Add the `mcpServers.openephemeris` block from "Manual install".
   - Restart Windsurf.

### Remote-only clients (Claude Web, ChatGPT, etc.)

The server is hosted at `https://mcp.openephemeris.com/mcp` with full Streamable HTTP support (MCP 2025-11-25 spec). Remote-only clients can connect directly — no bridge/proxy required:

- **Claude Web**: Add `https://mcp.openephemeris.com/mcp` as a custom connector URL — leave OAuth Client ID and Secret **blank**. The server uses OAuth 2.1 + PKCE (Dynamic Client Registration), so Claude handles authentication via a browser popup automatically.
- **Via Smithery**: Use the [Smithery listing](https://smithery.ai/servers/open-ephemeris/openephemeris) for managed connections with any client
- **Legacy SSE**: retired in 3.20.0 — use Streamable HTTP at `/mcp`

### Auth and upgrade behavior in MCP clients

- Missing/invalid credentials (`401`): tool call fails with a message that points users to sign up/sign in at `https://openephemeris.com/login?signup=true&redirect=%2Fdashboard%3Ftab%3Daccount`, then create/manage keys in `https://openephemeris.com/dashboard?tab=account`.
- Tier-gated endpoint (`403`): tool call returns an upgrade-required message with `https://openephemeris.com/pay` and dashboard billing/key management link.
- Monthly quota exhausted (`402`): tool call returns usage quota guidance with both dashboard (`/dashboard?tab=account`) and upgrade (`/pay`) links.
- Burst/rate limit (`429`): tool call returns retry guidance and links to dashboard usage monitoring.

## What You Can Ask

```
"Calculate a natal chart for 1990-04-15 at 2:30 PM in Chicago."
"Find all Saturn transits to my natal Sun in the next 6 months."
"Get the current moon phase and void-of-course status."
"Find the next solar eclipse visible from Tokyo."
"Find the best time to sign a contract in March — electional window."
"Generate a Human Design chart for my birth data."
"What is my Vedic (sidereal) chart?"
"Calculate my Chinese BaZi (Four Pillars) chart."
"Show me my Astrocartography power lines — where is my Venus line on the map?"
"Find all ACG lines within 3° of Paris for my chart."
"Calculate a synastry chart between two people."
"Find the next Venus Star Point and my relationship to it."
"What are the active planetary stations in the next 3 months?"
"Calculate primary directions for the next 5 years."
"Find my Firdaria time lord period."
"What is the sidereal time and delta-T right now?"
```

## Interactive Charts

Nine of the tools don't answer with JSON. They open a chart in the conversation — a real one, drawn from the same calculation, that you can click around in.

This matters more than it sounds. A natal chart returned as JSON is a list of numbers you have to already understand to read. The same chart rendered as a wheel is something you can point at. Click a planet and you get that placement explained; click a house and you get what's in it. The chart stays on screen while you keep talking, and it doesn't cost another credit to keep looking at it.

These need a host that supports MCP Apps — Claude Desktop is the main one today. In a client without app support the same tools still work; you get the underlying data instead of the picture, so nothing breaks, you just don't get the wheel.

| Tool | What opens | What you can click | Credits |
|---|---|---|---|
| `explore_natal_chart` | Natal wheel — planets, houses, aspects, angles | Planets, houses, aspect lines; recalculate with new settings | 1 |
| `explore_bi_wheel` | Two charts on one wheel: transits, synastry, progressions | Either wheel's planets, houses, and the aspects between them | 2 |
| `explore_human_design` | Human Design bodygraph, with a mandala view toggle | Centers, gates, channels, planets, variables | 2 |
| `explore_human_design_transit` | Today's planets laid over a natal bodygraph | Transit-activated channels | 3 |
| `explore_human_design_connection` | Two bodygraphs combined, every shared channel classified | Connection channels by type | 3 |
| `explore_vedic_chart` | South Indian Rashi grid — sidereal placements and Lagna | Each rashi, for its placements and nakshatras | 3 |
| `explore_bazi_chart` | Four Pillars (四柱命盘) — Year, Month, Day, Hour | Each pillar | 3 |
| `explore_transit_timeline` | Upcoming transit hits in date order | Individual hits | 6 |
| `explore_moon_phase` | Moon dial — illumination, phase, sign, void-of-course | Recalculate for another moment | 3 |

Ask for these the way you'd ask a person: *"show me my chart"*, *"put today's transits over my Human Design"*, *"what's the moon doing right now"*. The model picks the app.

Two things worth knowing. The chart wheel and bi-wheel accept a click on an aspect line, not just on the two planets it joins — so "why does this line matter" is one click rather than a paragraph of setup. And the bodygraph's mandala toggle rearranges the whole chart into concentric rings without another API call, so switching views is free.

Screenshots of each are on the way.

## Tools at a Glance

| Category | Tool | Tier |
|---|---|---|
| Natal chart | `ephemeris_natal_chart` | Explorer |
| Transit forecast | `ephemeris_transits` | Explorer |
| Transit chart snapshot | `ephemeris_natal_transits` | Explorer |
| Moon phase / VOC | `ephemeris_moon_phase` | Explorer |
| Eclipse next visible | `ephemeris_next_eclipse` | Explorer |
| Electional window | `ephemeris_electional` | Developer |
| Moment analysis | `electional_moment_analysis` | Developer |
| Station tracker | `electional_station_tracker` | Developer |
| Aspect search | `electional_aspect_search` | Developer |
| Human Design chart | `human_design_chart` | Explorer |
| HD composite | `human_design_composite` | Developer |
| HD transit overlay | `explore_human_design_transit` | Developer |
| HD connection (synastry) | `explore_human_design_connection` | Developer |
| HD penta | `human_design_penta` | Explorer |
| HD return / opposition | `hd_planetary_return`, `hd_opposition` | Explorer |
| Vedic chart | `vedic_chart` | Explorer |
| BaZi (Chinese) | `chinese_bazi` | Explorer |
| Synastry | `ephemeris_synastry` | Developer |
| Composite chart | `ephemeris_composite` | Developer |
| Relocation chart | `ephemeris_relocation` | Developer |
| Progressed chart | `ephemeris_progressed_chart` | Explorer |
| Solar return | `ephemeris_solar_return` | Developer |
| Lunar return | `ephemeris_lunar_return` | Developer |
| Planetary return | `ephemeris_planetary_return` | Developer |
| Astrocartography lines | `acg_power_lines` | Developer |
| ACG hits at location | `acg_hits` | Scale |
| Venus Star Points | `venus_star_points` + 4 more | Explorer |
| Chart wheel image | `ephemeris_chart_wheel` | Developer |
| Bi-wheel image | `ephemeris_bi_wheel` | Developer |
| Dignities / Midpoints / Fixed stars | `ephemeris_dignities`, `ephemeris_midpoints`, `ephemeris_fixed_stars` | Explorer |

## Tooling Model

- Typed tools are preferred for common workflows (natal, transits, moon phase, eclipse, synastry, relocation, electional, Human Design).
- Generic tools: `dev_list_allowed` returns all currently allowlisted operations; `dev_read_api` invokes allowlisted **GET** (read) operations and `dev_write_api` invokes allowlisted **POST/PUT/PATCH/DELETE** (write/compute) operations, each by `method + path`. Read and write are kept as separate tools so a safe read surface never shares a tool with state-changing writes.
- Security model: default-deny with explicit allowlist in `config/dev-allowlist.json`.
- Deny prefixes block sensitive route families (`/auth`, `/billing`, `/admin`, etc.).

### `dev_read_api` / `dev_write_api` input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `method` | `dev_read_api`: `GET` · `dev_write_api`: `POST\|PUT\|PATCH\|DELETE` | No | HTTP method (defaults to the tool's natural method) |
| `path` | `string` | Yes | Absolute API path, e.g. `/ephemeris/natal-chart` |
| `query` | `object` | No | Query parameters |
| `body` | `object` | No | JSON body for non-GET requests |
| `preset` | `full\|simple` | No | Convenience mapping to `query.preset` |
| `format` | `json\|llm\|llm_v2` | No | Convenience mapping to `query.format` (`llm_v2` normalizes to `llm`) |
| `output_mode` | `full\|simple\|llm\|llm_v2` | No | Legacy compatibility field |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENEPHEMERIS_API_KEY` | Yes (unless service key/JWT used) | API key for OpenEphemeris |
| `ASTROMCP_API_KEY` | No | Legacy alias for `OPENEPHEMERIS_API_KEY` (checked as fallback) |
| `OPENEPHEMERIS_BACKEND_URL` | No | Defaults to `https://api.openephemeris.com` |
| `OPENEPHEMERIS_PROFILE` | No | `dev` by default |
| `OPENEPHEMERIS_TOOLS` | No | `core` (default) advertises a focused everyday tool set; `full` advertises every tool. See [Tool surface](#tool-surface) |
| `OPENEPHEMERIS_TELEMETRY` | No | Set to `0`/`false`/`off` to disable anonymous usage reporting. `DO_NOT_TRACK=1` also works. See [Telemetry](#telemetry) |
| `OPENEPHEMERIS_SERVICE_KEY` | No | Internal service auth |
| `OPENEPHEMERIS_JWT` | No | Bearer token auth |
| `OPENEPHEMERIS_DEV_ALLOWLIST_PATH` | No | Override allowlist file path |
| `MCP_USER_ID` | No | Per-instance user identifier |

Legacy aliases (`ASTROMCP_*`, `MERIDIAN_*`) remain supported.

## Telemetry

This server reports anonymous usage so we know which tools are worth maintaining and which are broken. Three events: session start, tool call, tool error.

**What is sent:** the tool name, how long it took, error status, which MCP client connected (e.g. Claude Desktop, Cursor) and its version, the server version, and a one-way SHA-256 prefix of your API key used as a stable anonymous id.

**What is never sent:** your API key or token, birth data, dates, names, coordinates, tool arguments, or tool results. No request or response bodies, ever.

**To turn it off** — either works, checked before anything is sent:

```bash
OPENEPHEMERIS_TELEMETRY=0
# or the cross-tool standard
DO_NOT_TRACK=1
```

## Tool surface

By default the server advertises a **focused core set** of everyday tools rather than the entire catalog. Large tool lists cost context and make model tool-selection worse, so the default is tuned for real conversations: one interactive app per tradition, the primary data tool per domain, geocoding, and the allowlist-gated generic proxy.

**Nothing is removed.** The surface is a filter on `tools/list` only — every tool stays registered and stays callable by name. If you know the tool you want, call it and it works, listed or not.

To advertise the full catalog:

```bash
OPENEPHEMERIS_TOOLS=full npx -y @openephemeris/mcp-server
```

On the remote HTTP server, append `?profile=full` to the connector URL (or send `X-OE-Tool-Surface: full`):

```
https://mcp.openephemeris.com/mcp?profile=full
```

The surface is fixed when the session initializes — this server does not advertise `tools.listChanged`, so switching requires reconnecting. `dev_list_allowed` enumerates every operation reachable through the generic proxy regardless of surface.

## Contributing & Support

- **Something wrong with a result?** [Open an issue](https://github.com/openephemeris/openephemeris-MCP/issues/new/choose) — include the tool, your inputs, and what you expected.
- **Want to contribute?** See [CONTRIBUTING.md](CONTRIBUTING.md). Integration examples and new skills are the most useful things you can add.
- **Found a security problem?** Please report it privately — see [SECURITY.md](SECURITY.md).
- **Tools timing out?** Check [status.openephemeris.com](https://status.openephemeris.com) first.

If this saved you from an LLM confidently inventing a Saturn position, a ⭐ helps other people find it.

## Legal

This package is licensed under the [MIT License](./LICENSE). However, use of this package to access the OpenEphemeris API constitutes use of the Service and is governed by the [OpenEphemeris Terms of Service](https://openephemeris.com/terms). By using this package, you agree to those terms. See also the [Privacy Policy](https://openephemeris.com/privacy) and [Acceptable Use Policy](https://openephemeris.com/acceptable-use).

## Development

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run regen:dev-allowlist
npm run check:dev-allowlist
npm run sync:readme
npm run check:readme
npm run verify:release
```

### Deploying the SSE Server to Fly.io

When you update the MCP server logic (handlers, bug fixes, hardening), you should deploy it so clients connecting via the remote `https://mcp.openephemeris.com/mcp` endpoint get the updates immediately.

1. Navigate to `apps/api/mcp-server`
2. Run `fly deploy --remote-only`

*Note on NPM:* Deploying to Fly.io instantly updates the web-accessible SSE tool. However, users installing your tool locally in Cursor/Desktop via `npx @openephemeris/mcp-server` will *only* receive the updates once a new version is published to NPM. If your changes are critical, you should bump the version in `package.json` and run `npm publish` (or your CI release pipeline) *after* deploying to Fly.

`npm run verify:release` is the release gate. It checks:
- allowlist freshness against OpenAPI
- schema pack freshness
- README synchronization
- type safety + tests
- publish tarball contents (`npm pack --dry-run --json`)

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    MCP Clients                          │
│  Smithery Gateway · Claude Web · ChatGPT · Remote apps  │
└──────────────────┬──────────────────────────────────────┘
                   │ Streamable HTTP (MCP 2025-11-25)
                   │ https://mcp.openephemeris.com/mcp
                   │
┌─────────────────────────────────────────────────────────┐
│          Cursor · Claude Desktop · Windsurf             │
└──────────────────┬──────────────────────────────────────┘
                   │ stdio JSON-RPC
                   │ npx @openephemeris/mcp-server
                   │
              ┌────▼────────────────────┐
              │  openephemeris-mcp      │
              │  Node.js MCP Server     │
              │  typed tools            │
              │  auth: Key > JWT        │
              └────────────┬────────────┘
                           │ HTTPS
                           ▼
              ┌────────────────────────┐
              │  OpenEphemeris API     │
              │  api.openephemeris.com │
              │  NASA JPL DE440        │
              │  1,100 years of data   │
              └────────────────────────┘
```

<!-- GENERATED:RUNTIME_SNAPSHOT:BEGIN -->
## Runtime Snapshot (Generated)

Generated by `npm run sync:readme` from `config/dev-allowlist.json` and the live tool registry.

- Allowlisted operations: **31**
- Methods: `GET=5`, `POST=26`, `PUT=0`, `PATCH=0`, `DELETE=0`
- Registered tools (`OPENEPHEMERIS_PROFILE=dev`): **92**
- Typed tools: `account_usage`, `acg_hits`, `acg_power_lines`, `auth_login`, `auth_logout`, `auth_status`, `bazi_annual_pillar`, `bazi_chart`, `bazi_compatibility`, `bazi_element_balance`, `bazi_luck_pillars`, `bazi_recalculate`, `bazi_ten_gods`, `bi_wheel_on_cross_aspect_click`, `bi_wheel_on_house_click`, `bi_wheel_on_planet_click`, `bi_wheel_recalculate`, `bi_wheel_synopsis`, `bodygraph_recalculate`, `chart_wheel_on_aspect_click`, `chart_wheel_on_house_click`, `chart_wheel_on_planet_click`, `chart_wheel_recalculate`, `chinese_bazi`, `dev_list_allowed`, `dev_read_api`, `dev_write_api`, `electional_angle_crossings`, `electional_aspect_search`, `electional_moment_analysis`, `electional_station_tracker`, `ephemeris_angles_points`, `ephemeris_aspect_check`, `ephemeris_bi_wheel`, `ephemeris_chart_wheel`, `ephemeris_composite`, `ephemeris_composite_midpoint`, `ephemeris_dignities`, `ephemeris_electional`, `ephemeris_fixed_stars`, `ephemeris_hermetic_lots`, `ephemeris_house_cusps`, `ephemeris_lunar_return`, `ephemeris_midpoints`, `ephemeris_moon_phase`, `ephemeris_natal_batch`, `ephemeris_natal_chart`, `ephemeris_natal_transits`, `ephemeris_next_eclipse`, `ephemeris_next_lunar_phase`, `ephemeris_overlay`, `ephemeris_planet_position`, `ephemeris_planetary_return`, `ephemeris_progressed_chart`, `ephemeris_relocation`, `ephemeris_retrograde_status`, `ephemeris_solar_return`, `ephemeris_synastry`, `ephemeris_transits`, `explore_bazi_chart`, `explore_bi_wheel`, `explore_human_design`, `explore_human_design_connection`, `explore_human_design_transit`, `explore_moon_phase`, `explore_natal_chart`, `explore_transit_timeline`, `explore_vedic_chart`, `hd_on_center_click`, `hd_on_channel_click`, `hd_on_connection_channel_click`, `hd_on_gate_click`, `hd_on_planet_click`, `hd_on_transit_channel_click`, `hd_on_variable_click`, `hd_opposition`, `hd_planetary_return`, `human_design_bodygraph`, `human_design_chart`, `human_design_composite`, `human_design_penta`, `location_search`, `moon_phase_recalculate`, `timezone_resolve`, `vedic_chart`, `vedic_chart_recalculate`, `venus_eight_year_star`, `venus_elongations`, `venus_phase`, `venus_star_points`, `venus_star_points_conjunctions`, `venus_stations`
- Generic tools: 

### Allowlist Families

| Family | Operations | Example |
|---|---:|---|
| `acg` | 4 | `POST /acg/ccg`, `POST /acg/hits` |
| `chinese` | 5 | `POST /chinese/bazi/compatibility`, `POST /chinese/bazi/element-balance` |
| `comparative` | 5 | `POST /comparative/composite`, `POST /comparative/composite/midpoint` |
| `electional` | 5 | `GET /electional/angle-crossings`, `GET /electional/aspect-search` |
| `ephemeris` | 1 | `POST /ephemeris/relocation` |
| `human-design` | 2 | `POST /human-design/composite`, `POST /human-design/transit-chart` |
| `predictive` | 6 | `POST /predictive/returns`, `POST /predictive/returns/lunar` |
| `visualization` | 3 | `POST /visualization/bi-wheel`, `POST /visualization/bodygraph` |
<!-- GENERATED:RUNTIME_SNAPSHOT:END -->

## Why OpenEphemeris for AI Agents?

Most LLMs (like Claude and ChatGPT) struggle heavily with astronomical calculations (trigonometry, Julian date conversions, and planetary lookups). OpenEphemeris serves as a **secure, remote math engine**.

By pairing LLMs with the OpenEphemeris MCP server, your agents can instantly access:
- **Zero-hallucination coordinates**: Direct, sub-arcsecond NASA JPL DE440 calculations spanning 1,100 years of astronomical data.
- **LLM-optimized tokens (`format=llm`)**: We compress standard 25,000 token JSON chart responses into minimal text blocks, cutting your inference costs by 50%.
- **Ready-to-use astrology layers**: Built-in support for Astrocartography geoJSON lines, Hermetic Lots, Fixed Stars, and complex Human Design matrix generation.