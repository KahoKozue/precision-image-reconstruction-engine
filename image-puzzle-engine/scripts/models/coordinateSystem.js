/**
 * 座標轉換系統 - 處理無限畫布的座標轉換
 */

export class CoordinateSystem {
  constructor() {
    // 畫布容器和畫布元素
    this.container = null;
    this.canvas = null;
    
    // 變換狀態
    this.transform = {
      scale: 1.0,
      translateX: 0,
      translateY: 0
    };
    
    // 容器尺寸
    this.containerSize = {
      width: 0,
      height: 0
    };
    
    // 畫布原始尺寸
    this.canvasSize = {
      width: 0,
      height: 0
    };
  }
  
  /**
   * 初始化座標系統
   */
  init(container, canvas) {
    this.container = container;
    this.canvas = canvas;
    
    // 更新尺寸
    this.updateSizes();
    
    // 監聽尺寸變更
    this.setupResizeObserver();
    
    console.log('座標系統初始化完成');
  }
  
  /**
   * 設置尺寸變更監聽器
   */
  setupResizeObserver() {
    if (!window.ResizeObserver) return;
    
    const resizeObserver = new ResizeObserver(() => {
      this.updateSizes();
    });
    
    if (this.container) {
      resizeObserver.observe(this.container);
    }
  }
  
