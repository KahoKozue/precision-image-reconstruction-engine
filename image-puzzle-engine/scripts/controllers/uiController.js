/**
 * UI控制器 - 管理所有UI元素的狀態和互動
 */

export class UIController {
  constructor(stateManager, eventHandler) {
    this.stateManager = stateManager;
    this.eventHandler = eventHandler; // 確保將 eventHandler 賦值給 this.eventHandler
    
    this.currentTheme = 'dark';
    this.currentStage = 1;
    this.isLoading = false;
    
    // DOM 元素引用
    this.elements = {};
  }
  
  /**
   * 初始化UI控制器
   */
  async init() {
    console.log('正在初始化UI控制器...');
    
    // 獲取DOM元素引用
    this.cacheElements();
    
    // 設置事件監聽器
    this.setupEventListeners();
    
    // 初始化主題
    this.initializeTheme();
    
    // 初始化響應式佈局
    this.initializeResponsiveLayout();
    
    // 初始化拖放功能
    this.initializeDragAndDrop();
    
    console.log('UI控制器初始化完成');
  }
  
  /**
   * 快取DOM元素引用
   */
  cacheElements() {
    const getElement = (id) => {
      const element = document.getElementById(id);
      return element;
    };

    const querySelectorAll = (selector) => {
      const elements = document.querySelectorAll(selector);
      return elements;
    };

    this.elements = {
      // 主容器
      appContainer: getElement('app-container'),
      
      // 側邊欄
      sidebar: getElement('sidebar'),
      themeToggle: getElement('theme-toggle'),
      
      // 階段指示器
      stageItems: querySelectorAll('.stage-item'),
      
      // 工具面板
      toolPanels: querySelectorAll('.tool-panel'),
      stage1Panel: getElement('stage1-panel'),
      stage2Panel: getElement('stage2-panel'),
      stage3Panel: getElement('stage3-panel'),
      
      // 上傳區域
      mainImageInput: getElement('main-image-input'),
      referenceImageInput: getElement('reference-image-input'),
      uploadAreas: querySelectorAll('.upload-area'),
      
      // 裁剪設定
      cropX: getElement('crop-x'),
      cropY: getElement('crop-y'),
      cropW: getElement('crop-w'),
      cropH: getElement('crop-h'),
      
      // 圖塊設定
      tileWidth: getElement('tile-width'),
      tileHeight: getElement('tile-height'),
      
      // 按鈕
      processButton: getElement('process-button'),
      nextLineButton: getElement('next-line-button'),
      undoButton: getElement('undo-button'),
      redoButton: getElement('redo-button'),
      resetButton: getElement('reset-button'),
      exportButton: getElement('export-button'),
      
      // 畫布控制
      zoomInButton: getElement('zoom-in'),
      zoomOutButton: getElement('zoom-out'),
      zoomResetButton: getElement('zoom-reset'),
      
      // 工作區
      workspace: getElement('workspace'),
      infiniteCanvas: getElement('infinite-canvas'),
      previewCanvas: getElement('preview-canvas'),
      imagePreview: getElement('image-preview'),
      cropBox: getElement('crop-box'),
      assemblyGrid: getElement('assembly-grid'),
      
      // 右側面板
      rightPanel: getElement('right-panel'),
      toggleRightPanel: getElement('toggle-right-panel'),
      referencePreview: getElement('reference-preview'),
      tileStorage: getElement('tile-storage'),
      tileList: getElement('tile-list'),
      
      // 對話框和提示
      toastContainer: getElement('toast-container'),
      confirmDialog: getElement('confirm-dialog'),
      dialogMessage: getElement('dialog-message'),
      dialogCancel: getElement('dialog-cancel'),
      dialogConfirm: getElement('dialog-confirm')
    };
  }
  
  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 主題切換
    this.elements.themeToggle?.addEventListener('click', () => {
      this.toggleTheme();
    });
    
