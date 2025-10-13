# 依賴套件升級計劃

## 概述

本文檔記錄了 QuoteSwipe 專案中主要依賴套件的升級計劃。升級前需仔細評估破壞性變更的影響。

## 當前版本狀態

執行日期：2025-10-09

### 主要依賴（Production Dependencies）

| 套件名稱 | 當前版本 | 最新版本 | 版本差異 | 優先級 |
|---------|---------|---------|---------|--------|
| react | 18.3.1 | 19.2.0 | Major | 中 |
| react-dom | 18.3.1 | 19.2.0 | Major | 中 |
| firebase | 10.14.1 | 12.3.0 | Major | 中 |
| framer-motion | 10.18.0 | 12.23.22 | Major | 低 |

### 開發依賴（Dev Dependencies）

| 套件名稱 | 當前版本 | 最新版本 | 版本差異 | 優先級 |
|---------|---------|---------|---------|--------|
| vite | 4.5.14 | 7.1.9 | Major | 中 |
| tailwindcss | 3.4.17 | 4.1.14 | Major | 低 |
| @types/react | 18.3.24 | 19.2.2 | Major | 中 |
| @types/react-dom | 18.3.7 | 19.2.1 | Major | 中 |
| @typescript-eslint/eslint-plugin | 6.21.0 | 8.46.0 | Major | 低 |
| @typescript-eslint/parser | 6.21.0 | 8.46.0 | Major | 低 |
| eslint | 8.57.1 | 9.37.0 | Major | 低 |

---

## 升級策略

### 階段一：測試環境準備（立即執行）

**目標：確保當前版本穩定運作**

- [x] 建立 ESLint 配置
- [x] 確保建構流程正常
- [x] 驗證 PWA 功能正常
- [x] 記錄當前依賴版本

### 階段二：小版本更新（2 週內）

**目標：安全地更新 patch 和 minor 版本**

執行命令：
```bash
npm update
```

預期更新：
- typescript: 5.9.2 → 5.9.3
- eslint-plugin-react-refresh: 0.4.21 → 0.4.23
- @types/react: 18.3.24 → 18.3.26

**驗證步驟：**
1. 執行 `npm run build`
2. 執行 `npm run lint`
3. 測試主要功能：滑動、新增引言、登入
4. 檢查 PWA 安裝功能

### 階段三：React 18 → React 19（1-2 個月內）

**破壞性變更分析：**

React 19 主要變更：
- 新的 React Compiler（自動記憶化）
- Server Components 支援（不影響本專案）
- 新的 Hooks API
- 改進的錯誤處理

**升級步驟：**

1. 閱讀官方升級指南：
   - https://react.dev/blog/2024/04/25/react-19
   - https://react.dev/blog/2024/04/25/react-19-upgrade-guide

2. 更新相關套件：
```bash
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19
```

3. 測試重點：
   - Suspense 和 lazy loading 行為
   - Framer Motion 相容性
   - Context API 行為變更

4. 回退計劃：
```bash
npm install react@18.3.1 react-dom@18.3.1
npm install -D @types/react@18.3.24 @types/react-dom@18.3.7
```

### 階段四：Firebase 10 → Firebase 12（2-3 個月內）

**破壞性變更分析：**

Firebase 12 主要變更：
- 改進的 TypeScript 支援
- 新的 Firestore 查詢 API
- Auth 改進（可能影響登入流程）

**升級步驟：**

1. 閱讀 Firebase Release Notes：
   - https://firebase.google.com/support/release-notes/js

2. 建立測試分支：
```bash
git checkout -b upgrade/firebase-12
```

3. 更新套件：
```bash
npm install firebase@12
```

4. 測試重點：
   - Firestore 查詢（getInitialQuotes, getQuotesByMood）
   - 認證流程（Google 登入）
   - Firestore 規則相容性
   - Real-time listeners

5. 受影響檔案：
   - `src/lib/firebase.ts`
   - `src/lib/firebaseAuth.ts`
   - `src/lib/firestoreApi.ts`

### 階段五：Vite 4 → Vite 7（3-4 個月內）

**破壞性變更分析：**

Vite 7 主要變更：
- 改進的建構效能
- 新的插件 API
- 更好的 TypeScript 支援

**升級步驟：**

1. 閱讀 Vite Migration Guide：
   - https://vitejs.dev/guide/migration.html

2. 更新相關套件：
```bash
npm install -D vite@7
npm install -D @vitejs/plugin-react@5
npm install -D vite-plugin-pwa@1
```

3. 更新配置：
   - 檢查 `vite.config.ts` 配置變更
   - 驗證 PWA 插件相容性

4. 測試重點：
   - 開發伺服器啟動
   - HMR（熱模組替換）
   - 建構產出
   - PWA 生成

### 階段六：其他套件更新（彈性執行）

**Tailwind CSS 3 → 4：**
- 需要評估設計系統影響
- 可能需要調整樣式配置
- 優先級：低

**Framer Motion 10 → 12：**
- 主要是新功能，破壞性變更少
- 測試動畫和手勢功能
- 優先級：低

---

## 風險評估

### 高風險

- **Firebase 升級**：可能影響資料存取和認證
- **React 升級**：可能影響元件行為和 Hooks

### 中風險

- **Vite 升級**：可能影響建構流程
- **TypeScript 相關套件**：可能影響型別檢查

### 低風險

- **Framer Motion**：主要是動畫庫，影響範圍有限
- **Tailwind CSS**：主要是樣式，可透過設計系統隔離

---

## 升級前檢查清單

每次升級前必須確認：

- [ ] 建立 Git 分支
- [ ] 閱讀官方升級指南和 Release Notes
- [ ] 備份當前 package.json 和 package-lock.json
- [ ] 檢查專案是否有未提交的變更
- [ ] 確認有足夠時間進行測試
- [ ] 通知團隊成員（如適用）

## 升級後驗證清單

每次升級後必須測試：

- [ ] `npm run build` 成功
- [ ] `npm run lint` 無錯誤
- [ ] 開發伺服器正常啟動（`npm run dev`）
- [ ] 所有頁面正常顯示
- [ ] 滑動功能正常
- [ ] 登入/登出功能正常
- [ ] 新增/編輯/刪除引言功能正常
- [ ] PWA 安裝功能正常
- [ ] 離線功能正常
- [ ] 無 console 錯誤或警告
- [ ] 效能無明顯下降（使用 Lighthouse）

---

## 回退程序

如果升級後出現問題：

1. 還原 package.json 和 package-lock.json：
```bash
git checkout package.json package-lock.json
npm install
```

2. 清除快取：
```bash
rm -rf node_modules
rm -rf dist
npm install
```

3. 重新建構：
```bash
npm run build
```

4. 記錄問題並建立 Issue

---

## 維護建議

### 定期檢查（每月）

```bash
npm outdated
```

### 安全性更新（立即執行）

```bash
npm audit
npm audit fix
```

**注意：** 避免使用 `npm audit fix --force`，這可能導致破壞性變更。

### 依賴分析

定期檢查套件大小和依賴樹：

```bash
npm ls --depth=0
npx vite-bundle-visualizer
```

---

## 參考資源

- [React 19 Release](https://react.dev/blog/2024/04/25/react-19)
- [Firebase Release Notes](https://firebase.google.com/support/release-notes/js)
- [Vite Migration Guide](https://vitejs.dev/guide/migration.html)
- [npm Semantic Versioning](https://docs.npmjs.com/about-semantic-versioning)

---

**最後更新：** 2025-10-09
**負責人：** 開發團隊
