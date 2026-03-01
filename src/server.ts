import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemosClient } from "./memos-client.ts";
import { registerCommentTools } from "./tools/comments.ts";
import { registerMemoTools } from "./tools/memos.ts";

export function createMcpServer(client: MemosClient): McpServer {
	const server = new McpServer({
		name: "ruru-memos-mcp",
		version: "0.1.0",
	});

	registerMemoTools(server, client);
	registerCommentTools(server, client);

	return server;
}
