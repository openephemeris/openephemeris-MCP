---
name: hd-life-cycles
description: Calculate and interpret Human Design maturation transits — Saturn Return, Uranus Opposition, Chiron Return, Jupiter Return, and Uranus Return. Use when someone asks about their HD life cycles, maturation points, midlife crisis transits, or the major developmental milestones of the Human Design system.
version: 1.0.0
updated: 2026-05-23
---

# Human Design Life Cycles

Use this skill when someone asks about their **HD life cycle events** — Saturn Return, Uranus Opposition (midlife), Chiron Return, Jupiter Return, or Uranus Return. These are the defining maturation moments where the Human Design system says consciousness matures through planetary cycles.

## The Five Key Life Cycle Transits

| Transit | Age | Orbital Period | Significance |
|---------|-----|---------------|--------------|
| **Jupiter Return** | ~12, 24, 36, 48… | 11.86 years | New 12-year cycle of faith, expansion, philosophy. Subtler than the others. |
| **Saturn Return** | ~29 and ~58 | 29.46 years | The HD maturation point — you become your design. Before: experiment. After: Authority becomes reliable. 2nd return = mastery. |
| **Uranus Opposition** | ~38–42 | 84 years (½ = 42) | Individuation crisis. Uranus opposes its natal position. Breaking free from what isn't you. In HD, where differentiation actualizes. |
| **Chiron Return** | ~49–51 | 50.76 years | Wounded Healer integration. The wound becomes the teaching. Shift from learning about the wound to actively healing others through it. |
| **Uranus Return** | ~84 | 84 years | Complete individuation cycle. Rare; the elder who has lived the entire Uranus arc. |

## Required Information

1. Full birth date
2. Birth time (precision matters — HD is time-sensitive)
3. Birth location
4. (Optional) Specific cycle(s) of interest, or current age — so you know which to lead with

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

## Compute

The HD cycle endpoints take `birth_datetime_utc` directly. Convert local birth time to UTC yourself using the IANA timezone from Standard Procedure Step 2.

### Planetary Return (Saturn, Jupiter, Chiron, etc.)

```
POST /human-design/cycles/return
```

Body:
```json
{
  "birth_datetime_utc": "1995-03-03T15:22:00Z",
  "latitude": 45.5152,
  "longitude": -122.6784,
  "planet": "saturn",
  "return_year": 2024
}
```

Supports: `sun`, `moon`, `mercury`, `venus`, `mars`, `jupiter`, `saturn`, `uranus`, `neptune`, `pluto`, `chiron`.

### Planetary Opposition

```
POST /human-design/cycles/opposition
```

Body:
```json
{
  "birth_datetime_utc": "1983-06-15T09:00:00Z",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "planet": "uranus",
  "target_year": 2025
}
```

Returns the full HD bodygraph at the moment the planet opposes its natal longitude (180°).

### Solar Return (annual HD)

```
POST /human-design/cycles/solar-return
```

The birthday-year chart through the HD lens — useful as a yearly companion reading.

## Interpretation

### Jupiter Return (~12, 24, 36, 48, 60…)

A new 12-year cycle of meaning. Subtler than Saturn. The themes are faith, optimism, philosophy, and expansion in whichever life area Jupiter sits.

- **Age 12**: First adult faith; what you start believing in
- **Age 24**: Worldview begins to crystallize
- **Age 36**: Often the "second adolescence" — new direction of faith
- **Age 48**: Wisdom, teaching impulses, faith refined by Saturn
- **Age 60+**: Patriarch/matriarch role

### Saturn Return (~29 and ~58)

**Before the Saturn Return** (ages 0–28): In HD, this is the "experiment." Conditioning runs the show. Decisions come from the Not-Self (frustration, bitterness, anger, or disappointment). This is correct — the experiment must happen for awareness to develop.

**The Saturn Return itself** (~29): Everything that isn't you starts falling apart. Conditioning-based relationships end. Mind-chosen careers feel hollow. This is a *correction*, not a crisis. Inner Authority becomes genuinely available. Strategy stops being theoretical.

