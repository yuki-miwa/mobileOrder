# MobileOrder Cafe (モック)

飲食店向けのモバイルオーダー・モックです。  
商品選択→カート→注文送信までを、テストデータで直感的に体験できます。

## 特長
- スタティックSPA（HTML/CSS/JS）でサクッと閲覧可能
- 直感的なUI、リッチなアニメーション
- カテゴリタブ、商品カード、カートドロワー、トースト通知
- 消費税（10%）計算、金額を常時表示
- 注文送信はモック（スピナー→注文番号・目安時間を表示）
- ローカルストレージでカート保持

## 使い方（ローカル）
1. ファイルをそのまま開いて動作します（外部API等未使用）。
2. 推奨: 簡易サーバ
   - Python: `python3 -m http.server 8080` → http://localhost:8080
   - VSCode拡張「Live Server」など

## デプロイ（GitHub Pages）
- `.github/workflows/pages.yml` 同梱。`main` へ push で自動公開。
- 初回は Actions 実行完了後に URL が発行されます。  
  例: `https://<GitHubユーザー名>.github.io/mobileOrder/`
- 進捗は「Actions」タブで確認できます。

## 構成
```
.
├─ index.html
├─ styles/
│  └─ style.css
├─ scripts/
│  └─ app.js
└─ .github/
   └─ workflows/
      └─ pages.yml
```

## 今後の拡張アイデア
- 実API連携（在庫、オーダー作成）
- クーポン/オプション（トッピング）機能
- 多言語対応
- PWA化（オフライン・ホーム画面追加）