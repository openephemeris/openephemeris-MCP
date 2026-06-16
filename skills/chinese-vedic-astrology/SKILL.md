---
name: chinese-vedic-astrology
description: Calculate and interpret Chinese BaZi Four Pillars / Chinese zodiac and Vedic Jyotish charts including nakshatras, dashas, yogas, and ayanamsa selection. Use when someone asks about Eastern astrology systems, their Chinese zodiac animal, BaZi, sidereal/Vedic chart, nakshatra, or dasha.
version: 1.0.0
updated: 2026-05-23
---

# Chinese & Vedic Astrology

Two distinct Eastern systems. Don't conflate them — Chinese astrology is based on the lunisolar calendar and Five Elements; Vedic is sidereal and tied to the Nakshatra (lunar mansion) system.

## When to Use Which

| Question | System |
|----------|--------|
| "What's my Chinese zodiac animal?" | Chinese (basic) |
| "What's my BaZi / Four Pillars / Eight Characters?" | Chinese BaZi |
| "Element balance / lucky element?" | Chinese BaZi |
| "What's my Vedic chart / Jyotish?" | Vedic |
| "What's my nakshatra / lunar mansion?" | Vedic |
| "What dasha am I in?" | Vedic |
| "Tropical vs sidereal — what's the difference for me?" | Vedic |

## Required Information

For both:
1. Full birth date
2. Birth time (for BaZi, hour pillar requires this; for Vedic, all houses + nakshatra are time-sensitive)
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

---

## Chinese Astrology

### Chinese Zodiac (Surface)

Just animal + element from year of birth:

```
POST /chinese/zodiac
```

Returns the year animal (12-year cycle) and element (5-element cycle = 60-year zodiac).

12 animals: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig
5 elements: Wood, Fire, Earth, Metal, Water

### BaZi — Four Pillars of Destiny

The deep Chinese system. Four pillars: Year, Month, Day, Hour. Each pillar has a Heavenly Stem + Earthly Branch (a stem-branch pair). The Day Master (the Stem of the Day Pillar) is the user's core self.

```
POST /chinese/bazi
```

Body:
```json
{
  "year": 1990,
  "month": 4,
  "day": 15,
  "hour": 14
}
```

> BaZi uses **solar terms**, not the standard Gregorian calendar. The calculation handles this automatically. The hour is the **local solar hour** at the birth location — pass the local clock hour, the engine corrects.

### How to Read BaZi

1. **Day Master** — the user's identity. State the stem (e.g. "Yang Wood Jia"). This anchors everything.
2. **Element Balance** — which elements are strong/weak/missing. Call:
   ```
   POST /chinese/bazi/element-balance
   ```
   The user's **Useful God** (favorable element) and **Restrictive God** (unfavorable) emerge from this.
3. **Ten Gods** — the 10 archetypal relationships between Day Master and other pillars (Friend, Rival, Output, Wealth, Authority, Resource, etc.):
   ```
   POST /chinese/bazi/ten-gods
   ```
4. **Luck Pillars (Da Yun)** — 10-year life cycles, each with its own stem-branch:
   ```
   POST /chinese/bazi/luck-pillars
   ```
5. **Annual Pillar** — current-year influence:
   ```
   POST /chinese/bazi/annual-pillar
   ```
6. **Compatibility** — between two BaZi charts:
   ```
   POST /chinese/bazi/compatibility
   ```

### Interpretation Order

- Lead with Day Master and what it means (e.g. "Yang Wood Jia is the great tree — rooted, principled, slow but steady growth").
- Then element balance: "Your chart is strong in Fire and weak in Water — your Useful God is Water, meaning Water-element environments, careers, and people support you."
- Walk through Year/Month/Day/Hour pillar themes (ancestry / parents+youth / self+spouse / children+later life).
- Note the current Luck Pillar — the 10-year backdrop.
- Mention 2–3 of the strongest Ten Gods relationships.

---

## Vedic Astrology (Jyotish)

### Ayanamsa — Ask First

