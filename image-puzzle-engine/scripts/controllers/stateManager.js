/**
 * 狀態管理器 - 管理應用程式的全局狀態
 */

export class StateManager {
  constructor() {
    // 應用程式狀態
    this.state = {
      currentStage: 1,
      mainImage: null,
      referenceImage: null,
      cropSettings: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      tileSettings: {
        width: 100,
        height: 100
      },
      tiles: [],
      placedTiles: [],
      nextPosition: { x: 0, y: 0 },
      currentRow: 0,
      tilesPerRow: 0
    };
    
    // 復原/重做堆疊
    this.undoStack = [];
    this.redoStack = [];
    this.maxStackSize = 50;
    
    // 變更追蹤
    this.hasChanges = false;
    this.lastSaveState = null;
    
    // 事件監聽器
    this.listeners = new Map();
  }
  
  /**
   * 初始化狀態管理器
   */
  async init() {
    console.log('正在初始化狀態管理器...');
    
    // 嘗試從本地存儲恢復狀態
    this.loadFromStorage();
    
    // 保存初始狀態
    this.saveCurrentState();
    
    console.log('狀態管理器初始化完成');
  }
  
  /**
   * 獲取當前狀態
   */
  getState() {
    return {
      ...this.state,
      canProcess: this.canProcess(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      canExport: this.canExport(),
      hasUnsavedChanges: this.hasUnsavedChanges()
    };
  }
  
  /**
   * 設置當前階段
   */
  setCurrentStage(stage) {
    if (this.state.currentStage !== stage) {
      this.state.currentStage = stage;
      this.notifyChange('stage-change', stage);
    }
  }
  
  /**
   * 獲取當前階段
   */
  getCurrentStage() {
    return this.state.currentStage;
  }
  
  /**
   * 設置主圖像
   */
  setMainImage(image) {
    this.state.mainImage = image;
    
    // 自動更新裁剪設定
    this.state.cropSettings = {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    };
    
    this.markChanged();
    this.notifyChange('main-image-change', image);
  }
  
  /**
   * 獲取主圖像
   */
  getMainImage() {
    return this.state.mainImage;
  }
  
  /**
   * 設置參考圖像
   */
  setReferenceImage(image) {
    this.state.referenceImage = image;
    this.markChanged();
    this.notifyChange('reference-image-change', image);
  }
  
  /**
   * 獲取參考圖像
   */
  getReferenceImage() {
    return this.state.referenceImage;
  }
  
  /**
   * 設置裁剪設定
   */
  setCropSettings(settings) {
    this.state.cropSettings = { ...settings };
    this.markChanged();
    this.notifyChange('crop-settings-change', settings);
  }
  
  /**
   * 獲取裁剪設定
   */
  getCropSettings() {
    return { ...this.state.cropSettings };
  }
  
  /**
   * 設置圖塊設定
   */
  setTileSettings(settings) {
    this.state.tileSettings = { ...settings };
    this.markChanged();
    this.notifyChange('tile-settings-change', settings);
  }
  
  /**
   * 獲取圖塊設定
   */
  getTileSettings() {
    return { ...this.state.tileSettings };
  }
  
  /**
   * 設置圖塊
   */
  setTiles(tiles) {
    this.state.tiles = [...tiles];
    this.state.placedTiles = [];
    
    // 計算每行圖塊數量
    const { width: tileWidth } = this.state.tileSettings;
    const { width: cropWidth } = this.state.cropSettings;
    this.state.tilesPerRow = Math.floor(cropWidth / tileWidth);
    
    // 重置放置位置
    this.resetPlacementPosition();
    
    this.markChanged();
    this.notifyChange('tiles-change', tiles);
  }
  
  /**
   * 獲取圖塊
   */
  getTiles() {
    return [...this.state.tiles];
  }
  
  /**
   * 獲取已放置的圖塊
   */
  getPlacedTiles() {
    return [...this.state.placedTiles];
  }
  
  /**
   * 獲取未放置的圖塊
   */
  getUnplacedTiles() {
    const placedIds = new Set(this.state.placedTiles.map(tile => tile.id));
    return this.state.tiles.filter(tile => !placedIds.has(tile.id));
  }
  
  /**
   * 放置圖塊到下一個位置
   */
  placeTileNext(tileId) {
    const tile = this.state.tiles.find(t => t.id === tileId);
    if (!tile) return false;
    
    // 檢查是否已放置
    if (this.state.placedTiles.some(t => t.id === tileId)) {
      return false;
    }
    
    // 保存當前狀態到復原堆疊
    this.saveToUndoStack();
    
    // 創建放置的圖塊
    const placedTile = {
      ...tile,
      position: { ...this.state.nextPosition },
      placedAt: Date.now()
    };
    
    this.state.placedTiles.push(placedTile);
    
    // 更新下一個位置
    this.updateNextPosition();
    
    this.markChanged();
    this.notifyChange('tile-placed', placedTile);
    
    return true;
  }
  
  /**
   * 放置圖塊到指定位置
   */
  placeTileAt(tileId, position) {
    const tile = this.state.tiles.find(t => t.id === tileId);
    if (!tile) return false;
    
    // 保存當前狀態到復原堆疊
    this.saveToUndoStack();
    
    // 檢查是否已放置
    const existingIndex = this.state.placedTiles.findIndex(t => t.id === tileId);
    
    const placedTile = {
      ...tile,
      position: { ...position },
      placedAt: Date.now()
    };
    
    if (existingIndex >= 0) {
      // 更新現有圖塊位置
      this.state.placedTiles[existingIndex] = placedTile;
    } else {
      // 添加新圖塊
      this.state.placedTiles.push(placedTile);
    }
    
    this.markChanged();
    this.notifyChange('tile-placed', placedTile);
    
    return true;
  }
  
  /**
   * 移除圖塊
   */
  removeTile(tileId) {
    // 保存當前狀態到復原堆疊
    this.saveToUndoStack();
    
    const index = this.state.placedTiles.findIndex(t => t.id === tileId);
    if (index >= 0) {
      const removedTile = this.state.placedTiles.splice(index, 1)[0];
      this.markChanged();
      this.notifyChange('tile-removed', removedTile);
      return true;
    }
    
    return false;
  }
  
  /**
   * 強制換行
   */
  forceNextLine() {
    this.state.currentRow++;
    this.state.nextPosition.x = 0;
    this.state.nextPosition.y = this.state.currentRow * this.state.tileSettings.height;
    
    this.notifyChange('next-line-forced');
  }
  
  /**
   * 重置放置位置
   */
  resetPlacementPosition() {
    this.state.nextPosition = { x: 0, y: 0 };
    this.state.currentRow = 0;
  }
  
  /**
   * 更新下一個放置位置
   */
  updateNextPosition() {
    const { width: tileWidth, height: tileHeight } = this.state.tileSettings;
    
    this.state.nextPosition.x += tileWidth;
    
    // 檢查是否需要換行
    if (this.state.nextPosition.x + tileWidth > this.state.cropSettings.width) {
      this.state.nextPosition.x = 0;
      this.state.currentRow++;
      this.state.nextPosition.y = this.state.currentRow * tileHeight;
    }
  }
  
  /**
   * 強制換行
   */
  forceNextLine() {
    this.state.currentRow++;
    this.state.nextPosition.x = 0;
    this.state.nextPosition.y = this.state.currentRow * this.state.tileSettings.height;
    
    this.notifyChange('next-line-forced');
  }
  
  /**
   * 重置拼圖
   */
  reset() {
    // 保存當前狀態到復原堆疊
    this.saveToUndoStack();
    
    this.state.placedTiles = [];
    this.resetPlacementPosition();
    
    this.markChanged();
    this.notifyChange('puzzle-reset');
  }
  
  /**
   * 保存當前狀態到復原堆疊
   */
  saveToUndoStack() {
    // 深拷貝當前狀態
    const stateSnapshot = JSON.parse(JSON.stringify({
      placedTiles: this.state.placedTiles,
      nextPosition: this.state.nextPosition,
      currentRow: this.state.currentRow
    }));
    
    this.undoStack.push(stateSnapshot);
    
    // 限制堆疊大小
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    
    // 清空重做堆疊
    this.redoStack = [];
  }
  
  /**
   * 復原操作
   */
  undo() {
    if (this.undoStack.length === 0) return false;
    
    // 保存當前狀態到重做堆疊
    const currentState = {
      placedTiles: this.state.placedTiles,
      nextPosition: this.state.nextPosition,
      currentRow: this.state.currentRow
    };
    this.redoStack.push(JSON.parse(JSON.stringify(currentState)));
    
    // 恢復上一個狀態
    const previousState = this.undoStack.pop();
    this.state.placedTiles = previousState.placedTiles;
    this.state.nextPosition = previousState.nextPosition;
    this.state.currentRow = previousState.currentRow;
    
    this.markChanged();
    this.notifyChange('state-restored', 'undo');
    
    return true;
  }
  
  /**
   * 重做操作
   */
  redo() {
    if (this.redoStack.length === 0) return false;
    
    // 保存當前狀態到復原堆疊
    this.saveToUndoStack();
    
    // 恢復重做狀態
    const redoState = this.redoStack.pop();
    this.state.placedTiles = redoState.placedTiles;
    this.state.nextPosition = redoState.nextPosition;
    this.state.currentRow = redoState.currentRow;
    
    this.markChanged();
    this.notifyChange('state-restored', 'redo');
    
    return true;
  }
  
  /**
   * 檢查是否可以處理圖塊
   */
  canProcess() {
    return this.state.mainImage && 
           this.state.cropSettings.width > 0 && 
           this.state.cropSettings.height > 0 &&
           this.state.tileSettings.width > 0 && 
           this.state.tileSettings.height > 0;
  }
  
  /**
   * 檢查是否可以復原
   */
  canUndo() {
    return this.undoStack.length > 0;
  }
  
  /**
   * 檢查是否可以重做
   */
  canRedo() {
    return this.redoStack.length > 0;
  }
  
  /**
   * 檢查是否可以匯出
   */
  canExport() {
    return this.state.placedTiles.length > 0;
  }
  
  /**
   * 檢查是否有未保存的變更
   */
  hasUnsavedChanges() {
    return this.hasChanges;
  }
  
  /**
   * 標記狀態已變更
   */
  markChanged() {
    this.hasChanges = true;
  }
  
  /**
   * 標記狀態已保存
   */
  markSaved() {
    this.hasChanges = false;
    this.lastSaveState = JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * 保存當前狀態
   */
  saveCurrentState() {
    this.lastSaveState = JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * 從本地存儲載入狀態
   */
  loadFromStorage() {
    try {
      const savedState = localStorage.getItem('puzzle-engine-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // 只恢復部分狀態（不包括圖像數據）
        this.state.cropSettings = parsedState.cropSettings || this.state.cropSettings;
        this.state.tileSettings = parsedState.tileSettings || this.state.tileSettings;
        
        console.log('從本地存儲恢復狀態');
      }
    } catch (error) {
      console.warn('載入本地狀態失敗:', error);
    }
  }
  
  /**
   * 保存狀態到本地存儲
   */
  saveToStorage() {
    try {
      const stateToSave = {
        cropSettings: this.state.cropSettings,
        tileSettings: this.state.tileSettings,
        currentStage: this.state.currentStage
      };
      
      localStorage.setItem('puzzle-engine-state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('保存本地狀態失敗:', error);
    }
  }
  
  /**
   * 清除本地存儲
   */
  clearStorage() {
    try {
      localStorage.removeItem('puzzle-engine-state');
    } catch (error) {
      console.warn('清除本地狀態失敗:', error);
    }
  }
  
  /**
   * 添加狀態變更監聽器
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  /**
   * 移除狀態變更監聽器
   */
  removeListener(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  /**
   * 通知狀態變更
   */
  notifyChange(event, data = null) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data, this.getState());
        } catch (error) {
          console.error(`狀態變更監聽器錯誤 (${event}):`, error);
        }
      });
    }
    
