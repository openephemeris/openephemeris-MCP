---
name: human-design-reading
description: Generate and interpret Human Design bodygraph charts including type, strategy, authority, profile, incarnation cross, defined and undefined centers, gates, and channels. Use when someone asks about their Human Design, HD type, strategy and authority, or any Human Design concept.
version: 1.0.0
updated: 2026-05-23
---

# Human Design Reading

Use this skill whenever a user asks about their Human Design — their type, strategy, authority, profile, incarnation cross, centers, channels, or gates.

> **Time sensitivity:** Human Design is *extremely* sensitive to birth time. Type, authority, and profile can flip with 5–10 minutes. If the user is uncertain by more than ~20 minutes, flag that the reading is provisional and suggest professional rectification.

## Required Information

1. **Full birth date**
2. **Birth time** (to the minute if possible; flag any uncertainty)
3. **Birth location**

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

The Human Design endpoint takes `birth_datetime_utc` directly. Do **not** convert local→UTC by hand or with generic timezone math — before 1970, US DST was state and local law and standard timezone databases are silently wrong for many places. Resolve the instant with the API: `POST /timezone/offset` with `datetime_local`, the IANA `timezone`, and the birth `lat`/`lon` returns `resolved_utc` (historically correct, with a `tz_confidence` grade) — use that as `birth_datetime_utc`. (The MCP `human_design_chart` tool does this resolution automatically when you pass a local datetime + timezone + coordinates.)

```
POST /human-design/chart
```

Body:
```json
{
  "birth_datetime_utc": "1990-04-15T19:30:00Z",
  "latitude": 41.8781,
  "longitude": -87.6298,
  "include_chiron": false,
  "include_lilith": false
}
```

For composite (relationship), penta (group of 2–5), or transit ("today's design weather"):

- `POST /human-design/composite` — two-person HD
- `POST /human-design/penta` — 2–5 person group
- `POST /human-design/transit` — current planetary positions as a bodygraph

## How to Read a Bodygraph

Deliver in this order:

### 1. Energy Type (lead with this)

The single most important piece. There are 5 types:

| Type | % of population | Energy | Strategy |
|------|----------------|--------|----------|
| **Generator** | ~37% | Sustainable life-force, sacral motor | Respond (wait for something to respond to before acting) |
| **Manifesting Generator** | ~33% | Sacral + manifesting capacity | Respond, then inform before acting |
| **Projector** | ~20% | Non-energy, penetrating awareness | Wait for invitation/recognition |
| **Manifestor** | ~9% | Initiator, can act without waiting | Inform before acting |
| **Reflector** | ~1% | Lunar, mirrors the community | Wait a full lunar cycle (~28 days) before major decisions |

State the type clearly and explain its strategy in one sentence.

### 2. Strategy & Authority

**Strategy** is HOW the type moves through life. **Authority** is HOW they make decisions correctly. Different combinations require different inner navigation.

Common authorities:

| Authority | How it works |
|-----------|--------------|
| **Emotional (Solar Plexus)** | Wait out the emotional wave — clarity comes over time, not in the moment. "Sleep on it." |
| **Sacral** | Generators only. Listen for the gut "uh-huh" (yes) or "uhn-uhn" (no) sound/feeling. |
| **Splenic** | The quiet, in-the-moment intuitive hit. Spoken once, never repeated by the body. |
| **Ego (Heart)** | Manifestors with defined Heart — what does the will want? |
| **Self-Projected (G Center)** | Talk it out aloud — clarity emerges through your own speaking. |
| **Mental (Outer)** | Projectors only — clarity comes through being in the right environment and discussing with the right people. |
| **Lunar** | Reflectors only — wait one full lunar cycle for any major decision. |

Be specific to the user's authority. Don't generalize.

### 3. Profile

The two-number profile (e.g. 1/3, 5/1, 6/2) describes the conscious and unconscious life themes.

The six lines:
- **1 — Investigator** — needs foundation, deep study
- **2 — Hermit** — natural talent, needs to be called out
- **3 — Martyr** — learns by trial and error
- **4 — Opportunist** — works through network and friendship
- **5 — Heretic** — universal solutions, projection field
- **6 — Role Model** — three life phases (chaos, retreat, wisdom)

Lead with the conscious line (first number — sun position in personality), follow with unconscious (second number — sun position in design).

Common profiles:
- **1/3** — Investigator-Martyr — research + trial-and-error
- **2/4** — Hermit-Opportunist — natural talent shared with friends
- **3/5** — Martyr-Heretic — experimentation as universal teaching
- **4/6** — Opportunist-Role Model — friendships shape eventual wisdom
- **5/1** — Heretic-Investigator — deep solutions for collective
- **6/2** — Role Model-Hermit — lived experience as natural authority