Vedic charts use the **sidereal** zodiac (fixed-star reference) rather than tropical (seasonal). The offset between tropical and sidereal is called the **ayanamsa**. Different schools use different ayanamsas — they shift sign and nakshatra boundaries by minutes to a full degree, which matters for the Moon's nakshatra.

Before computing, ask:

> "Which ayanamsa would you like? **Lahiri** is the modern standard (used by the Indian Government Ephemeris). Other options: **Raman** (B.V. Raman school), **Krishnamurti** (KP system), or **Fagan-Bradley** (Western sidereal)."

Default to Lahiri if the user has no preference.

### Compute

```
POST /vedic/chart?format=llm
```

Body:
```json
{
  "datetime_utc": "1990-04-15T19:30:00Z",
  "latitude": 41.8781,
  "longitude": -87.6298,
  "ayanamsa": "lahiri"
}
```

> Vedic chart uses `datetime_utc` directly — convert local birth time → UTC using the IANA timezone from the Standard Procedure.

### How to Read a Vedic Chart

Walk through in order:

#### 1. Lagna (Ascendant) & Lagna Lord

The rising sign at birth — the most important point in Vedic astrology. The Lagna Lord (the planet ruling the rising sign) and its placement determines life direction.

#### 2. The Moon and Nakshatra

The Moon's nakshatra (one of 27 lunar mansions) is read MORE than the Sun in Vedic. State:
- Moon sign (Rasi)
- Moon nakshatra (one of 27, e.g. Rohini, Ashwini, Magha)
- Pada (which of 4 quarters of the nakshatra)

The nakshatra ruler and its placement deeply colors the personality.

#### 3. The Nine Grahas (Planets)

Note: Vedic uses 9 grahas — the 7 visible planets plus Rahu (North Node) and Ketu (South Node). It does NOT use Uranus, Neptune, Pluto (some modern Vedic astrologers do; default is the classical 9).

For each graha, note: sign, house from Lagna, nakshatra placement, dignity (exalted, debilitated, own sign, friend's sign, enemy's sign), retrograde status.

#### 4. Mahadasha (Major Period)

The Vimshottari dasha system divides life into 9 planetary periods. Each is 6–20 years. State:
- Current Mahadasha (e.g. "Saturn Mahadasha, 19 years total, you're 7 years in")
- Current Antardasha (sub-period within Mahadasha)
- What this period emphasizes

#### 5. Yogas (Planetary Combinations)

Special combinations that confer specific outcomes. Famous ones:
- **Raja Yogas** — kingly combinations (success, status)
- **Dhana Yogas** — wealth combinations
- **Gajakesari Yoga** — Jupiter-Moon in mutual kendras (good fortune, knowledge)
- **Neecha Bhanga Raja Yoga** — debilitation cancellation (rags to riches)

Highlight any prominent yogas in the chart.

#### 6. Divisional Charts (Vargas)

If asked for depth, mention:
- **D-9 / Navamsa** — marriage, spiritual path, true potential of each planet
- **D-10 / Dasamsa** — career
- **D-7 / Saptamsa** — children
- **D-12 / Dwadasamsa** — parents

### Tropical vs Sidereal — the Common Question

Users often ask why their Vedic Sun sign differs from their Western Sun sign. Explain:

> "Western astrology uses the **tropical** zodiac, locked to the seasons (Aries always starts at the spring equinox). Vedic uses the **sidereal** zodiac, locked to the actual fixed stars. The two have drifted apart by ~24° over 2000 years. Your Vedic Sun is one sign earlier than your Western Sun roughly 75% of the time. Neither is 'right' — they're two different reference frames asking different questions."

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flows

**"What's my BaZi?"**
1. Standard Procedure (mainly for the local hour — geocoding still useful for solar time correction at extreme longitudes)
2. `POST /chinese/bazi` with year/month/day/local-hour
3. `POST /chinese/bazi/element-balance` for the Useful God
4. Lead with Day Master + Useful God; walk pillars

**"What's my nakshatra?"**
1. Ask preferred ayanamsa (default Lahiri)
2. Standard Procedure → UTC
3. `POST /vedic/chart` with `ayanamsa: "lahiri"`
4. Lead with Moon nakshatra + pada, then Lagna, then current Mahadasha