**After the Saturn Return**: You can trust your Authority. The experiment is over. You begin to live your Design rather than rehearse it.

**Second Saturn Return** (~58): Mastery. You've lived a full Saturn cycle in alignment. The role shifts — from doing to teaching, from building to mentoring.

### Uranus Opposition (~38–42)

The classic midlife crisis, reframed: Uranus breaks apart structures that don't serve your unique individuality. The more Not-Self you've lived, the more dramatic the period.

**What to expect:**
- Sudden impulses to quit, leave, start over
- Relationships tested against authenticity
- Career realignment — should-do vs. lights-you-up
- Physical restlessness, urge for freedom

**HD reading:** If you've followed Strategy and Authority since the Saturn Return, this period is *exciting* rather than destructive. If you haven't, it's a more forceful correction. The G center's sense of direction often gets re-routed here.

### Chiron Return (~49–51)

The deepest and most personal of these transits. Chiron's natal placement (sign, house, gate) reveals the core wound — where you've always felt different, broken, insufficient.

**The Return**: You stop running from the wound. You realize *the wound is the teaching*. People who've gone through heartbreak become the best relationship counselors. Those who struggled with identity become guides for others finding themselves.

**HD specifics:** Look at which gate Chiron activates in the bodygraph.
- **In a defined channel** — the wound is consistent and expressed outward
- **As a hanging gate** — electromagnetic; attracts people who complete the channel and trigger the healing/wounding dynamic
- **Conjunct Sun or Earth (Personality or Design)** — the wound is central to identity, integrated into the incarnation cross

### Uranus Return (~84)

Rarely discussed because few people live to experience it fully. Completion of the entire individuation cycle. The elder has lived through every Uranus phase — first quarter square (~21), opposition (~42), third quarter square (~63), and finally the return.

## Reading Order

1. **Identify current age** and lead with the most immediately relevant transit:
   - Under 30: Lead with the upcoming Saturn Return
   - 30–38: Recently-completed Saturn Return + upcoming Uranus Opposition
   - 38–48: Uranus Opposition is the headline
   - 48–58: Chiron Return + approaching 2nd Saturn Return
   - 58+: 2nd Saturn Return integration, Jupiter cycle wisdom
2. **Include retrograde windows** — outer planets retrograde annually, so the transit may cross the exact degree 3 times (direct → retrograde → direct). Frame as a period, not a moment.
3. **Connect to their HD chart** — relate each transit to Type, Strategy, Authority, and the specific gate the planet activates at the return moment.
4. **Frame as stages, not events** — "Your Saturn Return runs from [date] to [date], with exact passes on [dates]."
5. **Never predict doom.** These are maturation processes, invitations for alignment.

## Accuracy Note

Chiron calculations use Keplerian orbital propagation (not full INPOP/CALCEPH ephemeris data). Accuracy is ±0.5–1° over a 50-year span — about ±1–2 weeks for the exact return date. Plenty of precision for life-cycle work where the active window spans months.

## Cost

| Calculation | Endpoint | Credits |
|------------|----------|---------|
| Planetary Return | `/human-design/cycles/return` | 2 |
| Opposition | `/human-design/cycles/opposition` | 2 |
| Solar Return | `/human-design/cycles/solar-return` | 2 |

A full life-cycle reading (Saturn Return + Uranus Opposition + Chiron Return + Jupiter cycles) typically costs 8–12 credits.

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flow

User: "I'm turning 41 next month — what HD life cycle am I in? Born March 3, 1983 at 9:14 AM in Chicago."

1. Standard Procedure → lat 41.8781, lon -87.6298, tz "America/Chicago" → UTC `1983-03-03T15:14:00Z`
2. Recognize the headline transit at age 41 → Uranus Opposition
3. `POST /human-design/cycles/opposition` with `planet: "uranus"`, `target_year: 2024`
4. Lead with the Uranus Opposition meaning and the user's specific gate activation
5. Note: "Saturn Return was around 2012–2013 — what shifted then is now being tested by Uranus"
6. Mention the upcoming Chiron Return at ~age 50
7. Frame as a stage, name the exact-pass dates, connect to their HD Type/Authority/Strategy