    // 階段切換
    this.elements.stageItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.switchToStage(index + 1);
      });
    });
    
    // 檔案上傳
    this.elements.mainImageInput?.addEventListener('change', (e) => {
      this.handleFileUpload(e, 'main');
    });
    
    this.elements.referenceImageInput?.addEventListener('change', (e) => {
      this.handleFileUpload(e, 'reference');
    });
    
    // 上傳區域點擊
    this.elements.uploadAreas.forEach(area => {
      area.addEventListener('click', () => {
        const targetId = area.dataset.target;
        const input = document.getElementById(targetId);
        input?.click();
      });
    });
    
    // 裁剪設定變更
    [this.elements.cropX, this.elements.cropY, this.elements.cropW, this.elements.cropH].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.handleCropSettingsChange();
        });
      }
    });
    
    // 圖塊設定變更
    [this.elements.tileWidth, this.elements.tileHeight].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          this.handleTileSettingsChange();
        });
      }
    });
    
    // 按鈕點擊
    this.elements.processButton?.addEventListener('click', () => {
      this.dispatchEvent('process-tiles');
    });
    
    this.elements.nextLineButton?.addEventListener('click', () => {
      this.dispatchEvent('next-line');
    });
    
    this.elements.undoButton?.addEventListener('click', () => {
      this.dispatchEvent('undo');
    });
    
    this.elements.redoButton?.addEventListener('click', () => {
      this.dispatchEvent('redo');
    });
    
    this.elements.resetButton?.addEventListener('click', () => {
      this.dispatchEvent('reset');
    });
    
    this.elements.exportButton?.addEventListener('click', () => {
      this.dispatchEvent('export');
    });
    
    // 畫布控制
    this.elements.zoomInButton?.addEventListener('click', () => {
      this.dispatchEvent('canvas-zoom', { delta: 1, point: { x: 0.5, y: 0.5 } });
    });
    
    this.elements.zoomOutButton?.addEventListener('click', () => {
      this.dispatchEvent('canvas-zoom', { delta: -1, point: { x: 0.5, y: 0.5 } });
    });
    
    this.elements.zoomResetButton?.addEventListener('click', () => {
      this.dispatchEvent('canvas-reset');
    });
    
    // 右側面板切換
    this.elements.toggleRightPanel?.addEventListener('click', () => {
      this.toggleRightPanel();
    });
    
    // 對話框按鈕
    this.elements.dialogCancel?.addEventListener('click', () => {
      this.hideConfirmDialog(false);
    });
    
    this.elements.dialogConfirm?.addEventListener('click', () => {
      this.hideConfirmDialog(true);
    });
    
    // 響應式佈局
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  /**
   * 初始化主題
   */
  initializeTheme() {
    const savedTheme = localStorage.getItem('puzzle-engine-theme') || 'dark';
    this.setTheme(savedTheme);
  }
  
  /**
   * 設置主題
   */
  setTheme(theme) {
    this.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('puzzle-engine-theme', theme);
    
    // 更新主題切換按鈕圖示
    this.updateThemeIcon();
  }
  
  /**
   * 切換主題
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.showToast(`已切換到${newTheme === 'dark' ? '暗黑' : '明亮'}主題`, 'info');
  }
  
  /**
   * 更新主題圖示
   */
  updateThemeIcon() {
    const icon = this.elements.themeToggle?.querySelector('.theme-icon');
    if (!icon) return;
    
    if (this.currentTheme === 'dark') {
      // 月亮圖示
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      `;
    } else {
      // 太陽圖示
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      `;
    }
  }
  
  /**
   * 初始化響應式佈局
   */
  initializeResponsiveLayout() {
    this.handleResize();
    
    // 檢查是否為行動裝置
    if (window.innerWidth <= 768) {
      this.setupMobileLayout();
    }
  }
  
  /**
   * 設置行動端佈局
   */
  setupMobileLayout() {
    // 創建行動端工具列
    if (!document.querySelector('.mobile-toolbar')) {
      const toolbar = document.createElement('div');
      toolbar.className = 'mobile-toolbar';
      toolbar.innerHTML = `
        <button id="mobile-sidebar-toggle" class="mobile-toolbar-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <button id="mobile-panel-toggle" class="mobile-toolbar-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
        </button>
      `;
      document.body.appendChild(toolbar);
      
      // 綁定行動端按鈕事件
      document.getElementById('mobile-sidebar-toggle')?.addEventListener('click', () => {
        this.toggleSidebar();
      });
      
      document.getElementById('mobile-panel-toggle')?.addEventListener('click', () => {
        this.toggleRightPanel();
      });
    }
  }
  
  /**
   * 初始化拖放功能
   */
  initializeDragAndDrop() {
    this.elements.uploadAreas.forEach(area => {
      // 拖放事件
      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
      });
      
      area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
      });
      
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const targetId = area.dataset.target;
          const type = targetId.includes('main') ? 'main' : 'reference';
          this.handleFileUpload({ target: { files } }, type);
        }
      });
    });
  }
  
  /**
   * 處理檔案上傳
   */
  handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      this.showToast('請選擇圖像檔案', 'error');
      return;
    }
    
    // 檢查檔案大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('檔案大小不能超過10MB', 'error');
      return;
    }
    
    // 觸發圖像上傳事件
    this.dispatchEvent('image-upload', { file, type });
  }
  
  /**
   * 處理裁剪設定變更
   */
  handleCropSettingsChange() {
    const settings = {
      x: parseInt(this.elements.cropX?.value || 0),
      y: parseInt(this.elements.cropY?.value || 0),
      width: parseInt(this.elements.cropW?.value || 100),
      height: parseInt(this.elements.cropH?.value || 100)
    };
    
    this.dispatchEvent('crop-settings-change', settings);
  }
  
  /**
   * 處理圖塊設定變更
   */
  handleTileSettingsChange() {
    const settings = {
      width: parseInt(this.elements.tileWidth?.value || 100),
      height: parseInt(this.elements.tileHeight?.value || 100)
    };
    
    this.dispatchEvent('tile-settings-change', settings);
  }
  
  /**
   * 切換到指定階段
   */
  switchToStage(stage) {
    this.currentStage = stage;
    
    // 更新階段指示器
    this.elements.stageItems.forEach((item, index) => {
      item.classList.toggle('active', index + 1 === stage);
    });
    
    // 更新工具面板
    this.elements.toolPanels.forEach((panel, index) => {
      panel.classList.toggle('active', index + 1 === stage);
    });
    
    // 更新畫布顯示
    this.updateCanvasDisplay(stage);
  }
  
  /**
   * 更新畫布顯示
   */
  updateCanvasDisplay(stage) {
    const previewCanvas = this.elements.previewCanvas;
    const assemblyGrid = this.elements.assemblyGrid;
    const tileStorage = this.elements.tileStorage;
    
    if (stage <= 2) {
      // 顯示預覽畫布
      previewCanvas.style.display = 'flex';
      assemblyGrid.style.display = 'none';
      tileStorage.style.display = 'none';
    } else {
      // 顯示拼圖畫布
      previewCanvas.style.display = 'none';
      assemblyGrid.style.display = 'block';
      tileStorage.style.display = 'block';
    }
  }
  
  /**
   * 更新裁剪設定
   */
  updateCropSettings(image) {
    if (this.elements.cropW) this.elements.cropW.value = image.width;
    if (this.elements.cropH) this.elements.cropH.value = image.height;
    if (this.elements.cropW) this.elements.cropW.max = image.width;
    if (this.elements.cropH) this.elements.cropH.max = image.height;
  }
  
  /**
   * 顯示參考圖像
   */
  displayReferenceImage(image) {
    console.log('UIController: Displaying reference image:', image);
    const preview = this.elements.referencePreview;
    if (!preview) {
      console.error('UIController: referencePreview element not found.');
      return;
    }
    
    preview.innerHTML = `<img src="${image.src}" alt="參考圖像" />`;
  }
  
  /**
   * 顯示圖塊暫存區
   */
  displayTileStorage(tiles) {
    const tileList = this.elements.tileList;
    if (!tileList) return;
    
    tileList.innerHTML = '';
    
    tiles.forEach((tile, index) => {
      const tileElement = document.createElement('div');
      tileElement.className = 'tile-item';
      tileElement.dataset.tileId = tile.id;
      tileElement.innerHTML = `<img src="${tile.src}" alt="圖塊 ${index + 1}" />`;
      
      // 添加點擊事件
      tileElement.addEventListener('click', () => {
        this.dispatchEvent('tile-click', tile.id);
      });
      
      tileList.appendChild(tileElement);
    });
  }
  
  /**
   * 更新圖塊暫存區
   */
  updateTileStorage() {
    // 根據狀態更新圖塊顯示
    const placedTiles = this.stateManager.getPlacedTiles();
    const tileItems = this.elements.tileList?.querySelectorAll('.tile-item');
    
    tileItems?.forEach(item => {
      const tileId = item.dataset.tileId;
      const isPlaced = placedTiles.some(tile => tile.id === tileId);
      item.style.opacity = isPlaced ? '0.5' : '1';
      item.style.pointerEvents = isPlaced ? 'none' : 'all';
    });
  }
  
  /**
   * 更新按鈕狀態
   */
  updateButtonStates(state) {
    // 處理按鈕
    if (this.elements.processButton) {
      this.elements.processButton.disabled = !state.canProcess;
    }
    
    // 復原/重做按鈕
    if (this.elements.undoButton) {
      this.elements.undoButton.disabled = !state.canUndo;
    }
    
    if (this.elements.redoButton) {
      this.elements.redoButton.disabled = !state.canRedo;
    }
    
    // 匯出按鈕
    if (this.elements.exportButton) {
      this.elements.exportButton.disabled = !state.canExport;
    }
  }
  
  /**
   * 切換側邊欄 (行動端)
   */
  toggleSidebar() {
    this.elements.sidebar?.classList.toggle('open');
  }
  
  /**
   * 切換右側面板
   */
  toggleRightPanel() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.elements.rightPanel?.classList.toggle('open');
    } else {
      // 桌面模式下，切換 app-container 的 class
      this.elements.appContainer?.classList.toggle('right-panel-collapsed');
    }
  }
  
  /**
   * 處理視窗大小變更
   */
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && !document.querySelector('.mobile-toolbar')) {
      this.setupMobileLayout();
    }
  }
  
  /**
   * 顯示載入狀態
   */
  showLoading(message = '載入中...') {
    this.isLoading = true;
    
    // 創建載入覆蓋層
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <div class="loading-spinner"></div>
        <p style="color: var(--text-primary); margin: 0;">${message}</p>
      </div>
    `;
    
    this.elements.workspace?.appendChild(overlay);
  }
  
  /**
   * 隱藏載入狀態
   */
  hideLoading() {
    this.isLoading = false;
    const overlay = this.elements.workspace?.querySelector('.loading-overlay');
    overlay?.remove();
  }
  
  /**
   * 顯示提示訊息
   */
  showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: `<path d="M9 12l2 2 4-4"/>`,
      error: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
      warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
      info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`
    };
    
    toast.innerHTML = `
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        ${icons[type]}
      </svg>
      <div class="toast-content">
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="toast-progress"></div>
    `;
    
    // 添加關閉事件
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.removeToast(toast);
    });
    
    // 添加到容器
    this.elements.toastContainer?.appendChild(toast);
    
    // 自動移除
    if (duration > 0) {
      const progress = toast.querySelector('.toast-progress');
      progress.style.width = '100%';
      progress.style.transition = `width ${duration}ms linear`;
      
      setTimeout(() => {
        progress.style.width = '0%';
      }, 100);
      
      setTimeout(() => {
        this.removeToast(toast);
      }, duration);
    }
  }
  
  /**
   * 移除提示訊息
   */
  removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
  
  /**
   * 顯示確認對話框
   */
  showConfirmDialog(title, message) {
    return new Promise((resolve) => {
      this.elements.dialogMessage.textContent = message;
      this.elements.confirmDialog.style.display = 'flex';
      
      this.confirmDialogResolve = resolve;
    });
  }
  
  /**
   * 隱藏確認對話框
   */
  hideConfirmDialog(result) {
    this.elements.confirmDialog.style.display = 'none';
    if (this.confirmDialogResolve) {
      this.confirmDialogResolve(result);
      this.confirmDialogResolve = null;
    }
  }
  
  /**
   * 觸發自定義事件
   */
  dispatchEvent(eventName, data = null) {
    this.eventHandler.emit(eventName, data);
  }
  
  /**
   * 清理資源
   */
  destroy() {
    // 移除所有事件監聽器
    this.eventListeners.forEach((handlers, eventName) => {
      handlers.forEach(handler => {
        document.removeEventListener(eventName, handler);
      });
    });
    
    this.eventListeners.clear();
  }
}

