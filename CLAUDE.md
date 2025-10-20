# QuoteSwipe App

## 核心價值 (Core Values)

這個 App 是一個**個人化的引言提醒與靈感激發工具**，**不提供**任何形式的心理健康建議、支持或治療。

## 設計原則 (Design Principles)

### 色彩系統 (Color System)

- **主色調 (Primary):** #F7AAD6 (粉紅主色)
- **次要色調 (Secondary):** #FFC0E6 (柔和粉紅)
- **輔助色調 (Accent):** #FFD6EF (淡粉紅)

### 灰階系統 (Grayscale System)

- **背景色 (Background):** #f8fafc (最淡灰)
- **卡片背景 (Card Background):** #f1f5f9 (淺灰)
- **邊框色 (Border):** #e2e8f0 (中灰)
- **文字輔助 (Text Secondary):** #cbd5e1 (深灰)

### 功能色彩 (Functional Colors)

- **表面色 (Surface):** #f8f8f8 (邊框色)
- **分隔線 (Divider):** #f0f0f0 (分隔線)
- **禁用狀態 (Disabled):** #e8e8e8 (禁用狀態)

## 技術規格 (Technical Specifications)

### 開發環境

- **框架:** React 18 + TypeScript
- **建構工具:** Vite
- **樣式框架:** Tailwind CSS
- **動畫庫:** Framer Motion
- **後端服務:** Firebase Firestore
- **PWA 支援:** 必須支援離線使用和加入主畫面

### 檔案結構規範

```
src/
├── app/                    # 應用進入點
│   ├── App.tsx
│   └── main.tsx
│
├── pages/                  # 頁面層元件
│   └── SwipeInterface/    # 主頁面
│       ├── index.tsx
│       └── components/     # 頁面專用元件
│           ├── QuoteCard/
│           └── EmptyCard/
│
├── features/               # 功能模組
│   ├── mood/              # 心情選擇功能
│   │   ├── MoodGrid/
│   │   └── MoodSelector/
│   ├── user/              # 使用者相關功能
│   │   ├── UserProfile/
│   │   ├── UserCardsModal/
│   │   ├── AddQuoteModal/
│   │   └── LoginModal/
│   └── theme/             # 主題切換功能
│       └── ThemeToggle/
│
├── components/            # 共用 UI 元件
│   ├── TabNavigation/
│   ├── ViewModeToggle/
│   └── HexagonIcon/
│
├── services/              # 後端服務層
│   └── firebase/
│       ├── config.ts      # Firebase 配置
│       ├── auth.ts        # 認證服務
│       ├── firestore.ts   # 資料庫操作
│       └── api.ts         # 高階 API
│
├── contexts/              # 全域 Context
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── types/                 # 型別定義
│   └── index.ts
│
├── utils/                 # 工具函式
│   └── seedData.ts
│
└── styles/                # 全域樣式
    └── globals.css
```

### 檔案組織原則

1. **頁面元件** (`pages/SwipeInterface/components/`): 僅供該頁面使用
2. **功能模組** (`features/`): 按功能分類（mood, user, theme）
3. **共用元件** (`components/`): 可跨頁面重用
4. **統一命名**: 每個元件資料夾都使用 `index.tsx`
5. **服務整合**: Firebase 相關服務統一在 `services/firebase/`

### Import 路徑規範

**從頁面元件 (SwipeInterface):**
```typescript
import { Quote } from '../../types';
import { getInitialQuotes } from '../../services/firebase/api';
import QuoteCard from './components/QuoteCard';
import MoodGrid from '../../features/mood/MoodGrid';
```

**從功能元件:**
```typescript
import { Quote } from '../../../types';
import { addQuote } from '../../../services/firebase/api';
import { useAuth } from '../../../contexts/AuthContext';
```

**從共用元件:**
```typescript
import { TabType } from '../../types';
import HexagonIcon from '../HexagonIcon';
```

## 功能需求 (Functional Requirements)

### 模式一：隨機滑動

- 向左滑動：下一張卡片
- 向右滑動：上一張卡片
- 流暢的動畫轉場

### 模式二：心情篩選

- 提供情境選擇：「需要靈感時」、「感到迷惘時」、「尋求動力時」、「保持平靜時」
- 篩選後的卡片同樣支援左右滑動
- 必須提供返回全部模式的選項

### 使用者引言管理（雙模式系統）

**Quote Mode（預設粉紅模式）:**
- 使用者可新增自己的引言卡片
- 使用固定的 Mood Tags（Excited, Innovation, Not My Day, Reflection）
- 文案：Add Quote / Edit Quote
- 說明文字：Create your personal wisdom quotes

**Vitality Mode（六角形紫色模式）:**
- 使用者可新增 Vitality 卡片
- 使用自由輸入的 Tags 系統（按 Enter 新增）
- 文案：Add Vitality / Edit Vitality
- 無說明文字
- Tags 可自由新增和刪除

