# QuoteSwipe 文檔索引

本資料夾包含專案的完整技術文檔。

## 文檔結構

### 快速開始
- [`../QUICK_START.md`](../QUICK_START.md) - 新專案設定快速指南
- [`../FIREBASE_SETUP.md`](../FIREBASE_SETUP.md) - Firebase 完整設定指南

### 開發指南
- [`development-process.md`](development-process.md) - 開發流程和編碼規範
- [`../CLAUDE.md`](../CLAUDE.md) - AI 程式碼撰寫規範

### 技術文檔
- [`frontend/`](frontend/) - 前端架構和元件文檔
  - `components.md` - React 元件說明
  - `styles.md` - 樣式系統和設計規範
  - `types.md` - TypeScript 型別定義
  - `services.md` - Firebase 服務層說明
- [`backend/`](backend/) - 後端和資料庫文檔

### 故障排除
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) - 常見問題診斷和解決方案

### 變更記錄
- [`../CHANGELOG.md`](../CHANGELOG.md) - 專案變更歷史

---

## 重要提醒

### Firebase Hosting 是 Google Auth 的必要條件

Google 登入功能**必須**先部署 Firebase Hosting 才能正常運作：

```bash
npm run build
firebase deploy --only hosting
```

詳見：
- [FIREBASE_SETUP.md - Step 7](../FIREBASE_SETUP.md)
- [TROUBLESHOOTING.md - Google 登入問題](TROUBLESHOOTING.md)

---

## 開發前必讀

1. **QUICK_START.md** - 了解基本設定流程
2. **CLAUDE.md** - 遵循 AI 編碼規範
3. **development-process.md** - 理解開發工作流程
4. **相關功能文檔** - 在 `frontend/` 或 `backend/` 找到對應文檔

---

## 遇到問題時

1. 檢查 [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
2. 搜尋 [`CHANGELOG.md`](../CHANGELOG.md) 是否有類似問題
3. 查看相關技術文檔
4. 更新文檔記錄新問題和解決方案

---

**維護者：** 開發團隊  
**最後更新：** 2025-10-20
