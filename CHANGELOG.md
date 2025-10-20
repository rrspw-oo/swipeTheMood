# Change Log

## 2025/10/20 - CRITICAL FIX: Google 登入功能修復

### 問題診斷與修復
**嚴重問題：** Google 登入完全失效，popup 視窗顯示應用頁面而非 Google 登入畫面

**根本原因：**
- Firebase Hosting 從未部署
- Firebase Auth 依賴 `/__/auth/handler` 端點處理 OAuth 流程
- 該端點只有在部署 Firebase Hosting 後才會正常運作
- 未部署時，所有請求（包括 auth handler）都被 rewrite 規則重定向到 `index.html`

**解決方案：**
```bash
npm run build
firebase deploy --only hosting
```

### 程式碼變更
- 恢復 `src/services/firebase/auth.ts` 到原始簡單版本
- 移除所有 redirect flow 相關程式碼
- 清理 `src/contexts/AuthContext.tsx` 的 redirect 處理邏輯
- 移除未使用的 import (`useRef`)

### 文檔更新
**新增文檔：**
- `docs/TROUBLESHOOTING.md` - 完整的故障排除指南
  - Google 登入問題診斷
  - Firestore 連接問題
  - 環境變數問題
  - 歷史事件記錄

**更新文檔：**
- `FIREBASE_SETUP.md`
  - 新增 Step 7: Deploy Firebase Hosting (標註為 CRITICAL)
  - 詳細說明為何 Hosting 部署是必要的
  - 新增驗證步驟
  - 更新 Troubleshooting 區塊

- `docs/development-process.md`
  - 新增 "Firebase Hosting Deployment (CRITICAL)" 區塊
  - 更新部署流程 checklist
  - 新增 "Critical Lessons Learned" 章節
  - 記錄本次事件的完整時間線和教訓

### 部署資訊
- 成功部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe
- 建構時間：4.98s
- Bundle 大小：936.19 KiB

### 預防措施
1. Firebase Hosting 部署現已標註為 CRITICAL 步驟
2. 在所有相關文檔中明確說明其必要性
3. 建立完整的故障排除文檔避免類似問題
4. 記錄事件時間線供未來參考

### 教訓
**關鍵發現：** Firebase Hosting 不是可選功能，而是 Google Authentication 的**前置條件**，即使在本地開發環境也必須先部署才能測試登入功能。

---

## 2025/10/13 - Paradigm 卡片 Layout 統一與 UI 改進

### ParadigmCard Layout 統一
- "Private/Public Paradigm" 改用 tag 樣式顯示（與 Vitality cards 一致）
- 移除原本的灰色文字樣式，改用紫色圓角標籤
- 使用 `bg-[#B8A9D4]` 紫色背景 + 白色文字
- 置中顯示，移除上方邊框線

### 視覺一致性提升
- Paradigm 卡片底部 layout 與 Vitality 完全一致
- 統一使用紫色主題標籤樣式
- 更清晰的視覺層級和資訊呈現

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.33s
- Bundle 大小：915.50 KiB

---

## 2025/10/13 - Paradigm 新增 Description 與 Tags 系統

### AddParadigmModal 結構調整
- Description textarea 從 Foundation 內移至 Theory Name 下方
- Description 作為整體理論描述，顯示在卡片的 Theory 標題下方
- 說明文字：「This will appear below the theory name on the card」

