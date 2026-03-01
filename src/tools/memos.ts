import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { MemosClient } from "../memos-client.ts";

const BY_RURU_TAG = "\n\n#by_Ruru";

export function registerMemoTools(
	server: McpServer,
	client: MemosClient,
): void {
	server.registerTool(
		"create_memo",
		{
			description: "メモを作成する",
			inputSchema: {
				content: z.string().describe("メモの本文"),
				visibility: z
					.enum(["PRIVATE", "PROTECTED", "PUBLIC"])
					.optional()
					.describe("公開範囲（デフォルト: サーバー設定に従う）"),
			},
		},
		async (args) => {
			const content = args.content + BY_RURU_TAG;
			const memo = await client.createMemo(content, args.visibility);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(memo, null, 2),
					},
				],
			};
		},
	);

	server.registerTool(
		"list_memos",
		{
			description:
				'メモの一覧を取得する。filter パラメータで CEL 式によるフィルタが可能（例: content.contains("keyword")）',
			inputSchema: {
				pageSize: z.number().optional().describe("取得件数（デフォルト: 10）"),
				filter: z
					.string()
					.optional()
					.describe('CEL 式フィルタ（例: content.contains("keyword")）'),
			},
		},
		async (args) => {
			const result = await client.listMemos(
				args.pageSize,
				undefined,
				args.filter,
			);

			if (result.memos.length === 0) {
				return {
					content: [
						{
							type: "text" as const,
							text: "メモが見つかりませんでした",
						},
					],
				};
			}

			// name を先頭に配置して AI が参照しやすくする
			const formatted = {
				...result,
				memos: result.memos.map(({ name, ...rest }) => ({ name, ...rest })),
			};

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(formatted, null, 2),
					},
				],
			};
		},
	);
}
