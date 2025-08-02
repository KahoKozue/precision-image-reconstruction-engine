/**
 * 拼圖邏輯 - 管理拼圖的核心邏輯
 */

export class PuzzleLogic {
  constructor(stateManager) {
    this.stateManager = stateManager;
    
    // 拼圖配置
    this.config = {
      snapThreshold: 20,      // 吸附閾值（像素）
      gridSize: 10,           // 網格大小
      enableSnapping: true,   // 啟用吸附
      enableAutoArrange: true // 啟用自動排列
    };
    
    // 拼圖狀態
    this.puzzleState = {
      isInitialized: false,
      totalTiles: 0,
      placedTiles: 0,
      gridLayout: null,
      targetPositions: new Map()
    };
  }
  
  /**
   * 初始化拼圖
   */
  initializePuzzle(tiles, cropSettings) {
    console.log('正在初始化拼圖邏輯...');
    
    this.puzzleState.totalTiles = tiles.length;
    this.puzzleState.placedTiles = 0;
    this.puzzleState.isInitialized = true;
    
    // 計算網格佈局
    this.calculateGridLayout(tiles, cropSettings);
    
    // 計算目標位置
    this.calculateTargetPositions(tiles, cropSettings);
    
    console.log('拼圖邏輯初始化完成');
  }
  
  /**
   * 計算網格佈局
   */
  calculateGridLayout(tiles, cropSettings) {
    const tileSettings = this.stateManager.getTileSettings();
    const { width: tileWidth, height: tileHeight } = tileSettings;
    const { width: cropWidth, height: cropHeight } = cropSettings;
    
    const cols = Math.ceil(cropWidth / tileWidth);
    const rows = Math.ceil(cropHeight / tileHeight);
    
    this.puzzleState.gridLayout = {
      cols,
      rows,
      tileWidth,
      tileHeight,
      totalCells: cols * rows
    };
  }
  
  /**
   * 計算目標位置
   */
  calculateTargetPositions(tiles, cropSettings) {
    const { gridLayout } = this.puzzleState;
    this.puzzleState.targetPositions.clear();
    
    tiles.forEach(tile => {
      const { row, col } = tile.gridPosition;
      const targetX = col * gridLayout.tileWidth;
      const targetY = row * gridLayout.tileHeight;
      
      this.puzzleState.targetPositions.set(tile.id, {
        x: targetX,
        y: targetY,
        row,
        col
      });
    });
  }
  
  /**
   * 放置圖塊到下一個位置
   */
  placeTileNext(tileId) {
    if (!this.puzzleState.isInitialized) {
      console.warn('拼圖尚未初始化');
      return false;
    }
    
    const nextPosition = this.getNextPlacementPosition();
    if (!nextPosition) {
      console.warn('沒有可用的放置位置');
      return false;
    }
    
    return this.stateManager.placeTileNext(tileId);
  }
  
  /**
   * 放置圖塊到指定位置
   */
  placeTileAt(tileId, position) {
    if (!this.puzzleState.isInitialized) {
      console.warn('拼圖尚未初始化');
      return false;
    }
    
    // 應用吸附邏輯
    const snappedPosition = this.applySnapping(position, tileId);
    
    return this.stateManager.placeTileAt(tileId, snappedPosition);
  }
  
  /**
   * 獲取下一個放置位置
   */
  getNextPlacementPosition() {
    const state = this.stateManager.getState();
    return state.nextPosition;
  }
  
  /**
   * 應用吸附邏輯
   */
  applySnapping(position, tileId) {
    if (!this.config.enableSnapping) {
      return position;
    }
    
    // 網格吸附
    const gridSnapped = this.snapToGrid(position);
    
    // 目標位置吸附
    const targetSnapped = this.snapToTarget(gridSnapped, tileId);
    
    // 其他圖塊吸附
    const tileSnapped = this.snapToOtherTiles(targetSnapped, tileId);
    
    return tileSnapped;
  }
  
  /**
   * 網格吸附
   */
  snapToGrid(position) {
    const { gridSize } = this.config;
    
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }
  
  /**
   * 目標位置吸附
   */
  snapToTarget(position, tileId) {
    const targetPosition = this.puzzleState.targetPositions.get(tileId);
    if (!targetPosition) return position;
    
    const distance = this.calculateDistance(position, targetPosition);
    
    if (distance <= this.config.snapThreshold) {
      return {
        x: targetPosition.x,
        y: targetPosition.y
      };
    }
    
    return position;
  }
  
