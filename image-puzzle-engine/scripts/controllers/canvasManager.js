/**
 * 畫布管理器 - 管理無限畫布的所有操作
 */

export class CanvasManager {
  constructor(coordinateSystem, stateManager, eventHandler) {
    this.coordinateSystem = coordinateSystem;
    this.stateManager = stateManager;
    this.eventHandler = eventHandler; // 新增：接收 eventHandler
    
    // 畫布變換狀態
    this.transform = {
      scale: 1.0,
      translateX: 0,
      translateY: 0
    };
    
    // 畫布限制
    this.minScale = 0.1;
    this.maxScale = 5.0;
    this.zoomStep = 0.1;
    
    // 拖拽狀態
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.lastTransform = { translateX: 0, translateY: 0 };
    
    // DOM 元素
    this.elements = {};
    
    // 事件監聽器
    this.eventListeners = [];
  }
  
  /**
   * 初始化畫布管理器
   */
  async init() {
    console.log('正在初始化畫布管理器...');
    
    // 獲取DOM元素
    this.cacheElements();
    
    // 設置事件監聽器
    this.setupEventListeners();
    
    // 初始化座標系統
    this.coordinateSystem.init(this.elements.canvasContainer, this.elements.canvas);
    
    // 設置初始狀態
    this.resetTransform();
    
    console.log('畫布管理器初始化完成');
  }
  
  /**
   * 快取DOM元素
   */
  cacheElements() {
    this.elements = {
      canvasContainer: document.getElementById('infinite-canvas-container'),
      canvas: document.getElementById('infinite-canvas'),
      previewCanvas: document.getElementById('preview-canvas'),
      imagePreview: document.getElementById('image-preview'),
      cropBox: document.getElementById('crop-box'),
      cropSelection: document.querySelector('.crop-selection'),
      cropOverlay: document.querySelector('.crop-overlay'),
      assemblyGrid: document.getElementById('assembly-grid'),
      workspace: document.getElementById('workspace')
    };
  }
  
  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    const container = this.elements.canvasContainer;
    if (!container) return;
    
    // 滑鼠事件
    this.addEventListeners([
      [container, 'mousedown', this.handleMouseDown.bind(this)],
      [container, 'mousemove', this.handleMouseMove.bind(this)],
      [container, 'mouseup', this.handleMouseUp.bind(this)],
      [container, 'wheel', this.handleWheel.bind(this)],
      [container, 'contextmenu', this.handleContextMenu.bind(this)],
      
      // 觸控事件
      [container, 'touchstart', this.handleTouchStart.bind(this)],
      [container, 'touchmove', this.handleTouchMove.bind(this)],
      [container, 'touchend', this.handleTouchEnd.bind(this)],
      
      // 視窗事件
      [window, 'resize', this.handleResize.bind(this)]
    ]);
    
    // 裁剪框事件
    this.setupCropBoxEvents();

