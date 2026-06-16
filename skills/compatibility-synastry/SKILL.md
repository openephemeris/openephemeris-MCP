---
name: compatibility-synastry
description: Analyze relationship compatibility between two people using synastry, composite, and Davison/midpoint charts. Use when someone asks about romantic compatibility, relationship dynamics, friendship chemistry, business partnership fit, or how two people's charts interact.
version: 1.0.0
updated: 2026-05-23
---

# Compatibility & Synastry

Use this skill whenever someone asks how two people work together — romantically, in friendship, or in partnership. Three complementary tools:

| Tool | Question it answers |
|------|--------------------|
| **Synastry** | "How do our energies interact?" (each person's planets aspecting the other's) |
| **Composite** | "What is the relationship itself like?" (a third chart for the bond) |
| **Davison / Midpoint** | "What's the time-space midpoint of our two charts?" (an alternative composite based on real averaged ephemeris time + location) |

## Required Information

Two complete subjects — for EACH person:

1. Full birth date
2. Birth time (precision matters; flag if missing)
3. Birth location

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

Run Steps 1–3 of the Standard Procedure **for both people independently** — geocode and timezone lookup are per-person.

## Compute

### Synastry

```
POST /comparative/synastry?format=llm
```

Body:
```json
{
  "subject_a": { "name": "...", "birth_datetime": {...}, "birth_location": {...} },
  "subject_b": { "name": "...", "birth_datetime": {...}, "birth_location": {...} },
  "configuration": { "house_system": "placidus" }
}
```

### Composite

```
POST /comparative/composite?format=llm
```

(same two-subject body shape)

### Midpoint Composite (Davison-style)

```
POST /comparative/composite/midpoint?format=llm
```

### Bi-wheel Overlay (for visual)

```
POST /comparative/overlay?format=llm
```

— wheel rendering of one chart overlaid on the other.

## How to Read Synastry

Walk through these in order, leading with the most impactful.

### 1. Sun / Moon / Rising Cross-Aspects

The "Big Three to Big Three" check:

- **Sun ↔ Moon** (either direction) — classic emotional-conscious compatibility. Conjunction, trine, sextile = warmth. Square, opposition = creative friction.
- **Sun ↔ Rising** — the way one shows up validates the other's identity.
- **Moon ↔ Moon** — emotional rhythm alignment. Same element = native fluency. Opposite element = attraction through difference.
- **Sun in 7th of the other** — magnetic, "destined partner" feeling.
- **Moon in 4th of the other** — feels like home.

### 2. Venus / Mars

The romantic / sexual / desire layer:

- **Venus ↔ Mars** = chemistry. Cross-conjunctions are textbook attraction.
- **Venus ↔ Venus** = shared aesthetic, love language fit.
- **Mars ↔ Mars** = how you fight and how you move through the world together.

### 3. Mercury

Communication style and friendship layer:

- **Mercury ↔ Mercury** — conversational rhythm. Same element = effortless. Different element = constant interpretation.
- **Mercury ↔ Sun / Moon** — your mind validates their identity/feelings.

### 4. The Outer Planets (Heavy Aspects)

These create the deepest binds — and the deepest difficulties:

- **Saturn aspects** — durability, lessons, sometimes coldness. Saturn ↔ Venus/Moon needs maturity to thrive.
- **Pluto aspects** — power dynamics, transformation, obsession. Pluto ↔ Venus/Moon is the classic intense bond.
- **Uranus aspects** — excitement, unpredictability, on-off patterns.
- **Neptune aspects** — idealization, romance, but also projection and illusion.

### 5. Nodes

- **One person's planet conjunct the other's North Node** — soul-pull, "we have work together"
- **South Node connections** — past-life sense, comfortable but can stagnate

### 6. House Overlays

Where each person's planets fall in the OTHER's houses tells you what life areas activate between you:

- Person A's Sun in Person B's 10th = Person A energizes B's career
- Person A's Moon in Person B's 4th = Person A activates B's home/emotions
- Heavy stacking in B's 5th = romance/creativity emphasis
- Heavy stacking in B's 12th = deep, sometimes hidden, often unspoken

## How to Read the Composite Chart

The composite is the relationship-as-a-being. Read it like a natal chart, but every placement describes the relationship, not either person:

- **Composite Sun** — what the relationship is *for*; its life purpose
- **Composite Moon** — the relationship's emotional climate
- **Composite Ascendant** — how the relationship presents to the world
- **Composite Venus / Mars** — its romantic and sexual character
- **Composite Saturn** — what tests the bond
- **House emphasis** — where the relationship spends its energy

## Synthesis

After walking through the layers, give a short overall narrative:

- **Dominant theme** — Is this a soulmate-feeling Sun/Moon-heavy bond? A passion-driven Mars/Venus bond? A purposeful Saturn/Pluto destiny bond? A creative Jupiter/Uranus bond?
- **Where you'll grow each other** — Hard aspects and difficult overlays.
- **Where it'll feel easy** — Soft aspects and supportive overlays.
- **The risk** — Every relationship has one. Name it gently. (Saturn-heavy = duty over joy. Pluto-heavy = power struggles. Neptune-heavy = idealization.)

## Honest Framing

- **Never predict outcomes.** Say "this dynamic tends to create…" not "this relationship will…"
- **Compatibility is a starting condition, not a destiny.** Two people with rough synastry can build something beautiful with awareness; two with easy synastry can let it go stale.
- **Both charts must be willing.** A reading is for what's there to work with, not a forecast.
- **For unknown birth times** — synastry without houses is still meaningful (planet-to-planet aspects work fine), but the house overlays are unreliable. Disclose.

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flow

User: "Are my partner and I compatible? I'm March 3, 1995, 7:22 AM Portland Oregon. They're July 12, 1988, around 3 PM in Brooklyn NY."

1. Standard Procedure for Person A → lat/lon/tz/UTC for Portland on 1995-03-03
2. Standard Procedure for Person B → lat/lon/tz/UTC for Brooklyn on 1988-07-12
3. (Note Person B's "around 3 PM" — flag that rising/houses may be approximate)
4. `POST /comparative/synastry?format=llm` with both subjects
5. Lead with Sun/Moon cross-aspects; cover Venus/Mars; note any heavy outer-planet aspects; describe house overlays
6. Optionally run `POST /comparative/composite?format=llm` for the relationship-as-entity reading
7. Synthesize with honest, balanced framing