  /**
   * 其他圖塊吸附
   */
  snapToOtherTiles(position, tileId) {
    const placedTiles = this.stateManager.getPlacedTiles();
    const currentTile = this.stateManager.getTiles().find(t => t.id === tileId);
    
    if (!currentTile) return position;
    
    let bestPosition = position;
    let minDistance = Infinity;
    
    placedTiles.forEach(placedTile => {
      if (placedTile.id === tileId) return;
      
      // 檢查相鄰位置
      const adjacentPositions = this.getAdjacentPositions(placedTile, currentTile);
      
      adjacentPositions.forEach(adjPos => {
        const distance = this.calculateDistance(position, adjPos);
        
        if (distance <= this.config.snapThreshold && distance < minDistance) {
          minDistance = distance;
          bestPosition = adjPos;
        }
      });
    });
    
    return bestPosition;
  }
  
  /**
   * 獲取相鄰位置
   */
  getAdjacentPositions(placedTile, currentTile) {
    const positions = [];
    const { x, y } = placedTile.position;
    const { width, height } = placedTile;
    
    // 上下左右四個相鄰位置
    positions.push(
      { x: x - currentTile.width, y },  // 左
      { x: x + width, y },              // 右
      { x, y: y - currentTile.height }, // 上
      { x, y: y + height }              // 下
    );
    
    return positions;
  }
  
  /**
   * 計算兩點距離
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 檢查位置是否被佔用
   */
  isPositionOccupied(position, excludeTileId = null) {
    const placedTiles = this.stateManager.getPlacedTiles();
    
    return placedTiles.some(tile => {
      if (tile.id === excludeTileId) return false;
      
      return this.rectsOverlap(
        { x: position.x, y: position.y, width: tile.width, height: tile.height },
        { x: tile.position.x, y: tile.position.y, width: tile.width, height: tile.height }
      );
    });
  }
  
  /**
   * 檢查兩個矩形是否重疊
   */
  rectsOverlap(rect1, rect2) {
    return !(rect1.x + rect1.width <= rect2.x ||
             rect2.x + rect2.width <= rect1.x ||
             rect1.y + rect1.height <= rect2.y ||
             rect2.y + rect2.height <= rect1.y);
  }
  
  /**
   * 自動排列圖塊
   */
  autoArrangeTiles() {
    if (!this.config.enableAutoArrange) return false;
    
    const unplacedTiles = this.stateManager.getUnplacedTiles();
    let arranged = 0;
    
    unplacedTiles.forEach(tile => {
      const targetPosition = this.puzzleState.targetPositions.get(tile.id);
      if (targetPosition && !this.isPositionOccupied(targetPosition, tile.id)) {
        this.stateManager.placeTileAt(tile.id, targetPosition);
        arranged++;
      }
    });
    
    return arranged > 0;
  }
  
  /**
   * 檢查拼圖是否完成
   */
  isPuzzleComplete() {
    const placedTiles = this.stateManager.getPlacedTiles();
    
    if (placedTiles.length !== this.puzzleState.totalTiles) {
      return false;
    }
    
    // 檢查所有圖塊是否在正確位置
    return placedTiles.every(tile => {
      const targetPosition = this.puzzleState.targetPositions.get(tile.id);
      if (!targetPosition) return false;
      
      const distance = this.calculateDistance(tile.position, targetPosition);
      return distance <= this.config.snapThreshold;
    });
  }
  
  /**
   * 獲取拼圖進度
   */
  getPuzzleProgress() {
    const placedTiles = this.stateManager.getPlacedTiles();
    const correctlyPlaced = placedTiles.filter(tile => {
      const targetPosition = this.puzzleState.targetPositions.get(tile.id);
      if (!targetPosition) return false;
      
      const distance = this.calculateDistance(tile.position, targetPosition);
      return distance <= this.config.snapThreshold;
    }).length;
    
    return {
      totalTiles: this.puzzleState.totalTiles,
      placedTiles: placedTiles.length,
      correctlyPlaced,
      completionPercentage: this.puzzleState.totalTiles > 0 
        ? Math.round((correctlyPlaced / this.puzzleState.totalTiles) * 100)
        : 0
    };
  }
  
  /**
   * 獲取提示
   */
  getHint(tileId) {
    const targetPosition = this.puzzleState.targetPositions.get(tileId);
    if (!targetPosition) return null;
    
    const placedTiles = this.stateManager.getPlacedTiles();
    const currentTile = placedTiles.find(t => t.id === tileId);
    
    if (!currentTile) {
      // 圖塊未放置，返回目標位置
      return {
        type: 'target',
        position: targetPosition,
        message: '將圖塊放置到高亮區域'
      };
    }
    
    const distance = this.calculateDistance(currentTile.position, targetPosition);
    
    if (distance <= this.config.snapThreshold) {
      return {
        type: 'correct',
        message: '圖塊位置正確'
      };
    }
    
    // 計算方向提示
    const dx = targetPosition.x - currentTile.position.x;
    const dy = targetPosition.y - currentTile.position.y;
    
    let direction = '';
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? '向右移動' : '向左移動';
    } else {
      direction = dy > 0 ? '向下移動' : '向上移動';
    }
    
