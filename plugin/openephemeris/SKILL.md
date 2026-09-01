---
name: openephemeris
description: This skill should be used when a user asks for astrology or astronomical chart calculations — natal charts, transits, synastry/compatibility, progressions, solar/lunar returns, eclipses, moon phases, electional (auspicious-timing) astrology, Human Design, Vedic/Jyotish, Chinese BaZi, astrocartography, or chart wheel/bi-wheel visualizations. Uses NASA JPL DE440 ephemeris data for sub-arcsecond precision and interprets results conversationally.
---

# OpenEphemeris — AI-Native Astrology

This skill turns Claude into a professional astrologer backed by NASA-grade ephemeris math. Ask about your birth chart, check today's transits, explore relationship compatibility, find auspicious timing for decisions, or generate a Human Design bodygraph — all in natural conversation with computation precision down to the arc-second.

Every calculation uses the JPL DE440 planetary ephemeris (covering 1,100 years of astronomical data) and our high-precision mathematical engine. These are not horoscope generators — they are astronomically accurate planetary positions, house cusps, and aspect geometry that Claude interprets for you in plain language.

**House systems:** Placidus by default — Whole Sign, Equal, Koch, Campanus, Regiomontanus, and Porphyry also available. Just ask.

## Setup

### 1. Get an API Key

1. Go to [openephemeris.com/login?signup=true](https://openephemeris.com/login?signup=true)
2. Create a free account (Explorer tier: 150 free credits one-time, no credit card)
3. Go to Dashboard → Account tab → Create API Key
4. Copy the key (starts with `oe_...`)

> Don't hardcode your API key. Set it as an environment variable.

### 2. Set Your API Key

```bash
export OPENEPHEMERIS_API_KEY="oe_your_key_here"
```

Or add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.) for persistence.

### 3. Install the Plugin

```bash
claude plugin add openephemeris
```

Or if testing locally:
```bash
claude plugin add ./path/to/openephemeris
```

That's it. Ask Claude anything about astrology and it will compute real answers.

### CRITICAL: Timezone & Time Precision Handling

