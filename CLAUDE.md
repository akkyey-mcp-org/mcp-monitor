# mcp-monitor: VS Code 拡張機能開発・保守ガイド (CLAUDE.md)

本ファイルは、`mcp-monitor` のシステム構成、開発フロー、および保守ルールを定義する **「プロジェクト固有の SSOT (Single Source of Truth)」** です。共通ルールは `GEMINI.md` を参照してください。

## 1. システム俯瞰 (System Map)

### 1.1 ディレクトリ構成
- `src/`: TypeScript ソースコード。
  - `extension.ts`: 拡張機能のエントリーポイント。
  - `mcp-provider.ts`: MCPサーバーの状態監視ロジック。
- `media/`: Webview UI 資産（HTML, CSS, JS）。
- `resources/`: アイコンや画像などのリソース。
- `.gemini/`: 共通ルールおよびスキル（サブモジュール）。

### 1.2 実行フロー (Development Flow)
1. **Build**: `npm run compile` で TypeScript を JavaScript にコンパイル。
2. **Debug**: `F5` キーで VS Code 拡張ホストを起動してデバッグ。
3. **UI Preview**: Webview は開発中に `index.html` を直接ブラウザで開いてレイアウトを確認可能。

## 2. 開発・運用ルール

### 2.1 強制ルール: シェル操作
- すべてのシェルコマンド実行は、原則として **`mcp_safe-shell-server_execute_safe`** を通じて行うこと。
- コマンド注入を防ぐため、文字列連結ではなく引数リスト形式を推奨。

### 2.2 デザイン・アイデンティティ (Design Principles)
- **Aesthetic First**: Antigravity Quota のようなプレミアムなデザインを維持する。
- **Non-Intrusive**: エディタの標準操作を邪魔せず、かつ必要な情報（MCP 稼働状況）を一目で把握できること。

### 2.3 依存関係の管理
- 拡張機能の軽量化のため、不要な依存関係の追加は避ける。
- 外部プロセスの起動が必要な場合は、`child_process` ではなく VS Code API の `Task` 経由を検討する。

---
※ 本ファイルは、プロジェクトの進化に合わせて随時更新されます。
