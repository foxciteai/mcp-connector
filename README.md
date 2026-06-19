# Foxcite MCP Connector

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A transparent Model Context Protocol (MCP) proxy that natively connects Claude Desktop (and other MCP-compatible clients) directly to your [Foxcite](https://foxcite.com) AEO data.

With this connector, you can leverage [ai search visibility for agencies](https://foxcite.com/features) by asking Claude to "analyze my brand's AI visibility," "check my latest citation gaps," or "run a new audit for [query]"—and Claude will seamlessly interface with your Foxcite workspace.

## Installation & Configuration

The connector is designed to be run as an npx executable directly from your Claude Desktop configuration file.

### 1. Get an API Key

Generate an API Key from your [Foxcite Dashboard](https://foxcite.com).

### 2. Configure Claude Desktop

Open your Claude Desktop configuration file.

- **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add the Foxcite MCP server to your `mcpServers` object:

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

### 3. Restart Claude

Fully quit and restart Claude Desktop. You will now see the "Foxcite" tools available in the Claude interface!

## Exposed MCP Tools

Once connected, the LLM gains access to the following tools:

- **`list_brands`**: Retrieve all brands and workspaces in the user's account.
- **`get_visibility_score`**: Fetch the current overall AI Visibility Score (AVS) for a specific brand.
- **`run_quick_audit`**: Trigger a live scrape against ChatGPT, Claude, Perplexity, etc. to see if a brand is recommended for a given query.
- **`get_citation_gaps`**: Retrieve specific LLM responses where competitors were cited but the user's brand was omitted.

## Developer Notes

This connector acts as an SSE (Server-Sent Events) bridge to Foxcite's backend. It uses the official `@modelcontextprotocol/sdk` to expose Foxcite's REST API as an MCP standard interface.

## Resources

- [Homepage](https://foxcite.com)
- [GitHub Repository](https://github.com/foxciteai/mcp-connector)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
