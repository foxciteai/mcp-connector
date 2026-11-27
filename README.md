# Foxcite MCP Connector

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A transparent Model Context Protocol (MCP) proxy that natively connects Claude Desktop (and other MCP-compatible clients) directly to your [Foxcite](https://foxcite.com) AEO data.

With this connector, you can leverage [ai search visibility for agencies](https://foxcite.com/features) by asking Claude to "analyze my brand's AI visibility," "check my latest citation gaps," or "run a new audit for [query]"—and Claude will seamlessly interface with your Foxcite workspace.

## Installation & Configuration

The connector is designed to be run as an npx executable directly from your Claude Desktop configuration file.

### 1. Get an API Key

Generate an API Key from your [Foxcite Dashboard](https://foxcite.com).

### 2. Connect Your Agent Client

#### Option A: Direct Streamable HTTP (Recommended for Claude Code, Cursor, Codex)

Add Foxcite directly without a proxy binary:

```json
{
  "mcpServers": {
    "foxcite": {
      "type": "http",
      "url": "https://api.foxcite.com/mcp",
      "headers": {
        "Authorization": "Bearer fc_live_..."
      }
    }
  }
}
```

#### Option B: Claude Desktop (`npx` Stdio-to-SSE Bridge)

Open your Claude Desktop configuration file:

- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add Foxcite to your `mcpServers` object:

```json
{
  "mcpServers": {
    "foxcite": {
      "command": "npx",
      "args": ["-y", "@foxcite/mcp-connector"],
      "env": {
        "FOXCITE_API_KEY": "fc_live_..."
      }
    }
  }
}
```

For self-hosted deployments, set `"FOXCITE_MCP_URL": "https://your-host.example.com/mcp/sse"` or pass the URL and `--token <key>` as arguments.

### 3. Restart Your Client

Fully quit and restart Claude Desktop (or reload MCP servers in Cursor / Claude Code). Foxcite's tools and audit prompts will be ready to use.

## Exposed MCP Tools

Once connected, your agent has access to 18 focused tools:

- **`run_scan`**: Run a live multi-engine AI search scan (ChatGPT, Claude, Gemini, Perplexity, Google AI Overviews, Grok) with zero-setup `domain` + `query` or an existing `brand_id`, returning full responses, cited URLs, uncited consulted sources, and SERP questions.
- **`get_scan`**: Retrieve full scan evidence and per-engine responses for a `scan_id` or a brand's latest scan, with what each engine searched, the pages it got back in rank order, and whether the brand was among them (`is_found`).
- **`get_visibility`**: Fetch the brand's AI Visibility Score (AVS) and competitive citation gaps showing which competitor domains and URLs won missing queries.
- **`manage_brand`**: List brands, create a brand, add competitors, or track/untrack daily queries.
- **`site_inspect`**: Inspect any public site or winning competitor URL (`search`, `timeline`, `history` via Wayback Machine, `snapshot` for live title/H1/canonical/JSON-LD).
- **`keyword_research`**: List tracked keywords, get PAA suggestions, fetch volume/CPC metrics, or score keyword opportunities.
- **`get_audit_context`**: Retrieve verified `BrandFact` memory, recurring Google SERP questions, recent citation drops, alerts, past playbooks, and open wrong facts (AI answers that contradict a verified fact).
- **`get_account`**: Check your active plan, credit balance, and recent credit transaction ledger.
- **`log_change`**: Log a site change and start an experiment that measures whether AI engines name the brand more afterwards (treated vs control queries). `dry_run=true` returns the plan and credit estimate only.
- **`mark_change_shipped`**: Mark a logged change as live, which schedules its after-change readings.
- **`get_experiments`**: List a brand's change experiments, or pass `experiment_id` for every reading's per-group mention rates.
- **`cancel_experiment`**: Stop an experiment's further readings and their credit charges.
- **`manage_facts`**: Add (one at a time or in bulk), list and retire a brand's verified facts; review the AI answers that contradict them and mark them fixed or not a problem; switch the after-scan check (1 credit per checked scan) on or off.
- **`action_plans`**: Action plans: what a competitor's cited page does that wins an AI answer, and what to change to be cited instead. `create` (from a scan's engine answer and one cited page; 10 credits, `dry_run` for the quote; a plan already made for that answer and page comes back at no charge), `list`, and `get` (poll until it's written).
- **`get_history`**: A brand's AI visibility over time: cited and named rates against the previous window, a day or week trend, each query's rates and direction (weakest first), each engine's rates, and recent scan ids. Filter by query or engine. No credits.
- **`monitoring`**: See and change a brand's scheduled monitoring: daily checks on or off (paid plans), which engines run, and the projected credits per day and per 30 days against your balance. Track or untrack queries with `manage_brand`.
- **`competitors`**: List competitors with their citation share and the answers they won over the brand; see one competitor's most-cited pages and recent wins (with scan ids for `action_plans`); add, hide or unhide competitors. No credits.
- **`top_up`**: See your balance, plan, and every plan and recharge pack with prices, or get a Stripe Checkout link for one to open and pay. Nothing is charged until checkout is completed. When any tool runs out of credits, its error points here.

Paid tools (`run_scan`, `keyword_research`, `log_change`, `action_plans`) accept `dry_run: true`, which returns the credit cost and your balance without running or charging anything. Each tool is also labelled read-only, destructive or reaching outside Foxcite, so clients can decide when to ask you before a call.

Plus 2 MCP Prompts (`ai-visibility-audit` and `humanize-copy`) that guide your coding or research agent through Foxcite's diagnostic workflow.

## Developer Notes

This connector bridges local `stdio` MCP clients to Foxcite's SSE endpoint (`/mcp/sse`), reading `FOXCITE_API_KEY` and optional `FOXCITE_MCP_URL` from the environment (or `--token` / `--header` / positional `<url>` flags). Modern HTTP MCP clients can connect directly to `https://api.foxcite.com/mcp` via Streamable HTTP.

## Resources

- [Homepage](https://foxcite.com)
- [GitHub Repository](https://github.com/foxciteai/mcp-connector)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
