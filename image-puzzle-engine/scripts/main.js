/**
 * 精準圖像重組引擎 - 主要入口文件
 * 負責初始化應用程式和協調各個模組
 */

// 導入控制器
import { UIController } from './controllers/uiController.js';
import { CanvasManager } from './controllers/canvasManager.js';
import { StateManager } from './controllers/stateManager.js';

// 導入模型
import { ImageProcessor } from './models/imageProcessor.js';
import { CoordinateSystem } from './models/coordinateSystem.js';
import { PuzzleLogic } from './models/puzzleLogic.js';

// 導入工具
import { EventHandler } from './utils/eventHandler.js';
import { FileHandler } from './utils/fileHandler.js';
import { Animations } from './utils/animations.js';

/**
 * 應用程式主類
 */
class ImagePuzzleEngine {
  constructor() {
    this.isInitialized = false;
    this.currentStage = 1;
    
    // 初始化各個管理器
    this.stateManager = new StateManager();
    this.coordinateSystem = new CoordinateSystem();
    this.eventHandler = new EventHandler();
    this.canvasManager = new CanvasManager(this.coordinateSystem, this.stateManager, this.eventHandler);
    this.uiController = new UIController(this.stateManager, this.eventHandler);
    this.imageProcessor = new ImageProcessor();
    this.puzzleLogic = new PuzzleLogic(this.stateManager);
    this.fileHandler = new FileHandler();
    this.animations = new Animations();
    
    // 綁定事件處理器
    this.bindEvents();
  }
  
  /**
   * 初始化應用程式
   */
  async init() {
    try {
      console.log('正在初始化精準圖像重組引擎...');
      
      // 初始化UI
      await this.uiController.init();
      
      // 初始化畫布管理器
      await this.canvasManager.init();
      
      // 初始化狀態管理器
      await this.stateManager.init();
      
      // 設置初始狀態
      this.setupInitialState();
      
      // 註冊全局事件監聽器
      this.registerGlobalEvents();
      
      this.isInitialized = true;
      console.log('應用程式初始化完成');
      
      // 顯示歡迎訊息
      this.uiController.showToast('歡迎使用精準圖像重組引擎', 'info');
      
    } catch (error) {
      console.error('應用程式初始化失敗:', error);
      this.uiController.showToast('應用程式初始化失敗', 'error');
    }
  }
  
  /**
   * 設置初始狀態
   */
  setupInitialState() {
    // 設置初始階段
    this.stateManager.setCurrentStage(1);
    
    // 初始化畫布
    this.canvasManager.resetCanvas();
    
    // 設置預設主題
    const savedTheme = localStorage.getItem('puzzle-engine-theme') || 'dark';
    this.uiController.setTheme(savedTheme);
  }
  
  /**
   * 綁定事件處理器
   */
  bindEvents() {
    // 主題切換
    this.eventHandler.on('theme-toggle', () => {
      this.uiController.toggleTheme();
    });
    
    // 圖像上傳
    this.eventHandler.on('image-upload', (data) => {
      this.handleImageUpload(data);
    });
    
    // 裁剪設定變更
    this.eventHandler.on('crop-settings-change', (settings) => {
      this.handleCropSettingsChange(settings);
    });
    
    // 圖塊設定變更
    this.eventHandler.on('tile-settings-change', (settings) => {
      this.handleTileSettingsChange(settings);
    });
    
    // 處理按鈕點擊
    this.eventHandler.on('process-tiles', () => {
      this.handleProcessTiles();
    });
    
    // 拼圖操作
    this.eventHandler.on('tile-click', (tileId) => {
      this.handleTileClick(tileId);
    });
    
    this.eventHandler.on('tile-drag', (data) => {
      this.handleTileDrag(data);
    });
    
    // 控制操作 (移除 next-line 相關)
    this.eventHandler.on('undo', () => {
      this.handleUndo();
    });
    
    this.eventHandler.on('redo', () => {
      this.handleRedo();
    });
    
    this.eventHandler.on('reset', () => {
      this.handleReset();
    });
    
    this.eventHandler.on('next-line', () => {
      this.handleNextLine();
    });
    
    // 匯出操作
    this.eventHandler.on('export', () => {
      this.handleExport();
    });
    
    // 畫布操作
    this.eventHandler.on('canvas-zoom', (data) => {
      this.canvasManager.zoom(data.delta, data.point);
    });
    
    this.eventHandler.on('canvas-pan', (data) => {
      this.canvasManager.pan(data.deltaX, data.deltaY);
    });
    
    this.eventHandler.on('canvas-reset', () => {
      this.canvasManager.resetTransform();
    });
  }
  
