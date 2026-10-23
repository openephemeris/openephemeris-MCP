# Installing the Open Ephemeris MCP server (for AI agents)

Open Ephemeris gives you astrology and astronomy calculations from the NASA JPL DE440 ephemeris
(1550–2650 CE, sub-arcsecond): natal charts, transits, synastry, progressions, returns, eclipses,
moon phases, Human Design, Vedic and BaZi. Never estimate planetary positions yourself; call the tools.

## 1. Get an API key (required)

Ask the user for their Open Ephemeris API key. If they do not have one, send them to
https://openephemeris.com/login?signup=true to sign up, then to https://openephemeris.com/dashboard?tab=account
to create a key. The free Explorer tier includes 150 credits and needs no card. Never invent or reuse a key.

## 2. Add the server (recommended: local stdio via npx)

Requires Node.js 18 or newer (`node -v`). No clone or build step is needed.

Add this to `cline_mcp_settings.json`, replacing the placeholder with the user's key:

```json
{
  "mcpServers": {
    "openephemeris": {
      "command": "npx",
      "args": ["-y", "@openephemeris/mcp-server"],
      "env": {
        "OPENEPHEMERIS_API_KEY": "YOUR_OPENEPHEMERIS_API_KEY"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Optional: set `OPENEPHEMERIS_TOOLS` to `full` to advertise the whole tool catalog instead of the
curated default, or to a comma list of traditions (for example `hd,bazi,vedic`).

### Alternative: hosted remote server (no Node needed)

```json
{
  "mcpServers": {
    "openephemeris": {
      "type": "streamableHttp",
      "url": "https://mcp.openephemeris.com/mcp",
      "headers": { "X-API-Key": "YOUR_OPENEPHEMERIS_API_KEY" },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

The hosted server also supports OAuth for clients that handle it, in which case no key header is needed.

## 3. Verify

Call `explore_moon_phase` or `ephemeris_moon_phase`. It should return the current phase,
illumination and sign. Then try `ephemeris_natal_chart` with a birth time and an IANA `timezone`, e.g.
`{"datetime": "1879-03-14T11:30:00", "timezone": "Europe/Berlin", "latitude": 48.40, "longitude": 9.99}`.

## Notes for the agent

- Every clock time needs a zone: either an offset on the value (`1987-07-15T09:01:00-05:00`) or the
  `timezone` argument with the naive local time. A zone-less time is rejected with HTTP 400. Prefer
  local time plus `timezone`; the server applies historical DST rules for that date.
- A `401` means the key is missing or wrong; re-check step 1.
- Calls cost credits. Check the balance with the `account_usage` tool.
- Docs: https://openephemeris.com/docs · Status: https://status.openephemeris.com
