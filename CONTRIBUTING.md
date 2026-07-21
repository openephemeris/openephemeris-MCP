# Contributing

Thanks for your interest in OpenEphemeris.

## How this repo works

This repository is the **public home of the OpenEphemeris MCP server's docs, Claude plugin, agent skills, and integration examples**. The server itself is published to npm as [`@openephemeris/mcp-server`](https://www.npmjs.com/package/@openephemeris/mcp-server); its TypeScript source lives in a private monorepo alongside the Go API that does the actual astronomy.

Practically, that means:

| You want to… | Do this |
|---|---|
| Report a bug in a tool's output | [Open an issue](https://github.com/openephemeris/openephemeris-MCP/issues/new/choose) — include the tool name, inputs, and what you expected |
| Request a new tool or endpoint | Open a feature request issue |
| Fix a typo or error in the docs/skills | Open a PR here — we port it upstream and it comes back on the next sync |
| Add an integration example | Open a PR adding to `curl/`, `python/`, or `typescript/` |
| Report a security issue | **Don't open an issue** — see [SECURITY.md](SECURITY.md) |

## A note on doc PRs

`README.md`, `SETUP.md`, `CHANGELOG.md`, `smithery.yaml`, `plugin/`, and `skills/*/SKILL.md` are **generated into this repo from the upstream monorepo**. We happily accept PRs against them — we just apply the change upstream rather than merging directly, so your fix survives the next sync. You'll be credited either way. Everything else (`curl/`, `python/`, `typescript/`, `assets/`, `.github/`) is edited directly here.

Parts of the README are machine-generated between `<!-- GENERATED:... -->` markers (tool counts, the tool list, the allowlist table). Edits inside those markers get overwritten — flag the underlying problem in an issue instead.

## Getting set up

You don't need to build anything to use the server:

```bash
npx -y @openephemeris/mcp-server
```

Full client-by-client instructions are in [SETUP.md](SETUP.md). A free API key comes from [openephemeris.com/dashboard](https://openephemeris.com/dashboard).

## Good first contributions

- An integration example for a language or framework we don't cover yet
- A skill for a reading style or technique that isn't in `skills/`
- Clearer setup instructions for an MCP client we've documented poorly

## Code of conduct

Participation is governed by our [Code of Conduct](CODE_OF_CONDUCT.md).