    // 拼圖塊拖曳事件
    this.setupPuzzleTileDragEvents();
  }
  
  /**
   * 添加事件監聽器並記錄
   */
  addEventListeners(listeners) {
    listeners.forEach(([element, event, handler]) => {
      element.addEventListener(event, handler);
      this.eventListeners.push({ element, event, handler });
    });
  }
  
  /**
   * 設置裁剪框事件
   */
  setupCropBoxEvents() {
    const cropSelection = this.elements.cropSelection;
    if (!cropSelection) return;
    
    let isDragging = false;
    let isResizing = false;
    let dragStart = { x: 0, y: 0 };
    let initialRect = { x: 0, y: 0, width: 0, height: 0 };
    let resizeHandle = null;
    
    // 裁剪框拖拽
    cropSelection.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('crop-handle')) {
        isResizing = true;
        resizeHandle = e.target;
      } else {
        isDragging = true;
      }
      
      const rect = cropSelection.getBoundingClientRect();
      const containerRect = this.elements.canvasContainer.getBoundingClientRect();
      
      dragStart = {
        x: e.clientX,
        y: e.clientY
      };
      
      initialRect = {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height
      };
      
      // 移除此處的 e.preventDefault() 和 e.stopPropagation()
    });
    
    // 裁剪框移動和調整大小
    document.addEventListener('mousemove', (e) => {
      if (!isDragging && !isResizing) return;
      
      // 只有在實際拖曳或調整大小時才阻止事件傳播
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let newCanvasX;
      let newCanvasY;
      let newCanvasWidth;
      let newCanvasHeight;

      // Convert initial screen rect to canvas coordinates
      const initialCanvasRect = this.coordinateSystem.screenToCanvasRect(initialRect);

      // Convert screen delta to canvas delta
      const canvasDeltaX = deltaX / this.coordinateSystem.transform.scale;
      const canvasDeltaY = deltaY / this.coordinateSystem.transform.scale;

      if (isDragging) {
        newCanvasX = initialCanvasRect.x + canvasDeltaX;
        newCanvasY = initialCanvasRect.y + canvasDeltaY;
        newCanvasWidth = initialCanvasRect.width;
        newCanvasHeight = initialCanvasRect.height;
      } else if (isResizing && resizeHandle) {
        const handleClass = resizeHandle.className;

        newCanvasX = initialCanvasRect.x;
        newCanvasY = initialCanvasRect.y;
        newCanvasWidth = initialCanvasRect.width;
        newCanvasHeight = initialCanvasRect.height;

        if (handleClass.includes('nw')) {
          newCanvasX += canvasDeltaX;
          newCanvasY += canvasDeltaY;
          newCanvasWidth -= canvasDeltaX;
          newCanvasHeight -= canvasDeltaY;
        } else if (handleClass.includes('ne')) {
          newCanvasY += canvasDeltaY;
          newCanvasWidth += canvasDeltaX;
          newCanvasHeight -= canvasDeltaY;
        } else if (handleClass.includes('sw')) {
          newCanvasX += canvasDeltaX;
          newCanvasWidth -= canvasDeltaX;
          newCanvasHeight += canvasDeltaY;
        } else if (handleClass.includes('se')) {
          newCanvasWidth += canvasDeltaX;
          newCanvasHeight += canvasDeltaY;
        } else if (handleClass.includes('n')) {
          newCanvasY += canvasDeltaY;
          newCanvasHeight -= canvasDeltaY;
        } else if (handleClass.includes('s')) {
          newCanvasHeight += canvasDeltaY;
        } else if (handleClass.includes('w')) {
          newCanvasX += canvasDeltaX;
          newCanvasWidth -= canvasDeltaX;
        } else if (handleClass.includes('e')) {
          newCanvasWidth += canvasDeltaX;
        }
      }

        // Limit minimum size in canvas coordinates
      const minCanvasCropWidth = 20 / this.coordinateSystem.transform.scale;
      const minCanvasCropHeight = 20 / this.coordinateSystem.transform.scale;

      newCanvasWidth = Math.max(minCanvasCropWidth, newCanvasWidth);
      newCanvasHeight = Math.max(minCanvasCropHeight, newCanvasHeight);

      // Apply image bounds constraints in canvas coordinates
      const mainImage = this.stateManager.getMainImage();
      if (mainImage) {
        const imageWidth = mainImage.width;
        const imageHeight = mainImage.height;

        // Clamp maximum size (cannot be larger than image dimensions)
        newCanvasWidth = Math.min(newCanvasWidth, imageWidth);
        newCanvasHeight = Math.min(newCanvasHeight, imageHeight);

        // Clamp position (x, y)
        newCanvasX = Math.max(0, Math.min(newCanvasX, imageWidth - newCanvasWidth));
        newCanvasY = Math.max(0, Math.min(newCanvasY, imageHeight - newCanvasHeight));

        // Re-clamp width and height based on potentially adjusted x, y (if x or y were clamped)
        newCanvasWidth = Math.min(newCanvasWidth, imageWidth - newCanvasX);
        newCanvasHeight = Math.min(newCanvasHeight, imageHeight - newCanvasY);
      }

      // Emit the updated crop settings to the state manager
      this.eventHandler.emit('crop-settings-change', {
        x: newCanvasX,
        y: newCanvasY,
        width: newCanvasWidth,
        height: newCanvasHeight
      });
    });
    
    // 結束拖拽
    document.addEventListener('mouseup', () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
        this.updateCropSettings(); // 確保在拖曳或調整大小結束時更新 UI 輸入框
      }
    });
  }

  /**
   * 設置拼圖塊拖曳事件
   */
  setupPuzzleTileDragEvents() {
    const assemblyGrid = this.elements.assemblyGrid;
    if (!assemblyGrid) return;

    let isTileDragging = false;
    let currentTileElement = null;
    let initialMouseX = 0;
    let initialMouseY = 0;
    let initialTileX = 0;
    let initialTileY = 0;

    assemblyGrid.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('puzzle-tile') || e.target.closest('.puzzle-tile')) {
        currentTileElement = e.target.classList.contains('puzzle-tile') ? e.target : e.target.closest('.puzzle-tile');
        isTileDragging = true;
        initialMouseX = e.clientX;
        initialMouseY = e.clientY;
        initialTileX = parseFloat(currentTileElement.style.left);
        initialTileY = parseFloat(currentTileElement.style.top);

        // 移除此處的 e.preventDefault() 和 e.stopPropagation()
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (!isTileDragging || !currentTileElement) return;

      // 只有在實際拖曳時才阻止事件傳播
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - initialMouseX;
      const deltaY = e.clientY - initialMouseY;

      const newX = initialTileX + deltaX;
      const newY = initialTileY + deltaY;

      currentTileElement.style.left = `${newX}px`;
      currentTileElement.style.top = `${newY}px`;

      // 觸發拖曳事件，將螢幕座標轉換為畫布座標
      const tileId = currentTileElement.dataset.tileId;
      const tileRect = currentTileElement.getBoundingClientRect();
      const containerRect = this.elements.canvasContainer.getBoundingClientRect();
      const screenX = tileRect.left - containerRect.left;
      const screenY = tileRect.top - containerRect.top;
      const canvasPosition = this.coordinateSystem.screenToCanvas({ x: screenX, y: screenY });
      this.eventHandler.emit('tile-drag', { tileId, position: canvasPosition });
    });

    document.addEventListener('mouseup', () => {
      if (isTileDragging && currentTileElement) {
        currentTileElement.classList.remove('dragging');
        isTileDragging = false;
        currentTileElement = null;
      }
    });
  }
  
  /**
   * 處理裁剪框調整大小
   */
  handleCropBoxResize(handle, deltaX, deltaY, initialRect) {
    const currentCropSettings = this.stateManager.getCropSettings(); // These are in canvas coordinates
    let newCanvasX = currentCropSettings.x;
    let newCanvasY = currentCropSettings.y;
    let newCanvasWidth = currentCropSettings.width;
    let newCanvasHeight = currentCropSettings.height;

    // Convert screen delta to canvas delta
    const canvasDeltaX = deltaX / this.coordinateSystem.transform.scale;
    const canvasDeltaY = deltaY / this.coordinateSystem.transform.scale;

    const handleClass = handle.className;

    if (handleClass.includes('nw')) {
      newCanvasX += canvasDeltaX;
      newCanvasY += canvasDeltaY;
      newCanvasWidth -= canvasDeltaX;
      newCanvasHeight -= canvasDeltaY;
    } else if (handleClass.includes('ne')) {
      newCanvasY += canvasDeltaY;
      newCanvasWidth += canvasDeltaX;
      newCanvasHeight -= canvasDeltaY;
    } else if (handleClass.includes('sw')) {
      newCanvasX += canvasDeltaX;
      newCanvasWidth -= canvasDeltaX;
      newCanvasHeight += canvasDeltaY;
    } else if (handleClass.includes('se')) {
      newCanvasWidth += canvasDeltaX;
      newCanvasHeight += canvasDeltaY;
    } else if (handleClass.includes('n')) {
      newCanvasY += canvasDeltaY;
      newCanvasHeight -= canvasDeltaY;
    } else if (handleClass.includes('s')) {
      newCanvasHeight += canvasDeltaY;
    } else if (handleClass.includes('w')) {
      newCanvasX += canvasDeltaX;
      newCanvasWidth -= canvasDeltaX;
    } else if (handleClass.includes('e')) {
      newCanvasWidth += canvasDeltaX;
    }

    // Limit minimum size in canvas coordinates
    const minCanvasCropWidth = 20 / this.coordinateSystem.transform.scale;
    const minCanvasCropHeight = 20 / this.coordinateSystem.transform.scale;

    newCanvasWidth = Math.max(minCanvasCropWidth, newCanvasWidth);
    newCanvasHeight = Math.max(minCanvasCropHeight, newCanvasHeight);

    // Apply image bounds constraints in canvas coordinates
    const mainImage = this.stateManager.getMainImage();
    if (mainImage) {
      newCanvasX = Math.max(0, Math.min(newCanvasX, mainImage.width - newCanvasWidth));
      newCanvasY = Math.max(0, Math.min(newCanvasY, mainImage.height - newCanvasHeight));

      newCanvasWidth = Math.min(newCanvasWidth, mainImage.width - newCanvasX);
      newCanvasHeight = Math.min(newCanvasHeight, mainImage.height - newCanvasY);
    }

    // Convert back to screen coordinates for updating the style
    const screenCoords = this.coordinateSystem.canvasToScreen({ x: newCanvasX, y: newCanvasY });
    const screenSizes = this.coordinateSystem.canvasToScreenSize({ width: newCanvasWidth, height: newCanvasHeight });

    const cropSelection = this.elements.cropSelection;
    if (!cropSelection) return;

    cropSelection.style.left = `${screenCoords.x}px`;
    cropSelection.style.top = `${screenCoords.y}px`;
    cropSelection.style.width = `${screenSizes.width}px`;
    cropSelection.style.height = `${screenSizes.height}px`;

    // Update the overlay
    this.updateCropOverlay(screenCoords.x, screenCoords.y, screenSizes.width, screenSizes.height);

    // REMOVED: this.updateCropSettings(); // This will read the new screen values and update state
  }
  
  /**
   * 更新裁剪框位置 (接收螢幕座標)
   */
  updateCropBoxPosition(screenX, screenY, screenWidth, screenHeight) {
    const cropSelection = this.elements.cropSelection;
    if (!cropSelection) return;

    // 更新裁剪框樣式
    cropSelection.style.left = `${screenX}px`;
    cropSelection.style.top = `${screenY}px`;
    cropSelection.style.width = `${screenWidth}px`;
    cropSelection.style.height = `${screenHeight}px`;

    // 更新遮罩
    this.updateCropOverlay(screenX, screenY, screenWidth, screenHeight);
  }
  
  /**
   * 更新裁剪遮罩
   */
  updateCropOverlay(x, y, width, height) {
    const overlay = this.elements.cropOverlay;
    if (!overlay) return;

    const imageElement = this.elements.imagePreview.querySelector('img');
    if (!imageElement) return;

    const imageRect = imageElement.getBoundingClientRect();
    const previewRect = this.elements.imagePreview.getBoundingClientRect();

    // 計算裁剪框相對於 image-preview 的位置
    const relativeX = x - (previewRect.left - imageRect.left);
    const relativeY = y - (previewRect.top - imageRect.top);

    // 使用 clip-path 創建遮罩效果
    const clipPath = `polygon(
      0% 0%,
      0% 100%,
      ${relativeX}px 100%,
      ${relativeX}px ${relativeY}px,
      ${relativeX + width}px ${relativeY}px,
      ${relativeX + width}px ${relativeY + height}px,
      ${relativeX}px ${relativeY + height}px,
      ${relativeX}px 100%,
      100% 100%,
      100% 0%
    )`;
    
    overlay.style.clipPath = clipPath;
  }
  
  /**
   * 更新裁剪設定
   */
  updateCropSettings() {
    const cropSelection = this.elements.cropSelection;
    if (!cropSelection) return;
    
    const rect = cropSelection.getBoundingClientRect();
    const containerRect = this.elements.canvasContainer.getBoundingClientRect();
    
    const screenCoords = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top
    };
    
    const canvasCoords = this.coordinateSystem.screenToCanvas(screenCoords);
    const canvasSize = this.coordinateSystem.screenToCanvasSize({
      width: rect.width,
      height: rect.height
    });
    
    // 觸發裁剪設定變更事件
    this.eventHandler.emit('crop-settings-change', {
      x: canvasCoords.x,
      y: canvasCoords.y,
      width: canvasSize.width,
      height: canvasSize.height
    });
  }
  
  /**
   * 處理滑鼠按下
   */
  handleMouseDown(e) {
    // 中鍵或按住空白鍵時開始拖拽
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      this.startPanning(e.clientX, e.clientY);
      e.preventDefault(); // 阻止預設行為，例如圖片拖曳
    } else if (e.button === 0) {
      // 左鍵點擊，不阻止預設行為，讓事件繼續傳播
      // 只有在實際開始拖曳時才阻止預設行為
    }
  }
  
  /**
   * 處理滑鼠移動
   */
  handleMouseMove(e) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.dragStart.x;
      const deltaY = e.clientY - this.dragStart.y;
      
      this.transform.translateX = this.lastTransform.translateX + deltaX;
      this.transform.translateY = this.lastTransform.translateY + deltaY;
      
      this.applyTransform();
    }
  }
  
  /**
   * 處理滑鼠放開
   */
  handleMouseUp(e) {
    if (this.isDragging) {
      this.stopPanning();
    }
  }
  
  /**
   * 處理滾輪事件
   */
  handleWheel(e) {
    e.preventDefault();
    
    const rect = this.elements.canvasContainer.getBoundingClientRect();
    const centerX = (e.clientX - rect.left) / rect.width;
    const centerY = (e.clientY - rect.top) / rect.height;
    
    const delta = e.deltaY > 0 ? -1 : 1;
    this.zoom(delta, { x: centerX, y: centerY });
  }
  
  /**
   * 處理右鍵選單
   */
  handleContextMenu(e) {
    e.preventDefault();
  }
  
  /**
   * 處理觸控開始
   */
  handleTouchStart(e) {
    if (e.touches.length === 1) {
      // 單指拖拽
      const touch = e.touches[0];
      this.startPanning(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
      // 雙指縮放
      this.startPinchZoom(e.touches);
    }
    
    e.preventDefault();
  }
  
  /**
   * 處理觸控移動
   */
  handleTouchMove(e) {
    if (e.touches.length === 1 && this.isDragging) {
      // 單指拖拽
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.dragStart.x;
      const deltaY = touch.clientY - this.dragStart.y;
      
      this.transform.translateX = this.lastTransform.translateX + deltaX;
      this.transform.translateY = this.lastTransform.translateY + deltaY;
      
      this.applyTransform();
    } else if (e.touches.length === 2) {
      // 雙指縮放
      this.handlePinchZoom(e.touches);
    }
    
    e.preventDefault();
  }
  
  /**
   * 處理觸控結束
   */
  handleTouchEnd(e) {
    if (e.touches.length === 0) {
      this.stopPanning();
      this.stopPinchZoom();
    }
    
    e.preventDefault();
  }
  
  /**
   * 開始拖拽
   */
  startPanning(x, y) {
    this.isDragging = true;
    this.dragStart = { x, y };
    this.lastTransform = { ...this.transform };
    
    this.elements.canvasContainer.classList.add('panning');
    document.body.style.cursor = 'grabbing';
  }
  
  /**
   * 停止拖拽
   */
  stopPanning() {
    this.isDragging = false;
    
    this.elements.canvasContainer.classList.remove('panning');
    document.body.style.cursor = '';
  }
  
  /**
   * 開始雙指縮放
   */
  startPinchZoom(touches) {
    const touch1 = touches[0];
    const touch2 = touches[1];
    
    this.pinchStart = {
      distance: this.getTouchDistance(touch1, touch2),
      scale: this.transform.scale,
      center: this.getTouchCenter(touch1, touch2)
    };
  }
  
  /**
   * 處理雙指縮放
   */
  handlePinchZoom(touches) {
    if (!this.pinchStart) return;
    
    const touch1 = touches[0];
    const touch2 = touches[1];
    const currentDistance = this.getTouchDistance(touch1, touch2);
    const currentCenter = this.getTouchCenter(touch1, touch2);
    
    const scaleChange = currentDistance / this.pinchStart.distance;
    const newScale = this.pinchStart.scale * scaleChange;
    
    // 限制縮放範圍
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    
    // 計算縮放中心
    const rect = this.elements.canvasContainer.getBoundingClientRect();
    const centerX = (currentCenter.x - rect.left) / rect.width;
    const centerY = (currentCenter.y - rect.top) / rect.height;
    
    this.setScale(clampedScale, { x: centerX, y: centerY });
  }
  
  /**
   * 停止雙指縮放
   */
  stopPinchZoom() {
    this.pinchStart = null;
  }
  
  /**
   * 獲取兩點距離
   */
  getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 獲取兩點中心
   */
  getTouchCenter(touch1, touch2) {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }
  
  /**
   * 縮放畫布
   */
  zoom(delta, center = { x: 0.5, y: 0.5 }) {
    const newScale = this.transform.scale + (delta * this.zoomStep);
    const clampedScale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    
    this.setScale(clampedScale, center);
  }
  
  /**
   * 設置縮放比例
   */
  setScale(scale, center = { x: 0.5, y: 0.5 }) {
    const oldScale = this.transform.scale;
    const scaleChange = scale / oldScale;
    
    // 計算縮放中心偏移
    const rect = this.elements.canvasContainer.getBoundingClientRect();
    const centerX = rect.width * center.x;
    const centerY = rect.height * center.y;
    
    // 調整平移以保持縮放中心不變
    this.transform.translateX = centerX + (this.transform.translateX - centerX) * scaleChange;
    this.transform.translateY = centerY + (this.transform.translateY - centerY) * scaleChange;
    this.transform.scale = scale;
    
    this.applyTransform();
  }
  
  /**
   * 平移畫布
   */
  pan(deltaX, deltaY) {
    this.transform.translateX += deltaX;
    this.transform.translateY += deltaY;
    this.applyTransform();
  }
  
  /**
   * 重置變換
   */
  resetTransform() {
    this.transform = {
      scale: 1.0,
      translateX: 0,
      translateY: 0
    };
    this.applyTransform();
  }
  
  /**
   * 應用變換
   */
  applyTransform() {
    const canvas = this.elements.canvas;
    if (!canvas) return;
    
    const { scale, translateX, translateY } = this.transform;
    canvas.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    
    // 更新座標系統
    this.coordinateSystem.updateTransform(this.transform);
  }
  
  /**
   * 顯示主圖像
   */
  displayMainImage(image) {
    console.log('CanvasManager: Displaying main image:', image);
    const preview = this.elements.imagePreview;
    if (!preview) {
      console.error('CanvasManager: imagePreview element not found.');
      return;
    }
    
    // 設定 image-preview 的尺寸為圖像的原始尺寸
    preview.style.width = `${image.width}px`;
    preview.style.height = `${image.height}px`;

    preview.innerHTML = `<img src="${image.src}" alt="主圖像" />`;
    
    // 顯示裁剪框
    this.showCropBox(image);
  }
  
  /**
   * 顯示裁剪框
   */
  showCropBox(image) {
    const cropBox = this.elements.cropBox;
    if (!cropBox) return;
    
    cropBox.style.display = 'block';
    
    // 設置初始裁剪區域（整個圖像）
    // 直接使用圖像的原始尺寸來初始化裁剪框
    const initialCropWidth = image.width;
    const initialCropHeight = image.height;

    // 將圖像的原始尺寸轉換為螢幕座標
    const screenImageSize = this.coordinateSystem.canvasToScreenSize({
      width: initialCropWidth,
      height: initialCropHeight
    });

    // 初始位置設置為 (0,0) 相對於圖像的左上角
    this.updateCropBoxPosition(0, 0, screenImageSize.width, screenImageSize.height);
  }
  
  /**
   * 更新裁剪框
   */
  updateCropBox(settings) {
    const canvasCoords = this.coordinateSystem.canvasToScreen({
      x: settings.x,
      y: settings.y
    });
    
    const canvasSize = this.coordinateSystem.canvasToScreenSize({
      width: settings.width,
      height: settings.height
    });
    
    this.updateCropBoxPosition(
      canvasCoords.x,
      canvasCoords.y,
      canvasSize.width,
      canvasSize.height
    );
  }
  
  /**
   * 設置拼圖網格
   */
  setupAssemblyGrid(cropSettings) {
    const grid = this.elements.assemblyGrid;
    if (!grid) return;
    
    // 移除固定尺寸，讓其根據內容自動擴展
    grid.style.width = 'auto';
    grid.style.height = 'auto';
    grid.style.minWidth = `${cropSettings.width}px`; // 設置最小寬度為裁剪區域寬度
    grid.style.minHeight = `${cropSettings.height}px`; // 設置最小高度為裁剪區域高度

    // 居中顯示
    grid.style.left = '50%';
    grid.style.top = '50%';
    grid.style.transform = 'translate(-50%, -50%)';
  }
  
  /**
   * 切換到指定階段
   */
  switchToStage(stage) {
    const previewCanvas = this.elements.previewCanvas;
    const assemblyGrid = this.elements.assemblyGrid;
    
    if (stage <= 2) {
      previewCanvas.style.display = 'flex';
      assemblyGrid.style.display = 'none';
    } else {
      previewCanvas.style.display = 'none';
      assemblyGrid.style.display = 'block';
    }
  }
  
  /**
   * 重置畫布
   */
  resetCanvas() {
    this.resetTransform();
    
    // 隱藏裁剪框
    if (this.elements.cropBox) {
      this.elements.cropBox.style.display = 'none';
    }
    
    // 清空預覽
    if (this.elements.imagePreview) {
      this.elements.imagePreview.innerHTML = `
        <div class="placeholder-content">
          <svg class="placeholder-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <p class="placeholder-text">請上傳圖像開始使用</p>
        </div>
      `;
    }
  }
  
  /**
   * 處理視窗大小變更
   */
  handleResize() {
    // 重新計算座標系統
    this.coordinateSystem.handleResize();
  }
  
  /**
   * 動畫圖塊放置
   */
  animateTilePlacement(tileId) {
    // 實現圖塊放置動畫
    const tileElement = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (tileElement) {
      tileElement.style.transition = 'all 0.3s ease-out';
      tileElement.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        tileElement.style.transform = 'scale(1)';
      }, 150);
      
      setTimeout(() => {
        tileElement.style.transition = '';
      }, 300);
    }
  }
  
  /**
   * 更新圖塊位置
   */
  updateTilePosition(tileId, position) {
    const tileElement = document.querySelector(`[data-tile-id="${tileId}"]`);
    if (tileElement) {
      tileElement.style.left = `${position.x}px`;
      tileElement.style.top = `${position.y}px`;
    }
  }
  
  /**
   * 更新拼圖顯示
   */
  updatePuzzleDisplay(placedTiles) {
    const grid = this.elements.assemblyGrid;
    if (!grid) return;
    
    // 清空現有圖塊
    grid.innerHTML = '';
    
    // 添加已放置的圖塊
    placedTiles.forEach(tile => {
      const tileElement = document.createElement('div');
      tileElement.className = 'puzzle-tile placed';
      tileElement.dataset.tileId = tile.id;
      tileElement.style.left = `${tile.position.x}px`;
      tileElement.style.top = `${tile.position.y}px`;
      tileElement.style.width = `${tile.width}px`;
      tileElement.style.height = `${tile.height}px`;
      tileElement.innerHTML = `<img src="${tile.src}" alt="圖塊" />`;
      
      grid.appendChild(tileElement);
    });
  }
  
  /**
   * 清理資源
   */
  destroy() {
    // 移除所有事件監聽器
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    this.eventListeners = [];
  }
}