Astrology requires exact time calculation. You must be rigorous with user time input:
1. **Never Assume AM/PM**: If a user says "8:00", explicitly ask if it is AM or PM before generating anything.
2. **Local Time vs Timezone**: Clarify if the time provided is local to the birth/event location. (e.g., "Was 8:00 PM the local time in Paris?").
3. **Timezone Offset**: When computing the chart or using tools, ensure you understand the Daylight Saving Time (DST) or timezone rules for that specific year and location. 
4. **Always state the zone**: A datetime that names a clock time but not its zone is rejected — it is never assumed to be UTC. Either pass the local wall-clock time together with the `timezone` argument (`datetime='1990-04-15T14:30:00'`, `timezone='America/Chicago'` — preferred, since the IANA zone resolves that year's DST for you), or put the offset on the value itself (`1990-04-15T14:30:00-05:00`, or `...T19:30:00Z` for UTC). A date with no clock time (`1990-04-15`) is fine and resolves to noon UTC.

**Never guess or hallucinate the time** if the user gave an ambiguous input. Instant trust is broken if a user sees a wrong chart based on a sloppy time assumption. Hold their hand and ask clarifying questions first.

## What You Can Do

> These tables cover all 43 tools this skill can call. The MCP server advertises a curated **default surface of 36** to keep context lean; the rest — including `ephemeris_fixed_stars`, the Venus Star Points tools, `ephemeris_composite`, and a few others below — need `OPENEPHEMERIS_TOOLS=full` to be *listed* by default, but every tool stays callable by name regardless.

### Core Charts

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_natal_chart` | Full natal chart — positions, houses, aspects, dignities, optional Hermetic Lots & fixed stars | 1 |
| `ephemeris_synastry` | Synastry chart — inter-aspects and house overlays between two people | 3 |
| `ephemeris_relocation` | Relocated chart — same planets, different city | 1 |
| `ephemeris_progressed_chart` | Secondary progressions — evolving natal chart over time | 1 |
| `ephemeris_natal_batch` | Batch natal charts — up to 100 subjects in one call | 1/subject |

### Comparative Charts

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_composite` | Composite chart from two natal charts (midpoint method) | 3 |
| `ephemeris_composite_midpoint` | Alternative midpoint composite | 3 |
| `ephemeris_overlay` | House overlay — one person's planets in another's houses | 3 |
| `ephemeris_natal_transits` | Active transits aspecting a natal chart right now | 3 |

### Predictive

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_transits` | Search transit events by planet, aspect, orb, and date range | 5 |
| `ephemeris_solar_return` | Exact Solar Return date/time for a given year | 1 |
| `ephemeris_lunar_return` | Exact Lunar Return date/time (~monthly) | 1 |
| `ephemeris_planetary_return` | Generic planetary return (Jupiter, Saturn, etc.) | 1 |

### Moon & Eclipses

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_moon_phase` | Live moon phase + sign + void-of-course status | 1 |
| `ephemeris_next_eclipse` | Next solar or lunar eclipse — global or local visibility | 1 |

### Electional Timing

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_electional` | Scan a date range for optimal timing windows | 5 |
| `electional_moment_analysis` | Analyze quality of a specific moment (score 0-100) | 5 |
| `electional_station_tracker` | Upcoming retrograde/direct stations | 5 |
| `electional_aspect_search` | All active aspects at a given moment | 5 |

### Venus Star Points

| Tool | What It Does | Credits |
|------|-------------|---------|
| `venus_star_points` | Sun-Venus conjunction events nearest to a birth date | 1 |
| `venus_star_points_conjunctions` | Sun-Venus conjunctions in a date range | 1 |
| `venus_eight_year_star` | 8-year Venus pentagram cycle (5 vertices) | 1 |
| `venus_phase` | Venus morning/evening star status, elongation, cazimi | 1 |
| `venus_elongations` | Greatest elongation events in a date range | 1 |
| `venus_stations` | Venus retrograde and direct stations | 1 |

### Ephemeris Building Blocks

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_planet_position` | Raw planet position at a Julian Day | 1 |
| `ephemeris_house_cusps` | House cusp degrees for a location/time | 1 |
| `ephemeris_dignities` | Essential dignities for all planets | 1 |
| `ephemeris_retrograde_status` | Retrograde flags and speeds for all planets | 10 (1 if planet_id given) |
| `ephemeris_midpoints` | Midpoints between all planet pairs | 1 |
| `ephemeris_fixed_stars` | Fixed star positions and conjunctions | 1 |
| `ephemeris_hermetic_lots` | Arabic Parts / Hermetic Lots | 1 |
| `ephemeris_angles_points` | ASC, MC, DSC, IC, Vertex, East Point | 1 |
| `ephemeris_aspect_check` | Check aspect between two ecliptic longitudes | 1 |

### Specialized Modalities

| Tool | What It Does | Credits |
|------|-------------|---------|
| `human_design_chart` | Full Human Design bodygraph — type, strategy, authority, profile, centers, gates, channels | 2 |
| `human_design_composite` | HD composite chart for two people | 4 |
| `human_design_penta` | HD group chart for 3-5 people | 6 |
| `vedic_chart` | Vedic/Jyotish chart with sidereal positions | 1 |
| `chinese_bazi` | Four Pillars of Destiny (BaZi) chart | 1 |

### Visualization

| Tool | What It Does | Credits |
|------|-------------|---------|
| `ephemeris_chart_wheel` | PNG chart wheel image (800px) | 2 |
| `ephemeris_bi_wheel` | PNG bi-wheel image (transit overlay) | 2 |

### Astrocartography (ACG)

| Tool | What It Does | Credits |
|------|-------------|---------|
| `acg_power_lines` | Planetary power lines on a world map | 10 |
| `acg_hits` | Which lines are active at a specific location | 10 |


### Beyond the Basics

These aren't simplified consumer calculations. The engine includes features most astrology apps skip entirely:

- **Hermetic Lots (Arabic Parts)** — Part of Fortune, Part of Spirit, and the classical lot collection. Ask Claude to include them or set `include_arabic_parts=true`.
- **Fixed star conjunctions** — Regulus, Algol, Spica, Fomalhaut, and the full traditional catalog, plus which chart points sit conjunct them. Ask for `ephemeris_fixed_stars`. Give it a latitude and longitude too if you want the angles scanned — ASC/MC depend on place, not just time.
- **Essential dignities** — Domicile, exaltation, detriment, fall, triplicity, term, and face — calculated for every planet automatically.
- **Retrograde & station tracking** — Every planet's retrograde status is included in natal and transit results.
- **7 house systems** — Placidus, Whole Sign, Equal, Koch, Campanus, Regiomontanus, Porphyry. Just tell Claude which you prefer.
- **Arc-second precision** — Planetary longitudes accurate to fractions of an arc-second, powered by the same JPL DE440 data NASA uses for spacecraft navigation.
- **Everything else** — `dev_read_api` is a generic proxy over 120 allowlisted compute endpoints that don't have a dedicated tool above. If you ask for something not in these tables, Claude can still reach it.

## Try Asking

Not sure where to start? Try any of these:

- "What does my natal chart say?" *(give your birth date, time, and city)*
- "What's the moon phase right now? Is it void-of-course?"
- "When's the next solar eclipse visible from where I live?"
- "Are Saturn transits hitting my chart this year?"
- "When's the best time to launch my project next month?"
- "My partner and I — are we compatible?" *(give both birth details)*
- "How would my chart change if I moved to Tokyo?"
- "What's my Human Design type?"
- "Show me my chart with Whole Sign houses and fixed stars"
- "What are my Arabic Parts?"

## Examples

### "What does my chart say?"

**Prompt:** "I was born April 15, 1990 at 2:30 PM in Chicago. What does my chart say?"

Claude calls `ephemeris_natal_chart` → receives planetary positions, house cusps, aspects with orbs, and essential dignities → interprets the chart conversationally:

```json
{
  "planets": [
    {"name": "Sun", "sign": "Aries", "degree": 25.42, "house": 10, "dignity": "none"},
    {"name": "Moon", "sign": "Scorpio", "degree": 8.17, "house": 5, "dignity": "fall"}
  ],
  "aspects": [
    {"planet1": "Sun", "planet2": "Moon", "aspect": "quincunx", "orb": 2.75}
  ]
}
```

*"Your Sun at 25° Aries in the 10th house signals a driven, visible career path — you're meant to be seen leading. With your Moon in Scorpio in the 5th (in fall, which deepens the intensity), your emotional world runs deep and demands authentic creative outlets. The quincunx between them means your public ambition and private emotional needs don't speak the same language — learning to honor both is a lifelong integration..."*

### "Should I start this project today?"

**Prompt:** "Should I start this project today or wait?"

Claude calls `ephemeris_moon_phase` → gets phase, sign, and void-of-course status in one smart call:

```json
{
  "phase": "Waxing Gibbous",
  "illumination": 0.78,
  "sign": "Leo",
  "void_of_course": false,
  "next_phase": {"phase": "Full Moon", "datetime": "2026-03-14T06:55:00Z"}
}
```

*"The Moon is waxing gibbous in Leo — momentum is building and it's not void-of-course. Good energy for launching something creative and visible. The Full Moon hits tomorrow, so starting today lets you ride that wave to completion..."*

### "When should I sign this contract?"

**Prompt:** "I need to sign a business contract next week. When's the best window?"

Claude calls `ephemeris_electional` → scans the week for favorable timing, avoiding retrograde Mercury and void-of-course Moon:

```json
{
  "windows": [
    {
      "start": "2026-03-17T10:00:00Z",
      "end": "2026-03-17T14:00:00Z",
      "quality_score": 0.87,
      "factors": ["Mercury direct", "Moon in Virgo (earth sign)", "Jupiter trine MC"]
    }
  ]
}
```

*"Tuesday morning is your window. Mercury is direct, the Moon is in detail-oriented Virgo — perfect for binding agreements — and Jupiter is trining the Midheaven, which blesses business decisions. Avoid Wednesday afternoon — the Moon goes void-of-course, and contracts signed during VoC tend not to stick..."*

### "Are we compatible?"

**Prompt:** "My partner was born March 8, 1988 at 6 AM in London. I'm April 15, 1990 at 2:30 PM in Chicago. How do our charts interact?"

Claude calls `ephemeris_synastry` → compares both charts, calculating inter-aspects, house overlays, and elemental balance:

*"Your Sun in Aries trines their Mars in Sagittarius — fire meeting fire. That's raw chemistry and mutual motivation. But your Moon in Scorpio squares their Venus in Aquarius, which means emotional needs versus love language can feel like different dialects. The good news: their Jupiter conjuncts your Ascendant, so they naturally expand your sense of self..."*

### "What if I moved to Tokyo?"

**Prompt:** "How would my chart change if I moved from Chicago to Tokyo?"

Claude calls `ephemeris_relocation` → same planetary positions, new house cusps and angles for Tokyo:

*"Your planets don't change — you're still an Aries Sun. But in Tokyo, your Midheaven shifts to Capricorn, pulling your career focus toward discipline and institutional structures. Your Ascendant moves too, which changes how people perceive you on first meeting. If Chicago felt like 'build the startup,' Tokyo would feel like 'master the craft.'"*

### "When's the next eclipse?"

**Prompt:** "When's the next solar eclipse I can see from New York?"

Claude calls `ephemeris_next_eclipse` with the location → returns the next eclipse with local visibility and contact times:

*"The next solar eclipse visible from New York is a partial on March 29, 2025. First contact at 10:12 AM local time, maximum eclipse at 12:37 PM with 29% obscuration. The next total eclipse visible from your area won't be until 2079 — so this one's worth stepping outside for."*

### "What's my Human Design type?"

**Prompt:** "Generate my Human Design — June 21, 1985 at 8:15 AM in San Francisco"

Claude calls `human_design_chart` → returns type, strategy, authority, profile, defined centers, gates, and channels:

```json
{
  "type": "Manifesting Generator",
  "strategy": "Wait to Respond",
  "authority": "Sacral",
  "profile": "3/5",
  "defined_centers": ["Sacral", "Root", "Solar Plexus", "Throat"],
  "channels": ["26-44 (Surrender)"]
}
```

*"You're a Manifesting Generator — a multi-passionate energy type designed to respond to what lights you up, not initiate from the mind. Your Sacral authority means your gut response is your compass, not logic or emotion. That 3/5 profile? You learn by doing (and breaking things), and others see you as someone who can fix what's broken..."*

### Error Handling

If the API key is missing or invalid, you'll get a clear error with a signup link:

```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "API key is missing or invalid. Sign up at https://openephemeris.com/login?signup=true and create a key in Dashboard → Account."
}
```

## Format Options

Add `format='llm'` to any tool for token-efficient output (available on all tiers):
- Reduces natal chart output from ~24,000 tokens to ~6,500 tokens — a 73% cut
- Best practice when running multiple tools in sequence

## Privacy

This plugin sends computation requests to the OpenEphemeris API (`api.openephemeris.com`).

- **What's collected:** Birth dates, times, and coordinates submitted in computation requests
- **How it's used:** To compute astronomical positions and return results. That's it.
- **Third-party sharing:** No birth data, coordinates, names, or tool arguments are ever shared or sold. The `@openephemeris/mcp-server` package does send anonymous usage telemetry (tool name, duration, error status, client name) to `us.i.posthog.com` on each call — opt out with `OPENEPHEMERIS_TELEMETRY=false` or `DO_NOT_TRACK=1`.
- **Retention:** Request data is not stored after computation. Usage counts are tracked for billing.

Full privacy policy: [openephemeris.com/privacy](https://openephemeris.com/privacy)

## Support

- **Docs:** [openephemeris.com/docs](https://openephemeris.com/docs)
- **Dashboard:** [openephemeris.com/dashboard](https://openephemeris.com/dashboard)
- **npm:** [@openephemeris/mcp-server](https://www.npmjs.com/package/@openephemeris/mcp-server)
- **Email:** support@openephemeris.com
- **GitHub Issues:** [github.com/openephemeris/openephemeris-MCP/issues](https://github.com/openephemeris/openephemeris-MCP/issues)
