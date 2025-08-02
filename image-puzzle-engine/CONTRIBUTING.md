# 貢獻指南

感謝您對精準圖像重組引擎專案的關注！我們歡迎所有形式的貢獻，包括但不限於：

- 🐛 錯誤回報
- 💡 功能建議
- 📝 文檔改進
- 🔧 代碼貢獻
- 🎨 設計改進
- 🧪 測試用例

## 📋 目錄

- [行為準則](#行為準則)
- [如何貢獻](#如何貢獻)
- [開發環境設置](#開發環境設置)
- [代碼規範](#代碼規範)
- [提交指南](#提交指南)
- [Pull Request流程](#pull-request流程)
- [問題回報](#問題回報)
- [功能建議](#功能建議)

## 🤝 行為準則

### 我們的承諾

為了營造一個開放且友善的環境，我們作為貢獻者和維護者承諾：無論年齡、體型、身心障礙、族群、性別認同與表達、經驗程度、國籍、個人外表、種族、宗教或性取向，參與我們專案和社群的每個人都能享有無騷擾的體驗。

### 我們的標準

有助於創造正面環境的行為包括：

- 使用友善和包容的語言
- 尊重不同的觀點和經驗
- 優雅地接受建設性批評
- 專注於對社群最有利的事情
- 對其他社群成員表現同理心

不可接受的行為包括：

- 使用性暗示的語言或圖像，以及不受歡迎的性關注或性騷擾
- 酸民行為、侮辱/貶損的評論，以及人身或政治攻擊
- 公開或私下的騷擾
- 未經明確許可，發佈他人的個人資料，例如住址或電子信箱
- 其他可以合理認定為不適當或不專業的行為

## 🚀 如何貢獻

### 🐛 回報錯誤

在回報錯誤之前，請：

1. 檢查 [已知問題](https://github.com/your-username/precision-image-reconstruction-engine/issues) 確認問題尚未被回報
2. 確保您使用的是最新版本
3. 嘗試在不同瀏覽器中重現問題

#### 錯誤回報模板

```markdown
**錯誤描述**
簡潔清楚地描述錯誤。

**重現步驟**
1. 前往 '...'
2. 點擊 '....'
3. 滾動到 '....'
4. 看到錯誤

**預期行為**
清楚簡潔地描述您預期會發生什麼。

**實際行為**
清楚簡潔地描述實際發生了什麼。

**截圖**
如果適用，請添加截圖來幫助解釋您的問題。

**環境資訊**
- 作業系統: [例如 Windows 10, macOS 12.0]
- 瀏覽器: [例如 Chrome 95, Firefox 94]
- 版本: [例如 1.0.0]

**額外資訊**
在此添加關於問題的任何其他資訊。
```

### 💡 功能建議

我們歡迎新功能的建議！在提交功能請求之前，請：

1. 檢查 [功能請求](https://github.com/your-username/precision-image-reconstruction-engine/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) 確認功能尚未被建議
2. 考慮該功能是否符合專案的目標和範圍
3. 在 [Discussions](https://github.com/your-username/precision-image-reconstruction-engine/discussions) 中討論您的想法

#### 功能建議模板

```markdown
**功能描述**
清楚簡潔地描述您想要的功能。

**問題描述**
清楚簡潔地描述問題。例如：我總是感到困擾的是 [...]

**解決方案**
清楚簡潔地描述您想要發生的事情。

**替代方案**
清楚簡潔地描述您考慮過的任何替代解決方案或功能。

**使用場景**
描述這個功能的具體使用場景。

**額外資訊**
在此添加關於功能請求的任何其他資訊或截圖。
```

## 🛠️ 開發環境設置

### 系統要求

- Node.js 14.0.0 或更高版本
- 現代瀏覽器（Chrome 80+, Firefox 75+, Safari 13+, Edge 80+）
- Git

### 設置步驟

1. **Fork 專案**
   ```bash
   # 在 GitHub 上 fork 專案，然後克隆您的 fork
   git clone https://github.com/your-username/precision-image-reconstruction-engine.git
   cd precision-image-reconstruction-engine
   ```

2. **設置上游遠端**
   ```bash
   git remote add upstream https://github.com/original-owner/precision-image-reconstruction-engine.git
   ```

3. **安裝依賴**
   ```bash
   npm install
   ```

4. **啟動開發服務器**
   ```bash
   npm start
   # 或
   python3 -m http.server 8000
   ```

5. **開啟瀏覽器**
   ```
   http://localhost:8000
   ```

### 專案結構

```
image-puzzle-engine/
├── index.html              # 主頁面
├── styles/                 # CSS 樣式
│   ├── themes.css         # 主題變數
│   ├── main.css           # 主要樣式
│   ├── layout.css         # 佈局樣式
│   └── components.css     # 組件樣式
├── scripts/               # JavaScript 模組
│   ├── main.js           # 應用程式入口
│   ├── controllers/      # 控制器層
│   ├── models/           # 模型層
│   └── utils/            # 工具層
├── docs/                 # 文檔
├── tests/                # 測試文件
└── examples/             # 範例文件
```

## 📝 代碼規範

### JavaScript 規範

- 使用 ES6+ 語法
- 使用駝峰命名法 (camelCase)
- 使用有意義的變數和函數名稱
- 添加詳細的註釋
- 保持函數簡潔（建議不超過 50 行）
- 使用 const 和 let，避免使用 var

#### 範例

```javascript
/**
 * 處理圖像上傳
 * @param {File} file - 上傳的圖像文件
 * @returns {Promise<Object>} 處理後的圖像對象
 */
async function handleImageUpload(file) {
  try {
    // 驗證文件類型
    if (!this.isValidImageFile(file)) {
      throw new Error('不支援的圖像格式');
    }
    
    // 載入圖像
    const image = await this.loadImage(file);
    
    return image;
  } catch (error) {
    console.error('圖像上傳失敗:', error);
    throw error;
  }
}
```

### CSS 規範

- 使用 CSS 變數進行主題管理
- 使用 BEM 命名法
- 保持選擇器簡潔
- 使用 Flexbox 和 Grid 進行佈局
- 添加適當的註釋

#### 範例

```css
/* 主要按鈕樣式 */
.button {
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: var(--primary-text-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.button--secondary {
  background-color: var(--secondary-color);
  color: var(--secondary-text-color);
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

### HTML 規範

- 使用語義化標籤
- 添加適當的 ARIA 屬性
- 確保無障礙性
- 使用有意義的 class 和 id 名稱

## 📤 提交指南

### 提交訊息格式

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<類型>[可選範圍]: <描述>

[可選正文]

[可選頁腳]
```

#### 類型

- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔變更
- `style`: 代碼格式變更（不影響代碼運行）
- `refactor`: 代碼重構
- `test`: 添加或修改測試
- `chore`: 建構過程或輔助工具的變更

#### 範例

```
feat(image-processor): 添加圖像壓縮功能

添加了自動圖像壓縮功能，當圖像大小超過限制時自動壓縮。

Closes #123
```

### 分支命名

- `feature/功能名稱` - 新功能
- `fix/錯誤描述` - 錯誤修復
- `docs/文檔更新` - 文檔更新
- `refactor/重構描述` - 代碼重構

## 🔄 Pull Request 流程

1. **創建分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **進行變更**
   - 遵循代碼規範
   - 添加適當的測試
   - 更新相關文檔

3. **提交變更**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **同步上游變更**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **推送分支**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **創建 Pull Request**
   - 使用清楚的標題和描述
   - 引用相關的 issue
   - 添加截圖（如果適用）
   - 確保所有檢查通過

### Pull Request 模板

```markdown
## 變更描述
簡潔地描述這個 PR 的變更內容。

## 變更類型
- [ ] 錯誤修復
- [ ] 新功能
- [ ] 代碼重構
- [ ] 文檔更新
- [ ] 其他（請說明）

## 測試
- [ ] 我已經測試了我的變更
- [ ] 我已經添加了適當的測試用例
- [ ] 所有現有測試都通過

## 檢查清單
- [ ] 我的代碼遵循專案的代碼規範
- [ ] 我已經進行了自我審查
- [ ] 我已經添加了必要的註釋
- [ ] 我已經更新了相關文檔
- [ ] 我的變更不會產生新的警告

## 相關 Issue
Closes #(issue number)

## 截圖（如果適用）
添加截圖來展示變更效果。
```

## 🧪 測試

### 運行測試

```bash
# 運行所有測試
npm test

# 運行特定測試
npm test -- --grep "ImageProcessor"

# 運行測試並生成覆蓋率報告
npm run test:coverage
```

### 添加測試

- 為新功能添加單元測試
- 為錯誤修復添加回歸測試
- 確保測試覆蓋率不降低

## 📚 文檔

### 更新文檔

- 為新功能添加文檔
- 更新 API 文檔
- 添加使用範例
- 更新 README 和 CHANGELOG

### 文檔結構

```
docs/
├── api/              # API 文檔
├── guides/           # 使用指南
├── examples/         # 範例代碼
└── contributing/     # 貢獻指南
```

## 🎨 設計指南

### UI/UX 原則

- 保持簡潔和直觀
- 確保無障礙性
- 支援響應式設計
- 遵循現有的設計語言

### 設計資源

- 使用 Figma 進行設計
- 遵循 Material Design 原則
- 保持一致的顏色和字體

## 🏷️ 發布流程

### 版本號

我們使用 [語義化版本](https://semver.org/)：

- `MAJOR.MINOR.PATCH`
- 主版本號：不相容的 API 變更
- 次版本號：向下相容的功能新增
- 修訂號：向下相容的錯誤修復

### 發布檢查清單

- [ ] 所有測試通過
- [ ] 文檔已更新
- [ ] CHANGELOG 已更新
- [ ] 版本號已更新
- [ ] 創建 GitHub Release

## 🆘 獲得幫助

如果您需要幫助，可以：

1. 查看 [文檔](docs/)
2. 搜尋 [已有問題](https://github.com/your-username/precision-image-reconstruction-engine/issues)
3. 在 [Discussions](https://github.com/your-username/precision-image-reconstruction-engine/discussions) 中提問
4. 聯繫維護者

## 🙏 致謝

感謝所有貢獻者的努力！您的貢獻讓這個專案變得更好。

---

**記住：每個貢獻都很重要，無論大小！** 🌟

