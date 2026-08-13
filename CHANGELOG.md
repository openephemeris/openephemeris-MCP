# Changelog

All notable changes to `@openephemeris/mcp-server` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Version numbering follows [Semantic Versioning](https://semver.org/).

---

## [4.12.0] — 2026-08-13

### Fixed
- **Server `instructions` told the model a tool needed no arguments when it
  did.** The zero-data-entry-point line named `ephemeris_retrograde_status` as
  needing no arguments; its schema has `required: ["datetime"]`. An agent
  that took the line literally made a zero-argument call and got a validation
  error as its first experience of the server. Now names
  `explore_moon_phase` and `electional_moment_analysis` — both genuinely
  zero-argument — and both are asserted against the real tool schemas in CI
  so this cannot silently drift again.

### Added
- **Connector first-run activation telemetry.** `mcp_tools_listed` (both
  transports, once per session) and `mcp_session_silent` (HTTP, on teardown
  when tools were listed but never called) close the gap where "connected but
  never used it" was only an absence of events — indistinguishable from a
  session that died mid-handshake. Funnel: `mcp_session_init` →
  `mcp_tools_listed` → `first_tool_call`.

### Changed
- **Server `instructions` deduplicated** into `src/instructions.ts`, shared by
  both transports. They were previously copy-pasted verbatim into each
  transport file, which is how the argument-count claim above drifted from
  the schemas undetected.

---

## [4.11.2] — 2026-08-13

### Fixed
- **Location resolver rejected `"City, Country"` as ambiguous.** The
  ambiguity qualifier matched a region name, a US state abbreviation, or a
  two-letter ISO country *code* — but never a country *name*. So
  `location: "Paris, France"` lost the qualification check against its US
  namesakes and threw, while the far rarer `"Paris, fr"` resolved fine.
  Live, `"Paris, France"` matches 8 same-named places and `"London, UK"`
  matches 6, so the most natural phrasing for a foreign birthplace failed
  outright. Country names now qualify via `Intl.DisplayNames` (the runtime's
  own code→name table, so there is no list to maintain), plus colloquial
  aliases Intl doesn't emit (`uk` → GB). Completes the class of fix started
  for US state abbreviations in 4.11.1.

### Changed
- **Location resolver errors now carry a stable `code`.** `mcp_tool_error`
  telemetry records no message and no stack, so every resolver rejection
  arrived as `code: "none"` / `error_kind: "local"` — indistinguishable from
  a genuine server-side crash. Throws now carry `location_ambiguous`,
  `location_not_found`, `location_missing_coordinates`, `location_empty`, or
  `coords_partial` on the property the event already ships. The codes are
  constants; no user input is added to telemetry.

---

## [4.11.1] — 2026-08-12

### Fixed
- **Location resolver didn't recognize US state abbreviations.**
  `location: "San Francisco, CA"` was rejected as ambiguous while the
  equivalent `"San Francisco, California"` resolved fine — the API returns
  the full state name in `region`, and the ambiguity qualifier only matched
  full-name substrings or ISO country-code tokens. Added a USPS abbreviation
  lookup (50 states + DC + territories) so `"City, ST"` qualifies the same
  as `"City, State Name"`.
- **`bazi_recalculate` double-charged for theme-only re-renders.** Its only
  caller is the BaZi app's automatic host-theme reconciliation — never a
  birth-data change — but it billed the full 3 credits as if it were a fresh
  chart, on top of the identical charge already paid via `explore_bazi_chart`
  moments earlier. Theme-only reconcile now skips the 2-credit visual-render
  reservation.
- **Datetime tool descriptions could invite a silent 1-hour-off chart.**
  Extended the shared datetime contract instructions to explicitly tell
  callers to pass local wall-clock time + IANA `timezone` rather than
  converting to UTC themselves — a calling model's own conversion mistake
  (e.g. treating July San Francisco as PST instead of PDT) previously sailed
  through with zero server-side errors and a confidently wrong chart.

## [4.11.0] — 2026-08-07

### Fixed
- **`explore_natal_chart` never drew aspect lines.** `buildNatalBody()` didn't
  set `options.include_aspects`, so the API returned an empty aspects array
  for the single-wheel chart (the bi-wheel was unaffected — it computes
  cross-aspects client-side).
- **HD synastry connection panel showed only one person's data, unlabeled.**
  `explore_human_design_connection` computed both people's type/profile/
  authority/definition/incarnation-cross but only used Person B's to feed the
  connection-channel classifier, then discarded it. The bodygraph panel now
  shows both, labeled "Person A"/"Person B" to match the overlay legend.
- **Inconsistent planet/sign glyph weight** (Sun/Moon bold, Venus/Mars thin)
  in the natal and bi-wheel apps. A bare `font-family: "serif"` resolves
  per-glyph on Windows — Times New Roman covers ☉/☽ but not ♀/♂, so those
  silently fell back to a different, thinner font. Pinned an explicit
  astrological symbol-font stack everywhere these glyphs render.

### Changed
- **Welcome popup → on-demand info button.** All 7 MCP apps (chart-wheel,
  bi-wheel, bodygraph, moon-phase, transit-timeline, vedic-chart, bazi) no
  longer auto-pop a modal on every load/reload — a small "i" button opens the
  same guide on demand.
- **House ring now reads with visible depth.** The band between the zodiac
  ring and the center previously matched the background exactly; it now uses
  a step-up `--surface` shade on both the natal and bi-wheel apps.

## [4.10.0] — 2026-08-05

### Fixed
- **BaZi tools never forwarded `timezone` to the API.** `parseBaziArgs` used it
  only to read a zoned `datetime` back into local calendar components, then
  dropped it — every BaZi request from MCP (`chinese_bazi`, `bazi_ten_gods`,
  `bazi_element_balance`, `bazi_luck_pillars`, `bazi_chart`,
  `explore_bazi_chart`, `bazi_compatibility`) landed on the API with no zone,
  which resolves the year/month solar-term boundary (Li Chun, the Jié) against
  the naive local clock instead of the true birth instant — exactly the defect
  [#532](https://github.com/openephemeris/openephemeris/pull/532) fixes at the
  API. A birth within roughly the birthplace's UTC offset of a boundary could
  land on the wrong side and get the wrong year or month pillar. `timezone` is
  now forwarded on every BaZi tool.

### Added
- **BaZi convention parameters.** `minute`, `year_boundary`
  (`lichun`/`cny`), `day_boundary` (`zi_hour`/`midnight`), `true_solar_time`,
  and `latitude`/`longitude` are now request parameters on every BaZi tool
  that accepts them at the API — `bazi_compatibility` takes them per chart
  (`chart_a_*`/`chart_b_*`), since partners are often born under different
  conventions or in different timezones.

## [4.9.0] — 2026-08-03

### Fixed
- **`location_search` gave pre-1970 birthplaces the wrong UTC offset.** With a
  `date` before 1970 it answered from local tzdata alone — and tzdata models
  only a zone's *reference city* before 1970, which is exactly the error the
  API's historical correction overlay exists to remove. Dallas on 1952-07-15
  came back `-05:00` (Chicago observed daylight time that summer; Texas did
  not) instead of the correct `-06:00`. Because this tool is the documented
  one-call alternative to `timezone_resolve`, an agent that took the top match
  and built a zone-suffixed datetime from it produced a chart an hour off with
  nothing downstream able to detect it. The top match is now corrected through
  the API (1 extra credit, pre-1970 only); remaining matches keep their tzdata
  estimate and stay labelled `historical_estimate`. Post-1970 is unchanged and
  still free.

### Added
- **Historical-correction provenance now reaches MCP consumers.**
  `timezone_resolve` and `location_search` forwarded only `tzRuleSource` out of
  the five fields the API publishes. They now also return `tzOverlayVersion`,
  `tzOverlayHash`, `tzRuleCitation` and `serverVersion`. The first two are the
  change signal — without them a consumer cannot tell that the correction
  dataset moved underneath charts it already computed. `tzRuleCitation` carries
  the actual primary source behind a correction (a statute reference, an agency
  order, a dated almanac page), so a corrected time can show its work instead of
  asking to be trusted. Keys are omitted rather than emitted as nulls when the
  API sends none.

## [4.8.1] — 2026-08-02

### Fixed
- Every tool now declares all four MCP annotation hints explicitly
  (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`).
  Notably `dev_write_api` is `destructiveHint: false` — every allowlisted
  write is stateless chart computation — so strict clients no longer gate it
  behind a confirmation, and `openWorldHint` is uniformly `false` (the server
  reaches only the fixed OpenEphemeris API).
- `account_usage` reports a real authentication failure as a tool error
  (`isError: true`) instead of a success-shaped message.

## [4.8.0] — 2026-08-02

### Added
- **Toolsets by tradition.** Tool definitions are re-sent to the model on every
  message, so callers who work in one tradition can now advertise just that
  tradition instead of the general-purpose default: `OPENEPHEMERIS_TOOLS=hd`
  (stdio) or `?profile=hd,bazi` (hosted). Eight toolsets — `astrology`, `moon`,
  `hd`, `bazi`, `vedic`, `acg`, `electional`, `venus` — each including
  geocoding, account usage, and the API escape hatch. A Human Design session
  drops from ~19,100 to ~7,800 advertised tokens (−59%); Vedic to ~3,400
  (−82%). `astrology,moon` matches the default's tool count at ~1,700 fewer
  tokens while covering the long tail (dignities, midpoints, hermetic lots,
  fixed stars, composites) the curated set omits. As with `core`/`full`, this
  filters `tools/list` only — every tool stays callable by name. Also exposed
  as the `toolSurface` option in the Smithery config.

### Fixed
- `explore_human_design` now states its real credit cost: 4 where the bodygraph
  renders (2 chart + 2 visual), 2 in text-only hosts — it previously claimed a
  flat 2. `ephemeris_moon_phase` (2, not 1) and `ephemeris_next_lunar_phase`
  (1–2 per occurrence) corrected the same way.
- `explore_bi_wheel` in synastry mode now requires Person 2's coordinates (or a
  resolvable `person2_location`) instead of silently casting Person 2's chart
  for 0°N 0°E.
- Chart-wheel widget escapes birth parameters before rendering them into the
  info chips.
- OAuth token endpoint binds authorization codes to their `redirect_uri` and
  `client_id`; both checks were previously skippable by omitting the parameter.

---

## [4.7.0] — 2026-08-02

Historically correct birth-time conversion. IANA timezone databases — including
the one inside every JavaScript runtime — are only authoritative from 1970.
Before the US Uniform Time Act took effect in 1967, daylight saving was state
and municipal law, and a zone like `America/Chicago` models Chicago alone. A
1961 Minnesota birth converted with standard timezone math lands an hour off,
which flips the Ascendant sign and the Human Design design-Moon gate.

### Added

- **Pre-1970 births now resolve through the API's historical correction
  overlay.** Any tool given a naive local birth time with a timezone and
  coordinates — natal, Human Design (chart, composite, penta, cycles, groups),
  Vedic, BaZi apps, ACG, moon tools, and the embedded chart apps — routes the
  local→UTC conversion through the API's `/timezone/offset` `datetime_local`
  mode, which applies primary-source-cited state and local law (with a
  `tz_confidence` grade and rule citation) instead of assuming the reference
  city's rules. Post-1970 conversions stay on the local, zero-latency path,
  which is exactly as authoritative as the server. If the server is
  unreachable, tools fall back to the previous local conversion rather than
  failing the chart call.
- **`timezone_resolve`** consults the same historical path for pre-1970 dates
  and reports `tzConfidence`, `tzRuleSource`, and `datetimeStatus` (ambiguous
  DST-fold and nonexistent-gap times are called out explicitly).
- **`location_search`** tags each suggestion's historical offset with a
  confidence grade and a note when a pre-1970 date may be affected by
  state/local law divergence.

### Fixed

- Three skills and one prompt still instructed the model to convert local
  birth times to UTC itself with generic timezone math — the exact manual
  conversion the historical overlay exists to prevent. They now direct all
  conversion through the API.

---

## [4.6.0] — 2026-07-30

Fixes the tool that could not answer the question it is named for, closes the
last two places a chart was silently computed at 0°N 0°E, and stops two tools
discarding a timezone the caller supplied. The first three come from a 75-run
behavioural eval (25 prompts × 3, fresh context each) run against 4.4.0; the
last from the directory-submission readiness review.

### Fixed

- **`ephemeris_next_eclipse` can now find the next eclipse.** Without a
  location it routed to `/eclipse/solar/global` or `/eclipse/lunar/global`,
  which classify whatever eclipse is occurring *at* a given instant rather
  than searching forward from one. The consequences compounded: `after_date`
  was documented as optional and defaulting to today, but the backend
  rejected the call without it; an ordinary date returned *"no solar eclipse
  occurs at the requested date"*; and `eclipse_type: 'any'` was accepted and
  ignored. Asking *"when is the next solar eclipse"* was unanswerable.

  It now calls a new `/eclipse/next` endpoint that genuinely searches forward
  from `after_date` (defaulting to now), honours `any` by returning whichever
  of solar/lunar comes first, and needs no arguments beyond the type. Server
  side in [`openephemeris#473`](https://github.com/openephemeris/openephemeris/pull/473).

  Worth stating plainly, because it is the reason this is the lede: a broken
  tool did not surface an error to the end user. Across three runs of the
  same prompt the model answered from its own memory twice — once correctly,
  once naming an eclipse in the wrong year — and disagreed with itself. Only
  one run in three reported that the tool had failed.

- **`explore_human_design_transit` and `explore_human_design_connection` no
  longer silently compute at 0°N 0°E.** 4.4.0 fixed this for
  `explore_human_design` and wired `location` into four chart tools; these
  two were missed. `explore_human_design_transit` accepted a `location` that
  was display-only — its own description conceded the chart would be cast on
  the Gulf of Guinea — and `explore_human_design_connection` had no location
  field at all for either person. Both now resolve a place name through the
  same lookup `location_search` uses, and reject the call outright when
  neither coordinates nor a resolvable location is supplied.

- **`ephemeris_natal_batch` and `explore_transit_timeline` no longer discard a
  supplied timezone.** Both declared a timezone parameter and then built the
  request body without it, so a naive local birth time plus an IANA zone — the
  remedy the server's own error message recommends — was rejected by the
  datetime contract. `ephemeris_natal_batch` failed this way for *every*
  subject in a batch, and its documented example was the failing shape;
  `explore_transit_timeline` never read `natal_timezone` at all. Both now route
  the value through the same canonical helper the rest of the surface uses, so
  the zone reaches the wire.

### Changed

- **Two server-side fixes change what these tools return** (no MCP change
  required, listed because the output differs):
  `ephemeris_natal_chart` with `format: 'llm'` now distinguishes the mean and
  true lunar nodes — both previously carried the id `north_node`, so a
  consumer keying by id silently dropped one and the `aspects` indices
  inherited the ambiguity ([`#475`](https://github.com/openephemeris/openephemeris/pull/475)).
  And `server_version` in calculation metadata is now derived from the
  deployed image reference rather than Fly's per-machine version counter, so
  every instance serving a given release reports the same value; a separate
  `instance_id` carries per-machine attribution
  ([`#474`](https://github.com/openephemeris/openephemeris/pull/474)).

---

## [4.5.0] — 2026-07-30

Adds a tool for the question the astrocartography tools could not answer:
*when* a planet reaches an angle at a place, rather than what is angular
there at a fixed moment.

### Added

- **`electional_angle_crossings` — find when a body crosses the Ascendant,
  Descendant, Midheaven, or Imum Coeli at a location.** The time-inverse of
  astrocartography. `acg_hits` answers "which lines pass near Warsaw at this
  moment"; this answers "at what moment does Mercury cross the Descendant
  over Warsaw". Give it a latitude/longitude and a date range and it returns
  the crossing moments chronologically, with each body's position and a
  daylight hint at that instant.

  Crossing times are solved on the same in-mundo (equatorial RA/Dec) geometry
  the astrocartography line engine draws, so casting a map at a returned
  moment puts that line through the query point — the search and the map
  cannot disagree.

  Defaults to the classical seven bodies and all four angles over the current
  UTC day. Circumpolar cases — a body that never rises or never sets at that
  latitude — simply return no event rather than an error. Ranges up to 366
  days; an over-long range is rejected rather than quietly shortened.

  Advertised in the default tool surface. 5 credits per call, Developer plan
  and above.

## [4.4.0] — 2026-07-30

Puts the location resolver on the natural path for the four `explore_*`
chart tools, and corrects two parameter descriptions that had drifted from
the code.

### Added

- **`location` on `explore_natal_chart`, `explore_human_design`,
  `explore_vedic_chart`, and `explore_bi_wheel` now resolves internally.**
  Supply a plain place name — `location: "Portland, ME"` — and the tool
  fills in the coordinates and (unless overridden) the timezone via the
  same `/location/autocomplete` lookup `location_search` uses. Supplied
  `latitude`/`longitude` always win. Ambiguous names (e.g. bare
  `"portland"`) throw with a disambiguation hint rather than silently
  picking the top hit — the same behaviour `location_search` reports as
  `ambiguous: true`.
  A prior smoke run measured `location_search` adoption at **1 in 8** when
  it was documented but off the natural path; every request supplied
  coordinates from model memory instead. Wiring `location` into the chart
  tools themselves makes the resolver the minimum-effort call.

### Fixed

- **`explore_human_design` no longer silently computes at 0°N 0°E.**
  When neither `latitude`/`longitude` nor a resolvable `location` is
  supplied, the call is now rejected with a clear message. Previously a
  bare `datetime` produced a plausible-looking bodygraph anchored on the
  Gulf of Guinea — a location-sensitive system silently defaulting to a
  wrong location is the failure class the Phase-0 audits keep catching.
- **`include_fixed_stars` and `include_arabic_parts` descriptions on
  `ephemeris_natal_chart` no longer say "Reserved for future use".** Both
  parameters have always been wired to their respective configuration
  keys (`configuration.fixed_star_options.include: true` and
  `options.include_hermetic_lots: true`); only the descriptions were
  stale.

---

## [4.3.1] — 2026-07-29

Two rendering fixes surfaced by the Phase-0 v4.3 audit, plus a companion
server-side fix that unblocks the tool this release advertised.

### Fixed

- **`account_usage` no longer tells unlimited-plan customers they have "0 remaining".**
  A service-tier row reports `included_units = -1` (the sentinel for unlimited);
  the tool rendered it literally as *"Credits: 993 used of -1 included — 0 remaining
  (0% used)"* — three mutually contradictory statements about the same quota, and
  the "0 remaining" reading a paid customer as cut off. Unlimited plans now render
  as *"Credits: 993 used · unlimited plan"* with no synthesized percentage.
  NEW-11 from the audit.
- **Companion:** `ephemeris_house_cusps` accepts the `timezone` companion the
  4.3.0 schema advertised. The Go server rejected the field at the JSON decode
  layer with *"unknown field provided in DateTimeInput"*, so an agent following
  OE's own naive-datetime error message hit a second error. Fixed server-side
  in [`openephemeris/openephemeris#466`](https://github.com/openephemeris/openephemeris/pull/466)
  (no MCP change) — the schema, generated struct, and handler were all correct;
  only the bespoke JSON decoder's allowlist was out of sync. NEW-10 from the
  audit.

### Added

- **`account_usage` now prints a `Server version` line.** External audits and
  eval runs could not previously attribute a score to a specific published
  build — the version is set in `serverInfo.version` on `initialize` but was
  not surfaced anywhere a human-readable tool response could echo. NEW-9 from
  the audit.

---

## [4.3.0] — 2026-07-29

The bodygraph iframes get the same view toggle across every mode (natal, transit,
connection), the datetime contract stops being repeated on every datetime tool,
and eleven tools stop lying about which zone the caller named.

### Added

- **Bodygraph mandala layout works on transit and connection overlay iframes.**
  The natal bodygraph iframe has had a graph ↔ mandala toggle since 3.19.0;
  the transit and connection overlays did not, because the overlay render path
  dropped `layout` on the floor. The mandala scene builder already delegates
  channel and center rendering to the same overlay-aware helpers the graph
  layout uses, so this was purely a matter of wiring: openapi
  `VisualRenderConfig` gains an optional `layout` (`graph` | `mandala`),
  `visualConfigFromRender` copies it through, `RenderBodygraphOverlayEmbed`
  applies the same mandala scaling the natal path already had, and both
  `explore_human_design_transit` and `explore_human_design_connection` accept
  a `layout` argument that forwards to `visual_config.layout`. The iframe's
  existing view-toggle button renders on overlay payloads too now, and
  reroutes via the `_refetch` metadata so the model never sees the switch.
  Overlay attributes (`data-connection-type`, `data-transit-new`, the overlay
  legend) survive the mandala switch — the mandala inherits the overlay-aware
  channel builder unchanged.

### Changed

- **The datetime contract paragraph moved off every tool description and into the
  server `instructions` field.** The 130-token contract text used to be sent on
  every datetime-accepting tool and re-sent on every model pass — ~40 sites'
  worth of pure repetition. It's now stated once, up front, in `instructions`
  (both stdio and HTTP transports), with each parameter description carrying a
  one-sentence rule + a pointer back. The 400 rejection still rewrites the
  caller's own value into each remedy, so a host that fails to propagate
  `instructions` learns the rule from the first violation. Core surface dropped
  from ~18.7k to ~17.2k tokens (−1.5k, 8%); full surface dropped from ~35.1k to
  ~29.9k (−5.2k, 15%). NEW-4 from the Phase-0 v4.1 audit.

### Fixed

- **`ephemeris_house_cusps` (and ten other DateTimeInput tools) lied about how the
  caller supplied the zone.** Calling with `datetime="1987-07-15T09:01:00"` +
  `timezone="America/Chicago"` came back with `datetime_zone: "UTC"` and
  `datetime_zone_source: "offset"` — because the tool converted the value to a
  Z-suffixed UTC string on the client before sending it, and the server (correctly)
  described what it received. `ephemeris_natal_chart` reported the same input as
  `America/Chicago` / `timezone`, so the two tools disagreed about the same fact,
  and the mislabelled `"UTC"` was the exact wrong value the naive-datetime contract
  was written to catch — a false alarm on a correct call.

  The 11 tools that take a `DateTimeInput` body field (`ephemeris_house_cusps`,
  `ephemeris_planet_position`, `ephemeris_dignities`, `ephemeris_retrograde_status`,
  `ephemeris_midpoints`, `ephemeris_fixed_stars`, `ephemeris_hermetic_lots`,
  `ephemeris_angles_points`, `ephemeris_solar_return`, `ephemeris_lunar_return`,
  `ephemeris_natal_transits`) now pass a naive datetime + IANA zone through as
  `{ iso, timezone: { iana_name } }` — the shape the Go handler already resolves
  correctly and stamps as `datetime_zone_source: "timezone"`. Endpoints whose body
  field is named `*_utc` (`vedic_chart`, Human Design, the ACG `epoch`) still
  pre-convert client-side, because their Go types are strict RFC 3339 `time.Time`
  and cannot accept a companion zone.

  Contract test asserts, for every fixed tool, that the wire body carries the naive
  datetime and the IANA name — not a synthesized Z-suffixed value — and the Go
  handler test proves all three input forms (`Z`, `±HH:MM`, naive + IANA) resolve
  to the same instant and each self-describes its provenance correctly.

---

## [4.2.0] — 2026-07-29

`ephemeris_next_lunar_phase` could not answer the question it exists to answer. The
tool's response shape changes with this fix, hence a minor rather than a patch.

### Fixed

- **`ephemeris_next_lunar_phase` returned zero results for every query.** "When is the
  next full moon?" answered `result_count: 0` with the note *"No matching phase found in
  window"* — an empty result that reads like a real one, so the answer came back as
  "there is no full moon in the next month". Four faults stacked up:

  - the tool sent `start_date`/`end_date`, but the calendar endpoint takes a single
    `date`, so the search window was silently ignored;
  - it looked for the phase array at `phases`/`data`/`events`, while the response nests
    it at `data.events`, so the list was always empty;
  - it matched phase names as `"full moon"` against the engine's `"full_moon"`, so
    nothing would have matched even once the list was found;
  - `last_quarter` had no match at all, because the engine names it `third_quarter`.

  The search now walks the calendar forward one lunation at a time, so `count` above 1
  works. An empty result is no longer reported as an answer: since every principal phase
  recurs about every 29.5 days, zero results is a fault and the tool now says so instead
  of handing back a plausible non-answer.

### Changed

- **`ephemeris_retrograde_status` now leads with the single-planet path.** The
  description opened on the all-planets sweep and mentioned `planet_id` last, so "is
  Mercury retrograde?" tended to take the 10-credit route instead of the 1-credit one.
  `planet_id` now carries the planet-id table and both costs are stated up front.
- **`ephemeris_next_lunar_phase` no longer claims to return the zodiac sign and degree.**
  It never did — it returns exact UTC datetimes. It now points at `ephemeris_moon_phase`
  for the sign, and states that cost scales with `count`.

---

## [4.1.0] — 2026-07-26

Follow-up to 4.0.0. The new `400` was telling REST callers to do something that, on
most endpoints, was impossible. It now isn't — the remedy it names is real everywhere.

### Added

- **`date_time.timezone` — every datetime in the API now accepts its own zone.** 4.0.0's
  rejection message offered two fixes: put an offset on the value, or "keep the local
  wall-clock time and pass the zone alongside it". The second one only worked on requests
  built around a `subject`, because the zone lived on `subject.birth_location.timezone`.
  Endpoints that take a bare `date_time` — `/ephemeris/angles-points`, `/ephemeris/house-cusps`,
  `/ephemeris/planet-position`, `/ephemeris/dignities`, `/ephemeris/midpoints`,
  `/ephemeris/retrograde-status`, `/ephemeris/fixed-stars`, `/ephemeris/hermetic-lots`
  and `/ephemeris/lunar-phase` — had nowhere to put a zone, so a caller following the
  error's own advice got the same `400` back. Nine endpoints, one impossible instruction.

  The zone now belongs to the datetime rather than to the request, so this works
  everywhere a datetime is accepted:

  ```json
  { "date_time": { "iso": "1987-07-15T09:01:00",
                   "timezone": { "iana_name": "America/Chicago" } } }
  ```

  Purely additive — an omitted `timezone` behaves exactly as before, and where a request
  already carries a zone (a subject's birth location) that remains the fallback. A zone
  already written on the string always wins, so a stray `timezone` can never move an
  instant that the caller had already pinned.

- **`docs/datetime-contract.md`** — one authoritative statement of the rule: when a zone
  is required, the date-only and `*_utc` carve-outs, how to pass a zone on each request
  shape, and what the response echoes. The reason four endpoint families drifted to four
  different readings of "ISO 8601 date-time" is that no such document existed.

### Fixed

- **The `400` no longer advertises a remedy the endpoint doesn't have.** Fields that are
  a bare datetime *string* rather than an object — the ACG `epoch` family, the Venus date
  ranges, the `datetime` query parameter on the `GET /ephemeris/moon/*` endpoints — have
  no `timezone` companion and cannot grow one. Their rejection message now names only the
  fix that exists: put the zone on the value. Being told to do something impossible is
  worse than a terse error.

- **The OpenAPI spec now states the contract where callers actually read it.** The
  `date_time` fields said "ISO 8601 date-time" and nothing more, so the only place the
  rule appeared was in the error you got for breaking it. The `iso`, `components` and
  `timezone` fields, the `epoch`/date-range string fields, and the spec's own
  "Supported Formats" section now all state it. That section had been listing a zone-less
  `"2000-01-01T12:00:00"` as an accepted input — the exact value the API rejects.

- **`/timezone/offset` documented behaviour it has never had.** Its `datetime_utc` field
  claimed a naive value was "interpreted as UTC". The field is a strict RFC 3339 instant,
  so a zone-less value was never interpreted at all — it failed to parse. Now documented
  as what it is.

- **The spec's front-page example used field names that do not exist** (`iso_string`,
  a `timezone.name`, and latitude/longitude directly under `subject`). Replaced with the
  real request shape.

- **Four tool modules were still teaching the pre-4.0.0 contract.** `chart_wheel` told the
  model to "include timezone offset **if known**"; `ephemeris_composite`,
  `ephemeris_composite_midpoint`, `ephemeris_overlay`, `ephemeris_natal_transits`, the
  electional search tools and `explore_bi_wheel` described their datetimes as plain
  "(ISO 8601)" with no zone requirement. 4.0.0 migrated the rest of the surface and missed
  these. They now use the same canonical description as every other tool, and the composite
  tools reject a zone-less datetime locally instead of spending a credit to learn it.

### Changed

- The tool-surface token ceilings are **unchanged** (core 20,000 / full 36,500). The
  descriptions above cost ~0.4k core / ~1.0k full and fit inside the existing budget;
  measured after the change, core is 18.7k and full is 34.8k.

---

## [4.0.0] — 2026-07-26

**Breaking.** A datetime that states a clock time without a zone is now rejected instead of silently assumed to be UTC. Callers who relied on the old behaviour were receiving charts computed for the wrong instant, so the break is the fix — but it is a break, and it is why this is a major version.

This release also carries everything from 3.26.0, which was written up but never published to npm (`latest` was 3.24.0). Nothing is lost; the 3.26.0 entry below is part of what ships here.

### Fixed

- **A birth time without a timezone was silently read as UTC, producing the wrong houses and angles.** This is the headline fix, and it is a correctness bug rather than a cosmetic one.

  Given `datetime='1987-07-15T09:01:00'` with Dallas coordinates — 9:01 AM local, which is 14:01 UTC in July — the API computed the chart for 09:01 **UTC**: five hours early. Every planet keeps its sign at that error scale, so the output passed casual inspection, while the Ascendant landed in Gemini instead of Leo (77.97° vs 143.12°), the Midheaven moved nearly three signs, and every house placement was wrong. In Human Design the same input returned profile 2/4 instead of 2/5 and a Design Sun on gate 42 line 4 instead of line 5.

  A datetime that states a clock time but not the zone that clock is in does not name a moment, so the server no longer guesses. It is now a `400` with an RFC 7807 `ambiguous_datetime` problem that names **both** fixes — put a `Z`/`±HH:MM` offset on the value, or pass the local time together with a `timezone`. Rejecting is the right default for a chart-correctness product: a loud failure costs one retry, a silent five-hour shift costs the whole reading.

  A date with no clock time (`'1987-07-15'`) is unaffected and still resolves to 12:00 UTC — there is nothing ambiguous about it, and every search-window parameter in the API depends on it.

- **Every tool that takes a datetime now takes a `timezone`.** Previously only four did (`ephemeris_natal_chart`, `ephemeris_chart_wheel`, `ephemeris_bi_wheel`, and the `explore_*` apps), which left callers of `ephemeris_synastry`, `ephemeris_relocation`, the return tools, the ACG tools, `ephemeris_angles_points`, `ephemeris_house_cusps` and the rest with **no correct way to express a local birth time at all**. There is now a test that fails if a tool gains a datetime parameter without one.

- **The Human Design tools documented `"Must include 'Z' or timezone offset"` and then silently appended a `Z` themselves.** Four separate copies of an `ensureTimezone` helper turned any zone-less value into a UTC assertion the caller never made — which is precisely what made the error invisible. `human_design_composite` and `human_design_penta` skipped even that and passed the naive string straight through. All of them now take a `timezone`, resolve it properly (including historical DST — 1987 Chicago is UTC-5, not UTC-6), and refuse to invent a zone.

- **The documentation taught the bug.** `ephemeris_natal_chart`'s example was `datetime='1990-04-15T14:30:00'` with Chicago coordinates, no offset and no timezone — copied verbatim by models reading it. `acg_power_lines`, `acg_hits` and `ephemeris_progressed_chart` each carried a naive example that directly contradicted their own parameter description warning against naive input. Every ISO example across the tool surface now states its zone, and a repo test fails the build if a new one appears.

- **BaZi charts depended on the server's own timezone.** `parseBaziArgs` did `new Date('1987-07-15T14:00:00')`, which JavaScript resolves in the *host process's* zone, then read `.getUTCHours()`. On any server not running in UTC this shifted the hour pillar, and near midnight the day pillar. Components are now read from the string itself. (BaZi pillars are built from local wall-clock time by definition, so a zone-less datetime is correct there — it was the reading that was wrong, not the input.)

- **`ephemeris_natal_transits` declared a `transit_timezone` parameter that the handler never read.** It is now applied.

- **`vedic_chart_recalculate` dropped the `timezone` that `explore_vedic_chart` accepts**, so re-rendering the same chart from the iframe interpreted the birth time as UTC and produced a different chart than the one on screen.

### Changed

- Responses now echo the instant they were actually computed for: `resolved_utc`, plus `datetime_zone_source` (`offset` / `timezone` / `date_only`) and the zone itself. When a chart looks wrong, the first question is which moment it was cast for, and the answer is now in the response.

---

## [3.26.0] — 2026-07-25

A leaner default tool list, and a sweep of documentation and billing corrections found while auditing it.

The server has grown to 91 registered tools, 69 of which were advertised to the model on every single connection. That is roughly 28,000 tokens of tool definitions consumed before the user has said anything, and a 69-item menu to choose from on questions that almost always want one of about a dozen tools. This release changes what gets *advertised* without changing what exists.

### Added

- **Tool surfaces — a focused default, with the full catalog one flag away.** `tools/list` now returns a curated core set (32 tools over HTTP, 35 over stdio) instead of everything: one interactive app per tradition, the primary data tool per domain, geocoding, account usage, and the allowlist-gated generic proxy. Measured tool-definition payload drops from ~27,800 to ~15,100 tokens.

  **No capability was removed.** This is a filter on `tools/list` alone — every tool remains registered and remains callable by name. If a client knows the tool it wants, it works whether or not it was listed. There is a regression test asserting exactly this, because a surface filter that quietly became a capability cut would be a very easy mistake to ship.

  Opt into the full catalog with `OPENEPHEMERIS_TOOLS=full` (stdio) or `?profile=full` / `X-OE-Tool-Surface: full` (remote HTTP). The surface is fixed at session initialize — this server does not advertise `tools.listChanged`, so switching means reconnecting. The public server card at `/.well-known/mcp/server-card.json` deliberately still lists everything: it is a registry catalog, not model context.

- **Usage reporting now covers the stdio transport, and identifies the connecting client.** Telemetry previously existed only on the remote HTTP server, so the entire npm install base — every Claude Desktop, Cursor and Windsurf user — was invisible. Both transports now emit the same three events with the same properties (`transport`, `surface`, `client_name`, `client_version`, `server_version`), so a single query can compare them. `client_name` comes from the MCP initialize handshake and is the only way to know which hosts this package actually runs in.

  **This is disclosed and opt-out-able**, because it runs on your machine: see [Telemetry](README.md#telemetry). Tool name, duration, error status, client name and a one-way hash of your API key are sent. Your key, birth data, coordinates, tool arguments and tool results never are. Disable with `OPENEPHEMERIS_TELEMETRY=0` or the cross-tool standard `DO_NOT_TRACK=1`; both are checked before anything is sent, and are covered by tests.

- **`location_search` and `timezone_resolve` are now visible to the model.** Both existed but were marked app-only, so the model could not call them — which is why prompts had to geocode through `dev_read_api /location/autocomplete` instead. Turning a birth city into coordinates and an IANA timezone is now a first-class two-step.

### Fixed

- **`ephemeris_planet_position` documented the wrong body for `planet_id=11`.** The description advertised `10=North Node, 11=South Node`. The API actually returns `10` = North Node (Mean) and `11` = North Node (**True**) — there is no South Node id at all. A request for a South Node returned the North Node with no error and no warning: a silently wrong answer, roughly 180° off. The description now documents the real ids and explains that the South Node is the North Node opposed (add 180°, mod 360).

- **Ten tools misstated their credit cost.** Costs are metered server-side on the URL path, so billing was always correct — but the descriptions the model reads were not, which meant plans and cost estimates built on them were wrong. Corrected: the BaZi analytical tools (`bazi_ten_gods`, `bazi_element_balance`, `bazi_luck_pillars`, `bazi_annual_pillar` — 1 → 3; `bazi_compatibility` — 2 → 3), the electional tools (`electional_moment_analysis` and `electional_aspect_search` — 2 → 5; `electional_station_tracker` — 3 → 5), and the Venus tools, which were **overstated** at 2 and actually cost 1. `ephemeris_retrograde_status` now discloses that its all-planets sweep fans out to ten backend calls and costs 10 credits, not 1.

- **`/chinese/bazi/chart` charged 4 credits while documenting 3.** The handler reserved base + visual render, but the route is mounted behind the usage-tracking middleware, which had already debited the base credit — so every BaZi chart render double-charged its base credit. The handler now reserves only the visual surcharge, matching the pattern already used by the `include_visual` wrapper. Actual cost is now 3, as documented.

- **Progressed chart recalculation in the chart-wheel app posted to `/predictive/progressed`, which does not exist.** The real path is `/ephemeris/progressed`; every progressed recalculate from the iframe was 404ing.

- **`ephemeris_lunar_return` and `ephemeris_planetary_return` declared an output schema promising an image** they can never return — neither tool sends `include_visual`. Both now declare the JSON-only schema they actually produce.

- **Tool-error telemetry could not distinguish a backend outage from a client-side argument error.** Errors thrown locally carry no HTTP status, so they were all recorded as `status: "unknown"` alongside genuine backend failures. Error events now carry `error_kind` (`backend` / `local`) and the error code.

- **WCAG AA contrast restored in the dark widget palette.** The 3.24.0 theme unification left five of the seven embedded apps — bodygraph, moon-phase, transit-timeline, vedic-chart and bazi — with muted and secondary text below the minimum contrast ratio. Those bundles ship inside this package (`dist/ui`), so anyone rendering the iframe apps saw it. The visual gate that should have caught it now audits **both** palettes per app and state; previously it only ever rendered one, which is how a whole-palette regression stayed green.

- **A release could not pass its own gate.** `npm publish` runs `verify:release` → `check:public`, which byte-compares the files mirrored to the public repo. Neither side pinned line endings, so a Windows checkout rewrote them to CRLF and the check reported permanent drift on files nobody had edited. Both repos now pin LF.

- **Stale references in the skill packs and plugin docs.** The setup and API-reference skills still described `dev.call` / `dev.list_allowed`, names retired in 3.15.0 (the tools are `dev_read_api`, `dev_write_api`, `dev_list_allowed`). The plugin skill listed `electional_ingress_calendar`, which is not a tool this server has ever registered. Endpoint counts corrected to 118.

### Notes

Registered tool count is unchanged at 91 — this release changes what is advertised, not what exists.

---

## [3.25.0] — 2026-07-22

New account-usage tool, remote-transport session-security hardening, plus text-encoding and telemetry fixes. Registered tool count: 90 → 91.

### Added
- **`account_usage`** — a free (0-credit) tool that answers "how many credits do I have left?" directly in chat: plan tier, billing period, credits used / included / remaining, percent of quota used, total API calls, and subscription status with renewal date, plus the right next step (wallet top-up or plan upgrade) for the user's tier. Accepts an optional `month` (YYYY-MM) to review past periods.

### Security
- **Sessions are now bound to the credential that created them.** Previously the resume path (`POST /mcp` with an `mcp-session-id`) accepted *any* syntactically valid API key or unexpired Bearer token — it never checked that the presented credential matched the one that initialized the session. A leaked or guessed session id combined with a *different* valid credential could attach to another user's session. Each session now stores a SHA-256 hash of a stable binding token (the raw API key, or the JWT `sub`/subject for OAuth so legitimate ~hourly token refresh still matches) and every resume must present a credential whose hash matches, compared in constant time. Mismatches get a `403 application/problem+json`.
- **The SSE stream leg (`GET /mcp`) now requires authentication.** It previously checked only the `mcp-session-id` header with no credential at all, so a leaked session id alone let an attacker attach to another user's server→client event stream. It now requires a credential (401 without one) and the same credential-binding match as resume (403 on mismatch).

### Fixed
- **Bodygraph gate/center text encoding repaired** — the Human Design bodygraph click-handler tools contained double-encoded UTF-8 (mojibake) in em-dashes, ranges, and status emoji across all 64 gate hexagram names and the center descriptions; they now render correctly.
- **Tool-error telemetry now records HTTP status** — the remote server's error events always reported "unknown" instead of the actual status (402 paywall / 429 rate-limit), making those uncountable in analytics.
- **`autoStartDeviceAuth` race (stdio device-auth):** concurrent first requests could each launch a device-auth flow (two codes, two poll loops) because the in-flight guard was only assigned after the async start resolved. The guard promise is now assigned synchronously before the first await.
- **Corrected a stale code comment** claiming HTTP 429 responses are retried — they are deliberately not (retrying a metered POST would double-charge; only idempotent GETs over 502/503/504 + transient transport codes retry).

## [3.24.0] — 2026-07-21

Mandala layout for the bodygraph iframe app — an in-iframe toggle between the classic graph and the concentric-rings mandala view, plus a metered house-ring opt-in.

### Added
- **Mandala layout toggle** in the Human Design Bodygraph Explorer — a power-user view alongside the default graph layout, reusing the existing theme-recalculate round-trip. The render cache now keys on layout × theme × houses, so toggling any axis back and forth never re-bills within a session. Requests an explicit hexagram-free ring set (the decorative hexagram ring cells no longer carry `data-gate` at all, fixing a hover mislabel and roughly halving the keyboard tab-stop count).
- **House rings — a distinct, explicitly metered opt-in** — a location-gated "Add house rings (+1 credit)" checkbox, off by default even when the mandala is on, disabled without a birth location or outside the mandala layout.

## [3.23.0] — 2026-07-19

Coverage build-out (4 → 7 live iframe apps), tool-data bug fixes from live probing, and Human Design trademark hygiene. Registered tool count: 84 → 90.

### Added
- **Three revived iframe apps** (all following current conventions — structuredContent, shared error/first-run/fullscreen chrome, theme reconciliation, harness + visual-check gated):
  - **`explore_transit_timeline`** — vertical timeline of upcoming transit hits grouped by month, with retrograde markers and clickable events.
  - **`explore_vedic_chart`** + `vedic_chart_recalculate` (app-only) — interactive Vedic (Jyotish) chart as a South Indian fixed-sign Rashi grid; Go renders the SVG server-side (`handler_vedic_visual.go`, now emitting `data-sign`/`data-lagna`/`data-planets` groups), iframe binds interactivity.
  - **`explore_bazi_chart`** + `bazi_recalculate` (app-only) — BaZi Four Pillars grid from the Go visual renderer, with element coloring, Wu Xing balance bar, and click-to-explain pillars.
- **Moon-phase app grew up**: date control (`moon_phase_recalculate`, app-only), fullscreen toggle, and first-run coaching — it is no longer frozen on "now".
- **Copy-positions button** on the chart-wheel planet table (Markdown to clipboard, graceful fallback when the host denies clipboard access).
- **Credit-cost hints** on the iframe Recalculate controls, and per-theme SVG caching in the bodygraph so light↔dark host toggles no longer re-bill on every flip.
- **Go: Pholus rides a real kernel** — `pholus.bsp` fetched at build time (mirrors the Chiron pattern), boot self-test vs JPL Horizons truth, `BootFatal` in prod on mismatch. No body is served from silent Keplerian fallback.

### Fixed
- **`ephemeris_natal_chart` now returns its promised aspect grid** (the tool omitted the endpoint's opt-in `include_aspects`).
- **`format=llm` `summary_lines` house annotations repaired** — a union-type formatting bug printed raw JSON bytes (`H{[56]}`) instead of the house number (`H8`).
- **`electional_moment_analysis` `format=llm`** top-level fields (aspects, day ruler, dignity, VOC, lunar phase) are now populated instead of `null`-with-values-hidden-under-`score_detail`.
- **Bi-wheel provenance dates render in the chart's timezone**, not the viewer's browser timezone.
- Cross-references added between every `explore_*` tool and its raw data sibling; credit-cost disclosure normalized to one consistent line per metered tool.

### Changed
- **Human Design trademark hygiene**: affiliation disclaimers ("not affiliated with Jovian Archive") added to the HD marketing pages, the bodygraph iframe footer (with the AUP informational/entertainment line), and the `explore_human_design*` tool descriptions; the one "Rave I Ching" usage replaced with generic phrasing.

## [3.22.0] — 2026-07-19

Mobile/dark QA sweep across the four live iframe apps (chart-wheel, bi-wheel, bodygraph, moon-phase), plus a design-parity pass bringing the wheels' colors in line with the web app's #239 engine redesign.

### Added
- **Pinch-to-zoom + reliable touch pan** on chart-wheel, bi-wheel, and bodygraph — `touch-action: none` on the chart SVG stops mobile browsers from claiming drags for page scroll and pinches for page zoom; two-finger pinch zooms anchored at the gesture midpoint with simultaneous pan.
- **Midpoint aspect-type glyphs** on the natal chart wheel — every aspect line now shows its symbol (☌ ☍ △ □ ⚹) on a backing disc, matching the bi-wheel app and the Go engine's design.
- **Theme-aware HD transit/connection overlays** — `explore_human_design_transit` and `explore_human_design_connection` now pass `visual_config.theme` (previously always defaulted to light server-side) and re-fetch in the host's detected theme via the embedded app.

### Fixed
- **HD transit/connection overlays no longer error-card** in MCP Apps hosts — both tools' payloads nest the chart under `natal` / `composite_chart` (with a `centers` map shape the app didn't handle), which the bodygraph app's validity gate rejected outright.
- **Chart-wheel and bi-wheel color palette** now matches the web app's #239 wheel redesign (element remap, vibrant dark-mode zodiac tints, warm/cool aspect semantics) — the iframe wheels had never received that pass and read muddy by comparison.
- Zodiac sign glyphs no longer occasionally render as the wrong emoji-presentation glyph (missing `U+FE0E` variation selector).
- Light-host theme detection no longer misreads as dark in some hosts (background-luminance probe used the wrong color space).
- **ASC/DSC angle labels** no longer clip at the edge of the wheel on full-bleed mobile hosts (a `viewBox` overflow needing container padding that phones don't provide) — coordinates are now clamped inside the frame.
- Mobile pan/zoom controls shrink to 32px with a translucent, blurred background and an icon-only Reset button, so the control stack stops covering the chart at phone widths.

## [3.21.1] — 2026-07-12

### Changed
- **"Developer tier" renamed to "Pro tier"** in all user-facing copy, matching the site-wide rename (the internal plan id `developer` and `/pricing?plan=developer` URLs are unchanged). Updated the `explore_human_design_transit` / `explore_human_design_connection` tool descriptions, the `transit_search` range-limit note, and the astrocartography / API-reference / setup skill docs. Historical changelog entries below retain the old name as a record of what shipped.

---

## [3.21.0] — 2026-07-09

Launch-readiness wave from the three-perspective master review (directory vetting, first-run UX, revenue red-team).

### Security (directory-listing conditions)
- **`auth_*` device tools removed from the HTTP transport.** They mutate process-global state (shared credential file, env inspection) — on the multi-tenant remote server one user's `auth_logout` cleared shared credentials and `auth_status` could report the process service-key config to any tenant. Now `stdioOnly` and hidden/blocked on `/mcp`; unchanged for local stdio installs.
- **Rate limiters no longer trust `X-Forwarded-For`** (leftmost value is attacker-controlled and let callers rotate fake IPs past every throttle). Client IP now comes from Fly's trusted `Fly-Client-IP` hop, with a spoof-resistance test.
- **DCR redirect hardening:** `redirect_uris` must be https or http loopback (RFC 8252) — non-conforming registrations are rejected.

### Conversion & instrumentation
- **PostHog events from the MCP server** (`src/analytics.ts`, fire-and-forget, no-ops without `POSTHOG_API_KEY`): `mcp_session_init` (auth type), `mcp_tool_call` (tool, duration), `mcp_tool_error` (tool, HTTP status — makes 402 paywall hits and 429s countable). Identity is a SHA-256 prefix of the credential, never the raw key; all events tagged `source: mcp`.
- **402 paywall fixed:** paid tiers are no longer told to "enable overages" (overage billing is switched off) — they get the next tier with exact price and a `/pricing?plan=…` deep link; free-tier 402s deep-link to the wallet top-up and `/pricing?plan=developer`.
- **Credit costs disclosed** on the five app tools that lacked them (verified against `usage_meter.go`); `ephemeris_natal_batch` now states its Startup-tier gating and warns that N subjects = N credits.
- **Return hooks:** `current_sky_snapshot` and `transit_forecast` prompts now end with when to check back (next Moon sign change / next exact transit).

### First-run UX
- **Routing:** `explore_natal_chart` is now explicitly the PRIMARY tool for chart requests; `ephemeris_natal_chart` marks itself raw-JSON and defers to it; the `natal_chart_reading` prompt and the astrology-mcp landing page now point at the interactive explorers.
- **Welcome rewritten** from a 12-bullet brochure to a two-option hook (instant no-birth-data sky snapshot, or an interactive birth chart); server `instructions` now steer the model to `explore_*` tools for anything visual.
- **Loader copy de-jargoned** ("Computing ephemeris…" → "Mapping the sky at your birth moment…" etc.); every terminal iframe error now offers "Tap to try again" wired to a real retry; `auth_login` leads with "free tier, no credit card needed"; expired-OAuth copy tells users exactly where to reconnect.

### Fixed
- **Local visual harness (`npm run harness`) was broken** by an orphaned vite process squatting port 5180: `visual-check.mjs` now kills the full process tree on Windows (`taskkill /T`), and the harness uses `strictPort` so a squatted port fails loudly instead of silently drifting. Harness index/fixtures cleaned of the deleted dormant apps; the dead bodygraph fixture was rebuilt with the real Go-SVG contract — which exposed and fixed two genuine a11y bugs (`role="img"` on an SVG containing buttons; hardcoded low-contrast gold on action buttons).

---

## [3.20.0] — 2026-07-09

Second wave of the transport/iframe review: legacy transport retirement, resumability, and remaining hardening/quality items.

### Removed
- **Legacy SSE transport retired.** `GET /sse` + `POST /message` (pre-2025 spec, SDK-deprecated, no cross-machine replay, zero live sessions) now return `410 Gone` pointing at `/mcp`. `scripts/test-sse-client.ts` and the `test:sse` script removed; docs updated.

### Added
- **`Last-Event-ID` resumability.** Bounded in-memory `EventStore` (200 events/stream, 2h TTL) on the Streamable HTTP transport — a reconnecting SSE stream replays missed events instead of losing them. Per-process is safe because sessions are machine-pinned via fly-replay.
- **Server-computed natal aspects.** `explore_natal_chart` was discarding the `aspects` array the natal endpoint already returns (with true ephemeris-derived `is_applying`) and re-deriving aspects client-side with an approximate heuristic — `computeAspects` deleted, server aspects mapped through. Bi-wheel cross-aspects stay client-side (two charts, no single endpoint) but the applying/separating heuristic now uses real longitude speeds instead of defaulted guesses.
- **CSP + keyboard accessibility** on the four iframe apps: inline-only `Content-Security-Policy` meta on each shell; interactive SVG elements (planets, houses, aspects, centers/gates/channels) get `tabindex`/`role`/`aria-label`, Enter/Space activation, and visible focus indicators.
- **Real-handler test coverage.** `createSseApp()` is now exported and `test/server-sse-real-app.test.ts` drives the actual Express app: 401/WWW-Authenticate contract, expired-JWT refresh signal, session issuance with machine prefix, cross-machine `fly-replay` 307 + loop-guard 404, resume-auth requirement, Host allowlist, and the 410 legacy responses.
- **`check:plugin` release gate** (`scripts/plugin-audit.ts`): plugin.json version must match the package (it had rotted at 3.1.0) and `openephemeris-plugin.zip` must match the plugin tree by content; `regen:plugin` rebuilds both. Wired into `verify:release`.
- **CI:** `validate:visual` (Playwright + axe over the app harness) added to the validate workflow; the live canary now sends a **Telegram alert on failure** (needs `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` secrets; no-ops without them).

### Changed
- Resume-path auth now runs **before** the session lookup so an unauthenticated probe cannot learn whether a session id exists.

---

## [3.19.0] — 2026-07-09

Transport hardening + E2E release verification, from a full review of the streaming HTTP transport and iframe app capability.

### Fixed
- **stdio missing the MCP Apps capability flag.** The stdio entry (`src/index.ts`) never advertised `experimental["io.modelcontextprotocol/ui"]` (the SSE server did), so hosts gating iframe rendering on that capability would not render apps from a local install. Now declared on both transports.
- **Rotted integration scripts.** `scripts/test-client.ts` and `scripts/smoke-dev-profile.ts` still asserted pre-rename dotted tool names (`auth.login`, `dev.call`) and could never pass. Fixed and wired into CI so they can't rot silently again.

### Added
- **SSE keepalive.** Long-lived streams (`GET /mcp` leg and legacy `/sse`) now emit an SSE comment frame every 25s and disable the per-socket idle timeout, preventing silent drops through Fly's proxy on idle sessions.
- **Idle session reaper.** In-memory HTTP sessions abandoned without a DELETE are reaped after 2h idle (they previously leaked until process restart); a reaped session 404s and the client re-initializes per spec.
- **Tool-call timeout** (120s) so a hung backend request can't pin a session forever.
- **Resume-path auth.** A session id alone is no longer sufficient to resume a Streamable HTTP session — every request must still carry a valid API key / non-expired JWT (expired JWTs get the standard 401 `invalid_token` refresh signal).
- **Host-header allowlist** on `/mcp`, `/sse`, `/message` as DNS-rebinding defense (Origin was already validated; Host was not). Extend via `MCP_ALLOWED_HOSTS`.
- **Fly HTTP health check** on `/health` (previously TCP-only, so a hung process stayed in rotation).
- **E2E release verification:** `test:published` installs the packed/published tarball into a clean dir and drives `dist/index.js` over stdio (initialize → tools/list → UI resource read → tool call); `test:mcp-http` drives the live Streamable HTTP endpoint end to end including an MCP Apps `resources/read`. Wired into the validate workflow, as a post-publish gate in the npm workflow, and as a 6-hourly production canary.
- **Tool-count regression test** (84) keeping the marketing SSOT honest.

### Removed
- **Dormant UI apps deleted** (transit-timeline, bazi, vedic-chart): never imported/registered, two never functional; their trees, tool files, per-app lockfiles, and `build:ui` steps are gone. BaZi/Vedic data still ships via the typed `bazi_*`/`vedic_chart` tools.
- Leftover one-off codemods (`fix.cjs`, `fix.mjs`, `fix2.mjs`) and the empty `dev_card.json`.
- 7 byte-identical copies of `singlefile-plugin.ts` (now shared from `src/ui/shared/`); debug `console.log` noise stripped from the chart-wheel bundle.

### Changed
- Runtime Docker image now prunes dev dependencies before the final stage.

---

## [3.18.0] — 2026-07-06

Launch-reliability hardening for the remote SSE/HTTP server (`oe-mcp-live`).

### Fixed
- **Stale-JWT dead session.** Self-signed Supabase JWTs expire after 1h. A session's `BackendClient` captured the JWT once at init and the resume path never re-read it, so after the host refreshed the token every tool call kept sending the frozen expired JWT and 401'd forever (users were told to disconnect/reconnect). `BackendClient.setJwt()` now lets the resume branch push the freshly-rotated Bearer token into the session client. Additionally, the `/mcp` auth gate now decodes the JWT `exp` claim (no signature verification — the Go API is the trust boundary) and returns `401 invalid_token` + `WWW-Authenticate` for an already-expired token, triggering the host's OAuth refresh instead of a confusing downstream tool error.
- **POST retry double-charge.** The axios retry loop retried every method — including POST — on transient failures, and every expensive compute endpoint is POST (e.g. `acg_hits` = 15 credits) metered at reservation time, so one dropped response could be billed up to 4×. Only idempotent GETs are auto-retried now; POST/PUT/PATCH/DELETE are never retried. `429` is no longer retried at all — the rate-limit message surfaces immediately instead of hammering the limiter.
- **`isError` correctness.** Both CallTool handlers previously set `isError: !isRetryable`, so 429/5xx/network/auth failures arrived as `isError: false` "successes." All failures now report `isError: true` so hosts recover (retry / OAuth refresh), with the one exception of the stdio device-auth-pending case (whose message carries a verification link the model must relay). Extracted into a shared, unit-tested `formatToolError` helper.
- **Cross-machine session 404s.** `min_machines_running = 2` but the session store is a per-process Map, so a resume request landing on the other machine 404'd. Streamable-HTTP session IDs now embed `FLY_MACHINE_ID`; a request whose session ID targets a different machine is re-routed via the `fly-replay` header (with a `fly-replay-src` loop guard that falls through to 404 so the client re-initializes). No-op locally when `FLY_MACHINE_ID` is unset.
- **API-key validation no longer costs a credit.** Session-init key validation probed `/ephemeris/moon/phase`, which meters at 1 credit — so merely connecting charged the user. Switched to `/catalogs/bodies` (auth-gated but metered at 0 credits).
- **ACG / progressed datetime descriptions** now require a UTC offset (e.g. `1990-05-15T14:30:00-05:00`); a naive datetime was silently interpreted as UTC and mislocated ACG lines / shifted progressions.
- **`dev_read_api` reference text** corrected: `/location/autocomplete` takes `query=`, not `q=`.

### Changed
- Added a `process.on('unhandledRejection')` log-and-continue handler so a single rejected request can't take down every live session.
- 402 credit-exhausted message annotated with a pointer to the pricing SSOT (`apps/web/config/billing-plans.ts`).
- `fly.toml` VM memory raised 512MB → 1024MB for the launch window.

---

## [3.17.0] — 2026-07-06

Docs-only release (this is the version live on npm while 3.18.0 awaited publish).

### Changed
- README: embedded the hero demo GIF and refreshed the quick-start copy for the launch window (PR #258). No runtime changes.

---

## [3.16.0] — 2026-07-05

### Added
- **`explore_human_design_transit`** — personalized Human Design transit overlay. Overlays a transiting moment on a person's natal bodygraph and highlights the channels the transit temporarily completes plus any newly-defined centers. Premium (Developer tier); renders an interactive overlay bodygraph in MCP Apps hosts.
- **`explore_human_design_connection`** — two-person Human Design connection (synastry) overlay. Classifies every connected channel as electromagnetic / companionship / dominance / compromise and renders a two-person overlay bodygraph. Premium (Developer tier).

### Changed
- **`human_design_composite` is now Developer-tier** (was Explorer) and returns real connection-channel scoring — the previously-stubbed relationship endpoint (`/human-design/composite`) is now live end-to-end.

---

## [3.15.0] — 2026-06-15

### Changed
- **`dev_call` split into `dev_read_api` (GET) and `dev_write_api` (POST/PUT/PATCH/DELETE).** Read and write now live in separate tools so a safe read surface never shares a tool with state-changing calls — required for MCP connector-directory compliance. `dev_read_api` carries `readOnlyHint: true`; `dev_write_api` carries `readOnlyHint: false`. Both name their target API explicitly.

### Fixed
- **Brand-gold WCAG AA contrast pass** across the chart-wheel, bi-wheel, and bodygraph iframes — gold accents darkened to clear AA against their backgrounds; all three apps are axe-clean.
- **Moon-phase color cue** now encodes speed/proximity, and aspect-label contrast corrected.

### Added
- **Collapsible glyph legend** in the interactive chart iframes — keeps the wheel uncluttered while remaining one tap from a full symbol key.

---

## [3.14.0] — 2026-05-24

### Added
- **Fullscreen bottom-bar layout** for bodygraph, bi-wheel, and chart-wheel iframes — chart fills the viewport, controls dock to the bottom for a cleaner read on small windows.
- **Debug highlight click handler** in the bodygraph (`?debugHighlight`) — click any gate to surface its center/channel data via iframe postMessage.
- **Highlight visualization** — highlighted gates render with CSS glow while non-highlighted gates dim, making activation patterns visually obvious.
- **Click payload metadata** — bodygraph gate groups now emit `data-center` for richer iframe click events.
- **OAuth refresh-token persistence** to Supabase, with in-memory expiry enforcement and a 90-day TTL (up from 30 days).
- **OAuth discovery test suite** with 401-compliance coverage.

### Fixed
- Auth check now runs before `isInitializeRequest` — resolves the Claude Web `ofid_` initialization error.
- Light-mode ring tokens wired correctly in bi-wheel (were missing token references).
- Fullscreen bottom-bar layout polish — edge cases and styling fixes after initial rollout.

### Changed
- **Server-side SVG is now the only bodygraph render path** — the legacy client-side renderer has been retired. Reduces bundle size and removes a source of cross-environment rendering drift.
- Claude Web connector docs updated to reflect OAuth (not API key) as the connection method.

### Underlying API improvements (delivered transparently)
- **LLM-format projection now covers all 7 benchmarked endpoints** (was 4): `/ephemeris/natal-chart`, `/comparative/synastry`, `/comparative/natal-transits`, `/human-design/chart`, `/vedic/chart`, `/chinese/bazi`, `/acg/hits`. Weighted average reduction: 61% (GPT-4o), 60% (Claude). Range: 13%–98% per endpoint.
- `/acg/hits` newly supports `format=llm` — proximity hits as compact rows. Other `/acg/*` endpoints continue to return precision GeoJSON for map rendering.

---

## [3.13.11] — 2026-05-15

### Added
- **Bi-Wheel UI Parity** — Unified the Bi-Wheel and Natal Chart Wheel architectures with matching feature sets.
- **Tally & Dignity Panels** — Integrated element/modality tallies and planetary dignity badges into the Bi-Wheel UI.
- **House System Controls** — Added dynamic house system selection to the Bi-Wheel aspect panel, triggering live recalculations.
- **Enhanced Rendering** — Exported dignity/tally logic from core renderer for consistent client-side UI generation.

### Fixed
- Widened `BiWheelMode` type definitions to prevent TypeScript compilation errors during mode-specific panel rendering.
- Standardized CSS design tokens and layout containers between natal and comparative chart wheels.

---

## [3.10.4] — 2026-04-24

### Changed
- `ephemeris_transits` tool description updated with compute surcharge and search range limit documentation
- `dev_call` credit cost reference now includes compute surcharge information
- Tier-based compute timeouts: Explorer 30s, Developer 120s, Startup 5m, Scale 10m for compute-heavy endpoints
- Search range caps: `/predictive/transits/search` limited to 1y (Explorer), 5y (Developer), 10y (Startup)
- Compute surcharges: requests exceeding 30s incur 1 additional credit per 30s of wall-clock compute
- Daily credit caps now persistent across server restarts (PostgreSQL-backed)

---

## [3.10.0] — 2026-04-23

### Added
- **Native visual rendering (Tier 1 MCP App)** — `ephemeris_natal_chart`, `ephemeris_synastry`,
  `human_design_chart`, `ephemeris_progressed_chart`, and `ephemeris_solar_return` now accept
  `include_visual: true` to embed a live chart image directly in the conversation alongside
  the JSON data. A single tool call returns both interpretation data and a rendered chart.
- **`visual_config` parameter** — optional `{ theme, size }` object on all visual-capable data
  tools. Astrology charts default to `theme: "light"`, HD bodygraphs default to `theme: "dark"`
  (per HD convention). Size range 200–4000 px, default 800.
- **Dual-content response handler** — `formatToolResponse` in `tools/index.ts` now intercepts
  embedded `VisualResult` objects: base64-encodes raw SVG strings on the fly, emits an MCP image
  block (`{ type: "image" }`) first, then a clean JSON text block with the `visual` key stripped.
  PNG payloads (already base64 from the sidecar) are passed through without double-encoding.
- **`test/visual-rendering.test.ts`** — 26 new unit tests covering the full visual pipeline:
  SVG encoding, PNG passthrough, dual-block output, key stripping, standalone binary passthrough,
  plain JSON fallthrough, and defensive handling of incomplete `visual` keys.

### Changed
- `ephemeris_chart_wheel`, `ephemeris_bi_wheel`, and `human_design_bodygraph` (standalone
  visualization tools) now **default to SVG** instead of PNG. This eliminates the `resvg` binary
  dependency that caused runtime environment mismatches in Docker/Fly deployments. PNG remains
  available as an explicit opt-in via `format: "png"`.
- Tool descriptions for standalone visual tools updated to reflect SVG-first rendering.

### Fixed
- Chart render failures caused by `resvg` binary not being available in the Node.js MCP
  server runtime environment. SVG is now rendered natively by the Go sidecar with no external
  binary dependencies.

---

## [3.9.0] — 2026-04-22


### Added
- **Streamable HTTP transport** (`POST/GET/DELETE /mcp`) — implements the MCP 2025-11-25
  specification. New integrations (Smithery, cursor, Claude Web) should prefer
  `https://mcp.openephemeris.com/mcp` over the legacy SSE endpoint. The SSE endpoint
  (`/sse`) is retained for backward compatibility.
- **`/.well-known/mcp/server-card.json`** — static server card served at the standard
  well-known path. Allows Smithery and other registries to scan tool metadata without
  requiring an authenticated session, enabling automatic listing and discovery.
- **`extractApiKey()` helper** — shared auth extraction (X-API-Key / Authorization: Bearer
  / X-OpenEphemeris-API-Key / ?apiKey) used by both transports, eliminating duplication.

### Changed
- `smithery.yaml` upgraded to modern `configSchema` + `commandFunction` format. Smithery
  now renders a typed API key input field in its UI instead of a raw env map.
- `/health` now reports both `sse_sessions` and `http_sessions` counts, and lists
  `transports: ["sse", "streamable-http"]` for client introspection.

---

## [3.8.0] — 2026-04-21

### Added
- `human_design_bodygraph` — new dedicated tool for generating Human Design Bodygraph images
  (PNG or SVG). Renders all 9 centers, 36 channels, and 64 gates with Personality/Design
  color-coding. Supports `light`, `dark`, and `mono` styles. Developer tier, 2 credits.

### Fixed
- **HD Bodygraph: missing 10-57 channel** — The "Channel of Perfected Form" (Gate 10 ↔ Gate 57)
  was silently dropped from the visualization geometry while the math engine still reported it as
  active. Charts with both gates activated now correctly render the channel.

---

## [3.7.0] — 2026-04-19

### Changed
- **Personal Tier Removed**: The platform no longer offers the Personal subscription tier.
- `ephemeris_transits` and `ephemeris_natal_transits` moved from Personal to the free **Explorer** tier.

---

## [3.6.0] — 2026-04-17

### Added
- `ephemeris_next_lunar_phase` — new purpose-built tool for "when is the next new/full/quarter moon?" queries.
  Replaces a 4–7 step multi-call chain with a single, credit-efficient call. Internally calculates a rolling
  search window and filters the calendar API response so the LLM receives a clean, normalized answer.

### Changed (Tool Descriptions & LLM Routing)
- `ephemeris_moon_phase` — sharpened description to clarify it is point-in-time only and cannot answer
  "upcoming date" questions. Adds explicit `→ use ephemeris_next_lunar_phase` redirect.
- `ephemeris_next_eclipse` — latitude/longitude are now **optional**. Omitting them triggers a global eclipse
  search (`/eclipse/solar/global` or `/eclipse/lunar/global`), allowing Claude to answer "when is the next
  total solar eclipse?" without forcing the user to specify a location.
- `acg_power_lines` — added explicit ❌/✅ routing guidance distinguishing it from `acg_hits`. This prevents
  Claude from fetching full global GeoJSON geometry when the user's question is about a specific city.
- `acg_hits` — symmetric routing guidance added (mirrors `acg_power_lines` change above).
- `ephemeris_solar_return` — `target_datetime` is now optional; defaults to `new Date().toISOString()` so
  Claude can answer "What does my solar return look like?" for the current year without stalling for input.
- `ephemeris_lunar_return` — same treatment; defaults to today so "what's my next lunar return?" resolves
  in one call.
- `electional_station_tracker` — `planets` parameter now accepts human-readable names (`mercury,venus,mars`)
  in addition to numeric IDs. Names are mapped to IDs in the handler. Adds `USE THIS TOOL FOR:` examples
  for "Mercury retrograde" queries to aid routing.
- `venus_phase` — `date` is now optional (was incorrectly marked required despite the description
  saying "Defaults to now"). Handler auto-fills today's date when omitted.

---

## [3.5.3] — 2026-04-10

### Fixed
- `ephemeris_chart_wheel` and `ephemeris_bi_wheel` tools now correctly advertise the
  `style` values accepted by the backend (`light`, `dark`, `mono`). The previous enum
  (`modern`, `classic`, `dark`) caused every non-dark chart request to fail with `400`.
- SSE sessions are now fully isolated: each connection creates its own `BackendClient`
  instance keyed to the connecting user's API key. Concurrent sessions no longer
  overwrite each other's API key on the shared singleton, preventing cross-user
  billing attribution errors.

---

## [3.5.1] — 2026-03-31

### Changed
- Added `mcp-server`, `modelcontextprotocol`, `model-context-protocol` to package.json keywords for registry discovery
- Fixed `OE_API_KEY` → `OPENEPHEMERIS_API_KEY` in registry submission guide
- Corrected GitHub links from `MeridianMap` to `Spirit-River` org

---

## [3.5.0] — 2026-03-28

### Added
- `POST /ephemeris/draconic` — Draconic chart: full planetary set shifted to True Node as 0° Aries (Explorer tier, 1 credit)
- `POST /ephemeris/prenatal-lunation` — Finds the prenatal new and full moon preceding a subject's birth date (Developer tier, 5 credits)
- `POST /predictive/primary-directions` — Placidian semi-arc primary directions with configurable arc length and body/angle targets (Developer tier, 5 credits)

### Changed
- Total production endpoints: **107 → 110**
- `dev-allowlist.json`, `endpoint-tier-matrix.json`, `llms.txt` all updated to reflect new surface

---

## [3.4.1] — 2026-03-25


### Fixed
- Chiron position fallback for edge-date calculations now uses full high-precision ephemeris path instead of simplified approximation
- SSE server chart wheel responses now correctly deliver native MCP image blocks instead of raw base64 JSON

### Changed
- Explorer tier daily cap set to 50 credits/day (resets midnight UTC)
- Catalog and metadata endpoints (`/acg/meta`, `/acg/datasets`, `/catalogs/*`) moved to free tier (0 credits)

---

## [3.4.0] — 2026-03-22

### Added
- `hd_planetary_return` tool — finds the exact date when a planet returns to its natal position in HD context
- `hd_opposition` tool — finds the exact date/age of a planet's first opposition (age cycle milestone)
- `venus_star_points`, `venus_eight_year_star`, `venus_elongations`, `venus_phase`, `venus_stations` — complete Venus Star Point toolkit
- `ephemeris_planetary_return` — generic multi-planet support for solar, lunar, and outer planet returns
- `ephemeris_lunar_return` — dedicated monthly lunar return chart

### Changed
- Asteroid data (Chiron, Ceres, Pallas, Juno, Vesta, Pholus) now included by default in natal chart responses
- `ephemeris_transits` tool now includes explicit `aspect_angle` parameter with examples for returns and oppositions

---

## [3.3.0] — 2026-03-21

### Added
- Timezone parameter added to all natal/transit/predictive tools — resolves ambiguous local-time inputs
- `ephemeris_composite_midpoint` — Davison midpoint composite chart
- `ephemeris_fixed_stars` — Ptolemaic fixed star positions with orb and conjunction data
- `ephemeris_hermetic_lots` — Arabic parts / Hermetic Lots (Lot of Fortune, Spirit, etc.)

### Fixed
- ACG power lines now correctly render for southern hemisphere birth locations
- Timezone resolution for "America/Denver" and similar IANA names no longer defaults to UTC

---

## [3.2.0] — 2026-03-21

### Added
- SSE (Server-Sent Events) transport support — enables remote MCP clients without local `npx` installs
- `ephemeris_chart_wheel` and `ephemeris_bi_wheel` tools now deliver native MCP image blocks (PNG)
- Payload size safety cap — responses over 500kb return a structured `PAYLOAD_TOO_LARGE` error

### Fixed
- Composite chart endpoint route corrected in allowlist

---

## [3.1.0] — 2026-03-20

### Added
- `human_design_composite` — dual-chart BodyGraph overlay for relationship analysis
- `human_design_penta` — 5-person Penta composite for group/team dynamics
- `ephemeris_progressed_chart` — secondary progressions (day-for-a-year method)

### Changed
- Explorer tier: transit endpoints now open at free tier (no subscription required)
- Developer tier: 75,000 credits/month
- Startup tier: 15,000 credits/month (formerly 'Pro')

---

## [3.0.0] — 2026-03-15

### Added
- Full tool allowlist security model — default-deny with `config/dev-allowlist.json`
- `dev.call` and `dev.list_allowed` generic proxy tools for allowlisted operations
- `welcome_to_open_ephemeris` MCP Prompt — orientation guide available to MCP clients
- Server icon registered at `https://mcp.openephemeris.com/icon.png`
- `verify:release` npm gate script for pre-publish validation

### Breaking
- Environment variable renamed from `ASTROMCP_API_KEY` to `OPENEPHEMERIS_API_KEY` (old name kept as fallback)
- Package renamed from `@astromcp/server` to `@openephemeris/mcp-server`

---

## [2.x] — Legacy

Earlier versions published under `@astromcp/server`. All users should migrate to `@openephemeris/mcp-server`.

---

*[Unreleased changes are tracked in commit history.]*
