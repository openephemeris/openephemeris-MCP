---
name: openephemeris-api-reference
description: Complete endpoint reference for the 121 OpenEphemeris API endpoints. Use when you need to find the exact endpoint, parameter, or path for an astronomical or astrological computation, or when other skills haven't covered the calculation a user is asking for.
version: 1.0.0
updated: 2026-05-23
---

# OpenEphemeris API Reference

Quick reference for all 121 endpoints across 19 groups. Every endpoint works via:

- **MCP `dev.call`** with `method` + `path` (for allowlisted endpoints — see `dev.list_allowed`)
- **Direct REST** to `https://api.openephemeris.com` with header `X-Meridian-API-Key: oe_...`

Always pass `format=llm` (query param or body field) unless raw JSON is requested — reduces tokens ~73%.

## Standard Procedure Reminder

For ANY chart endpoint that takes birth data:
1. `GET /location/autocomplete?query=<city>` → lat/lon
2. `POST /timezone/lookup` with `{latitude, longitude}` → IANA timezone string
3. Build `birth_location` with **latitude, longitude, AND timezone** — all three required
4. Build `birth_datetime` with `iso` field as local civil time (the engine handles UTC conversion)
5. Call the chart endpoint

## ACG / Astrocartography (16)

| Method | Path | Tier | Description |
|--------|------|------|-------------|
| POST | `/acg/power-lines` | Dev | Planet AC/MC/DC/IC lines globally |
| POST | `/acg/hits` | Dev | Lines near a target city |
| POST | `/acg/crossings` | Scale | Where two lines intersect |
| POST | `/acg/parans` | Dev | Latitude bands where two planets are simultaneously angular |
| POST | `/acg/midpoints` | Scale | Planetary midpoint lines |
| POST | `/acg/declination-lines` | Scale | Parallels of declination |
| POST | `/acg/aspects` | Scale | Where natal planets aspect local angles |
| POST | `/acg/local-space` | Dev | Azimuthal directions from a reference city |
| POST | `/acg/hermetic-lines` | Dev | Hermetic Lots projected as lines |
| POST | `/acg/relational-parans` | Scale | Parans for two-person synastry |
| POST | `/acg/ccg` | Scale | Cyclocartography time-series |
| POST | `/acg/ccg/parans` | Scale | Transit parans |
| POST | `/acg/heatmap/composite` | Service | Composite heatmap |
| POST | `/acg/features` | Service | Combined ACG feature collection |
| GET | `/acg/datasets` | Free | Available ACG datasets |
| GET | `/acg/meta` | Free | ACG engine metadata |

## Calendar (3)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/calendar/astrology/cross-quarter` | Wheel of the Year astronomical cross-quarter dates |
| GET | `/calendar/astrology/lunar-standstill` | 18.6-year nodal cycle status |
| GET | `/calendar/astrology/moon-phases` | 8-phase lunar classification |

## Catalogs (3)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/catalogs/bodies` | Supported natal bodies |
| GET | `/catalogs/fixed-stars` | Fixed-star catalog (paginated) |
| GET | `/catalogs/fixed-stars/groups` | Fixed-star group identifiers |

## Chinese Astrology (8)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/chinese/zodiac` | Year animal + element |
| POST | `/chinese/bazi` | Four Pillars of Destiny |
| POST | `/chinese/bazi/element-balance` | Wu Xing balance + Useful God |
| POST | `/chinese/bazi/ten-gods` | Ten Gods analysis |
| POST | `/chinese/bazi/luck-pillars` | Da Yun 10-year luck cycles |
| POST | `/chinese/bazi/annual-pillar` | Current-year Liu Nian |
| POST | `/chinese/bazi/solar-terms` | 24 solar terms for a year |
| POST | `/chinese/bazi/compatibility` | BaZi compatibility between two |

