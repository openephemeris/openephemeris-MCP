---
name: timing-electional
description: Find optimal timing for activities, analyze current transits, identify the best moment for an event, or describe the current astrological weather. Use when someone asks "when should I…?", "what transits are happening?", "what's the moon doing?", or anything about election, electional astrology, eclipses, retrogrades, or moon phases.
version: 1.0.0
updated: 2026-05-23
---

# Timing & Electional Astrology

Use this skill for three families of question:
1. **Right-now snapshot** — "what's happening astrologically today?"
2. **Personal transits** — "what's hitting my chart over the next 3 months?"
3. **Electional** — "what's the best time to launch / sign / wed / move?"

> Always pass `format=llm` unless raw JSON is requested.

## 1. Current Conditions ("What's the astrological weather?")

```
GET /ephemeris/moon/phase?datetime=<now ISO>&format=llm
```

Report phase, sign, degree, illumination. Then if useful:

- `GET /ephemeris/moon/void-of-course?format=llm` — Is the Moon void-of-course right now?
- `GET /electional/moment-analysis?format=llm` — Full snapshot of the sky
- `POST /predictive/transits/sign-ingresses` — Upcoming sign changes for the major planets

**Void-of-Course Moon** — when the Moon makes no more major aspects before leaving its current sign. Traditional reading: don't start anything new, sign contracts, or make major purchases. VoC is excellent for routine work, rest, meditation, creative play without attachment to outcome.

### Moon Phase Quick Reference

| Phase | Sun-Moon angle | Energy | Best for |
|-------|---------------|--------|----------|
| New Moon | 0° | Seed, intention | Set intentions, plan |
| Waxing Crescent | 45° | Emerging | Take first steps |
| First Quarter | 90° | Crisis in action | Decide, push through |
| Waxing Gibbous | 135° | Refining | Adjust, prepare |
| Full Moon | 180° | Illumination | Harvest, confront |
| Disseminating | 225° | Sharing | Teach, distribute |
| Last Quarter | 270° | Release | Let go, re-evaluate |
| Balsamic | 315° | Surrender | Rest, dream, clear |

### Moon Sign for Daily Timing

| Sign | Best for | Avoid starting |
|------|----------|---------------|
| Aries | Quick action, courage, sports | Plans needing patience |
| Taurus | Finances, garden, cooking, beauty | Changes requiring flexibility |
| Gemini | Writing, email, networking | Deep emotional conversations |
| Cancer | Home, family, self-care | Anything where vulnerability is weakness |
| Leo | Performance, romance, celebration | Humble work, ego-sacrifice |
| Virgo | Organizing, health, editing | Big-picture brainstorming |
| Libra | Partnership, design, negotiation | Solo decisions, confrontation |
| Scorpio | Research, intimacy, therapy | Light socializing |
| Sagittarius | Travel, education, publishing | Detail work |
| Capricorn | Business, career moves | Creative play |
| Aquarius | Tech, community, reform | Traditional events |
| Pisces | Meditation, art, healing | Hard negotiations, contracts |

## 2. Personal Transits

When someone asks "what transits are hitting me?", you need their natal data.

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

Then call:

```
POST /predictive/transits/search?format=llm
```

with body containing the subject (per Standard Procedure), a `start` date (today), an `end` date (default 3 months out), and the planets/aspects of interest. Inner planets for day-to-day; outer planets (Saturn → Pluto) for life themes.

### Transit Depth by Planet

**Saturn (~2.5 yr/sign)** — tests what's real. Whatever lacks foundation cracks.
- Conjunction = restructuring; old way ends, new architecture begins
- Square = pressure to act before the structure collapses
- Opposition = others confront what you've built
- **Saturn return (~29–30, ~58–60)** = the most important transit in human life
- Saturn stations within 1° of a natal planet are the crux of the transit

**Pluto (~12–30 yr/sign)** — destroys to rebuild. Generational rite of passage.
- Conjunction = total transformation; death and rebirth of the natal planet's domain
- Square = power struggles; what you try to control controls you until surrender
- Opposition = shadow projection breaks down
- Pluto conjunct Sun can span 1–3 years

**Uranus (~7 yr/sign)** — liberates through disruption.
- Conjunction = sudden awakening; breakthrough or breakdown
- **Opposition (~42)** = classic midlife transit

**Neptune (~14 yr/sign)** — dissolves boundaries.
- Conjunction = identity softens, spiritual opening; risk of confusion/escapism
- Square = ideals collide with reality; wisdom through disillusionment

