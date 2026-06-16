# OpenEphemeris Skills

Agent Skills that guide Claude to cast and interpret accurate astrology, Human Design, and ephemeris charts using the [OpenEphemeris MCP server](https://github.com/openephemeris/openephemeris-MCP). Each skill is a self-contained directory with its own `SKILL.md`.

These skills call the OpenEphemeris MCP tools (hosted at `https://mcp.openephemeris.com/mcp`) and fall back to text output when the MCP Apps UI is unavailable. A free Explorer API key (openephemeris.com) covers the core skills.

## Skills

| Skill | Description |
|---|---|
| [`astrocartography`](./astrocartography/SKILL.md) | Generate and interpret astrocartography (ACG / locational astrology) — planetary lines, parans, crossings, local space, and how moving to a different location changes a chart. Use when someone asks about astrocartography, ACG, the best place to live, what city is best for their career or love life, relocation, or planetary lines. |
| [`chinese-vedic-astrology`](./chinese-vedic-astrology/SKILL.md) | Calculate and interpret Chinese BaZi Four Pillars / Chinese zodiac and Vedic Jyotish charts including nakshatras, dashas, yogas, and ayanamsa selection. Use when someone asks about Eastern astrology systems, their Chinese zodiac animal, BaZi, sidereal/Vedic chart, nakshatra, or dasha. |
| [`compatibility-synastry`](./compatibility-synastry/SKILL.md) | Analyze relationship compatibility between two people using synastry, composite, and Davison/midpoint charts. Use when someone asks about romantic compatibility, relationship dynamics, friendship chemistry, business partnership fit, or how two people's charts interact. |
| [`hd-life-cycles`](./hd-life-cycles/SKILL.md) | Calculate and interpret Human Design maturation transits — Saturn Return, Uranus Opposition, Chiron Return, Jupiter Return, and Uranus Return. Use when someone asks about their HD life cycles, maturation points, midlife crisis transits, or the major developmental milestones of the Human Design system. |
| [`human-design-reading`](./human-design-reading/SKILL.md) | Generate and interpret Human Design bodygraph charts including type, strategy, authority, profile, incarnation cross, defined and undefined centers, gates, and channels. Use when someone asks about their Human Design, HD type, strategy and authority, or any Human Design concept. |
| [`natal-chart-reading`](./natal-chart-reading/SKILL.md) | Interpret a natal (birth) chart using OpenEphemeris. Use when someone asks about their birth chart, planetary placements, personality traits, life themes, the Big Three (Sun/Moon/Rising), houses, aspects, dignities, nodes, Chiron, or any astrological analysis based on birth data. |
| [`openephemeris-api-reference`](./openephemeris-api-reference/SKILL.md) | Complete endpoint reference for the 121 OpenEphemeris API endpoints. Use when you need to find the exact endpoint, parameter, or path for an astronomical or astrological computation, or when other skills haven't covered the calculation a user is asking for. |
| [`openephemeris-setup`](./openephemeris-setup/SKILL.md) | Install and configure the OpenEphemeris MCP server. Use when a user wants to set up OpenEphemeris, get an API key, troubleshoot installation, or connect Claude / Cursor / Windsurf / ChatGPT to the planetary calculation API. |
| [`timing-electional`](./timing-electional/SKILL.md) | Find optimal timing for activities, analyze current transits, identify the best moment for an event, or describe the current astrological weather. Use when someone asks "when should I…?", "what transits are happening?", "what's the moon doing?", or anything about election, electional astrology, eclipses, retrogrades, or moon phases. |

## Installation

Each skill folder contains a `SKILL.md`. Copy a skill directory into your Claude skills location, or reference this repository when submitting to the Anthropic Skills directory.

## License

MIT — see [LICENSE](../LICENSE). Use of these skills to access the OpenEphemeris API is governed by the [OpenEphemeris Terms](https://openephemeris.com/terms).