## Comparative / Synastry (5)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/comparative/synastry` | Two-person synastry |
| POST | `/comparative/composite` | Composite chart |
| POST | `/comparative/composite/midpoint` | Davison-style midpoint composite |
| POST | `/comparative/natal-transits` | Transits to a natal chart |
| POST | `/comparative/overlay` | Bi-wheel overlay visualization |

## Eclipse (5)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/eclipse/next-visible` | Next eclipse visible from a location |
| GET | `/eclipse/solar/global` | Global solar eclipse circumstances |
| GET | `/eclipse/solar/local` | Local solar eclipse circumstances |
| GET | `/eclipse/lunar/global` | Global lunar eclipse circumstances |
| GET | `/eclipse/besselian-elements` | Raw Besselian elements |

## Electional (4)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/electional/moment-analysis` | Full snapshot of the sky at a moment |
| GET | `/electional/aspect-search` | Search for specific aspects in a window |
| GET | `/electional/find-window` | Find an electional window matching criteria |
| GET | `/electional/station-tracker` | Upcoming planetary stations |

## Ephemeris (38)

### Charts
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ephemeris/natal-chart` | **Primary natal chart endpoint** |
| POST | `/ephemeris/natal/batch` | Batch natal calculations |
| POST | `/ephemeris/relocation` | Relocate chart to another city |
| POST | `/ephemeris/progressed` | Secondary, tertiary, solar arc progressions |
| POST | `/ephemeris/draconic` | Draconic chart (nodal axis as Aries) |
| POST | `/ephemeris/harmonics` | Harmonic chart analysis |
| POST | `/ephemeris/prenatal-lunation` | Pre-birth New or Full Moon |

### Granular calculations
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ephemeris/planet-position` | Single planet position |
| POST | `/ephemeris/angles-points` | Angles + points granular |
| POST | `/ephemeris/house-cusps` | House cusps |
| POST | `/ephemeris/aspect-check` | Aspects between two longitudes |
| POST | `/ephemeris/midpoints` | Midpoint tree |
| POST | `/ephemeris/dignities` | Essential dignities |
| POST | `/ephemeris/hermetic-lots` | Lot of Fortune, Spirit, etc. |
| POST | `/ephemeris/fixed-stars` | Fixed-star positions |
| POST | `/ephemeris/declinations` | Out-of-Bounds declination analysis |
| POST | `/ephemeris/antiscia` | Antiscia and contra-antiscia |
| POST | `/ephemeris/dispositor-tree` | Dispositor chain from placements |
| POST | `/ephemeris/retrograde-status` | Is planet retrograde now |

### Moon
| Method | Path | Description |
|--------|------|-------------|
| GET | `/ephemeris/moon/phase` | Phase, sign, illumination |
| GET | `/ephemeris/moon/aspects` | Current Moon aspects |
| GET | `/ephemeris/moon/ingresses` | Moon sign changes over a range |
| GET | `/ephemeris/moon/void-of-course` | VoC status |
| POST | `/ephemeris/lunar-phase` | Phase for a specific datetime |

### Venus star cycle
| Method | Path | Description |
|--------|------|-------------|
| POST | `/ephemeris/venus-star-points` | Venus star points |
| POST | `/ephemeris/venus-star-points/phase` | Phase + visibility |
| POST | `/ephemeris/venus-star-points/stations` | Venus stations |
| POST | `/ephemeris/venus-star-points/elongations` | Greatest elongations |
| POST | `/ephemeris/venus-star-points/eight-year-star` | 8-year star pattern |
| POST | `/ephemeris/venus-star-points/conjunctions` | Range-based conjunctions |

### Biodynamic (Agro)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/ephemeris/agro/daily` | Today's biodynamic profile |
| GET | `/ephemeris/agro/calendar` | Monthly biodynamic calendar |
| GET | `/ephemeris/agro/void-of-course` | Agricultural VoC |

