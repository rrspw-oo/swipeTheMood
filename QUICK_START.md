# QuoteSwipe 快速開始指南

## 新專案設定 Checklist

### 1. 環境設定
```bash
npm install
```

### 2. Firebase 配置
1. 複製 `.env.example` 到 `.env.local`
2. 填入 Firebase 配置資訊
3. 確認所有變數名稱以 `VITE_` 開頭

### 3. Firebase 部署（必要步驟）

**WARNING:** 必須先完成此步驟才能測試 Google 登入！

```bash
# 登入 Firebase
firebase login

# 初始化 Hosting (只需一次)
firebase init hosting
# - Public directory: dist
# - Single-page app: Yes

# 部署 Firestore 規則
firebase deploy --only firestore:rules

# 建構並部署應用 (CRITICAL!)
npm run build
firebase deploy --only hosting
```

### 4. 驗證部署

訪問以下 URL 確認部署成功：
- 應用：https://quote-swipe.web.app
- Auth Handler：https://quote-swipe.firebaseapp.com/__/auth/handler
  （應該顯示 Firebase 頁面，不是你的應用）

### 5. 開始開發

```bash
npm run dev
# 訪問 http://localhost:5173
```

---

## 常見問題

### Google 登入不工作？

**症狀：** Popup 顯示應用頁面而非 Google 登入

**解決：**
```bash
npm run build
firebase deploy --only hosting
```

詳見：`docs/TROUBLESHOOTING.md`

### Firestore 回傳空資料？

**症狀：** Console 顯示 "using mock data"

**原因：** 資料庫是空的

**解決：** 在瀏覽器 Console 執行
```javascript
await import('./src/utils/seedData').then(m => m.initializeDatabase())
```

---

## 重要文檔

- `FIREBASE_SETUP.md` - 完整 Firebase 設定指南
- `docs/TROUBLESHOOTING.md` - 故障排除指南
- `docs/development-process.md` - 開發流程和規範
- `CHANGELOG.md` - 變更記錄
- `CLAUDE.md` - AI 程式碼撰寫規範

---

## 部署流程

### 開發環境
```bash
npm run dev
```

### 生產環境
```bash
# 1. 建構
npm run build

# 2. 測試建構結果
npm run preview

# 3. 部署
firebase deploy --only hosting

# 或部署所有內容
firebase deploy
```

---

## 關鍵提醒

1. **Firebase Hosting 必須部署才能使用 Google 登入**
   - 即使在本地開發也需要
   - 這不是可選步驟

2. **修改程式碼前先讀文檔**
   - 檢查 `docs/` 資料夾的相關文檔
   - 參考 `CLAUDE.md` 的開發規範

3. **同步更新文檔**
   - 修改功能時更新對應的 .md 檔案
   - 更新 `CHANGELOG.md`

4. **測試所有功能**
   - 確保修改不會破壞現有功能
   - Random、Mood、Vitality、Paradigm 模式都要測試

---

**最後更新：** 2025-10-20
