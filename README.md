# KAKU AI STUDIO v1

最初の実案件「加来広告事務所」を含む、自動検証・自動公開対応の開発環境。

## 起動
```bash
npm install
npm run dev
```

## 検証
```bash
npx playwright install
npm run check
```

## GitHub Pages
mainへPushすると、ビルド後に自動公開する。
GitHubの Settings → Pages → Source は GitHub Actions を選択。
