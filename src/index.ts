import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MemosClient } from "./memos-client.ts";
import { createMcpServer } from "./server.ts";

const baseUrl = process.env.MEMOS_BASE_URL;
const accessToken = process.env.MEMOS_ACCESS_TOKEN;

if (!baseUrl || !accessToken) {
	console.error(
		"Missing required environment variables: MEMOS_BASE_URL, MEMOS_ACCESS_TOKEN",
	);
	process.exit(1);
}

const client = new MemosClient({ baseUrl, accessToken });
const mcpServer = createMcpServer(client);

if (process.argv.includes("--http")) {
	const { StreamableHTTPTransport } = await import("@hono/mcp");
	const { serve } = await import("@hono/node-server");
	const { Hono } = await import("hono");

	const port = process.env.PORT ? Number(process.env.PORT) : 0;

	const transport = new StreamableHTTPTransport();
	await mcpServer.connect(transport);

	const app = new Hono();
	app.all("/mcp", (c) => transport.handleRequest(c));
	app.get("/health", (c) => c.json({ status: "ok" }));

	serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, (info) => {
		console.error(
			`ruru-memos-mcp server running on http://localhost:${info.port}`,
		);
		console.error(`MCP endpoint: http://localhost:${info.port}/mcp`);
	});
} else {
	const transport = new StdioServerTransport();
	await mcpServer.connect(transport);
}