### Tags 系統實作
- 新增完整的 Tags 輸入功能（類似 Quote/Vitality 模式）
- Tag 輸入框：輸入後按 Enter 新增到自訂 tags
- Quick select：顯示所有已使用的 tags，點擊切換選中狀態
- 選中狀態視覺化：Quick select 的 tag 被選中後顯示紫色背景（bg-[#B8A9D4]）
- 未選中狀態：灰色背景（bg-background-card）+ hover 效果

### 重要 UI 邏輯改進
- Quick select 中被選中的 tag 直接在該區域顯示選中狀態
- 下方只顯示「手動輸入」的 tags（customTags），不重複顯示 Quick select 的 tags
- 避免標籤重複出現，提升視覺清晰度
- 響應式顯示：手機 5 個 / 平板 7 個 / 桌面 11 個

### ParadigmCard 顯示優化
- Theory 標題下方顯示 Tags（如果有）
- Tags 使用紫色主題（bg-[#B8A9D4]）
- Tags 下方顯示 Description（整體理論描述）
- 視覺層級：Theory 標題 → Tags → Description → 分隔線 → Foundations

### 資料結構更新
- `CreateParadigmData` 新增 `description?: string` 欄位
- `CreateParadigmData` 新增 `moods: string[]` 欄位儲存 tags
- 提交時合併 selectedTags 和 customTags 到 moods 陣列
- 第一個 foundation 的 description 自動使用整體 description

### 編輯模式支援
- 編輯時自動分離 Quick select tags 和 custom tags
- Quick select tags 顯示選中狀態
- 正確載入並顯示整體 description

### 技術實作細節
- 修改 `types/index.ts` 更新 CreateParadigmData interface
- 修改 `AddParadigmModal/index.tsx` 新增完整 tags 系統
- 修改 `ParadigmCard/index.tsx` 顯示 tags 和 description
- 修改 `SwipeInterface/index.tsx` 處理 moods 欄位
- 使用 trackTagUsage 追蹤 tag 使用頻率

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.61s
- Bundle 大小：915.40 KiB
- 21 個檔案成功上傳

---

## 2025/10/13 - Paradigm 卡片結構優化與顯示邏輯改進

### Paradigm 卡片結構重新設計
- Theory 標題超過容器寬度時自動換行（break-words）
- Theory 下方顯示整體描述（使用第一個 foundation 的 description）
- Foundation 卡片收起時只顯示「View Examples」按鈕
- 展開後顯示 foundation 標題 + 範例列表
- 移除 foundation description 在卡片中的顯示（改為整體描述）

### 範例顯示格式優化
- 範例編號改為純數字格式：「1.」、「2.」、「3.」
- 移除「Example」文字前綴，更簡潔直觀
- 保持紫色數字高亮顯示（text-[#B8A9D4]）

### 視覺層級優化
- 理論名稱（H2）→ 理論描述（P）→ 分隔線 → Foundations
- Foundation 卡片預設收起，點擊展開查看詳細內容
- 展開動畫流暢，包含標題和範例的漸入效果
- 統一使用紫色主題（#B8A9D4）

### 使用流程改進
- **瀏覽模式**：查看理論名稱和整體描述
- **深入模式**：點擊 View Examples 展開查看具體基礎和範例
- 支援多個 foundations，每個可獨立展開/收起
- 更符合資訊層級的閱讀體驗

### 技術實作細節
- 修改 `ParadigmCard/index.tsx` 卡片結構
- 使用 `foundations[0].description` 作為整體描述
- Foundation title 和 examples 包裹在同一個 collapsible 區域
- 範例編號使用 `{exIndex + 1}.` 格式
- 保持 AnimatePresence 動畫效果

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.42s
- Bundle 大小：911.29 KiB
- 21 個檔案成功上傳

---

## 2025/10/13 - Paradigm 卡片樣式統一與編輯功能完善

### Paradigm 卡片視覺統一
- 卡片背景顏色與 Vitality 完全一致（bg-theme-cardBg, border-theme-cardBorder）
- 移除 foundation 前的紫色方塊（code 顯示），簡化視覺設計
- 編輯/刪除按鈕從右上角移至底部置中（與 Vitality 一致）
- 新增紫色漸層裝飾線（from-[#B8A9D4] to-[#9D8BB8]）

### 互動行為統一
- 桌面裝置：hover 顯示編輯/刪除按鈕，離開自動隱藏
- 手機裝置：長按 1 秒顯示按鈕，震動回饋，3 秒後自動隱藏
- 按鈕淡入/淡出動畫效果（opacity + scale）
- 相同的按鈕顏色配置（#D5C7EA / #E8E0F5）

### Paradigm 編輯功能實作
- 點擊編輯按鈕時正確載入既有內容
- AddParadigmModal 新增 `editingQuote` prop 支援編輯模式
- 編輯時自動填入 theory 名稱和所有 foundations
- 編輯時自動展開所有 foundation 顯示完整內容
- 動態標題顯示：「Add Paradigm」/ 「Edit Paradigm」
- 動態按鈕文字：「Save Paradigm」/ 「Update Paradigm」

### 資料更新邏輯
- `handleAddParadigm` 新增編輯模式分支處理
- 編輯時使用 `updateQuote` API 更新現有資料
- 同步更新 quotes 陣列和 randomQuotesCache
- 更新後正確顯示修改內容，無需重新載入

### 技術實作細節
- 修改 `AddParadigmModal/index.tsx` 支援編輯模式初始化
- 修改 `ParadigmCard/index.tsx` 統一按鈕 layout 和互動行為
- 修改 `SwipeInterface/index.tsx` 傳遞 editingQuote 並處理更新邏輯
- 使用 `useEffect` 監聽 `editingQuote` 變化初始化表單
- Foundation 簡化為直接顯示 title + description（移除 code 方塊）

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.27s
- Bundle 大小：911.11 KiB
- 同時部署 Firestore Rules 和 Hosting
- 21 個檔案成功上傳

---

## 2025/10/09 - Mood Tags 樣式優化為小標籤設計

### Mood Tags 樣式改進
- 將固定 Mood Tags 改為小標籤樣式（與 Author Quick Select 一致）
- 使用 `rounded-full`（圓角藥丸形狀）取代原本的 `rounded-xl`（圓角矩形）
- 使用 `px-3 py-1.5 text-xs`（小尺寸）取代原本的 `px-4 py-3 text-sm`（大尺寸）
- 使用 `flex flex-wrap gap-2`（彈性排列）取代原本的 `grid grid-cols-2`（2x2 網格）
- hover 動畫調整為 `scale: 1.05 / 0.95`（與 Author Quick Select 一致）

### UI/UX 一致性提升
- 固定 Mood Tags 和 Author Quick Select 現在使用相同的視覺語言
- 選中狀態：主色調背景（bg-primary-500）+ 白色文字
- 未選中狀態：卡片背景（bg-background-card）+ 灰色文字
- hover 效果：邊框變為主色調（border-primary-300）+ 淡粉背景（bg-primary-50）
- 保持 Framer Motion 動畫效果（hover/tap）

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.15s
- Bundle 大小：888.42 KiB

---

## 2025/10/09 - Quote Mode 恢復固定 Mood Tags 並新增自訂標籤功能

### Quote Mode 雙標籤系統
- **恢復固定 Mood Tags**：Excited, Innovation, Not My Day, Reflection
- **新增自訂標籤輸入**：使用者可在固定 Mood Tags 下方輸入自訂標籤
- Quote Mode 現在支援：固定 Mood Tags + 自訂標籤（兩者可同時使用）
- Vitality Mode 維持：只有自訂標籤輸入

### Tags 系統架構
- **Quote Mode**：
  - 固定 Mood Tags（2x2 網格布局，可點擊選取/取消）
  - 自訂標籤輸入（分隔線下方，按 Enter 新增）
  - 驗證：至少需要一個固定 Mood Tag 或自訂標籤
  - 儲存：合併固定 Mood Tags 和自訂標籤到 moods 陣列

- **Vitality Mode**：
  - 只有自訂標籤輸入（按 Enter 新增）
  - 驗證：至少需要一個自訂標籤
  - 儲存：只使用自訂標籤

### UI/UX 改進
- 輸入框文字顏色調整為 `text-gray-700`（可讀性更好）
- Quote Mode 標籤分為兩個區域：固定 Mood Tags 區 + 自訂標籤區
- 使用分隔線（border-t）區隔兩個區域
- 自訂標籤區加入說明文字："Add custom tags:"
- 保持 Framer Motion 動畫效果（hover/tap/新增/移除）

### 資料處理邏輯
- **編輯模式初始化**：
  - Quote Mode：分離固定 Mood Tags 和自訂標籤
  - Vitality Mode：所有標籤都視為自訂標籤
- **提交邏輯**：
  - Quote Mode：合併 `formData.moods` 和 `customTags`
  - Vitality Mode：只使用 `customTags`
- **驗證邏輯**：
  - Quote Mode：檢查 `formData.moods.length === 0 && customTags.length === 0`
  - Vitality Mode：檢查 `customTags.length === 0`

### 技術實作細節
- 恢復 `moods` 常數陣列定義固定 Mood Tags
- 恢復 `handleMoodToggle` 函式處理固定 Mood Tags 的點擊
- 重新引入 `MoodType` 型別定義
- 更新表單初始化邏輯以分離固定和自訂標籤
- 更新驗證和提交邏輯以支援雙標籤系統

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.11s
- Bundle 大小：888.40 KiB

---

## 2025/10/09 - AddQuoteModal 雙模式系統與智慧作者輸入

### AddQuoteModal 雙模式系統（Quote / Vitality）
- 新增 Quote 和 Vitality 雙模式切換功能
- 根據 ViewMode（default / alternative）自動切換模式
- Quote Mode 和 Vitality Mode：兩者都使用自由輸入的 Tags 系統（已統一）
- 文案客製化：標題、說明文字、欄位標籤隨模式變化

### Tags 自由輸入系統（兩種模式通用）
- 使用者可按 **Enter** 鍵新增自訂標籤
- 標籤以小藥丸形式顯示
- 點擊標籤上的 X 按鈕可刪除
- 支援 Framer Motion 動畫效果（新增/移除）
- 至少需要一個標籤才能儲存

### Author Quick Select 響應式顯示
- **手機版** (< 768px)：顯示 **5 個**最近作者
- **平板版** (768px - 1023px)：顯示 **7 個**最近作者
- **桌面版** (≥ 1024px)：顯示 **11 個**最近作者
- 動態偵測視窗大小變化並即時調整顯示數量
- 作者標籤採用 Framer Motion 動畫（hover / tap）

### Author Name 智慧建議功能
- 輸入時即時過濾匹配的作者名稱
- 下拉選單最多顯示 7 個建議
- 點擊建議自動填入並關閉選單
- 點擊外部區域關閉建議選單
- 輸入框獲得焦點時自動顯示建議

### 資料庫架構升級
- **新增 type 欄位**：區分 `quote` 和 `vitality` 兩種類型
- 更新 `Quote` interface 支援 `type?: 'quote' | 'vitality'`
- 新增 `CreateQuoteData` interface 統一表單資料結構
- Firestore 安全規則新增 type 欄位驗證
- 支援 moods 欄位為 `MoodType[]` 或 `string[]`（自訂標籤）

### 技術實作細節
- 使用 `useRef` 管理 Author Input 和 Suggestions Dropdown 的 ref
- 使用 `useEffect` 監聽視窗 resize 事件動態調整顯示數量
- 使用 `useEffect` 監聽 mousedown 事件關閉建議選單
- Tag 輸入使用 `onKeyPress` 事件監聽 Enter 鍵
- Author 輸入使用 `onChange` 事件即時過濾建議
- 統一使用 CreateQuoteData 類型避免型別衝突

### 部署資訊
- 成功建構生產版本
- 同時部署 Hosting 和 Firestore Rules
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.25s
- Bundle 大小：886.94 KiB

---

## 2025/10/09 - 作者快速選取功能與資料庫回退機制

### 新增作者快速選取功能
- 在 AddQuoteModal 新增作者標籤顯示功能
- 自動從現有引言中提取所有作者名稱
- 點擊作者標籤可快速填入作者輸入欄位
- 標籤採用 Framer Motion 動畫效果（hover/tap）
- 支援選中狀態視覺回饋（高亮顯示）

### Firestore 安全規則修復
- 修正 `firestore.rules` 權限配置問題
- 將 `allow read` 拆分為 `allow list` 和 `allow get`
- `allow list: if true` - 允許查詢操作（getDocs）
- `allow get` - 針對單一文件讀取進行權限檢查
- 解決「Missing or insufficient permissions」錯誤

### 資料庫回退機制優化
- 修改 `getInitialQuotes()` - 當 Firestore 回傳空陣列時自動使用 mock data
- 修改 `getQuotesByMood()` - 心情篩選模式也支援空資料庫回退
- 修改 `getAllAuthors()` - 作者列表空時顯示預設作者
- 確保空資料庫時仍可正常瀏覽 20 張預設引言卡片
- 預設引言包含：Charlie Munger, Steve Jobs, Elon Musk, Peter Thiel 等名人名言

### 技術實作細節
- 新增 `getAllAuthors()` 函式至 `firestore.ts`
- 使用 Set 資料結構自動去重作者名稱
- 作者列表按字母順序排序
- AddQuoteModal 在開啟時自動載入作者列表
- 使用 `useEffect` 監聽 modal 開啟狀態和使用者 ID

### 部署資訊
- 成功建構生產版本
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)
- 建構時間：4.33s
- Bundle 大小：883.31 KiB

---

## 2025/10/09 - 專案架構重組與文件結構優化

### 資料夾結構重組
- 將所有元件按功能分類重新組織
- 建立清晰的三層架構：`app/`, `pages/`, `features/`, `components/`
- 統一使用 `index.tsx` 命名提升 import 簡潔性
- 整合 Firebase 服務層至 `services/firebase/`

### 新的資料夾結構
```
src/
├── app/                    # 應用進入點
├── pages/                  # 頁面層元件
│   └── SwipeInterface/    # 主頁面與專用元件
├── features/               # 功能模組
│   ├── mood/              # 心情選擇功能
│   ├── user/              # 使用者相關功能
│   └── theme/             # 主題切換功能
├── components/            # 共用 UI 元件
├── services/              # 後端服務層
│   └── firebase/          # Firebase 整合服務
├── contexts/              # 全域 Context
├── types/                 # 型別定義
└── utils/                 # 工具函式
```

### 服務層整合
- `lib/firebase.ts` → `services/firebase/config.ts`
- `lib/firebaseAuth.ts` → `services/firebase/auth.ts`
- `lib/firestoreApi.ts` → `services/firebase/firestore.ts`
- `services/firebaseApi.ts` → `services/firebase/api.ts`

### Import 路徑優化
- 更新所有元件的 import 路徑
- 建立清晰的路徑規範
- 頁面元件：`../../types`, `../../services/firebase/api`
- 功能元件：`../../../types`, `../../../services/firebase/api`
- 共用元件：`../../types`, `../[Component]`

### 文檔更新
- 完整重寫 `docs/frontend/components.md` 反映新架構
- 完整重寫 `docs/frontend/services.md` 包含服務層說明
- 新增 import 路徑規範和最佳實踐
- 更新元件依賴關係圖

### 部署成功
- 成功建構生產版本（無 TypeScript 錯誤）
- 修正 `index.html` 的 main.tsx 路徑
- 部署至 Firebase Hosting: https://quote-swipe.web.app
- Firebase 專案：quote-swipe (wpsrrr@gmail.com)

### 技術改進
- 所有功能正常運作（Random/Mood/Vitality/Paradigm 模式）
- 無破壞性變更，保持所有現有功能
- 建構時間：4.28s
- PWA 功能完整保留
- 20 個檔案成功上傳至 Firebase

---

## 2024/09/24 - 品牌圖示更新與PWA優化

### 應用程式圖示更新
- 採用自訂設計的 `swipeQ.svg` 作為應用程式圖示
- 更新瀏覽器頁籤圖示（favicon）使用新的 SVG 圖示
- 配置 PWA 應用程式圖示支援「加入主畫面」功能
- 同時支援 `any` 和 `maskable` 圖示類型以符合不同平台需求

### PWA 功能強化
- 更新 PWA manifest 描述為雙語（中英文）
- 優化 PWA 圖示配置支援多種尺寸（192x192, 512x512）
- 確保應用程式可完美加入手機主畫面
- **官方術語：Add to Home Screen / Install App**

### 技術實作細節
- 新增 `public/swipeQ.svg` 圖示檔案
- 修改 `index.html` favicon 連結至新圖示
- 更新 `vite.config.ts` PWA 配置支援 SVG 圖示
- 建構系統自動包含圖示至最終部署版本

---

## 2024/09/24 - 性能優化與AddQuoteModal英文化

### 載入性能優化
- 移除 `firebaseApi.ts` 中所有人工延遲（500ms, 300ms）
- 當 Firestore 不可用時立即回退到本地數據
- 大幅提升應用載入速度和響應性
- 優化用戶體驗減少等待時間

### AddQuoteModal 介面改進
- 將所有介面文字轉換為英文
- 簡化心情標籤設計，移除描述和圖示
- 採用簡潔的 2x2 網格布局顯示心情選項
- 統一按鈕和表單的英文標籤

### 具體技術變更
- 修改 `getInitialQuotes()` 移除 `setTimeout(500)`
- 修改 `getQuotesByMood()` 移除 `setTimeout(300)`
- 修改 `getQuotesByAuthor()` 移除 `setTimeout(300)`
- 修改 `addQuote()` 移除 `setTimeout(500)`
- 重構 AddQuoteModal 心情選擇 UI 為英文網格設計
- 更新所有錯誤訊息和表單驗證文字為英文

---

## 2024/09/24 - 專案文檔化與開發流程建立

### 新增文檔結構
- 建立完整的 `docs/` 資料夾結構
- 新增前端文檔：`components.md`, `styles.md`, `types.md`, `services.md`
- 新增後端文檔：`api.md`, `database.md`, `firebase.md`
- 新增開發流程文檔：`development-process.md`, `deployment.md`
- 建立 `backend/` 資料夾準備未來擴展

### 更新開發規範
- 在 CLAUDE.md 中新增強制性開發流程
- 要求修改前必須閱讀相關文檔
- 建立「不要改一個功能壞掉一個功能」的測試原則
- 要求同步更新程式碼和文檔

### 建立變更記錄系統
- 新增 CHANGELOG.md 追蹤所有專案變更
- 採用日期格式：yyyy/mm/dd
- 記錄詳細的功能變更和改進

---

## 2024/09/24 - 滑動動畫最佳化

### 動畫效果改進
- 修正卡片滑動時的抖動問題
- 改為卡片直接滑出螢幕的 Tinder 式效果
- 新卡片直接在原位淡入，移除從旁邊滑入的動畫
- 優化彈回動畫使用 spring 物理效果

### 具體變更
- 修改 `SwipeInterface.tsx` 中的 `handleDragEnd` 函式
- 移除 `controls.set({ x: -300 })` 的強硬位置跳躍
- 新卡片改用 `opacity: 0 → 1` 淡入效果
- 移除 `QuoteCard.tsx` 中的 `whileHover` 和 `whileTap` 縮放效果

---

## 2024/09/24 - Mood Tab 使用流程優化

### 使用者體驗改進
- 點選 Mood Tab 時自動開啟心情選擇器
- 移除額外的「Select Mood」按鈕步驟
- 新增「Change Mood」按鈕支援重新選擇心情
- 在未選擇心情時顯示提示訊息

### 流程變更
- **舊流程：** Mood Tab → Select Mood 按鈕 → 選擇心情 → 開始滑卡
- **新流程：** Mood Tab → 直接顯示心情選項 → 開始滑卡 → 可返回重選

### 程式變更
- 修改 `handleTabChange` 在切換到 mood 時自動開啟選擇器
- 更新主介面顯示邏輯處理未選心情的狀態
- 調整 Change Mood 按鈕樣式和位置

---

## 2024/09/24 - 架構重構與功能完善

### 新增雙 Tab 導航系統
- 實作 `TabNavigation.tsx` 元件
- 支援 Random 和 Mood 兩種模式切換
- 平滑的滑動指示器動畫

### 重新設計心情系統
- 更新心情選項：`excited`, `innovation`, `not-my-day`, `reflection`
- 每個心情都有對應的描述和視覺設計
- 移除所有 emoji 使用，改用文字和字母縮寫

### 引言資料庫更新
- 替換為 20 則知名思想家引言
- 包含 Charlie Munger, Steve Jobs, Elon Musk, Peter Thiel 等
- 為 `excited` 心情特別新增謙虛主題引言

---

## 2024/09/24 - 專案初始化

### 技術架構建立
- 使用 React 18 + TypeScript 建立專案
- 整合 Tailwind CSS 進行樣式管理
- 設定 Vite 作為建構工具
- 加入 Framer Motion 處理動畫效果

### PWA 功能設定
- 配置 PWA manifest.json
- 設定 service worker 支援離線使用
- 支援加入手機主畫面功能
- 使用粉紅色主題 (#F7AAD6)

### 核心元件實作
- `QuoteCard.tsx` - 引言卡片顯示
- `SwipeInterface.tsx` - 主要滑動介面
- `MoodSelector.tsx` - 心情選擇器
- `firebaseApi.ts` - 資料服務層 (初期為 mock data)

### 基礎滑動功能
- 支援左右滑動切換引言
- 歷史記錄功能可回到上一張
- 載入動畫和錯誤處理
- 響應式設計適配手機螢幕

---

## 即將推出的功能

### 計劃中的新功能
- 使用者可自行新增引言卡片
- 按作者分類瀏覽引言功能
- 作者標籤點擊互動
- Firebase 後端整合
- 使用者認證系統

### 技術改進計劃
- 效能監控和分析
- 單元測試覆蓋率
- 國際化支援
- 深色主題選項