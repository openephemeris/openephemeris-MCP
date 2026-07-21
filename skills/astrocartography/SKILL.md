---
name: astrocartography
description: Generate and interpret astrocartography (ACG / locational astrology) — planetary lines, parans, crossings, local space, and how moving to a different location changes a chart. Use when someone asks about astrocartography, ACG, the best place to live, what city is best for their career or love life, relocation, or planetary lines.
version: 1.0.0
updated: 2026-05-23
---

# Astrocartography (ACG / Locational Astrology)

Use this skill when someone asks where on Earth they're "luckiest" for love, career, growth, or healing — or what changes if they move. ACG maps the four angular positions (rising, culminating, setting, anti-culminating) of every planet at the moment of birth across the globe, producing planetary lines. Living near a line activates that planet's energy in the corresponding angular theme.

> **Tier requirement:** Several ACG endpoints (aspects, midpoints, crossings, declinations) require the **Scale** tier ($199/mo). Power-lines, hits, and parans are available on Pro tier. The combined `/acg/features` endpoint is service-tier (Ela Map only).

## Required Information

1. Full birth date
2. Birth time (essential — ACG IS the angular system; time uncertainty wrecks it)
3. Birth location
4. (Optional but useful) One or more **target locations** the user is asking about, OR a desired theme (career, love, healing, spirituality) to find the best lines for that theme.

## Standard Procedure for Birth-Data Endpoints

Any endpoint that takes a birth chart (natal, synastry, composite, transits, returns, progressions, Human Design, Vedic, ACG) MUST follow this sequence. Skipping any step produces a wrong chart — usually wrong by hours of arc.

### Step 1 — Resolve location to coordinates

If you don't already have precise lat/lon, call:

```
GET /location/autocomplete?query=<city, country>&limit=5
```

Confirm the right hit with the user if there's ambiguity (e.g. "Portland, OR" vs "Portland, ME"). Record the `latitude` and `longitude` of the chosen result.

### Step 2 — Resolve timezone for that location AT THE BIRTH DATE

Historical timezone rules matter. A city's UTC offset in 1962 may differ from today (DST rules, war time, jurisdiction changes). Always look up the timezone for the specific birth date.

```
POST /timezone/lookup
{ "latitude": <lat>, "longitude": <lon> }
```

Response gives an IANA timezone string like `"America/Los_Angeles"`. The `BirthLocation` field below REQUIRES this — it is not optional.

### Step 3 — Build the request body

The `SubjectRequest` schema requires `birth_datetime`, `birth_location`, and `name`. The IANA timezone goes into `birth_location.timezone`:

```json
{
  "subject": {
    "name": "Subject",
    "birth_datetime": { "iso": "1990-04-15T14:30:00" },
    "birth_location": {
      "latitude": 41.8781,
      "longitude": -87.6298,
      "timezone": "America/Chicago",
      "city": "Chicago",
      "country": "United States"
    }
  }
}
```

The `iso` field is the **local civil time** at the birth location. The API handles the conversion to UTC using the supplied IANA `timezone`. Do not pre-convert to UTC and do not pass an offset suffix on the `iso` string unless the user explicitly knows it.

### Step 4 — Choose house system (ask if appropriate)

The natal chart endpoint defaults to **Placidus**. Before computing, briefly ask:

> "I'll use Placidus houses by default (the most common modern Western system). If you prefer a different system — Whole Sign (Hellenistic/traditional), Koch, Equal, Campanus, Regiomontanus, or Porphyry — just say so."

Once chosen, pass it through `configuration.house_system` on the request.

### Step 5 — Always request `format=llm` unless raw JSON is requested

This reduces token usage by ~73% and gives you a readable, interpretable response. Add `?format=llm` to the URL.

### Time-unknown handling

If the user doesn't know their birth time:

- **Sun sign, outer planets, North/South Node sign** — reliable.
- **Moon sign** — only reliable to within ~12 hours. If the user knows roughly morning/afternoon/evening, it usually narrows enough.
- **Rising sign, all house placements, Midheaven** — **unreliable**. Do not interpret these without a time.
- **Default fallback:** use 12:00 noon local. Disclose: "Without a birth time, I'm using noon as a placeholder. Your rising sign, house placements, and Moon sign may not be accurate. The rest of the chart is still meaningful."

For Human Design, type/strategy/authority/profile depend on precise time — flag any time uncertainty and suggest the user rectify with a Human Design analyst or rectification service before relying on these results.

## The Four Line Types

Each planet has four lines circling the globe:

| Line | What it means | Effect of living near it |
|------|---------------|--------------------------|
| **AC (Rising / Ascendant)** | Planet on the eastern horizon at birth | The planet's energy infuses your identity & first impressions in this location |
| **MC (Culminating / Midheaven)** | Planet at the highest point | The planet shapes your career & public visibility here |
| **DC (Setting / Descendant)** | Planet on the western horizon | The planet's energy enters through partners & relationships here |
| **IC (Anti-culminating / Imum Coeli)** | Planet at the lowest point | The planet shapes your home & inner foundation here |

## Planet Line Themes

| Planet | Quick read on its line |
|--------|----------------------|
| **Sun** | Vitality, recognition, "being seen"; can be ego-inflating |
| **Moon** | Emotional belonging, family feeling, nostalgia; can be moody |
| **Mercury** | Communication, learning, writing, networking |
| **Venus** | Love, beauty, art, money; magnetic, but can over-indulge |
| **Mars** | Action, ambition, sport, conflict; energizing but reactive |
| **Jupiter** | Expansion, luck, teaching, abundance; the "lucky" line |
| **Saturn** | Discipline, mastery, structure, sometimes hardship; mature life |
| **Uranus** | Disruption, freedom, breakthroughs, unpredictability |
| **Neptune** | Spirituality, art, dissolution; risk of confusion/escapism |
| **Pluto** | Transformation, power, intensity; can be cathartic or destructive |
| **Chiron** | Wounding and healing; gravitates toward healer paths |