    return {
      type: 'direction',
      direction,
      distance: Math.round(distance),
      message: `${direction} ${Math.round(distance)} 像素`
    };
  }
  
  /**
   * 洗牌圖塊
   */
  shuffleTiles() {
    const placedTiles = this.stateManager.getPlacedTiles();
    const cropSettings = this.stateManager.getCropSettings();
    
    // 生成隨機位置
    placedTiles.forEach(tile => {
      const randomX = Math.random() * (cropSettings.width - tile.width);
      const randomY = Math.random() * (cropSettings.height - tile.height);
      
      this.stateManager.placeTileAt(tile.id, { x: randomX, y: randomY });
    });
  }
  
  /**
   * 重置拼圖
   */
  reset() {
    this.stateManager.reset();
    this.puzzleState.placedTiles = 0;
  }
  
  /**
   * 強制換行
   */
  forceNextLine() {
    this.stateManager.forceNextLine();
  }
  
  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 獲取配置
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * 獲取拼圖統計
   */
  getStatistics() {
    const progress = this.getPuzzleProgress();
    const state = this.stateManager.getStatistics();
    
    return {
      ...progress,
      ...state,
      isComplete: this.isPuzzleComplete(),
      gridLayout: this.puzzleState.gridLayout
    };
  }
  
  /**
   * 驗證拼圖完整性
   */
  validatePuzzle() {
    const issues = [];
    
    // 檢查是否初始化
    if (!this.puzzleState.isInitialized) {
      issues.push('拼圖尚未初始化');
    }
    
    // 檢查圖塊數量
    const tiles = this.stateManager.getTiles();
    const placedTiles = this.stateManager.getPlacedTiles();
    
    if (tiles.length === 0) {
      issues.push('沒有可用的圖塊');
    }
    
    // 檢查重疊
    const overlaps = this.findOverlappingTiles();
    if (overlaps.length > 0) {
      issues.push(`發現 ${overlaps.length} 個重疊的圖塊`);
    }
    
    // 檢查超出邊界
    const outOfBounds = this.findOutOfBoundsTiles();
    if (outOfBounds.length > 0) {
      issues.push(`發現 ${outOfBounds.length} 個超出邊界的圖塊`);
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
  
  /**
   * 查找重疊的圖塊
   */
  findOverlappingTiles() {
    const placedTiles = this.stateManager.getPlacedTiles();
    const overlaps = [];
    
    for (let i = 0; i < placedTiles.length; i++) {
      for (let j = i + 1; j < placedTiles.length; j++) {
        const tile1 = placedTiles[i];
        const tile2 = placedTiles[j];
        
        if (this.rectsOverlap(
          { x: tile1.position.x, y: tile1.position.y, width: tile1.width, height: tile1.height },
          { x: tile2.position.x, y: tile2.position.y, width: tile2.width, height: tile2.height }
        )) {
          overlaps.push([tile1.id, tile2.id]);
        }
      }
    }
    
    return overlaps;
  }
  
  /**
   * 查找超出邊界的圖塊
   */
  findOutOfBoundsTiles() {
    const placedTiles = this.stateManager.getPlacedTiles();
    const cropSettings = this.stateManager.getCropSettings();
    const outOfBounds = [];
    
    placedTiles.forEach(tile => {
      const { x, y } = tile.position;
      const { width, height } = tile;
      
      if (x < 0 || y < 0 || 
          x + width > cropSettings.width || 
          y + height > cropSettings.height) {
        outOfBounds.push(tile.id);
      }
    });
    
    return outOfBounds;
  }
  /**
   * 放置或移除圖塊
   * @param {string} tileId - 圖塊ID
   * @returns {boolean} - 操作是否成功
   */
  toggleTilePlacement(tileId) {
    if (!this.puzzleState.isInitialized) {
      console.warn('拼圖尚未初始化');
      return false;
    }

    const isPlaced = this.stateManager.getPlacedTiles().some(t => t.id === tileId);

    if (isPlaced) {
      // 如果已放置，則移除
      return this.stateManager.removeTile(tileId);
    } else {
      // 如果未放置，則放置到下一個自動位置
      return this.stateManager.placeTileNext(tileId);
    }
  }
}

