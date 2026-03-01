# ruru-memos-mcp

[Memos](https://www.usememos.com/) にアクセスする MCP サーバー。メモの作成・一覧表示、コメントの作成・一覧表示が可能。

## 必要な環境変数

| 変数名 | 説明 |
|--------|------|
| `MEMOS_BASE_URL` | Memos インスタンスの URL（例: `https://memos.example.com`） |
| `MEMOS_ACCESS_TOKEN` | Memos の Bearer トークン |

## MCP ツール

### メモ操作

| ツール名 | 説明 |
|----------|------|
| `create_memo` | メモを作成する |
| `list_memos` | メモの一覧を取得する（CEL 式フィルタ対応） |

### コメント操作

| ツール名 | 説明 |
|----------|------|
| `create_comment` | メモにコメントを追加する（対象メモの name は `list_memos` で事前に確認） |
| `list_comments` | メモのコメント一覧を取得する（対象メモの name は `list_memos` で事前に確認） |

## セットアップ

```bash
npm install
```

## 開発

```bash
# stdio モード
npm run dev

# HTTP モード
npm run dev -- --http
```

## ビルド

```bash
npm run build
```

## MCP 設定例

```json
{
  "mcpServers": {
    "memos": {
      "command": "npx",
      "args": ["ruru-memos-mcp"],
      "env": {
        "MEMOS_BASE_URL": "https://memos.example.com",
        "MEMOS_ACCESS_TOKEN": "your-token"
      }
    }
  }
}
```