### 4. Defined Centers (consistent energy)

The nine centers, with defined = colored:

| Center | Defined = consistent | Undefined = open & amplifying |
|--------|----------------------|------------------------------|
| **Head** | Pressure to think specific thoughts | Inspired by others' inspirations; "is this even my question?" |
| **Ajna** | Consistent way of thinking | Open mind, takes in many perspectives |
| **Throat** | Defined way of expressing | Searches for being heard; speak when invited |
| **G (identity)** | Fixed sense of self and direction | Identity shifts with environment and company |
| **Heart / Ego** | Reliable willpower | Tries to prove worth; promises that exhaust |
| **Sacral** | Generator life-force | Not built for sustained work; needs rest |
| **Spleen** | Consistent intuition, immune | Holds onto unhealthy situations longer |
| **Solar Plexus** | Emotional waves (Emotional authority) | Amplifies others' feelings; needs distance |
| **Root** | Consistent pressure to act | Rushes to relieve pressure; needs to slow down |

For each undefined center, note BOTH the wisdom potential (amplification, learning) AND the conditioning risk (the "Not-Self" voice that emerges from that openness).

### 5. Channels & Gates

A **channel** is a fully-defined line between two centers (both gates on each end activated). Channels are the signature "themes" of a person — far more important than individual gates.

The 64 gates correspond to the I Ching hexagrams. Each gate has a specific theme. Highlight 3–5 of the user's most prominent gates (those that are part of defined channels, or unusual conscious vs unconscious patterns).

### 6. Incarnation Cross

The cross of four gates (Sun and Earth in Personality + Design) describes the life purpose. There are 192 possible crosses. Name the cross (e.g. "Right Angle Cross of the Vessel of Love") and explain its broad theme.

### 7. Variables (advanced — only if asked)

The four arrows around the bodygraph head/feet describe:
- **Determination** — how to eat
- **Environment** — where to be
- **Cognition** — how to perceive
- **Perspective** — how to see the world

These are PHS (Primary Health System) variables. Mention only if the user is past the basics.

## The "Not-Self" Theme

Each type has a Not-Self signature — the emotional state that says you're out of alignment:

- **Generator** Not-Self = **Frustration** → over-initiating instead of responding
- **Manifesting Generator** Not-Self = **Frustration + Anger** → skipping the respond step
- **Projector** Not-Self = **Bitterness** → trying to initiate, going un-recognized
- **Manifestor** Not-Self = **Anger** → not informing before acting
- **Reflector** Not-Self = **Disappointment** → rushing major decisions

Mention this — it's how the user can self-diagnose alignment.

## Synthesis

Close with: "Your design says you're here to [strategy verb] when life invites [strategy condition], trust your [authority] for decisions, and the deep theme of your life is [incarnation cross / profile combination]. When you're out of alignment you'll feel [not-self theme]; when you're in alignment you'll feel [signature: satisfaction / success / peace / surprise]."

The signature for each type:
- Generator / MG = **Satisfaction**
- Projector = **Success** (recognition)
- Manifestor = **Peace**
- Reflector = **Surprise**

## How to Frame Astrological Readings

- **Symbolic, not deterministic.** Astrology maps patterns and tendencies; it does not predict fixed outcomes. Every placement has light and shadow expressions, and conscious effort changes how a chart plays out.
- **Not a substitute for professional advice.** Astrology is not medical, legal, financial, or psychotherapeutic guidance. If a user is in crisis or asking about real medical / legal / financial decisions, recommend they see a qualified professional in that field.
- **Honor the whole chart.** No single placement defines a person. Synthesize across signs, houses, aspects, and dignities before offering interpretation.
- **Be specific, not generic.** Cite the actual placement and explain its meaning in context, rather than reciting trait lists.
- **Be balanced.** Don't flatter or doom-cast. Hard aspects are growth-producing; soft aspects can become laziness.
- **Stay curious.** If a user pushes back on a reading, that pushback is data — chart interpretations are dialogues, not verdicts.

## Example Flow

User: "What's my Human Design? Born March 3, 1995 at 7:22 AM in Portland, Oregon."

1. Standard Procedure → lat 45.5152, lon -122.6784, tz "America/Los_Angeles"
2. Convert 1995-03-03T07:22:00 in `America/Los_Angeles` → UTC `1995-03-03T15:22:00Z` (PST, UTC-8)
3. `POST /human-design/chart` with `birth_datetime_utc: "1995-03-03T15:22:00Z"`, lat, lon
4. Lead with type and strategy
5. Explain authority specifically
6. Walk through profile
7. Cover 2–3 most striking defined centers and 2–3 most striking undefined centers
8. Name the incarnation cross
9. Close with signature/not-self synthesis