  /**
   * 註冊全局事件監聽器
   */
  registerGlobalEvents() {
    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.handleRedo();
            } else {
              this.handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            this.handleRedo();
            break;
          case 's':
            e.preventDefault();
            this.handleExport();
            break;
        }
      }
    });
    
    // 視窗大小變更
    window.addEventListener('resize', () => {
      this.canvasManager.handleResize();
    });
    
    // 防止意外離開
    window.addEventListener('beforeunload', (e) => {
      if (this.stateManager.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '您有未保存的變更，確定要離開嗎？';
      }
    });
  }
  
  /**
   * 處理圖像上傳
   */
  async handleImageUpload(data) {
    try {
      const { file, type } = data;
      
      this.uiController.showLoading('正在處理圖像...');
      
      const processedImage = await this.imageProcessor.loadImage(file);
      
      if (type === 'main') {
        this.stateManager.setMainImage(processedImage);
        this.canvasManager.displayMainImage(processedImage);
        this.uiController.updateCropSettings(processedImage);
      } else if (type === 'reference') {
        this.stateManager.setReferenceImage(processedImage);
        this.uiController.displayReferenceImage(processedImage);
      }
      
      this.uiController.hideLoading();
      this.uiController.showToast('圖像載入成功', 'success');
      
      // 更新按鈕狀態
      this.updateButtonStates();
      
    } catch (error) {
      console.error('圖像上傳失敗:', error);
      this.uiController.hideLoading();
      this.uiController.showToast('圖像載入失敗', 'error');
    }
  }
  
  /**
   * 處理裁剪設定變更
   */
  handleCropSettingsChange(settings) {
    this.stateManager.setCropSettings(settings);
    this.canvasManager.updateCropBox(settings);
    this.updateButtonStates();
  }
  
  /**
   * 處理圖塊設定變更
   */
  handleTileSettingsChange(settings) {
    this.stateManager.setTileSettings(settings);
    this.updateButtonStates();
  }
  
  /**
   * 處理圖塊生成
   */
  async handleProcessTiles() {
    try {
      this.uiController.showLoading('正在生成圖塊...');
      
      const mainImage = this.stateManager.getMainImage();
      const cropSettings = this.stateManager.getCropSettings();
      const tileSettings = this.stateManager.getTileSettings();
      
      // 裁剪圖像
      const croppedImage = await this.imageProcessor.cropImage(
        mainImage, 
        cropSettings
      );
      
      // 生成圖塊
      const tiles = await this.imageProcessor.generateTiles(
        croppedImage, 
        tileSettings
      );
      
      // 保存圖塊到狀態
      this.stateManager.setTiles(tiles);
      
      // 切換到拼圖階段
      this.switchToStage(3);
      
      // 初始化拼圖邏輯
      this.puzzleLogic.initializePuzzle(tiles, cropSettings);
      
      // 顯示拼圖界面
      this.canvasManager.setupAssemblyGrid(cropSettings);
      this.uiController.displayTileStorage(tiles);
      
      this.uiController.hideLoading();
      this.uiController.showToast('圖塊生成完成', 'success');
      
    } catch (error) {
      console.error('圖塊生成失敗:', error);
      this.uiController.hideLoading();
      this.uiController.showToast('圖塊生成失敗', 'error');
    }
  }
  
  /**
   * 處理圖塊點擊
   */
  handleTileClick(tileId) {
    const success = this.puzzleLogic.toggleTilePlacement(tileId);
    if (success) {
      this.refreshPuzzleDisplay();
      this.canvasManager.animateTilePlacement(tileId);
      this.uiController.updateTileStorage();
      this.updateButtonStates();
    }
  }
  
  /**
   * 處理圖塊拖拽
   */
  handleTileDrag(data) {
    const { tileId, position: canvasPosition } = data; // 直接使用傳入的畫布座標
    
    const success = this.puzzleLogic.placeTileAt(tileId, canvasPosition);
    if (success) {
      this.refreshPuzzleDisplay();
      // this.canvasManager.updateTilePosition(tileId, canvasPosition); // refreshPuzzleDisplay 會處理更新
      this.uiController.updateTileStorage();
      this.updateButtonStates();
    }
  }
  
  /**
   * 處理復原操作
   */
  handleUndo() {
    const success = this.stateManager.undo();
    if (success) {
      this.refreshPuzzleDisplay();
      this.uiController.showToast('已復原', 'info');
    }
    this.updateButtonStates();
  }
  
  /**
   * 處理重做操作
   */
  handleRedo() {
    const success = this.stateManager.redo();
    if (success) {
      this.refreshPuzzleDisplay();
      this.uiController.showToast('已重做', 'info');
    }
    this.updateButtonStates();
  }
  
  /**
   * 處理重置操作
   */
  async handleReset() {
    const confirmed = await this.uiController.showConfirmDialog(
      '確定要重置拼圖嗎？',
      '這將清除所有已放置的圖塊，此操作無法復原。'
    );
    
    if (confirmed) {
      this.puzzleLogic.reset();
      this.refreshPuzzleDisplay();
      this.uiController.showToast('拼圖已重置', 'info');
      this.updateButtonStates();
    }
  }
  
  /**
   * 處理手動換行
   */
  handleNextLine() {
    this.puzzleLogic.forceNextLine();
    this.updateButtonStates();
  }
  
  /**
   * 處理匯出操作
   */
  async handleExport() {
    try {
      this.uiController.showLoading('正在匯出圖像...');
      
      const assembledImage = await this.imageProcessor.assembleImage(
        this.stateManager.getPlacedTiles()
      );
      
      await this.fileHandler.downloadImage(assembledImage, 'assembled-puzzle.png');
      
      this.uiController.hideLoading();
      this.uiController.showToast('圖像匯出成功', 'success');
      
    } catch (error) {
      console.error('圖像匯出失敗:', error);
      this.uiController.hideLoading();
      this.uiController.showToast('圖像匯出失敗', 'error');
    }
  }
  
  /**
   * 切換到指定階段
   */
  switchToStage(stage) {
    this.currentStage = stage;
    this.stateManager.setCurrentStage(stage);
    this.uiController.switchToStage(stage);
    this.canvasManager.switchToStage(stage);
    this.updateButtonStates();
  }
  
  /**
   * 刷新拼圖顯示
   */
  refreshPuzzleDisplay() {
    const placedTiles = this.stateManager.getPlacedTiles();
    this.canvasManager.updatePuzzleDisplay(placedTiles);
    this.uiController.updateTileStorage();
  }
  
  /**
   * 更新按鈕狀態
   */
  updateButtonStates() {
    const state = this.stateManager.getState();
    this.uiController.updateButtonStates(state);
  }
}

/**
 * 應用程式入口點
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 創建應用程式實例
    const app = new ImagePuzzleEngine();
    
    // 將應用程式實例掛載到全局，方便調試
    window.puzzleEngine = app;
    
    // 初始化應用程式
    await app.init();
    
  } catch (error) {
    console.error('應用程式啟動失敗:', error);
    
    // 顯示錯誤訊息
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ef4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <h3>應用程式啟動失敗</h3>
      <p>請重新整理頁面或聯繫技術支援</p>
      <small>${error.message}</small>
    `;
    document.body.appendChild(errorDiv);
  }
});

