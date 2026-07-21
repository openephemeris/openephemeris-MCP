# Security Policy

## Supported versions

Only the latest published release of [`@openephemeris/mcp-server`](https://www.npmjs.com/package/@openephemeris/mcp-server) is supported. The hosted endpoint at `https://mcp.openephemeris.com/mcp` always runs the current release.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately to **security@openephemeris.com**, or use GitHub's [private vulnerability reporting](https://github.com/openephemeris/openephemeris-MCP/security/advisories/new).

Please include:

- What the issue is and roughly how severe you think it is
- Steps to reproduce (a minimal tool call or request is ideal)
- Affected version or endpoint
- Any suggested fix, if you have one

We aim to acknowledge within **2 business days** and to ship a fix or share a mitigation timeline within **14 days** for confirmed issues. We'll credit you in the changelog and the advisory unless you'd rather stay anonymous.

## Scope

In scope:

- The published `@openephemeris/mcp-server` npm package
- The hosted MCP endpoint `mcp.openephemeris.com`
- The API it calls, `api.openephemeris.com`
- The Claude plugin and skills published in this repo

Out of scope: findings that require a compromised local machine, rate-limit and volumetric attacks, missing headers with no demonstrated impact, and reports produced solely by an automated scanner without a working proof of concept.

## API keys

Your OpenEphemeris API key authenticates and bills as you. Keep it in your MCP client's environment configuration — never commit it to a repo or paste it into an issue. If you believe a key has leaked, rotate it immediately at [openephemeris.com/dashboard](https://openephemeris.com/dashboard).
