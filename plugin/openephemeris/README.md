# OpenEphemeris — Claude Plugin

Astronomical computation tools for natal charts, transits, eclipses, moon phases, synastry, Human Design, Chinese astrology, Vedic astrology, and more — powered by NASA JPL DE440 data.

## Quick Start

1. Get a free API key at [openephemeris.com](https://openephemeris.com/login?signup=true)
2. Set `OPENEPHEMERIS_API_KEY` in your environment
3. Install: `claude plugin add openephemeris`
4. Ask Claude: *"Calculate a natal chart for April 15, 1990 at 2:30 PM in Chicago"*

## What's Included

- **10 MCP tools** — 8 typed (natal, transits, moon, eclipse, synastry, relocation, electional, Human Design) + generic proxy to 97 endpoints
- **97 allowlisted API endpoints** covering 25+ domain groups
- **NASA JPL DE440** ephemeris data — sub-arcsecond accuracy across 1,100 years
- **`format=llm`** support for 73% token reduction

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

This plugin sends computation requests to `api.openephemeris.com`. Birth dates, times, and coordinates are used only for computation and are not stored. No data is sold or shared. Full policy: [openephemeris.com/privacy](https://openephemeris.com/privacy)

## Links

- [Documentation](https://openephemeris.com/docs) · [Dashboard](https://openephemeris.com/dashboard) · [npm](https://www.npmjs.com/package/@openephemeris/mcp-server) · [GitHub](https://github.com/openephemeris/openephemeris-MCP)

## License

MIT — Spirit River Inc