    // 自動保存到本地存儲
    this.saveToStorage();
  }
  
  /**
   * 匯出狀態
   */
  exportState() {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(this.state))
    };
  }
  
  /**
   * 導入狀態
   */
  importState(exportedState) {
    try {
      if (exportedState.version === '1.0.0') {
        // 保存當前狀態到復原堆疊
        this.saveToUndoStack();
        
        // 恢復狀態
        this.state = { ...this.state, ...exportedState.state };
        
        this.markChanged();
        this.notifyChange('state-imported', exportedState);
        
        return true;
      } else {
        throw new Error('不支援的狀態版本');
      }
    } catch (error) {
      console.error('導入狀態失敗:', error);
      return false;
    }
  }
  
  /**
   * 獲取統計資訊
   */
  getStatistics() {
    return {
      totalTiles: this.state.tiles.length,
      placedTiles: this.state.placedTiles.length,
      unplacedTiles: this.state.tiles.length - this.state.placedTiles.length,
      completionPercentage: this.state.tiles.length > 0 
        ? Math.round((this.state.placedTiles.length / this.state.tiles.length) * 100)
        : 0,
      undoStackSize: this.undoStack.length,
      redoStackSize: this.redoStack.length
    };
  }
  
  /**
   * 清理資源
   */
  destroy() {
    // 保存最終狀態
    this.saveToStorage();
    
    // 清除監聽器
    this.listeners.clear();
    
    // 清除堆疊
    this.undoStack = [];
    this.redoStack = [];
  }
}

