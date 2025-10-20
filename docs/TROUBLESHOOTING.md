# QuoteSwipe 故障排除指南

本文件記錄常見問題及解決方案，幫助開發者快速診斷和修復問題。

---

## 目錄

- [Google 登入問題](#google-登入問題)
- [Firestore 連接問題](#firestore-連接問題)
- [環境變數問題](#環境變數問題)
- [建構和部署問題](#建構和部署問題)
- [歷史事件記錄](#歷史事件記錄)

---

## Google 登入問題

### 問題 1: 登入彈窗顯示應用頁面而非 Google 登入頁面

**症狀:**
- 點擊登入按鈕
- 彈出視窗打開，但顯示的是應用的首頁
- 視窗立即關閉，Console 顯示 `auth/popup-closed-by-user` 錯誤

**根本原因:**
Firebase Hosting 未部署。Firebase Authentication 依賴 `https://your-project.firebaseapp.com/__/auth/handler` 端點來處理 OAuth 流程，這個端點只有在部署 Firebase Hosting 後才會正常運作。

**診斷步驟:**

1. 檢查 popup URL (使用 debug-auth.html 或瀏覽器開發工具):
   ```javascript
   // 應該看到這樣的 URL
   https://quote-swipe.firebaseapp.com/__/auth/handler?apiKey=...&authType=signInViaPopup...
   ```

2. 手動訪問 auth handler:
   ```
   https://YOUR-PROJECT.firebaseapp.com/__/auth/handler
   ```
   - 如果顯示你的應用首頁 → Hosting 未正確部署
   - 如果顯示 Firebase 錯誤頁面或空白頁 → 正常

**解決方案:**

```bash
# 1. 建構應用
npm run build

# 2. 部署到 Firebase Hosting
firebase deploy --only hosting

# 3. 驗證部署
# 訪問 https://your-project.web.app 確認部署成功
```

**預防措施:**
- 在新專案設定時，必須先部署 Hosting 才能測試登入
- 在 FIREBASE_SETUP.md 中已標註為 CRITICAL 步驟
- 建議在 CI/CD 流程中自動部署

---

### 問題 2: auth/unauthorized-domain 錯誤

**症狀:**
Console 顯示 `Firebase: Error (auth/unauthorized-domain)`

**原因:**
開發域名未在 Firebase Console 的授權域名清單中

**解決方案:**

1. 前往 [Firebase Console → Authentication → Settings](https://console.firebase.google.com/project/quote-swipe/authentication/settings)
2. 找到 "Authorized domains" 區塊
3. 確認包含以下域名:
   - `localhost`
   - `your-project.firebaseapp.com`
   - `your-project.web.app`
4. 如缺少，點擊 "Add domain" 新增

---

### 問題 3: Google OAuth 客戶端 ID 配置錯誤

**症狀:**
- Popup 打開但內容不正確
- 或顯示 OAuth consent screen 錯誤

**解決方案:**

1. 前往 [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials?project=quote-swipe)

2. 找到 OAuth 2.0 客戶端 ID，確認以下設定:

   **已授權的 JavaScript 來源:**
   ```
   http://localhost
   http://localhost:5173
   https://quote-swipe.firebaseapp.com
   https://quote-swipe.web.app
   ```

   **已授權的重定向 URI:**
   ```
   https://quote-swipe.firebaseapp.com/__/auth/handler
   ```

3. 儲存變更後等待 5-10 分鐘讓變更生效

---

## Firestore 連接問題

### 問題 1: Firestore returned no quotes, using mock data

**症狀:**
Console 持續顯示 `api.ts:225 Firestore returned no quotes, using mock data`

**可能原因:**

1. **資料庫是空的** (最常見)
   - 解決方案: 執行 seed 函式或手動新增引言

2. **安全規則阻擋存取**
   - 檢查 `firestore.rules` 是否正確部署
   - 驗證命令: `firebase deploy --only firestore:rules`

3. **網路連接問題**
   - 檢查瀏覽器 Console 的 Network 分頁
   - 確認沒有被防火牆或 VPN 阻擋

**初始化資料庫:**

```javascript
// 在瀏覽器 Console 執行
await import('./src/utils/seedData').then(m => m.initializeDatabase())
```

---

### 問題 2: FirebaseError: Missing or insufficient permissions

**症狀:**
嘗試讀寫資料時出現權限錯誤

**解決方案:**

1. 確認 Firestore 規則已部署:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. 檢查規則檔案 `firestore.rules`:
   ```javascript
   // 允許所有人 list (查詢)
   allow list: if true;

   // 但 get (單一文件) 需要權限檢查
   allow get: if resource.data.isPublic == true
     || resource.data.userId == 'system'
     || (request.auth != null && resource.data.userId == request.auth.uid);
   ```

3. 確認使用者已登入 (如果嘗試存取私人資料)

---

## 環境變數問題

### 問題 1: import.meta.env 回傳 undefined

**症狀:**
```javascript
console.log(import.meta.env.VITE_FIREBASE_API_KEY); // undefined
```

**解決方案:**

1. 確認檔案名稱正確:
   - 應為 `.env.local` (注意開頭的點)
   - 不是 `.env` 或 `env.local`

2. 確認變數名稱前綴:
   - 必須以 `VITE_` 開頭
   - 例如: `VITE_FIREBASE_API_KEY`

3. 重啟開發伺服器:
   ```bash
   # 停止當前伺服器 (Ctrl+C)
   npm run dev
   ```

4. 檢查 `.env.local` 檔案格式:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=quote-swipe.firebaseapp.com
   # 不要有多餘的引號或空格
   ```

---

## 建構和部署問題

### 問題 1: TypeScript 編譯錯誤

**常見錯誤:**
```
error TS6133: 'useRef' is declared but its value is never read.
```

**解決方案:**
移除未使用的 import:
```typescript
// 錯誤
import { useState, useRef } from 'react';

// 正確 (如果沒用到 useRef)
import { useState } from 'react';
```

---

### 問題 2: Firebase deploy 失敗

**症狀:**
```bash
Error: HTTP Error: 403, The caller does not have permission
```

**解決方案:**

1. 重新登入 Firebase CLI:
   ```bash
   firebase logout
   firebase login
   ```

2. 確認已選擇正確專案:
   ```bash
   firebase use quote-swipe
   ```

3. 檢查 IAM 權限 (需要 Firebase Admin 或 Owner 角色)

---

## 歷史事件記錄

### 事件 #1: Google 登入完全失效 (2025-10-20)

**時間線:**
- 14:00 - 發現 Google 登入彈窗顯示應用頁面而非登入頁面
- 14:05 - 確認 Firebase 和 Google Auth 配置正確
- 14:10 - 嘗試修改 auth.ts，加入 redirect flow 作為回退
- 14:15 - 問題惡化，完全無法登入
- 14:20 - 建立 debug-auth.html 診斷工具
- 14:25 - 發現 popup URL 是 `https://quote-swipe.firebaseapp.com/__/auth/handler`
- 14:30 - 確認該 URL 返回應用首頁而非 OAuth handler
- 14:35 - 診斷出根本原因：Firebase Hosting 未部署
- 14:40 - 執行 `npm run build && firebase deploy --only hosting`
- 14:45 - 登入功能恢復正常

**根本原因:**
Firebase Authentication 的 OAuth 流程依賴 Hosting 上的 `/__/auth/handler` 端點。由於從未部署過 Firebase Hosting，這個端點不存在，導致 Firebase 的 rewrite 規則將所有請求（包括 auth handler）重定向到 `index.html`。

**教訓:**
1. Firebase Hosting 部署是 Google Auth 的**前置條件**，不是可選步驟
2. 即使在本地開發，也必須先部署 Hosting 才能測試登入
3. 應在設定文檔中明確標註為 CRITICAL 步驟

**預防措施:**
1. 更新 FIREBASE_SETUP.md，新增 Step 7 並標註為 CRITICAL
2. 在 Troubleshooting 區塊加入此問題的診斷和解決方案
3. 建立本文件 (TROUBLESHOOTING.md) 記錄未來問題
4. 考慮在專案 README 加入 Quick Start checklist

**相關檔案變更:**
- `FIREBASE_SETUP.md` - 新增 Step 7: Deploy Firebase Hosting
- `docs/TROUBLESHOOTING.md` - 新增本文件
- `src/services/firebase/auth.ts` - 恢復到原始簡單版本
- `src/contexts/AuthContext.tsx` - 移除 redirect 相關程式碼

---

## 診斷工具

### 快速檢查清單

登入問題診斷:
```bash
# 1. 檢查 Firebase Hosting 部署狀態
firebase hosting:channel:list

# 2. 確認環境變數
cat .env.local | grep VITE_FIREBASE

# 3. 測試 auth handler
curl -I https://quote-swipe.firebaseapp.com/__/auth/handler

# 4. 檢查 Firestore 規則
firebase firestore:rules:list
```

### 常用除錯命令

```bash
# 清除本地快取
rm -rf node_modules/.vite
rm -rf dist

# 完整重建
npm install
npm run build

# 查看 Firebase 專案資訊
firebase projects:list
firebase use

# 檢查部署歷史
firebase hosting:channel:list
```

---

## 回報新問題

如果遇到本文件未涵蓋的問題:

1. 記錄完整的錯誤訊息和堆疊追蹤
2. 記錄重現步驟
3. 記錄診斷過程和嘗試的解決方案
4. 更新本文件，加入新的問題和解決方案
5. 更新相關技術文檔

---

**文件版本:** 1.0.0
**最後更新:** 2025-10-20
**維護者:** 開發團隊