  /**
   * 更新容器和畫布尺寸
   */
  updateSizes() {
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      this.containerSize = {
        width: rect.width,
        height: rect.height
      };
    }
    
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      this.canvasSize = {
        width: rect.width / this.transform.scale,
        height: rect.height / this.transform.scale
      };
    }
  }
  
  /**
   * 更新變換狀態
   */
  updateTransform(transform) {
    this.transform = { ...transform };
    this.updateSizes();
  }
  
  /**
   * 螢幕座標轉換為畫布座標
   */
  screenToCanvas(screenPoint) {
    const { scale, translateX, translateY } = this.transform;
    
    // 計算相對於容器的座標
    const containerRect = this.container?.getBoundingClientRect();
    if (!containerRect) return screenPoint;
    
    const relativeX = screenPoint.x - containerRect.left;
    const relativeY = screenPoint.y - containerRect.top;
    
    // 考慮畫布變換
    const canvasX = (relativeX - translateX) / scale;
    const canvasY = (relativeY - translateY) / scale;
    
    return {
      x: canvasX,
      y: canvasY
    };
  }
  
  /**
   * 畫布座標轉換為螢幕座標
   */
  canvasToScreen(canvasPoint) {
    const { scale, translateX, translateY } = this.transform;
    
    // 應用畫布變換
    const screenX = canvasPoint.x * scale + translateX;
    const screenY = canvasPoint.y * scale + translateY;
    
    return {
      x: screenX,
      y: screenY
    };
  }
  
  /**
   * 螢幕尺寸轉換為畫布尺寸
   */
  screenToCanvasSize(screenSize) {
    const { scale } = this.transform;
    
    return {
      width: screenSize.width / scale,
      height: screenSize.height / scale
    };
  }
  
  /**
   * 畫布尺寸轉換為螢幕尺寸
   */
  canvasToScreenSize(canvasSize) {
    const { scale } = this.transform;
    
    return {
      width: canvasSize.width * scale,
      height: canvasSize.height * scale
    };
  }
  
  /**
   * 螢幕矩形轉換為畫布矩形
   */
  screenToCanvasRect(screenRect) {
    const topLeft = this.screenToCanvas({
      x: screenRect.x,
      y: screenRect.y
    });
    
    const size = this.screenToCanvasSize({
      width: screenRect.width,
      height: screenRect.height
    });
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: size.width,
      height: size.height
    };
  }
  
  /**
   * 畫布矩形轉換為螢幕矩形
   */
  canvasToScreenRect(canvasRect) {
    const topLeft = this.canvasToScreen({
      x: canvasRect.x,
      y: canvasRect.y
    });
    
    const size = this.canvasToScreenSize({
      width: canvasRect.width,
      height: canvasRect.height
    });
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: size.width,
      height: size.height
    };
  }
  
  /**
   * 獲取可見區域（畫布座標）
   */
  getVisibleCanvasArea() {
    const topLeft = this.screenToCanvas({ x: 0, y: 0 });
    const bottomRight = this.screenToCanvas({
      x: this.containerSize.width,
      y: this.containerSize.height
    });
    
    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    };
  }
  
  /**
   * 檢查點是否在可見區域內
   */
  isPointVisible(canvasPoint) {
    const visibleArea = this.getVisibleCanvasArea();
    
    return canvasPoint.x >= visibleArea.x &&
           canvasPoint.x <= visibleArea.x + visibleArea.width &&
           canvasPoint.y >= visibleArea.y &&
           canvasPoint.y <= visibleArea.y + visibleArea.height;
  }
  
  /**
   * 檢查矩形是否與可見區域相交
   */
  isRectVisible(canvasRect) {
    const visibleArea = this.getVisibleCanvasArea();
    
    return !(canvasRect.x + canvasRect.width < visibleArea.x ||
             canvasRect.x > visibleArea.x + visibleArea.width ||
             canvasRect.y + canvasRect.height < visibleArea.y ||
             canvasRect.y > visibleArea.y + visibleArea.height);
  }
  
  /**
   * 計算兩點之間的距離（畫布座標）
   */
  getCanvasDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 計算兩點之間的距離（螢幕座標）
   */
  getScreenDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 將點吸附到網格
   */
  snapToGrid(canvasPoint, gridSize = 10) {
    return {
      x: Math.round(canvasPoint.x / gridSize) * gridSize,
      y: Math.round(canvasPoint.y / gridSize) * gridSize
    };
  }
  
  /**
   * 限制點在指定區域內
   */
  clampPoint(point, bounds) {
    return {
      x: Math.max(bounds.x, Math.min(bounds.x + bounds.width, point.x)),
      y: Math.max(bounds.y, Math.min(bounds.y + bounds.height, point.y))
    };
  }
  
  /**
   * 限制矩形在指定區域內
   */
  clampRect(rect, bounds) {
    const clampedX = Math.max(bounds.x, Math.min(bounds.x + bounds.width - rect.width, rect.x));
    const clampedY = Math.max(bounds.y, Math.min(bounds.y + bounds.height - rect.height, rect.y));
    
    return {
      x: clampedX,
      y: clampedY,
      width: rect.width,
      height: rect.height
    };
  }
  
  /**
   * 計算矩形的中心點
   */
  getRectCenter(rect) {
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }
  
  /**
   * 檢查兩個矩形是否相交
   */
  rectsIntersect(rect1, rect2) {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }
  
  /**
   * 計算兩個矩形的交集
   */
  getRectsIntersection(rect1, rect2) {
    const left = Math.max(rect1.x, rect2.x);
    const top = Math.max(rect1.y, rect2.y);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
    
    if (left < right && top < bottom) {
      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
      };
    }
    
    return null;
  }
  
  /**
   * 計算包含所有矩形的邊界框
   */
  getBoundingRect(rects) {
    if (rects.length === 0) return null;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    rects.forEach(rect => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  /**
   * 將畫布座標轉換為相對於元素的座標
   */
  canvasToElementCoords(canvasPoint, element) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = this.container?.getBoundingClientRect();
    
    if (!containerRect) return canvasPoint;
    
    const screenPoint = this.canvasToScreen(canvasPoint);
    
    return {
      x: screenPoint.x + containerRect.left - elementRect.left,
      y: screenPoint.y + containerRect.top - elementRect.top
    };
  }
  
  /**
   * 將相對於元素的座標轉換為畫布座標
   */
  elementToCanvasCoords(elementPoint, element) {
    const elementRect = element.getBoundingClientRect();
    const containerRect = this.container?.getBoundingClientRect();
    
    if (!containerRect) return elementPoint;
    
    const screenPoint = {
      x: elementPoint.x + elementRect.left - containerRect.left,
      y: elementPoint.y + elementRect.top - containerRect.top
    };
    
    return this.screenToCanvas(screenPoint);
  }
  
  /**
   * 獲取當前變換矩陣
   */
  getTransformMatrix() {
    const { scale, translateX, translateY } = this.transform;
    
    return {
      a: scale,    // 水平縮放
      b: 0,        // 水平傾斜
      c: 0,        // 垂直傾斜
      d: scale,    // 垂直縮放
      e: translateX, // 水平平移
      f: translateY  // 垂直平移
    };
  }
  
  /**
   * 應用變換矩陣到點
   */
  applyMatrixToPoint(point, matrix) {
    return {
      x: point.x * matrix.a + point.y * matrix.c + matrix.e,
      y: point.x * matrix.b + point.y * matrix.d + matrix.f
    };
  }
  
  /**
   * 獲取逆變換矩陣
   */
  getInverseTransformMatrix() {
    const { scale, translateX, translateY } = this.transform;
    const invScale = 1 / scale;
    
    return {
      a: invScale,
      b: 0,
      c: 0,
      d: invScale,
      e: -translateX * invScale,
      f: -translateY * invScale
    };
  }
  
  /**
   * 處理視窗大小變更
   */
  handleResize() {
    this.updateSizes();
  }
  
  /**
   * 獲取調試資訊
   */
  getDebugInfo() {
    return {
      transform: { ...this.transform },
      containerSize: { ...this.containerSize },
      canvasSize: { ...this.canvasSize },
      visibleArea: this.getVisibleCanvasArea()
    };
  }
}

