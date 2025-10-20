# 使用者自建引言與作者篩選功能規格

## 功能概述

本文件定義三個核心新功能：
1. **使用者自建引言** - 允許使用者新增自己的引言卡片
2. **作者標籤互動** - 點擊作者標籤可瀏覽該作者的所有引言
3. **標籤佈局優化** - 作者標籤移至左下角，心情標籤保持右下角

**符合 CLAUDE.md 規範：**
- 不使用任何 emoji 符號
- 遵循現有的色彩系統和設計模式
- 保持現有功能完整運作

---

## 功能一：使用者自建引言

### 需求描述
使用者可以透過介面新增自己的引言卡片，包含引言文字、作者資訊和心情標籤。

### 使用者流程
1. 點擊主介面的「新增引言」按鈕
2. 開啟新增引言表單 Modal
3. 填寫引言內容、作者姓名、選擇心情標籤
4. 儲存後新引言加入資料庫
5. 可在對應的模式中瀏覽新引言

### UI 設計規格

#### 新增按鈕位置
- **位置：** 標題列右側（目前心情選擇按鈕旁）
- **樣式：** 與現有按鈕保持一致的設計
- **圖示：** 使用 "+" 文字符號或 "ADD" 文字

#### 新增引言 Modal
```typescript
interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteData: CreateQuoteData) => Promise<void>;
}

interface CreateQuoteData {
  text: string;
  author: string;
  moods: MoodType[];
}
```

#### 表單欄位
1. **引言文字**
   - 多行文字輸入框
   - 最大長度：500 字元
   - 即時字數統計顯示
   - 必填欄位

2. **作者姓名**
   - 單行文字輸入框
   - 最大長度：100 字元
   - 選填欄位（可為空白）

3. **心情標籤**
   - 多選核取方塊
   - 顯示所有可用心情選項
   - 至少選擇一個心情
   - 使用現有心情的視覺設計

#### 驗證規則
```typescript
const validateQuoteForm = (data: CreateQuoteData): string[] => {
  const errors: string[] = [];

  if (!data.text.trim()) {
    errors.push('引言內容不能為空');
  }

  if (data.text.length > 500) {
    errors.push('引言內容不能超過 500 字元');
  }

  if (data.author.length > 100) {
    errors.push('作者姓名不能超過 100 字元');
  }

  if (data.moods.length === 0) {
    errors.push('至少選擇一個心情標籤');
  }

  return errors;
};
```

### 技術實作

#### 新增元件
```
src/components/
├── AddQuoteModal.tsx        # 新增引言 Modal
├── QuoteForm.tsx           # 引言表單元件
└── FormField.tsx           # 表單欄位元件
```

#### API 擴充
```typescript
// src/services/firebaseApi.ts 新增功能
export const createQuote = async (
  quoteData: Omit<Quote, 'id' | 'createdAt'>
): Promise<Quote> => {
  // 實作新增引言到 Firestore
};

export const validateQuoteData = (data: any): boolean => {
  // 驗證引言資料格式
};
```

#### 狀態管理
```typescript
// SwipeInterface.tsx 新增狀態
const [isAddQuoteOpen, setIsAddQuoteOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

const handleAddQuote = async (quoteData: CreateQuoteData) => {
  setIsSubmitting(true);
  try {
    await createQuote(quoteData);
    // 重新載入引言列表
    await loadQuotes();
    setIsAddQuoteOpen(false);
  } catch (error) {
    // 錯誤處理
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 功能二：作者標籤互動

### 需求描述
使用者點擊卡片上的作者標籤時，可以瀏覽該作者的所有引言，類似目前的心情篩選功能。

### 使用者流程
1. 在任何引言卡片上點擊作者標籤
2. 自動切換到作者篩選模式
3. 顯示該作者的所有引言
4. 可正常左右滑動瀏覽
5. 可返回到 Random 或 Mood 模式

### UI 互動設計

#### 作者標籤樣式
```css
.author-tag {
  @apply cursor-pointer hover:bg-primary-100 active:scale-95 transition-all;
  @apply px-3 py-1 bg-background-secondary text-border-medium rounded-full;
  @apply text-sm font-medium border border-border-light;
}

.author-tag:hover {
  @apply border-primary-300 text-primary-600;
}
```

#### 作者篩選狀態指示
- 在 Header 顯示目前篩選的作者
- 格式：「作者：Steve Jobs • 3 則引言」
- 提供清除篩選的方式

### 技術實作

#### 新增 Tab 類型
```typescript
// src/types/index.ts 更新
export type TabType = 'random' | 'mood' | 'author';

export interface FilterState {
  type: TabType;
  value: string | MoodType | null;
}
```

#### API 擴充
```typescript
// src/services/firebaseApi.ts
export const getQuotesByAuthor = async (author: string): Promise<Quote[]> => {
  // 模擬資料階段：篩選 mockQuotes
  return mockQuotes.filter(quote =>
    quote.author?.toLowerCase().includes(author.toLowerCase())
  );
};

