# 精準圖像重組引擎 (Precision Image Reconstruction Engine)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)
![CSS](https://img.shields.io/badge/css-CSS3-blue.svg)
![HTML](https://img.shields.io/badge/html-HTML5-orange.svg)

**一個功能完整的網頁圖像拼圖重組工具**

[🌐 線上體驗](https://qnhnpaji.manus.space) | [📖 文檔](#文檔) | [🚀 快速開始](#快速開始)

</div>

## 📋 目錄

- [專案概述](#專案概述)
- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [使用說明](#使用說明)
- [API文檔](#api文檔)
- [開發指南](#開發指南)
- [瀏覽器支援](#瀏覽器支援)
- [貢獻指南](#貢獻指南)
- [授權條款](#授權條款)

## 🎯 專案概述

精準圖像重組引擎是一個基於純前端技術開發的圖像拼圖重組工具。它提供了直觀的用戶介面和強大的圖像處理功能，讓用戶能夠輕鬆地將錯亂的圖像重新組合成完整的圖片。

### 🌟 核心亮點

- 🎨 **現代化設計** - 支援暗黑/明亮主題切換的響應式介面
- 🖼️ **智能圖像處理** - 支援多種格式，自動優化和壓縮
- 🧩 **雙模式拼圖** - 順序模式和自由拖拽模式
- 🎯 **精準控制** - ROI選擇、自訂圖塊尺寸、智能吸附
- 📱 **跨平台支援** - 桌面端和移動端完美適配
- ⚡ **高性能** - 無限畫布、平滑動畫、記憶體優化

## ✨ 功能特色

### 🔧 核心功能

#### 1. 圖像輸入與預裁剪
- 📁 支援多種圖像格式（JPEG、PNG、GIF、WebP、BMP、SVG）
- 📏 ROI（感興趣區域）手動選擇
- 🎯 即時座標輸入與視覺回饋
- 🔄 智能圖像大小調整和壓縮

#### 2. 圖塊定義與生成
- 📐 自訂圖塊尺寸（支援非正方形）
- ✂️ 智能圖塊切割算法
- 👀 圖塊預覽和管理
- 🔢 批量圖塊處理

#### 3. 雙模式重組系統
- **🎯 順序模式**: 按順序放置圖塊到指定位置
- **🎨 自由模式**: 拖拽圖塊到任意位置
- 🧲 智能吸附功能
- 💥 圖塊碰撞檢測
- ↩️ 復原/重做機制

#### 4. 圖像匯出功能
- 💾 多格式匯出支援
- 🎨 高品質圖像輸出
- 📝 自動檔案命名
- 📦 批量匯出功能

### 🎨 用戶體驗

#### 介面設計
- 🌓 暗黑/明亮主題切換
- 📱 三欄式響應式佈局
- 🎛️ 直觀的工具列設計
- ✨ 專業級視覺效果

#### 無限畫布
- 🔍 平滑縮放和平移
- 📐 座標轉換系統
- 👆 觸控和滑鼠雙重支援
- 📺 視窗自適應

#### 智能輔助
- 🎯 圖塊自動吸附
- 💡 目標位置提示
- 📊 進度追蹤顯示
- 🔔 即時操作回饋

## 🏗️ 技術架構

### 📁 專案結構

```
image-puzzle-engine/
├── 📄 index.html                 # 主頁面
├── 📄 README.md                  # 專案說明
├── 📁 styles/                    # 樣式文件
│   ├── 🎨 themes.css            # 主題變數系統
│   ├── 🎨 main.css              # 主要樣式
│   ├── 🎨 layout.css            # 佈局樣式
│   └── 🎨 components.css        # 組件樣式
└── 📁 scripts/                   # JavaScript模組
    ├── 🚀 main.js               # 應用程式入口
    ├── 📁 controllers/          # 控制器層
    │   ├── 🎮 uiController.js   # UI控制器
    │   ├── 🖼️ canvasManager.js  # 畫布管理器
    │   └── 💾 stateManager.js   # 狀態管理器
    ├── 📁 models/               # 模型層
    │   ├── 🖼️ imageProcessor.js # 圖像處理器
    │   ├── 📐 coordinateSystem.js # 座標系統
    │   └── 🧩 puzzleLogic.js    # 拼圖邏輯
    └── 📁 utils/                # 工具層
        ├── 🎪 eventHandler.js   # 事件處理器
        ├── 📁 fileHandler.js    # 檔案處理器
        └── ✨ animations.js     # 動畫效果
```

### 🔧 技術棧

- **前端框架**: 純JavaScript ES6+
- **樣式系統**: CSS3 + CSS變數
- **圖像處理**: Canvas API
- **檔案處理**: File API + Blob
- **動畫系統**: Web Animations API
- **存儲系統**: LocalStorage
- **模組系統**: ES6 Modules

### 🏛️ 架構模式

- **MVC架構**: 清晰的模型-視圖-控制器分離
- **模組化設計**: ES6模組化，易於維護和擴展
- **事件驅動**: 鬆耦合的事件系統
- **狀態管理**: 集中式狀態管理和持久化

## 🚀 快速開始

### 📋 系統要求

- 現代瀏覽器（Chrome 80+, Firefox 75+, Safari 13+, Edge 80+）
- 支援ES6模組的環境
- 本地HTTP服務器（開發時）

### 💻 本地開發

1. **克隆專案**
```bash
git clone https://github.com/your-username/precision-image-reconstruction-engine.git
cd precision-image-reconstruction-engine
```

2. **啟動本地服務器**
```bash
# 使用Python
python3 -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

3. **開啟瀏覽器**
```
http://localhost:8000
```

### 🌐 線上部署

專案已部署到線上，可直接訪問：
**https://qnhnpaji.manus.space**

## 📖 使用說明

### 🎯 基本操作流程

1. **📤 上傳圖像**
   - 點擊「錯亂圖像」區域上傳需要重組的圖像
   - 可選擇上傳參考圖像輔助拼圖

2. **✂️ 設定裁剪區域**
   - 在「裁剪區域設定」中輸入座標和尺寸
   - 或直接在圖像上拖拽選擇區域

3. **🧩 定義圖塊**
   - 設定圖塊的寬度和高度
   - 點擊「生成圖塊」按鈕

4. **🎨 拼圖重組**
   - **順序模式**: 點擊圖塊按順序放置
   - **自由模式**: 拖拽圖塊到目標位置

5. **💾 匯出結果**
   - 完成拼圖後點擊「匯出圖像」
   - 選擇格式和品質進行下載

### 🎮 快捷鍵

- `Ctrl + Z` - 復原操作
- `Ctrl + Y` - 重做操作
- `Space + 拖拽` - 平移畫布
- `滾輪` - 縮放畫布
- `R` - 重置縮放
- `T` - 切換主題

### 📱 觸控操作

- **單指拖拽** - 移動圖塊
- **雙指縮放** - 縮放畫布
- **雙指拖拽** - 平移畫布
- **長按** - 顯示操作選單

## 📚 API文檔

### 🎮 核心控制器

#### UIController
```javascript
// 初始化UI控制器
const uiController = new UIController();
await uiController.init();

// 切換主題
uiController.toggleTheme();

// 更新進度
uiController.updateProgress(percentage);
```

#### CanvasManager
```javascript
// 初始化畫布管理器
const canvasManager = new CanvasManager(container);
await canvasManager.init();

// 縮放畫布
canvasManager.zoom(scale);

// 平移畫布
canvasManager.pan(deltaX, deltaY);
```

#### StateManager
```javascript
// 初始化狀態管理器
const stateManager = new StateManager();
await stateManager.init();

// 設定主圖像
stateManager.setMainImage(image);

// 獲取當前狀態
const state = stateManager.getState();
```

### 🖼️ 圖像處理

#### ImageProcessor
```javascript
// 載入圖像
const image = await imageProcessor.loadImage(file);

// 裁剪圖像
const croppedImage = await imageProcessor.cropImage(image, cropSettings);

// 生成圖塊
const tiles = await imageProcessor.generateTiles(image, tileSettings);
```

### 🧩 拼圖邏輯

#### PuzzleLogic
```javascript
// 初始化拼圖
puzzleLogic.initializePuzzle(tiles, cropSettings);

// 放置圖塊
puzzleLogic.placeTileAt(tileId, position);

// 檢查完成狀態
const isComplete = puzzleLogic.isPuzzleComplete();
```

## 🛠️ 開發指南

### 📝 代碼規範

- 使用ES6+語法
- 遵循駝峰命名法
- 添加詳細註釋
- 保持代碼簡潔

### 🧪 測試

```bash
# 運行本地測試
npm test

# 檢查代碼品質
npm run lint

# 格式化代碼
npm run format
```

### 🔧 自訂配置

#### 主題自訂
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #ffffff;
  --text-color: #1f2937;
}
```

#### 功能配置
```javascript
const config = {
  maxImageSize: 4096,
  maxFileSize: 10 * 1024 * 1024,
  snapThreshold: 20,
  enableAnimations: true
};
```

### 📦 建構部署

```bash
# 建構生產版本
npm run build

# 部署到GitHub Pages
npm run deploy
```

## 🌍 瀏覽器支援

| 瀏覽器 | 版本 | 狀態 |
|--------|------|------|
| Chrome | 80+ | ✅ 完全支援 |
| Firefox | 75+ | ✅ 完全支援 |
| Safari | 13+ | ✅ 完全支援 |
| Edge | 80+ | ✅ 完全支援 |
| Mobile Safari | 13+ | ✅ 完全支援 |
| Chrome Mobile | 80+ | ✅ 完全支援 |

## 🤝 貢獻指南

我們歡迎所有形式的貢獻！

### 🐛 回報問題

1. 檢查是否已有相同問題
2. 使用問題模板創建新issue
3. 提供詳細的重現步驟

### 💡 功能建議

1. 在Discussions中討論新功能
2. 創建功能請求issue
3. 提供詳細的使用場景

### 🔧 代碼貢獻

1. Fork專案
2. 創建功能分支
3. 提交變更
4. 創建Pull Request

### 📋 開發流程

```bash
# 1. Fork並克隆專案
git clone https://github.com/your-username/precision-image-reconstruction-engine.git

# 2. 創建功能分支
git checkout -b feature/amazing-feature

# 3. 提交變更
git commit -m 'Add amazing feature'

# 4. 推送到分支
git push origin feature/amazing-feature

# 5. 創建Pull Request
```

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 文件

## 🙏 致謝

- 感謝所有貢獻者的努力
- 感謝開源社群的支持
- 特別感謝測試用戶的回饋

## 📞 聯絡方式

- **專案主頁**: https://github.com/your-username/precision-image-reconstruction-engine
- **線上體驗**: https://qnhnpaji.manus.space
- **問題回報**: [GitHub Issues](https://github.com/your-username/precision-image-reconstruction-engine/issues)
- **功能討論**: [GitHub Discussions](https://github.com/your-username/precision-image-reconstruction-engine/discussions)

## 🔄 更新日誌

### v1.0.0 (2025-08-02)
- 🎉 首次發布
- ✨ 完整的圖像拼圖功能
- 🎨 現代化UI設計
- 📱 響應式佈局
- 🌓 主題切換功能
- 🧩 雙模式拼圖系統
- 💾 圖像匯出功能

---

<div align="center">

**如果這個專案對您有幫助，請給我們一個 ⭐ Star！**

Made with ❤️ by [Your Name]

</div>

