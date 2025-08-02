/**
 * 檔案處理器 - 處理檔案上傳、下載和格式轉換
 */

export class FileHandler {
  constructor() {
    // 支援的檔案類型
    this.supportedImageTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/svg+xml'
    ];
    
    // 檔案大小限制 (10MB)
    this.maxFileSize = 10 * 1024 * 1024;
    
    // 下載計數器
    this.downloadCounter = 0;
  }
  
  /**
   * 讀取檔案
   */
  async readFile(file, readAs = 'dataURL') {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('沒有提供檔案'));
        return;
      }
      
      // 檢查檔案大小
      if (file.size > this.maxFileSize) {
        reject(new Error(`檔案大小超過限制 (${this.formatFileSize(this.maxFileSize)})`));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          content: e.target.result,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        });
      };
      
      reader.onerror = () => {
        reject(new Error('檔案讀取失敗'));
      };
      
      // 根據讀取方式選擇方法
      switch (readAs) {
        case 'text':
          reader.readAsText(file);
          break;
        case 'arrayBuffer':
          reader.readAsArrayBuffer(file);
          break;
        case 'binaryString':
          reader.readAsBinaryString(file);
          break;
        case 'dataURL':
        default:
          reader.readAsDataURL(file);
          break;
      }
    });
  }
  
  /**
   * 驗證圖像檔案
   */
  validateImageFile(file) {
    const errors = [];
    
    // 檢查檔案類型
    if (!this.supportedImageTypes.includes(file.type)) {
      errors.push('不支援的圖像格式');
    }
    
    // 檢查檔案大小
    if (file.size > this.maxFileSize) {
      errors.push(`檔案大小超過限制 (${this.formatFileSize(this.maxFileSize)})`);
    }
    
    // 檢查檔案名稱
    if (!file.name || file.name.trim() === '') {
      errors.push('檔案名稱無效');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 下載圖像
   */
  async downloadImage(image, filename = null) {
    try {
      let blob;
      let downloadFilename = filename;
      
      if (image.file && image.file instanceof Blob) {
        // 如果有原始檔案，直接使用
        blob = image.file;
      } else if (image.src) {
        // 從圖像源創建 Blob
        blob = await this.createBlobFromImageSrc(image.src);
      } else {
        throw new Error('無效的圖像數據');
      }
      
      // 生成檔案名稱
      if (!downloadFilename) {
        downloadFilename = this.generateFilename('assembled-puzzle', 'png');
      }
      
      // 創建下載連結
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      
      // 觸發下載
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理 URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      this.downloadCounter++;
      
      return {
        success: true,
        filename: downloadFilename,
        size: blob.size
      };
      
    } catch (error) {
      console.error('下載失敗:', error);
      throw new Error(`下載失敗: ${error.message}`);
    }
  }
  
  /**
   * 從圖像源創建 Blob
   */
  async createBlobFromImageSrc(src) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('無法創建 Blob'));
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        reject(new Error('圖像載入失敗'));
      };
      
      img.src = src;
    });
  }
  
  /**
   * 生成檔案名稱
   */
  generateFilename(baseName, extension, includeTimestamp = true) {
    let filename = baseName;
    
    if (includeTimestamp) {
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, -5);
      filename += `_${timestamp}`;
    }
    
    if (this.downloadCounter > 0) {
      filename += `_${this.downloadCounter}`;
    }
    
    return `${filename}.${extension}`;
  }
  
  /**
   * 格式化檔案大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * 獲取檔案擴展名
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }
  
  /**
   * 獲取檔案基本名稱（不含擴展名）
   */
  getBaseName(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex > 0 ? filename.slice(0, lastDotIndex) : filename;
  }
  
  /**
   * 轉換圖像格式
   */
  async convertImageFormat(image, targetFormat, quality = 0.9) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image.element, 0, 0);
      
      const mimeType = this.getMimeType(targetFormat);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const convertedImg = new Image();
          convertedImg.onload = () => {
            resolve({
              src: convertedImg.src,
              width: convertedImg.width,
              height: convertedImg.height,
              element: convertedImg,
              file: blob,
              format: targetFormat
            });
          };
          convertedImg.src = URL.createObjectURL(blob);
        } else {
          reject(new Error('格式轉換失敗'));
        }
      }, mimeType, quality);
    });
  }
  
  /**
   * 獲取 MIME 類型
   */
  getMimeType(format) {
    const mimeTypes = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'bmp': 'image/bmp'
    };
    
    return mimeTypes[format.toLowerCase()] || 'image/png';
  }
  
  /**
   * 壓縮圖像
   */
  async compressImage(image, quality = 0.8, maxWidth = null, maxHeight = null) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      let { width, height } = image;
      
      // 計算新尺寸
      if (maxWidth || maxHeight) {
        const ratio = Math.min(
          maxWidth ? maxWidth / width : 1,
          maxHeight ? maxHeight / height : 1
        );
        
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(image.element, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedImg = new Image();
          compressedImg.onload = () => {
            resolve({
              src: compressedImg.src,
              width: compressedImg.width,
              height: compressedImg.height,
              element: compressedImg,
              file: blob,
              originalSize: image.file ? image.file.size : 0,
              compressedSize: blob.size,
              compressionRatio: image.file ? (1 - blob.size / image.file.size) : 0
            });
          };
          compressedImg.src = URL.createObjectURL(blob);
        } else {
          reject(new Error('圖像壓縮失敗'));
        }
      }, 'image/jpeg', quality);
    });
  }
  
  /**
   * 批量處理檔案
   */
  async processFiles(files, processor) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await processor(files[i], i);
        results.push(result);
      } catch (error) {
        errors.push({
          file: files[i],
          error: error.message
        });
      }
    }
    
    return {
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length
    };
  }
  
  /**
   * 創建檔案選擇器
   */
  createFileSelector(options = {}) {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    
    // 設置選項
    if (options.accept) {
      input.accept = options.accept;
    } else {
      input.accept = this.supportedImageTypes.join(',');
    }
    
    if (options.multiple) {
      input.multiple = true;
    }
    
    return new Promise((resolve, reject) => {
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        document.body.removeChild(input);
        
        if (files.length > 0) {
          resolve(files);
        } else {
          reject(new Error('沒有選擇檔案'));
        }
      };
      
      input.oncancel = () => {
        document.body.removeChild(input);
        reject(new Error('用戶取消選擇'));
      };
      
      document.body.appendChild(input);
      input.click();
    });
  }
  
  /**
   * 保存到本地存儲
   */
  saveToLocalStorage(key, data) {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('保存到本地存儲失敗:', error);
      return false;
    }
  }
  
  /**
   * 從本地存儲載入
   */
  loadFromLocalStorage(key) {
    try {
      const serializedData = localStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) : null;
    } catch (error) {
      console.error('從本地存儲載入失敗:', error);
      return null;
    }
  }
  
  /**
   * 清除本地存儲
   */
  clearLocalStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('清除本地存儲失敗:', error);
      return false;
    }
  }
  
  /**
   * 獲取統計資訊
   */
  getStatistics() {
    return {
      downloadCount: this.downloadCounter,
      supportedFormats: this.supportedImageTypes.length,
      maxFileSize: this.formatFileSize(this.maxFileSize)
    };
  }
}