### "Best line for X" quick map

| Life theme | Lines to favor |
|------------|---------------|
| Career / public success | Sun MC, Jupiter MC, Saturn MC (with effort) |
| Love | Venus DC, Venus AC, Moon DC, Sun DC |
| Healing | Chiron AC/MC, Neptune AC (carefully) |
| Money | Jupiter MC, Venus MC, Pluto (high-risk high-reward) |
| Spiritual practice | Neptune AC/MC, Jupiter IC, Moon IC |
| Home & belonging | Moon IC, Venus IC, Sun IC |
| Adventure / reinvention | Uranus AC, Jupiter AC |

## Computational Endpoints

### Generate the lines

```
POST /acg/power-lines
```

Returns the geographic coordinates (lat/lon paths) of every planet's four lines for the subject. Use this as the map.

### Find lines near a target city

```
POST /acg/hits
```

Body includes the subject + a list of locations. Returns which lines (and how close in km) are near each target city.

> This is the most common ACG question: "I'm considering moving to Lisbon — what lines are there?" → `/acg/hits` with Lisbon as the target.

### Crossings — where two lines intersect

```
POST /acg/crossings
```

Returns geographic points where two planetary lines cross. Crossings concentrate the energies of both planets — extremely potent spots (often profound or intense).

### Parans

```
POST /acg/parans
```

Parans are latitudes (not points) where two planets are simultaneously on the angles. A paran line affects a band of latitude around the globe — even cities far from a power line but on a paran latitude feel the combination.

### Midpoints (Scale tier)

```
POST /acg/midpoints
```

Lines for planetary midpoints (e.g. Sun/Moon midpoint line, Venus/Mars midpoint line). Used for more nuanced reading.

### Declination Lines (Scale tier)

```
POST /acg/declination-lines
```

Parallels of declination — alternative to ecliptic-based lines, useful for fixed-star and out-of-bounds work.

### Aspects to Local Angles (Scale tier)

```
POST /acg/aspects
```

Where natal planets form aspects (not just conjunctions) to local Asc/MC. Captures sextiles, squares, trines to the angles at any location.

### Local Space

```
POST /acg/local-space
```

A directional system from a chosen reference city. Tells you what direction to travel (e.g. "Mars is to your northeast, Jupiter to your south-southwest") for any purpose, even short distances within a city.

### Combined Features (service tier only)

```
POST /acg/features
```

Returns a bundle: lines + crossings + parans + hits in one call. Available only to service-tier consumers (Ela Map).

## Relocation Chart (alternative view)

If the user is asking "what's MY chart in Lisbon?" — i.e. wants the full chart recomputed for the new city — that's a relocation, not ACG:

```
POST /ephemeris/relocation?format=llm
```

ACG and relocation answer different questions:
- **ACG** = "what lines pass through Lisbon?" — surface-level scan
- **Relocation** = "what's my Lisbon Ascendant, Midheaven, and full house arrangement?" — full chart

A good ACG reading often combines both — name the lines passing through a city, then offer to compute the full relocation chart.

## How to Deliver an ACG Reading

### If the user asks about a SPECIFIC city

1. Run Standard Procedure for their birth data
2. `POST /acg/hits` with that city as target
3. List every line within ~700 km of the city, sorted by proximity
4. Read each line by planet + angle (e.g. "Venus DC line passes 80 km west of Lisbon — strong romantic and creative magnetism through partnership in this region")
5. Note any crossings nearby
6. Offer to run the full relocation chart for that city

### If the user asks "where SHOULD I move for X?"

1. Run Standard Procedure
2. `POST /acg/power-lines` to get all lines
3. Filter to the planet most aligned with X (career → Jupiter/Sun/Saturn MC; love → Venus DC/AC, etc.)
4. Identify cities along those lines from the user's mention or your knowledge
5. Cross-check with `/acg/hits` for those candidate cities
6. Recommend 2–4 specific cities with the reasoning for each

### If the user asks "what's MY map look like?"

1. Run Standard Procedure
2. `POST /acg/power-lines`
3. Describe the 3–5 most striking lines (longest stretches over populated regions; benefic lines through known major cities)
4. Flag any nearby crossings
5. Note parans of significance

## Honest Framing

- **Lines are influence, not destiny.** Many people thrive far from any "good" line. Many struggle right on top of a Jupiter line.
- **Width of influence:** typical practitioners read lines within ~700 km (about 4° longitude). Beyond that, the influence diminishes.
- **Crossings are intense, not always good.** A Mars/Saturn crossing is brutal; a Venus/Jupiter crossing is lucky. Read by planet pair, not just by "this is a crossing."
- **You bring your chart with you.** ACG doesn't change your birth chart; it amplifies or rearranges the angular expression. Saturn lessons happen wherever you go — Saturn lines just put them at the front of the stage.
- **Practical factors matter more than astrology.** Visa, family, language, climate, and economics matter more than any line. ACG is one input among many.

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flow

User: "I'm considering moving from Portland to Lisbon. What does that look like astrocartographically? Born March 3, 1995 at 7:22 AM in Portland, Oregon."

1. Standard Procedure → Portland coords + tz + subject body
2. `POST /acg/hits` with Lisbon (lat 38.7223, lon -9.1393) as target
3. Identify the 2–4 nearest lines (e.g. "Venus MC line ~50 km east — career through art/beauty; Jupiter DC line ~400 km north — partnerships through travel/teaching")
4. Note any crossings in the Iberian region
5. Offer: "Want me to also compute your full relocated chart for Lisbon — Ascendant, Midheaven, and house re-arrangement?"
