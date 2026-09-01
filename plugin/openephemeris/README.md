# OpenEphemeris — Claude Plugin

Astronomical computation tools for natal charts, transits, eclipses, moon phases, synastry, Human Design, Chinese astrology, Vedic astrology, and more — computed at NASA mission-grade precision, not guessed from training data.

## Quick Start

1. Get a free API key at [openephemeris.com](https://openephemeris.com/login?signup=true)
2. Set `OPENEPHEMERIS_API_KEY` in your environment
3. Install: `claude plugin add openephemeris`
4. Ask Claude: *"Calculate a natal chart for April 15, 1990 at 2:30 PM in Chicago"*

## What's Included

- **36 tools** spanning natal charts, transits, synastry, Human Design, BaZi, Vedic, astrocartography, electional timing, and eclipses — plus interactive chart wheels, bi-wheels, and bodygraphs that render inline
- **A focused default surface.** Tool definitions are re-sent on every model pass, so the server advertises a curated set rather than the whole catalog — large tool lists cost context and make tool selection worse. The rest are one flag away (`OPENEPHEMERIS_TOOLS=full`) and every tool stays callable by name.
- **`dev_read_api`** — a generic proxy over 120 allowlisted public compute endpoints, for anything without a typed tool
- **NASA mission-grade precision** — the JPL DE440 ephemeris, the same data NASA missions run on, spanning 1,100 years of astronomical data
- **`format=llm`** support — cuts chart response tokens by 50–73% depending on endpoint

## Structure

```
openephemeris/
├── .claude-plugin/
│   └── plugin.json        # Plugin manifest with MCP config
├── SKILL.md               # Full setup guide, tool reference, examples
├── README.md              # This file
└── LICENSE                # MIT license
```

## Privacy Policy

This plugin sends computation requests to `api.openephemeris.com`. Birth dates, times, and coordinates are used only for computation and are not stored. No data is sold or shared.

**Telemetry:** the underlying `@openephemeris/mcp-server` package sends anonymous usage events (tool name, duration, error status, client name — never birth data, coordinates, or tool arguments) to `us.i.posthog.com` on each tool call, so we can see what's used. Opt out with `OPENEPHEMERIS_TELEMETRY=false` or `DO_NOT_TRACK=1`.

Full policy: [openephemeris.com/privacy](https://openephemeris.com/privacy)

## Links

- [Documentation](https://openephemeris.com/docs) · [Dashboard](https://openephemeris.com/dashboard) · [npm](https://www.npmjs.com/package/@openephemeris/mcp-server) · [GitHub](https://github.com/openephemeris/openephemeris-MCP)

## License

MIT — Spirit River Inc
