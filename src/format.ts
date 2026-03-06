import type { Comment, ListMemosResponse, Memo } from "./memos-client.ts";

export function formatMemo(memo: Memo): string {
	const tags = memo.tags.length > 0 ? memo.tags.map((t) => `#${t}`).join(", ") : "なし";

	const lines = [
		`## ${memo.name}`,
		"",
		`- **作成日時**: ${memo.createTime}`,
		`- **公開範囲**: ${memo.visibility}`,
		`- **タグ**: ${tags}`,
		"",
		"### 本文",
		"",
		memo.content,
	];

	return lines.join("\n");
}

export function formatMemoList(result: ListMemosResponse): string {
	const lines = [`# メモ一覧（${result.memos.length}件）`];

	for (const memo of result.memos) {
		lines.push("", "---", "", formatMemo(memo));
	}

	if (result.nextPageToken) {
		lines.push("", `次のページトークン: \`${result.nextPageToken}\``);
	}

	return lines.join("\n");
}

export function formatComment(comment: Comment): string {
	const lines = [
		`## ${comment.name}`,
		"",
		`- **作成日時**: ${comment.createTime}`,
		"",
		"### 本文",
		"",
		comment.content,
	];

	return lines.join("\n");
}

export function formatCommentList(comments: Comment[]): string {
	const lines = [`# コメント一覧（${comments.length}件）`];

	for (const comment of comments) {
		lines.push("", "---", "", formatComment(comment));
	}

	return lines.join("\n");
}
