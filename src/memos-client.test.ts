import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";
import { MemosClient } from "./memos-client.ts";

const mockFetch = mock.fn<typeof globalThis.fetch>();

const client = new MemosClient({
	baseUrl: "https://memos.example.com",
	accessToken: "test-token",
});

beforeEach(() => {
	mockFetch.mock.resetCalls();
	mock.method(globalThis, "fetch", mockFetch);
});

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("MemosClient", () => {
	it("リクエストに Authorization ヘッダーを付与する", async () => {
		mockFetch.mock.mockImplementationOnce(() =>
			Promise.resolve(jsonResponse({ memos: [], nextPageToken: "" })),
		);

		await client.listMemos();

		const [, init] = mockFetch.mock.calls[0].arguments;
		const headers = new Headers(init?.headers);
		assert.equal(headers.get("Authorization"), "Bearer test-token");
	});

	it("末尾スラッシュを除去して URL を構築する", async () => {
		const c = new MemosClient({
			baseUrl: "https://memos.example.com/",
			accessToken: "token",
		});

		mockFetch.mock.mockImplementationOnce(() =>
			Promise.resolve(jsonResponse({ memos: [], nextPageToken: "" })),
		);

		await c.listMemos();

		const [url] = mockFetch.mock.calls[0].arguments;
		assert.equal(url, "https://memos.example.com/api/v1/memos");
	});

	describe("createMemo", () => {
		it("POST /api/v1/memos でメモを作成する", async () => {
			const memo = { name: "memos/1", uid: "abc", content: "hello" };
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse(memo)),
			);

			const result = await client.createMemo("hello", "PRIVATE");

			const [url, init] = mockFetch.mock.calls[0].arguments;
			assert.equal(url, "https://memos.example.com/api/v1/memos");
			assert.equal(init?.method, "POST");
			assert.deepEqual(JSON.parse(init?.body as string), {
				content: "hello",
				visibility: "PRIVATE",
			});
			assert.equal(result.name, "memos/1");
		});

		it("visibility 未指定時はリクエストボディに含めない", async () => {
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse({ name: "memos/1" })),
			);

			await client.createMemo("test");

			const [, init] = mockFetch.mock.calls[0].arguments;
			const body = JSON.parse(init?.body as string);
			assert.equal(body.visibility, undefined);
		});
	});

	describe("getMemo", () => {
		it("GET /api/v1/memos/{id} でメモを取得する", async () => {
			const memo = { name: "memos/1", uid: "abc", content: "hello" };
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse(memo)),
			);

			const result = await client.getMemo("1");

			const [url] = mockFetch.mock.calls[0].arguments;
			assert.equal(url, "https://memos.example.com/api/v1/memos/1");
			assert.equal(result.content, "hello");
		});
	});

	describe("listMemos", () => {
		it("クエリパラメータなしで一覧取得する", async () => {
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse({ memos: [], nextPageToken: "" })),
			);

			await client.listMemos();

			const [url] = mockFetch.mock.calls[0].arguments;
			assert.equal(url, "https://memos.example.com/api/v1/memos");
		});

		it("pageSize, pageToken, filter をクエリパラメータに含める", async () => {
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse({ memos: [], nextPageToken: "" })),
			);

			await client.listMemos(10, "token123", 'content.contains("test")');

			const [url] = mockFetch.mock.calls[0].arguments;
			const parsed = new URL(url as string);
			assert.equal(parsed.searchParams.get("pageSize"), "10");
			assert.equal(parsed.searchParams.get("pageToken"), "token123");
			assert.equal(
				parsed.searchParams.get("filter"),
				'content.contains("test")',
			);
		});
	});

	describe("createComment", () => {
		it("POST /api/v1/memos/{id}/comments でコメントを作成する", async () => {
			const comment = { name: "memos/1/comments/1", content: "nice" };
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse(comment)),
			);

			const result = await client.createComment("1", "nice");

			const [url, init] = mockFetch.mock.calls[0].arguments;
			assert.equal(url, "https://memos.example.com/api/v1/memos/1/comments");
			assert.equal(init?.method, "POST");
			assert.deepEqual(JSON.parse(init?.body as string), {
				content: "nice",
			});
			assert.equal(result.content, "nice");
		});
	});

	describe("listComments", () => {
		it("GET /api/v1/memos/{id}/comments でコメント一覧を取得する", async () => {
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse([])),
			);

			await client.listComments("1");

			const [url] = mockFetch.mock.calls[0].arguments;
			assert.equal(url, "https://memos.example.com/api/v1/memos/1/comments");
		});
	});

	describe("エラーハンドリング", () => {
		it("API がエラーを返した場合に例外をスローする", async () => {
			mockFetch.mock.mockImplementationOnce(() =>
				Promise.resolve(new Response("Not Found", { status: 404 })),
			);

			await assert.rejects(() => client.getMemo("999"), {
				message: /Memos API エラー \(404\): Not Found/,
			});
		});
	});
});
