# AGENTS.md — Open Ephemeris

For coding agents (Codex, Cursor, Claude Code, Cline) building on the Open Ephemeris API or MCP server.

## What this is

Astrology and astronomy calculations from the NASA JPL DE440 ephemeris (1550–2650 CE): planet
positions, natal charts, transits, synastry, progressions, returns, eclipses, moon phases,
astrocartography, Human Design, Vedic and BaZi. Accuracy by era, worst case included:
https://openephemeris.com/proof

## Rules for agents

- **Never compute or estimate planetary positions yourself.** Call the API or an MCP tool.
- **Every clock time needs a zone.** Send `1987-07-15T09:01:00-05:00`, or the naive local time plus
  an IANA `timezone` (`America/Chicago`). Prefer the second form: the server applies historical DST.
  A zone-less time is a 400, never a silent UTC guess.
- **Coordinates are decimal degrees**, north and east positive.
- **Ask the user for their API key.** Never invent, hard-code or commit one. Keys come from
  https://openephemeris.com/dashboard?tab=account (free tier, no card).
- **Pass `format=llm`** on data endpoints when the result goes into a model's context.
- **Paths are unversioned** (`/ephemeris/natal-chart`, not `/v1/...`).

## Where things are

| Need | Go to |
|---|---|
| Install the MCP server | [`llms-install.md`](llms-install.md), [`SETUP.md`](SETUP.md) |
| Hosted MCP endpoint | `https://mcp.openephemeris.com/mcp` |
| REST base URL | `https://api.openephemeris.com` |
| OpenAPI spec | `https://api.openephemeris.com/meta/openapi.json` |
| Endpoint and tool counts, full manifest | https://openephemeris.com/llms.txt |
| Docs | https://openephemeris.com/docs |
| Credits and pricing | https://openephemeris.com/pricing |
