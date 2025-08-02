# 精準圖像重組引擎 - 系統架構設計

## 1. 核心需求分析

### 1.1 功能需求
- **階段一：圖像輸入與精準預裁剪**
  - 雙輸入通道（錯亂圖必填，參考圖選填）
  - 互動式裁剪框與數值輸入雙向綁定
  - 無限畫布座標系下的裁剪操作

- **階段二：圖塊定義與生成**
  - 自定義圖塊尺寸（寬度、高度）
  - 智能按鈕狀態管理
  - 平滑過渡到拼圖階段

- **階段三：雙模式重組**
  - 點擊排序模式（自動吸附）
  - 自由拖曳模式（智能網格吸附）
  - 復原/重做功能
  - 手動換行控制

- **階段四：匯出**
  - 即時可用的匯出功能
  - 非阻塞式成功提示

### 1.2 設計需求
- **現代化UI：** Figma/Canva級別的視覺質感
- **響應式佈局：** 三欄式桌面佈局，單欄行動端佈局
- **主題系統：** 暗黑/明亮模式一鍵切換
- **無限畫布：** 支援縮放、平移的工作區

### 1.3 技術需求
- **純前端：** HTML5 + CSS3 + Vanilla JavaScript
- **模組化：** ES6+ Modules架構
- **跨平台：** 桌面端和行動端完整支援
- **無框架：** 禁止使用大型前端框架

## 2. 系統架構設計

### 2.1 整體架構
```
精準圖像重組引擎
├── 視圖層 (View Layer)
│   ├── HTML結構 (index.html)
│   ├── CSS樣式系統 (styles/)
│   └── 主題變數 (CSS Variables)
├── 控制層 (Controller Layer)
│   ├── UI控制器 (uiController.js)
│   ├── 畫布管理器 (canvasManager.js)
│   └── 狀態管理器 (stateManager.js)
├── 模型層 (Model Layer)
│   ├── 圖像處理 (imageProcessor.js)
│   ├── 座標轉換 (coordinateSystem.js)
│   └── 拼圖邏輯 (puzzleLogic.js)
└── 工具層 (Utility Layer)
    ├── 事件處理 (eventHandler.js)
    ├── 檔案操作 (fileHandler.js)
    └── 動畫效果 (animations.js)
```

### 2.2 核心模組設計

#### 2.2.1 UI控制器 (uiController.js)
- **職責：** 管理所有UI元素的狀態和互動
- **功能：**
  - 主題切換邏輯
  - 按鈕狀態管理
  - 工具列控制
  - 響應式佈局調整

#### 2.2.2 畫布管理器 (canvasManager.js)
- **職責：** 管理無限畫布的所有操作
- **功能：**
  - 縮放控制 (Zoom)
  - 平移控制 (Pan)
  - 座標轉換
  - 視窗邊界管理

#### 2.2.3 狀態管理器 (stateManager.js)
- **職責：** 管理應用程式的全局狀態
- **功能：**
  - 階段狀態追蹤
  - 復原/重做堆疊
  - 圖塊位置記錄
  - 設定參數管理

#### 2.2.4 圖像處理器 (imageProcessor.js)
- **職責：** 處理所有圖像相關操作
- **功能：**
  - 圖像載入和預覽
  - 裁剪區域計算
  - 圖塊生成
  - 最終圖像合成

#### 2.2.5 座標轉換系統 (coordinateSystem.js)
- **職責：** 處理無限畫布的座標轉換
- **功能：**
  - 螢幕座標 ↔ 畫布座標轉換
  - 縮放比例計算
  - 邊界檢測

## 3. 技術實現策略

### 3.1 無限畫布實現
```javascript
// 核心變換邏輯
const canvasTransform = {
  scale: 1.0,
  translateX: 0,
  translateY: 0,
  
  applyTransform() {
    const canvas = document.getElementById('infinite-canvas');
    canvas.style.transform = 
      `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }
};
```

### 3.2 座標轉換系統
```javascript
// 螢幕座標轉畫布座標
function screenToCanvas(screenX, screenY) {
  const rect = canvasContainer.getBoundingClientRect();
  const canvasX = (screenX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
  const canvasY = (screenY - rect.top - canvasTransform.translateY) / canvasTransform.scale;
  return { x: canvasX, y: canvasY };
}
```

### 3.3 主題系統實現
```css
:root {
  /* 明亮主題 */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #333333;
  --accent-color: #007bff;
}

[data-theme="dark"] {
  /* 暗黑主題 */
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --accent-color: #4dabf7;
}
```

## 4. 檔案結構規劃

```
image-puzzle-engine/
├── index.html
├── styles/
│   ├── main.css
│   ├── layout.css
│   ├── components.css
│   └── themes.css
├── scripts/
│   ├── main.js
│   ├── controllers/
│   │   ├── uiController.js
│   │   ├── canvasManager.js
│   │   └── stateManager.js
│   ├── models/
│   │   ├── imageProcessor.js
│   │   ├── coordinateSystem.js
│   │   └── puzzleLogic.js
│   └── utils/
│       ├── eventHandler.js
│       ├── fileHandler.js
│       └── animations.js
├── assets/
│   ├── icons/
│   └── images/
└── README.md
```

## 5. 開發優先級

### 第一優先級（核心功能）
1. 基礎HTML結構和CSS佈局
2. 圖像上傳和預覽功能
3. 基本的裁剪功能
4. 圖塊生成邏輯

### 第二優先級（進階功能）
1. 無限畫布實現
2. 拖放互動邏輯
3. 復原/重做功能
4. 圖像匯出功能

### 第三優先級（體驗優化）
1. 主題切換系統
2. 動畫效果
3. 觸控支援
4. 性能優化

## 6. 品質保證策略

### 6.1 程式碼品質
- 嚴格遵循ES6+標準
- 模組化設計原則
- 詳細的程式碼註釋
- 一致的命名規範

### 6.2 用戶體驗
- 所有互動都有視覺回饋
- 平滑的過渡動畫
- 直觀的操作流程
- 錯誤處理和提示

### 6.3 性能考量
- 圖像處理的記憶體管理
- 大圖像的分塊載入
- 事件處理的防抖動
- DOM操作的批次處理

這個架構設計確保了系統的可擴展性、可維護性，並完全符合技術開發手冊的所有要求。

