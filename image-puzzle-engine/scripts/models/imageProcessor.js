/**
 * 圖像處理器 - 處理所有圖像相關操作
 */

export class ImageProcessor {
  constructor() {
    // 支援的圖像格式
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    // 最大圖像尺寸
    this.maxImageSize = 4096;
    
    // Canvas 元素池
    this.canvasPool = [];
    this.maxPoolSize = 5;
  }
  
  /**
   * 載入圖像檔案
   */
  async loadImage(file) {
    return new Promise((resolve, reject) => {
      // 檢查檔案類型
      if (!this.supportedFormats.includes(file.type)) {
        reject(new Error('不支援的圖像格式'));
        return;
      }
      
      // 檢查檔案大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('檔案大小超過限制'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          console.log('Image loaded successfully:', img.src, img.width, img.height);
          // 檢查圖像尺寸
          if (img.width > this.maxImageSize || img.height > this.maxImageSize) {
            // 自動縮放大圖像
            this.resizeImage(img, this.maxImageSize)
              .then(resolve)
              .catch(reject);
          } else {
            resolve({
              src: img.src,
              width: img.width,
              height: img.height,
              element: img,
              file: file
            });
          }
        };
        
        img.onerror = (e) => {
          console.error('Image loading failed:', e);
          reject(new Error('圖像載入失敗'));
        };
        
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('檔案讀取失敗'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * 調整圖像大小
   */
  async resizeImage(img, maxSize) {
    return new Promise((resolve, reject) => {
      const canvas = this.getCanvas();
      const ctx = canvas.getContext('2d');
      
      // 計算新尺寸
      let { width, height } = img;
      const ratio = Math.min(maxSize / width, maxSize / height);
      
      if (ratio < 1) {
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 繪製調整後的圖像
      ctx.drawImage(img, 0, 0, width, height);
      
      // 轉換為新的圖像
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for resized image.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建調整大小圖像的 Blob'));
          return;
        }
        const newImg = new Image();
        newImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            src: newImg.src,
            width: newImg.width,
            height: newImg.height,
            element: newImg,
            file: blob
          });
        };
        newImg.onerror = (e) => {
          console.error('Resized image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('調整大小圖像載入失敗'));
        };
        newImg.src = URL.createObjectURL(blob);
      }, 'image/png');
    });
  }
  
  /**
   * 裁剪圖像
   */
  async cropImage(image, cropSettings) {
    return new Promise((resolve) => {
      const canvas = this.getCanvas();
      const ctx = canvas.getContext('2d');
      
      const { x, y, width, height } = cropSettings;
      
      canvas.width = width;
      canvas.height = height;
      
      // 繪製裁剪後的圖像
      ctx.drawImage(
        image.element,
        x, y, width, height,  // 源區域
        0, 0, width, height   // 目標區域
      );
      
      // 轉換為新的圖像
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for cropped image.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建裁剪圖像的 Blob'));
          return;
        }
        const croppedImg = new Image();
        croppedImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            src: croppedImg.src,
            width: croppedImg.width,
            height: croppedImg.height,
            element: croppedImg,
            file: blob
          });
        };
        croppedImg.onerror = (e) => {
          console.error('Cropped image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('裁剪圖像載入失敗'));
        };
        croppedImg.src = URL.createObjectURL(blob);
      }, 'image/png');
    });
  }
  
  /**
   * 生成圖塊
   */
  async generateTiles(image, tileSettings) {
    const { width: tileWidth, height: tileHeight } = tileSettings;
    const { width: imageWidth, height: imageHeight } = image;
    
    const tilesX = Math.ceil(imageWidth / tileWidth);
    const tilesY = Math.ceil(imageHeight / tileHeight);
    const totalTiles = tilesX * tilesY;
    
    const tiles = [];
    
    for (let row = 0; row < tilesY; row++) {
      for (let col = 0; col < tilesX; col++) {
        const x = col * tileWidth;
        const y = row * tileHeight;
        
        // 計算實際圖塊尺寸（邊緣圖塊可能較小）
        const actualWidth = Math.min(tileWidth, imageWidth - x);
        const actualHeight = Math.min(tileHeight, imageHeight - y);
        
        const tile = await this.createTile(
          image,
          { x, y, width: actualWidth, height: actualHeight },
          { row, col, index: row * tilesX + col }
        );
        
        tiles.push(tile);
      }
    }
    
    return tiles;
  }
  
  /**
   * 創建單個圖塊
   */
  async createTile(image, region, metadata) {
    return new Promise((resolve) => {
      const canvas = this.getCanvas();
      const ctx = canvas.getContext('2d');
      
      const { x, y, width, height } = region;
      
      canvas.width = width;
      canvas.height = height;
      
      // 繪製圖塊
      ctx.drawImage(
        image.element,
        x, y, width, height,  // 源區域
        0, 0, width, height   // 目標區域
      );
      
      // 轉換為圖塊對象
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for tile.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建圖塊的 Blob'));
          return;
        }
        const tileImg = new Image();
        tileImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            id: `tile-${metadata.index}`,
            src: tileImg.src,
            width: width,
            height: height,
            element: tileImg,
            file: blob,
            originalPosition: { x, y },
            gridPosition: { row: metadata.row, col: metadata.col },
            index: metadata.index
          });
        };
        tileImg.onerror = (e) => {
          console.error('Tile image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('圖塊圖像載入失敗'));
        };
        tileImg.src = URL.createObjectURL(blob);
      }, 'image/png');
    });
  }
  
  /**
   * 組裝圖像
   */
  async assembleImage(placedTiles) {
    if (placedTiles.length === 0) {
      throw new Error('沒有圖塊可以組裝');
    }
    
    // 計算組裝後的圖像尺寸
    const bounds = this.calculateAssemblyBounds(placedTiles);
    
    const canvas = this.getCanvas();
    const ctx = canvas.getContext('2d');
    
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    
    // 清空畫布
    ctx.clearRect(0, 0, bounds.width, bounds.height);
    
    // 繪製所有圖塊
    for (const tile of placedTiles) {
      const x = tile.position.x - bounds.x;
      const y = tile.position.y - bounds.y;
      
      ctx.drawImage(tile.element, x, y, tile.width, tile.height);
    }
    
    // 轉換為最終圖像
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for assembled image.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建組裝圖像的 Blob'));
          return;
        }
        const assembledImg = new Image();
        assembledImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            src: assembledImg.src,
            width: assembledImg.width,
            height: assembledImg.height,
            element: assembledImg,
            file: blob
          });
        };
        assembledImg.onerror = (e) => {
          console.error('Assembled image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('組裝圖像載入失敗'));
        };
        assembledImg.src = URL.createObjectURL(blob);
      }, 'image/png');
    });
  }
  
  /**
   * 計算組裝邊界
   */
  calculateAssemblyBounds(placedTiles) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    placedTiles.forEach(tile => {
      const { x, y } = tile.position;
      const { width, height } = tile;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  
  /**
   * 創建圖像預覽
   */
  async createPreview(image, maxSize = 300) {
    const canvas = this.getCanvas();
    const ctx = canvas.getContext('2d');
    
    // 計算預覽尺寸
    const ratio = Math.min(maxSize / image.width, maxSize / image.height);
    const previewWidth = image.width * ratio;
    const previewHeight = image.height * ratio;
    
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    
    // 繪製預覽
    ctx.drawImage(image.element, 0, 0, previewWidth, previewHeight);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for preview image.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建預覽圖像的 Blob'));
          return;
        }
        const previewImg = new Image();
        previewImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            src: previewImg.src,
            width: previewImg.width,
            height: previewImg.height,
            element: previewImg,
            file: blob
          });
        };
        previewImg.onerror = (e) => {
          console.error('Preview image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('預覽圖像載入失敗'));
        };
        previewImg.src = URL.createObjectURL(blob);
      }, 'image/jpeg', 0.8);
    });
  }
  
  /**
   * 應用圖像濾鏡
   */
  async applyFilter(image, filterType, intensity = 1.0) {
    const canvas = this.getCanvas();
    const ctx = canvas.getContext('2d');
    
    canvas.width = image.width;
    canvas.height = image.height;
    
    // 繪製原始圖像
    ctx.drawImage(image.element, 0, 0);
    
    // 獲取圖像數據
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 應用濾鏡
    switch (filterType) {
      case 'grayscale':
        this.applyGrayscaleFilter(data, intensity);
        break;
      case 'sepia':
        this.applySepiaFilter(data, intensity);
        break;
      case 'brightness':
        this.applyBrightnessFilter(data, intensity);
        break;
      case 'contrast':
        this.applyContrastFilter(data, intensity);
        break;
      case 'blur':
        // 模糊濾鏡需要特殊處理
        ctx.filter = `blur(${intensity}px)`;
        ctx.drawImage(image.element, 0, 0);
        break;
    }
    
    if (filterType !== 'blur') {
      // 將處理後的數據寫回畫布
      ctx.putImageData(imageData, 0, 0);
    }
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob for filtered image.');
          this.releaseCanvas(canvas);
          reject(new Error('無法創建濾鏡圖像的 Blob'));
          return;
        }
        const filteredImg = new Image();
        filteredImg.onload = () => {
          this.releaseCanvas(canvas);
          resolve({
            src: filteredImg.src,
            width: filteredImg.width,
            height: filteredImg.height,
            element: filteredImg,
            file: blob
          });
        };
        filteredImg.onerror = (e) => {
          console.error('Filtered image loading failed:', e);
          this.releaseCanvas(canvas);
          reject(new Error('濾鏡圖像載入失敗'));
        };
        filteredImg.src = URL.createObjectURL(blob);
      }, 'image/png');
    });
  }
  
  /**
   * 應用灰階濾鏡
   */
  applyGrayscaleFilter(data, intensity) {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = data[i] * (1 - intensity) + gray * intensity;
      data[i + 1] = data[i + 1] * (1 - intensity) + gray * intensity;
      data[i + 2] = data[i + 2] * (1 - intensity) + gray * intensity;
    }
  }
  
  /**
   * 應用懷舊濾鏡
   */
  applySepiaFilter(data, intensity) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const sepiaR = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      const sepiaG = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      const sepiaB = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      
      data[i] = r * (1 - intensity) + sepiaR * intensity;
      data[i + 1] = g * (1 - intensity) + sepiaG * intensity;
      data[i + 2] = b * (1 - intensity) + sepiaB * intensity;
    }
  }
  
  /**
   * 應用亮度濾鏡
   */
  applyBrightnessFilter(data, intensity) {
    const adjustment = (intensity - 1) * 255;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + adjustment));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + adjustment));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + adjustment));
    }
  }
  
  /**
   * 應用對比度濾鏡
   */
  applyContrastFilter(data, intensity) {
    const factor = (259 * (intensity * 255 + 255)) / (255 * (259 - intensity * 255));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
    }
  }
  
  /**
   * 獲取Canvas元素
   */
  getCanvas() {
    if (this.canvasPool.length > 0) {
      return this.canvasPool.pop();
    }
    
    const canvas = document.createElement('canvas');
    return canvas;
  }
  
  /**
   * 釋放Canvas元素
   */
  releaseCanvas(canvas) {
    if (this.canvasPool.length < this.maxPoolSize) {
      // 清空畫布
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.canvasPool.push(canvas);
    }
  }
  
  /**
   * 獲取圖像資訊
   */
  getImageInfo(image) {
    return {
      width: image.width,
      height: image.height,
      aspectRatio: image.width / image.height,
      fileSize: image.file ? image.file.size : 0,
      format: image.file ? image.file.type : 'unknown'
    };
  }
  
  /**
   * 檢查圖像是否有效
   */
  isValidImage(image) {
    return image && 
           image.element && 
           image.width > 0 && 
           image.height > 0 &&
           image.src;
  }
  
  /**
   * 清理資源
   */
  destroy() {
    // 清空Canvas池
    this.canvasPool = [];
  }
}