**Jupiter (~1 yr/sign)** — expands what it touches.
- Often overrated — opens doors but doesn't guarantee you walk through
- **Jupiter return (~12, 24, 36…)** = new 12-year cycle of faith and direction

### Progressed Chart

For inner timing nuance:

```
POST /ephemeris/progressed?format=llm
```

- Progressed Sun changes sign every ~30 years — major personality evolution
- Progressed Moon cycles all 12 signs every ~27.5 years — emotional seasons
- Progressed Moon through 4th = nesting; through 10th = career peak

### Returns

For year-ahead or month-ahead readings:

```
POST /predictive/returns/solar?format=llm   # birthday-to-birthday year
POST /predictive/returns/lunar?format=llm   # monthly emotional theme
```

## 3. Electional — "When should I…?"

When the user wants the best moment for a specific event in a date window:

```
GET /electional/moment-analysis?date=<candidate>&latitude=<lat>&longitude=<lon>&format=llm
```

Or, for a search over a date range, use `POST /electional/aspect-search` with the desired aspect criteria and window.

### Electional Heuristics

Look for moments that have:

1. **Strong Moon** — Moon waxing (after New, before Full), in a sign aligned with the activity, NOT void-of-course, not within ~3° of the Sun (combust), not afflicted by hard aspects from Mars/Saturn.
2. **Benefic angularity** — Jupiter or Venus on an angle (1st, 4th, 7th, 10th house cusp) at the chosen location.
3. **Avoid:**
   - Mercury retrograde for contracts, communication, tech, signing, travel
   - Venus retrograde for marriage, beauty work, jewelry, major purchases
   - Mars retrograde for war/conflict initiation, surgery, sharp tools
   - Eclipse season (±2 weeks from a solar/lunar eclipse) for new beginnings
   - Saturn afflicting the Moon
4. **Day & hour ruler alignment** — traditional electional uses planetary days (Sunday = Sun, Monday = Moon…) and planetary hours; match the day's ruler to the activity's nature.

### Common Elections

| Activity | Favor | Avoid |
|----------|-------|-------|
| Wedding | Venus strong, Moon waxing in fixed/cardinal, 7th house benefics | Venus Rx, Moon VoC, Saturn on Descendant |
| Business launch | Sun strong, Mercury direct, Jupiter angular | Mercury Rx, Moon VoC, eclipse window |
| Surgery | Moon waxing or new (healing), avoid Mars on the body part's sign | Mars Rx, Moon in the sign ruling the body part being operated on |
| Sign contract | Mercury direct, Moon applying to benefic | Mercury Rx, Moon VoC, Saturn on Ascendant |
| Move/Relocate | Strong 4th house, Moon in fixed sign for permanence | 4th house afflicted, Moon in mutable for stays you want to last |
| Plant garden | Moon waxing in earth/water sign, fruitful sign | Moon waning, barren signs (Leo, Virgo, Sagittarius, Aquarius) |

## 4. Eclipses

```
GET /eclipse/next-visible?lat=<lat>&lon=<lon>&type=solar    # or lunar, or omit
```

Eclipses are intensifiers, not schedule items. Frame as: "Eclipses don't happen *for* you on a timetable — they happen *to* you. Pay attention to what opens or closes around them and avoid forcing outcomes within ±2 weeks of one."

Also useful:
- `GET /eclipse/solar/global` / `/eclipse/lunar/global` — global eclipse data
- `GET /eclipse/besselian-elements` — technical Besselian elements for a specific eclipse

## 5. Retrograde Awareness

```
GET /electional/station-tracker?format=llm
```

Returns upcoming stations (planet pivot points). The station itself is often more potent than the entire retrograde.

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flows

**"What's the moon doing today?"**
→ `GET /ephemeris/moon/phase?datetime=<now>&format=llm`
→ Check VoC, report phase + sign + illumination + best activities.

**"What transits am I dealing with?"**
→ Run full Standard Procedure (geocode → tz → subject)
→ `POST /predictive/transits/search?format=llm` with 3-month window
→ Lead with the tightest outer-planet transits, then inner-planet color.

**"When should I sign this contract this week?"**
→ Ask for the date window + their location
→ Loop `GET /electional/moment-analysis` for candidate slots
→ Filter by Mercury direct, Moon not VoC, no hard Mars/Saturn to Mercury
→ Recommend 2–3 specific time windows with reasoning
