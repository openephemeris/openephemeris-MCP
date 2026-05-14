# Changelog

All notable changes to `@openephemeris/mcp-server` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbering follows [Semantic Versioning](https://semver.org/).

---

## [3.10.4] — 2026-04-24

### Changed
- `ephemeris_transits` tool description updated with compute surcharge and search range limit documentation
- `dev_call` credit cost reference now includes compute surcharge information
- Tier-based compute timeouts: Explorer 30s, Developer 120s, Startup 5m, Scale 10m for compute-heavy endpoints
- Search range caps: `/predictive/transits/search` limited to 1y (Explorer), 5y (Developer), 10y (Startup)
- Compute surcharges: requests exceeding 30s incur 1 additional credit per 30s of wall-clock compute
- Daily credit caps now persistent across server restarts (PostgreSQL-backed)

---

## [3.10.0] — 2026-04-23

### Added
- **Native visual rendering (Tier 1 MCP App)** — `ephemeris_natal_chart`, `ephemeris_synastry`,
  `human_design_chart`, `ephemeris_progressed_chart`, and `ephemeris_solar_return` now accept
  `include_visual: true` to embed a live chart image directly in the conversation alongside
  the JSON data. A single tool call returns both interpretation data and a rendered chart.
- **`visual_config` parameter** — optional `{ theme, size }` object on all visual-capable data
  tools. Astrology charts default to `theme: "light"`, HD bodygraphs default to `theme: "dark"`
  (per HD convention). Size range 200–4000 px, default 800.
- **Dual-content response handler** — `formatToolResponse` in `tools/index.ts` now intercepts
  embedded `VisualResult` objects: base64-encodes raw SVG strings on the fly, emits an MCP image
  block (`{ type: "image" }`) first, then a clean JSON text block with the `visual` key stripped.
  PNG payloads (already base64 from the sidecar) are passed through without double-encoding.
- **`test/visual-rendering.test.ts`** — 26 new unit tests covering the full visual pipeline:
  SVG encoding, PNG passthrough, dual-block output, key stripping, standalone binary passthrough,
  plain JSON fallthrough, and defensive handling of incomplete `visual` keys.

### Changed
- `ephemeris_chart_wheel`, `ephemeris_bi_wheel`, and `human_design_bodygraph` (standalone
  visualization tools) now **default to SVG** instead of PNG. This eliminates the `resvg` binary
  dependency that caused runtime environment mismatches in Docker/Fly deployments. PNG remains
  available as an explicit opt-in via `format: "png"`.
- Tool descriptions for standalone visual tools updated to reflect SVG-first rendering.

### Fixed
- Chart render failures caused by `resvg` binary not being available in the Node.js MCP
  server runtime environment. SVG is now rendered natively by the Go sidecar with no external
  binary dependencies.

---

## [3.9.0] — 2026-04-22


### Added
- **Streamable HTTP transport** (`POST/GET/DELETE /mcp`) — implements the MCP 2025-11-25
  specification. New integrations (Smithery, cursor, Claude Web) should prefer
  `https://mcp.openephemeris.com/mcp` over the legacy SSE endpoint. The SSE endpoint
  (`/sse`) is retained for backward compatibility.
- **`/.well-known/mcp/server-card.json`** — static server card served at the standard
  well-known path. Allows Smithery and other registries to scan tool metadata without
  requiring an authenticated session, enabling automatic listing and discovery.
- **`extractApiKey()` helper** — shared auth extraction (X-API-Key / Authorization: Bearer
  / X-OpenEphemeris-API-Key / ?apiKey) used by both transports, eliminating duplication.

### Changed
- `smithery.yaml` upgraded to modern `configSchema` + `commandFunction` format. Smithery
  now renders a typed API key input field in its UI instead of a raw env map.
- `/health` now reports both `sse_sessions` and `http_sessions` counts, and lists
  `transports: ["sse", "streamable-http"]` for client introspection.

---

## [3.8.0] — 2026-04-21

### Added
- `human_design_bodygraph` — new dedicated tool for generating Human Design Bodygraph images
  (PNG or SVG). Renders all 9 centers, 36 channels, and 64 gates with Personality/Design
  color-coding. Supports `light`, `dark`, and `mono` styles. Developer tier, 2 credits.

### Fixed
- **HD Bodygraph: missing 10-57 channel** — The "Channel of Perfected Form" (Gate 10 ↔ Gate 57)
  was silently dropped from the visualization geometry while the math engine still reported it as
  active. Charts with both gates activated now correctly render the channel.

---

## [3.7.0] — 2026-04-19

### Changed
- **Personal Tier Removed**: The platform no longer offers the Personal subscription tier.
- `ephemeris_transits` and `ephemeris_natal_transits` moved from Personal to the free **Explorer** tier.

---

## [3.6.0] — 2026-04-17

### Added
- `ephemeris_next_lunar_phase` — new purpose-built tool for "when is the next new/full/quarter moon?" queries.
  Replaces a 4–7 step multi-call chain with a single, credit-efficient call. Internally calculates a rolling
  search window and filters the calendar API response so the LLM receives a clean, normalized answer.

### Changed (Tool Descriptions & LLM Routing)
- `ephemeris_moon_phase` — sharpened description to clarify it is point-in-time only and cannot answer
  "upcoming date" questions. Adds explicit `→ use ephemeris_next_lunar_phase` redirect.
- `ephemeris_next_eclipse` — latitude/longitude are now **optional**. Omitting them triggers a global eclipse
  search (`/eclipse/solar/global` or `/eclipse/lunar/global`), allowing Claude to answer "when is the next
  total solar eclipse?" without forcing the user to specify a location.
- `acg_power_lines` — added explicit ❌/✅ routing guidance distinguishing it from `acg_hits`. This prevents
  Claude from fetching full global GeoJSON geometry when the user's question is about a specific city.
- `acg_hits` — symmetric routing guidance added (mirrors `acg_power_lines` change above).
- `ephemeris_solar_return` — `target_datetime` is now optional; defaults to `new Date().toISOString()` so
  Claude can answer "What does my solar return look like?" for the current year without stalling for input.
- `ephemeris_lunar_return` — same treatment; defaults to today so "what's my next lunar return?" resolves
  in one call.
- `electional_station_tracker` — `planets` parameter now accepts human-readable names (`mercury,venus,mars`)
  in addition to numeric IDs. Names are mapped to IDs in the handler. Adds `USE THIS TOOL FOR:` examples
  for "Mercury retrograde" queries to aid routing.
- `venus_phase` — `date` is now optional (was incorrectly marked required despite the description
  saying "Defaults to now"). Handler auto-fills today's date when omitted.

---

## [3.5.3] — 2026-04-10

### Fixed
- `ephemeris_chart_wheel` and `ephemeris_bi_wheel` tools now correctly advertise the
  `style` values accepted by the backend (`light`, `dark`, `mono`). The previous enum
  (`modern`, `classic`, `dark`) caused every non-dark chart request to fail with `400`.
- SSE sessions are now fully isolated: each connection creates its own `BackendClient`
  instance keyed to the connecting user's API key. Concurrent sessions no longer
  overwrite each other's API key on the shared singleton, preventing cross-user
  billing attribution errors.

---

## [3.5.1] — 2026-03-31

### Changed
- Added `mcp-server`, `modelcontextprotocol`, `model-context-protocol` to package.json keywords for registry discovery
- Fixed `OE_API_KEY` → `OPENEPHEMERIS_API_KEY` in registry submission guide
- Corrected GitHub links from `MeridianMap` to `Spirit-River` org

---

## [3.5.0] — 2026-03-28

### Added
- `POST /ephemeris/draconic` — Draconic chart: full planetary set shifted to True Node as 0° Aries (Explorer tier, 1 credit)
- `POST /ephemeris/prenatal-lunation` — Finds the prenatal new and full moon preceding a subject's birth date (Developer tier, 5 credits)
- `POST /predictive/primary-directions` — Placidian semi-arc primary directions with configurable arc length and body/angle targets (Developer tier, 5 credits)

### Changed
- Total production endpoints: **107 → 110**
- `dev-allowlist.json`, `endpoint-tier-matrix.json`, `llms.txt` all updated to reflect new surface

---

## [3.4.1] — 2026-03-25


### Fixed
- Chiron position fallback for edge-date calculations now uses full high-precision ephemeris path instead of simplified approximation
- SSE server chart wheel responses now correctly deliver native MCP image blocks instead of raw base64 JSON

### Changed
- Explorer tier daily cap set to 50 credits/day (resets midnight UTC)
- Catalog and metadata endpoints (`/acg/meta`, `/acg/datasets`, `/catalogs/*`) moved to free tier (0 credits)

---

## [3.4.0] — 2026-03-22

### Added
- `hd_planetary_return` tool — finds the exact date when a planet returns to its natal position in HD context
- `hd_opposition` tool — finds the exact date/age of a planet's first opposition (age cycle milestone)
- `venus_star_points`, `venus_eight_year_star`, `venus_elongations`, `venus_phase`, `venus_stations` — complete Venus Star Point toolkit
- `ephemeris_planetary_return` — generic multi-planet support for solar, lunar, and outer planet returns
- `ephemeris_lunar_return` — dedicated monthly lunar return chart

### Changed
- Asteroid data (Chiron, Ceres, Pallas, Juno, Vesta, Pholus) now included by default in natal chart responses
- `ephemeris_transits` tool now includes explicit `aspect_angle` parameter with examples for returns and oppositions

---

## [3.3.0] — 2026-03-21

### Added
- Timezone parameter added to all natal/transit/predictive tools — resolves ambiguous local-time inputs
- `ephemeris_composite_midpoint` — Davison midpoint composite chart
- `ephemeris_fixed_stars` — Ptolemaic fixed star positions with orb and conjunction data
- `ephemeris_hermetic_lots` — Arabic parts / Hermetic Lots (Lot of Fortune, Spirit, etc.)

### Fixed
- ACG power lines now correctly render for southern hemisphere birth locations
- Timezone resolution for "America/Denver" and similar IANA names no longer defaults to UTC

---

## [3.2.0] — 2026-03-21

### Added
- SSE (Server-Sent Events) transport support — enables remote MCP clients without local `npx` installs
- `ephemeris_chart_wheel` and `ephemeris_bi_wheel` tools now deliver native MCP image blocks (PNG)
- Payload size safety cap — responses over 500kb return a structured `PAYLOAD_TOO_LARGE` error

### Fixed
- Composite chart endpoint route corrected in allowlist

---

## [3.1.0] — 2026-03-20

### Added
- `human_design_composite` — dual-chart BodyGraph overlay for relationship analysis
- `human_design_penta` — 5-person Penta composite for group/team dynamics
- `ephemeris_progressed_chart` — secondary progressions (day-for-a-year method)

### Changed
- Explorer tier: transit endpoints now open at free tier (no subscription required)
- Developer tier: 75,000 credits/month
- Startup tier: 15,000 credits/month (formerly 'Pro')

---

## [3.0.0] — 2026-03-15

### Added
- Full tool allowlist security model — default-deny with `config/dev-allowlist.json`
- `dev.call` and `dev.list_allowed` generic proxy tools for allowlisted operations
- `welcome_to_open_ephemeris` MCP Prompt — orientation guide available to MCP clients
- Server icon registered at `https://mcp.openephemeris.com/icon.png`
- `verify:release` npm gate script for pre-publish validation

### Breaking
- Environment variable renamed from `ASTROMCP_API_KEY` to `OPENEPHEMERIS_API_KEY` (old name kept as fallback)
- Package renamed from `@astromcp/server` to `@openephemeris/mcp-server`

---

## [2.x] — Legacy

Earlier versions published under `@astromcp/server`. All users should migrate to `@openephemeris/mcp-server`.

---

*[Unreleased changes are tracked in commit history.]*