// 未來 Firestore 實作
export const getQuotesByAuthor = async (author: string): Promise<Quote[]> => {
  const q = query(
    collection(db, 'quotes'),
    where('author', '==', author),
    orderBy('createdAt', 'desc')
  );
  // ...
};
```

#### 狀態管理更新
```typescript
// SwipeInterface.tsx 狀態擴充
const [filterState, setFilterState] = useState<FilterState>({
  type: 'random',
  value: null
});

const handleAuthorClick = async (author: string) => {
  setFilterState({ type: 'author', value: author });
  const authorQuotes = await getQuotesByAuthor(author);
  setQuotes(authorQuotes);
  setCurrentIndex(0);
  setHistory([]);
};

const clearFilter = () => {
  setFilterState({ type: 'random', value: null });
  loadQuotes();
};
```

---

## 功能三：標籤佈局優化

### 需求描述
重新設計 QuoteCard 的標籤佈局，將作者標籤放在左下角，心情標籤保持在右下角，兩邊水平對齊。

### 視覺設計規格

#### 佈局結構
```
┌─────────────────────────────┐
│                             │
│     Quote Content Here      │
│                             │
│                             │
│  — Author Name              │
│                             │
│ [Author]        [Mood] [Tag] │
└─────────────────────────────┘
```

#### CSS 實作
```css
.quote-card-footer {
  @apply flex justify-between items-end mt-6;
}

.author-section {
  @apply flex flex-col items-start;
}

.mood-tags-section {
  @apply flex flex-wrap gap-2 justify-end;
}
```

### 技術實作

#### QuoteCard.tsx 重構
```typescript
const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  className,
  onAuthorClick,
  onMoodClick
}) => {
  return (
    <motion.div className={`quote-card ${className}`}>
      {/* Quote Text */}
      <div className="mb-6">
        <p className="text-lg font-medium text-gray-800 leading-relaxed">
          "{quote.text}"
        </p>
      </div>

      {/* Author */}
      {quote.author && (
        <div className="mb-4">
          <p className="text-sm text-border-medium font-medium">
            — {quote.author}
          </p>
        </div>
      )}

      {/* Footer: Author Tag (Left) + Mood Tags (Right) */}
      <div className="flex justify-between items-end">
        {/* Author Tag - Left */}
        <div className="author-section">
          {quote.author && (
            <button
              className="author-tag"
              onClick={() => onAuthorClick?.(quote.author!)}
            >
              {quote.author}
            </button>
          )}
        </div>

        {/* Mood Tags - Right */}
        <div className="mood-tags-section">
          {quote.moods.map((mood, index) => (
            <button
              key={index}
              className="mood-tag"
              onClick={() => onMoodClick?.(mood as MoodType)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```

#### Props Interface 更新
```typescript
interface QuoteCardProps {
  quote: Quote;
  className?: string;
  onAuthorClick?: (author: string) => void;
  onMoodClick?: (mood: MoodType) => void;
}
```

---

## 資料庫結構更新

### Firestore Collection 擴充

#### 新增索引需求
```javascript
// 作者篩選索引
{
  collection: "quotes",
  fields: [
    { field: "author", mode: "ASCENDING" },
    { field: "createdAt", mode: "DESCENDING" }
  ]
}

// 複合查詢索引（未來使用）
{
  collection: "quotes",
  fields: [
    { field: "author", mode: "ASCENDING" },
    { field: "moods", mode: "ARRAY_CONTAINS" },
    { field: "createdAt", mode: "DESCENDING" }
  ]
}
```

#### 安全規則更新
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /quotes/{quoteId} {
      allow read: if true;

      // 使用者可新增引言（未來需要認證）
      allow create: if request.auth != null
        && validateQuote(request.resource.data);

      // 只有管理員可修改/刪除
      allow update, delete: if request.auth != null
        && request.auth.token.admin == true;
    }
  }

  function validateQuote(quote) {
    return quote.keys().hasAll(['text', 'moods', 'createdAt']) &&
           quote.text is string &&
           quote.text.size() > 0 &&
           quote.text.size() <= 500 &&
           quote.moods is list &&
           quote.moods.size() > 0;
  }
}
```

---

## 測試計畫

### 功能測試
1. **新增引言測試**
   - 表單驗證正確性
   - 資料儲存成功
   - 新引言出現在對應篩選中

2. **作者篩選測試**
   - 點擊作者標籤正確篩選
   - 顯示該作者所有引言
   - 滑動功能正常運作

3. **標籤佈局測試**
   - 作者標籤在左下角
   - 心情標籤在右下角
   - 兩邊水平對齊
   - 響應式設計正常

### 回歸測試
- Random 模式正常運作
- Mood 模式正常運作
- 滑動動畫流暢
- Tab 切換正常
- 原有 UI 樣式無破壞

---

## 實作優先順序

### Phase 1：標籤佈局優化
1. 修改 QuoteCard.tsx 佈局
2. 更新 CSS 樣式
3. 測試響應式設計

### Phase 2：作者篩選功能
1. 新增 getQuotesByAuthor API
2. 更新狀態管理邏輯
3. 實作作者標籤點擊互動

### Phase 3：使用者新增引言
1. 建立 AddQuoteModal 元件
2. 實作表單驗證
3. 整合新增引言 API

### Phase 4：整合測試與優化
1. 完整功能測試
2. 效能優化
3. 文件更新