---
name: natal-chart-reading
description: Interpret a natal (birth) chart using OpenEphemeris. Use when someone asks about their birth chart, planetary placements, personality traits, life themes, the Big Three (Sun/Moon/Rising), houses, aspects, dignities, nodes, Chiron, or any astrological analysis based on birth data.
version: 1.0.0
updated: 2026-05-23
---

# Natal Chart Reading

Use this skill whenever a user asks about their birth chart or any individual placement (Sun, Moon, Rising, planets, houses, aspects, nodes, Chiron, dignities, midpoints, hermetic lots).

## Required Information

Ask for, in this order:

1. **Full birth date** (year, month, day)
2. **Birth time** (hour and minute — accuracy matters; see "Time-unknown handling" below)
3. **Birth location** (city, state/region, country)
4. **(Optional)** Preferred house system. Default Placidus. Offer alternatives if they sound traditional/Hellenistic-inclined.

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

## Compute the Chart

After Steps 1–4 of the Standard Procedure, call:

```
POST /ephemeris/natal-chart?format=llm
```

with a body shaped like:

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
  },
  "configuration": {
    "house_system": "placidus"
  },
  "include_aspects": true,
  "include_dignities": true,
  "include_hermetic_lots": false
}
```

For dignities depth, set `include_dignities: true` (already shown). For midpoints, hermetic lots, prenatal lunation, request the relevant `include_*` flags or call the dedicated endpoints:

- `POST /ephemeris/midpoints` — midpoint trees
- `POST /ephemeris/hermetic-lots` — Lot of Fortune, Lot of Spirit, etc.
- `GET /ephemeris/prenatal-lunation` — pre-birth New/Full Moon

## Interpretation Structure

Deliver the reading in this order. Always lead with the Big Three.

### 1. The Big Three

State Sun, Moon, Rising clearly, each by sign AND house. This is what most users want first.

- **Sun sign** — Core identity, ego, vital force. Conscious self.
- **Moon sign** — Emotional nature, instinctive reactions, what you need to feel safe.
- **Rising sign / Ascendant** — How others see you, your physical presence, the lens through which you encounter life.

Format: "You're a Pisces Sun in the 12th house — deeply intuitive, with energy drawn into the unseen. Your Moon in Capricorn in the 10th means you steady yourself through structure and visible accomplishment. With Sagittarius rising, the world meets you as warm, candid, and seeking."

### 2. The Nodes — Life Direction

- **North Node** — Soul's growth direction. Unfamiliar but rewarding territory.
- **South Node** — Comfort zone, prior skills, stagnation if clung to.

Interpret by sign AND house together.

### 3. Personal Planets

- **Mercury** — Mind, communication style. Note retrograde (internalized processing, careful revisions).
- **Venus** — Love style, aesthetic, money/pleasure relationship.
- **Mars** — Drive, assertion, anger style, sexual energy.

### 4. Social Planets

- **Jupiter** — Where abundance and faith flow. Where you might overdo.
- **Saturn** — Where mastery is earned through effort. Saturn aspects are not "bad"; Saturn return (~28–30) is the most important Saturn transit.

### 5. Chiron — The Wounded Healer

Sign + house reveal the core wound — the place of deep sensitivity, and through which the user develops wisdom to heal others.

### 6. House Emphasis

Concentrate on houses with 3+ planets (stelliums). Briefly explain the dominant life area.

| House | Domain |
|-------|--------|
| 1st | Self, identity, body, first impressions |
| 2nd | Resources, money, values, self-worth |
| 3rd | Communication, siblings, learning, local environment |
| 4th | Home, family, ancestry, emotional foundation |
| 5th | Creativity, romance, children, self-expression |
| 6th | Service, health, daily routine, work, craftsmanship |
| 7th | Partnership, marriage, open enemies |
| 8th | Transformation, shared resources, intimacy, depth psychology |
| 9th | Expansion, travel, philosophy, higher education |
| 10th | Vocation, reputation, public life, legacy |
| 11th | Community, friends, hopes, humanitarian ideals |
| 12th | Dissolution, spirituality, the unconscious, isolation |

### 7. Major Aspects

Focus on tight orbs first (≤3°). Wider orbs (up to 8° for Sun/Moon) are secondary.

**Hard aspects** — growth through tension:
- **Conjunction (0°)** — fused energies
- **Opposition (180°)** — awareness through polarity, often projected onto others
- **Square (90°)** — friction that drives action

**Soft aspects** — natural gifts:
- **Trine (120°)** — effortless flow; can become laziness without awareness
- **Sextile (60°)** — opportunity that requires conscious activation

**Minor when tight:**
- **Quincunx (150°)** — chronic adjustment between incompatible energies
- **Quintile (72°)** — creative, unique talent

### 8. Chart Shape

Note the gestalt: bundle, bowl, bucket, locomotive, seesaw, splay, splash. Briefly explain what the shape means for life pattern.

### 9. Dignities (if requested with `include_dignities`)

| State | Meaning |
|-------|---------|
| Domicile | Planet at home — natural, strong expression |
| Exalted | At peak power — elevated, idealized |
| Detriment | Opposite home — must work harder; not "bad" |
| Fall | Opposite exaltation — humbled; deepest lessons live here |

Frame constructively: "Venus in Scorpio is in detriment — your love runs intense, all-or-nothing, and transformative once trust is in place."

### 10. Retrogrades at Birth

Any personal planet retrograde indicates internalized expression. Briefly note Mercury / Venus / Mars retrograde dynamics.

## Synthesis

After covering placements, weave a narrative:

- Find repeated elements (e.g. multiple water placements → emotional depth as a core theme).
- Note repeated modalities (cardinal/fixed/mutable balance).
- Identify aspect patterns (T-square, grand trine, grand cross, yod, kite).
- Close with: "The overall arc of your chart is… Your greatest gift is… Your core growth edge is…"

## Follow-Up Offers

After the natal reading, naturally offer one or more of:

- **Current transits** — "Want me to look at what's moving across your chart right now?" → `timing-electional` skill
- **Solar return** — "Want me to read your birthday year? (Solar return chart for the year ahead.)" → `POST /predictive/returns/solar`
- **Relocation** — "Want me to see how a different city would shift your chart? (Astrocartography)" → `astrocartography` skill
- **Compatibility** — "Want me to compare your chart with someone else's?" → `compatibility-synastry` skill
- **Human Design** — "Want the Human Design lens? Same birth data, different reading." → `human-design-reading` skill

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flow

User: "What does my birth chart say? I was born March 3, 1995 at 7:22 AM in Portland, Oregon."

1. `GET /location/autocomplete?query=Portland Oregon` → lat 45.5152, lon -122.6784
2. `POST /timezone/lookup` with `{latitude:45.5152,longitude:-122.6784}` → `"America/Los_Angeles"`
3. (Optional) Ask: "Use Placidus houses by default?" — proceed if no objection
4. `POST /ephemeris/natal-chart?format=llm` with full subject body
5. Lead with the Big Three, then nodes, then personal planets, then synthesis
6. Offer a follow-up (transits, solar return, or compatibility)