**共用功能：**
- 新增引言時可輸入作者名稱（選填）
- 響應式作者標籤顯示：手機 5 個 / 平板 7 個 / 桌面 11 個
- 作者標籤自動從所有引言中提取並去重
- 點擊作者標籤可快速填入作者欄位
- 輸入作者名稱時顯示即時建議（最多 7 個）
- 點擊建議自動填入並關閉選單

## 文案規範 (Content Guidelines)

### 必要聲明文字

- "選擇一個情境，獲取你為自己準備的提醒"
- 強調這是使用者**為自己建立**的工具
- 避免任何可能被誤解為心理健康支持的措辭

### 程式碼規範 (Code Guidelines)

- **嚴格禁止**在任何程式碼檔案中使用 emoji 符號
- **嚴格禁止**在任何 .md 檔案中使用 emoji 符號
- 所有圖示需求請使用文字、SVG 圖標或 CSS 樣式替代

## 開發規範 (Development Guidelines)

### 強制性開發流程

1. **修改前必須閱讀文件** - 每次修改前必須先閱讀 `docs/` 資料夾中的相關文件
2. **不要破壞現有功能** - 不要改一個功能壞掉一個功能，確保現有功能持續運作
3. **同步更新文件** - 修改程式碼時必須同步更新對應的 .md 文件
4. **遵循現有模式** - 參考現有程式碼模式和慣例進行開發

### 必讀文件

- `docs/frontend/components.md` - 修改元件前必讀
- `docs/frontend/styles.md` - 修改樣式前必讀
- `docs/frontend/types.md` - 修改型別前必讀
- `docs/frontend/services.md` - 修改服務層前必讀
- `docs/backend/` - 後端相關修改前必讀
- `docs/development-process.md` - 開發流程規範

### 測試原則

- 每次修改後必須測試所有現有功能
- 確保 Random、Mood、Vitality、Paradigm 模式都正常運作
- 驗證滑動動畫和導航功能
- 測試響應式設計在手機端的表現
- 確認建構無錯誤：`npm run build`
- 部署前驗證：`npm run preview`

### 快速導航指南

**修改主頁面** → `src/pages/SwipeInterface/index.tsx`
**修改引言卡片** → `src/pages/SwipeInterface/components/QuoteCard/index.tsx`
**修改心情選擇** → `src/features/mood/MoodGrid/index.tsx`
**修改新增引言視窗** → `src/features/user/AddQuoteModal/index.tsx`
**修改使用者功能** → `src/features/user/[功能]/index.tsx`
**修改 Firebase 服務** → `src/services/firebase/[服務].ts`
**修改 Firestore 規則** → `firestore.rules`
**修改共用元件** → `src/components/[元件]/index.tsx`

## 開發命令 (Development Commands)

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建構生產版本
- `npm run preview` - 預覽生產版本
- `npm run lint` - 程式碼檢查

## 資料結構 (Data Structure)

```typescript
interface Quote {
  id: string;
  text: string;
  author?: string;
  moods: string[];
  createdAt: Date;
  userId: string;
  isPublic: boolean;
  type?: 'quote' | 'vitality';
}

interface CreateQuoteData {
  text: string;
  author: string;
  moods: MoodType[] | string[];
  isPublic?: boolean;
  type?: 'quote' | 'vitality';
}
```

### 資料結構說明

**Quote Interface:**
- `type`: 區分 quote（預設模式）和 vitality（六角形模式）
- `moods`: 支援 MoodType[]（固定標籤）或 string[]（自訂標籤）

**CreateQuoteData Interface:**
- 統一表單資料結構
- 用於 AddQuoteModal 的 onSave prop
- 支援雙模式的 moods 型別

## Firebase 服務層 (Firebase Services)

### 資料庫回退機制

應用程式設計了多層級的資料回退機制，確保在各種情況下都能正常運作：

1. **優先使用 Firestore 資料**
   - 成功連接時讀取雲端資料
   - 支援使用者認證和權限控制

2. **空資料庫自動回退**
   - 當 Firestore 回傳空陣列時自動使用 mock data
   - 確保新使用者也能看到預設引言

3. **錯誤時回退至本地資料**
   - 網路錯誤或權限問題時使用 mock data
   - 20 張預設引言（名人名言）

### 安全規則配置

Firestore 安全規則採用分離式權限控制：

- `allow list: if true` - 允許所有查詢操作（getDocs）
- `allow get` - 針對單一文件讀取檢查權限
  - 公開引言：所有人可讀
  - 系統引言：所有人可讀
  - 私人引言：僅擁有者可讀

### 核心 API 函式

- `getInitialQuotes()` - 取得所有引言（支援公開/私人篩選）
- `getQuotesByMood()` - 依心情篩選引言
- `getAllAuthors()` - 取得所有作者列表（自動去重）
- `addQuote()` - 新增引言
- `updateQuote()` - 更新引言
- `deleteQuote()` - 刪除引言
- `getUserQuotes()` - 取得使用者的所有引言

## 響應式設計 (Responsive Design)

- **主要目標:** 手機瀏覽器 (375px - 414px)
- **次要支援:** 平板 (768px+)
- **最低支援:** 桌面瀏覽器 (1024px+)

---

_此憲法確保專案開發過程中保持一致性和明確的方向。_
