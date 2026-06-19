#!/usr/bin/env node

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const args = process.argv.slice(2);
  let urlStr = null;
  const headers = new Headers();

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--header") {
      i++;
      const [key, ...val] = args[i].split(":");
      headers.set(key.trim(), val.join(":").trim());
    } else if (arg === "--token") {
      i++;
      headers.set("Authorization", `Bearer ${args[i]}`);
    } else if (!urlStr) {
      urlStr = arg;
    }
  }

  if (!urlStr) {
    console.error("Usage: npx @foxcite/mcp-connector <url> [--header 'Name: Value'] [--token <token>]");
    process.exit(1);
  }

  try {
    const url = new URL(urlStr);
    
    // The @modelcontextprotocol/sdk has a bug where it overwrites requestInit headers.
    // To reliably pass our Authorization headers, we intercept the fetch call.
    const clientTransport = new SSEClientTransport(url, {
      fetch: (input, init) => {
        const fetchHeaders = new Headers(init?.headers);
        headers.forEach((val, key) => {
          fetchHeaders.set(key, val);
        });
        return fetch(input, { ...init, headers: fetchHeaders });
      }
    });

    // Create the local stdio transport that talks to Claude Desktop
    const serverTransport = new StdioServerTransport();

    // The key here is transparently bridging messages
    clientTransport.onmessage = (message) => {
      serverTransport.send(message).catch(err => {
        console.error("Error forwarding to local stdio:", err);
      });
    };

    serverTransport.onmessage = (message) => {
      clientTransport.send(message).catch(err => {
        console.error("Error forwarding to remote SSE:", err);
      });
    };

    clientTransport.onerror = (error) => {
      console.error("Remote SSE error:", error);
    };

    serverTransport.onerror = (error) => {
      console.error("Local stdio error:", error);
    };

    clientTransport.onclose = () => {
      serverTransport.close();
      process.exit(0);
    };

    serverTransport.onclose = () => {
      clientTransport.close();
      process.exit(0);
    };

    // CRITICAL: Connect to remote SSE FIRST, then start local stdio.
    // Claude Desktop sends "initialize" the instant stdio starts.
    // If SSE isn't connected yet, that message gets dropped and
    // Claude never discovers the tools.
    await clientTransport.start();
    await serverTransport.start();

  } catch (err) {
    console.error("Failed to start proxy:", err);
    process.exit(1);
  }
}

main();