### Metadata
| Method | Path | Description |
|--------|------|-------------|
| GET | `/ephemeris/house-systems` | Supported house systems |
| GET | `/ephemeris/supported-objects` | Supported celestial objects |
| GET | `/ephemeris/supported-metadata` | Supported metadata levels |
| GET | `/ephemeris/schemas/natal-request` | Natal request schema |
| GET | `/ephemeris/schemas/natal-response` | Natal response schema |

## Human Design (7)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/human-design/chart` | Bodygraph (type, strategy, authority, profile) |
| POST | `/human-design/transit` | Today's design weather |
| POST | `/human-design/composite` | Two-person HD |
| POST | `/human-design/penta` | 2–5 person group |
| POST | `/human-design/cycles/return` | Planetary return chart |
| POST | `/human-design/cycles/solar-return` | Solar return chart |
| POST | `/human-design/cycles/opposition` | Opposition chart |

## Location & Timezone (4)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/location/autocomplete` | City → lat/lon |
| GET | `/location/reverse` | lat/lon → city (NOTE: param is `lng`, not `lon`) |
| POST | `/timezone/lookup` | lat/lon → IANA timezone |
| POST | `/timezone/offset` | UTC offset at a datetime+coord |

## Predictive (11)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/predictive/transits/search` | Search transit events |
| POST | `/predictive/transit-chart` | Transit chart snapshot |
| POST | `/predictive/transits/planet-to-degree` | Transit to a specific degree |
| POST | `/predictive/transits/sign-ingresses` | Sign-change ingresses |
| POST | `/predictive/returns` | Generic planetary return |
| POST | `/predictive/returns/solar` | Solar return |
| POST | `/predictive/returns/lunar` | Lunar return |
| POST | `/predictive/primary-directions` | Primary directions |
| POST | `/predictive/time-lords/profections` | Annual profections |
| POST | `/predictive/time-lords/firdaria` | Firdaria periods |
| POST | `/predictive/time-lords/zodiacal-releasing` | Zodiacal releasing |

## Time (6)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/time/sidereal` | Local Apparent Sidereal Time + GMST |
| GET | `/time/delta-t` | Delta T (TT-UT1) |
| GET | `/time/equation-of-time` | Equation of time |
| GET | `/time/solar-event` | Sunrise / sunset / transit |
| POST | `/time/julian-day` | Calendar → Julian Day |
| POST | `/time/scales` | Time-scale conversions |

## Tidal (2)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tidal/forcing` | Astronomical tidal forcing |
| GET | `/tidal/forcing/deep-time` | Deep-time tidal forcing (currently 410 Gone — DE441 deferred) |

## Vedic (1)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/vedic/chart` | Sidereal natal chart (ayanamsa configurable) |

## Visualization (3)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/visualization/chart-wheel` | Chart wheel SVG/PNG |
| POST | `/visualization/bi-wheel` | Bi-wheel SVG/PNG |
| POST | `/visualization/bodygraph` | Human Design bodygraph SVG/PNG |

## Meta / Health (4)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/health/detailed` | Detailed health check |
| GET | `/meta/openapi.json` | Full OpenAPI spec |
| GET | `/meta/version` | API version |

## Pricing Note

Most endpoints cost 1–5 credits. Heavy compounds (full natal with all options, ACG hits across many cities, transit search across a 12-month window) can cost 10–30+. Tell the user before running anything expensive.

## Tier Gating Reminder

| Tier | Access |
|------|--------|
| **Explorer** (free) | Core ephemeris, moon, transits, geocoding |
| **Pro** ($29) | Predictive, comparative, visualization, electional, charts |
| **Startup** ($79) | Batch computation |
| **Scale** ($199) | ACG aspects/midpoints/crossings/declinations, relational ACG |
| **Enterprise** | Custom |
| **Service** (internal) | Heatmaps, combined `/acg/features` |

A `403 Forbidden` from any endpoint means it's tier-gated — suggest the user upgrade at openephemeris.com/pay.
