/**
 * 事件處理器 - 統一管理應用程式事件
 */

export class EventHandler {
  constructor() {
    // 事件監聽器映射
    this.listeners = new Map();
    
    // 一次性事件監聽器
    this.onceListeners = new Map();
    
    // 事件歷史記錄
    this.eventHistory = [];
    this.maxHistorySize = 100;
    
    // 防抖動和節流控制
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
  }
  
  /**
   * 添加事件監聽器
   */
  on(eventName, callback, options = {}) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    
    const listener = {
      callback,
      options,
      id: this.generateListenerId()
    };
    
    this.listeners.get(eventName).push(listener);
    
    return listener.id;
  }
  
  /**
   * 添加一次性事件監聽器
   */
  once(eventName, callback, options = {}) {
    if (!this.onceListeners.has(eventName)) {
      this.onceListeners.set(eventName, []);
    }
    
    const listener = {
      callback,
      options,
      id: this.generateListenerId()
    };
    
    this.onceListeners.get(eventName).push(listener);
    
    return listener.id;
  }
  
  /**
   * 移除事件監聽器
   */
  off(eventName, listenerId = null) {
    if (listenerId) {
      // 移除特定監聽器
      this.removeListenerById(eventName, listenerId);
    } else {
      // 移除所有監聽器
      this.listeners.delete(eventName);
      this.onceListeners.delete(eventName);
    }
  }
  
  /**
   * 觸發事件
   */
  emit(eventName, data = null, options = {}) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      options
    };
    
    // 記錄事件歷史
    this.recordEvent(event);
    
    // 處理防抖動
    if (options.debounce) {
      this.handleDebounce(eventName, () => {
        this.executeEvent(event);
      }, options.debounce);
      return;
    }
    
    // 處理節流
    if (options.throttle) {
      this.handleThrottle(eventName, () => {
        this.executeEvent(event);
      }, options.throttle);
      return;
    }
    
    // 立即執行
    this.executeEvent(event);
  }
  
  /**
   * 執行事件
   */
  executeEvent(event) {
    const { name, data } = event;
    
    // 執行普通監聽器
    const listeners = this.listeners.get(name) || [];
    listeners.forEach(listener => {
      try {
        listener.callback(data, event);
      } catch (error) {
        console.error(`事件監聽器錯誤 (${name}):`, error);
      }
    });
    
    // 執行一次性監聽器
    const onceListeners = this.onceListeners.get(name) || [];
    onceListeners.forEach(listener => {
      try {
        listener.callback(data, event);
      } catch (error) {
        console.error(`一次性事件監聽器錯誤 (${name}):`, error);
      }
    });
    
    // 清除一次性監聽器
    if (onceListeners.length > 0) {
      this.onceListeners.delete(name);
    }
  }
  
  /**
   * 處理防抖動
   */
  handleDebounce(eventName, callback, delay) {
    // 清除之前的計時器
    if (this.debounceTimers.has(eventName)) {
      clearTimeout(this.debounceTimers.get(eventName));
    }
    
    // 設置新的計時器
    const timer = setTimeout(() => {
      callback();
      this.debounceTimers.delete(eventName);
    }, delay);
    
    this.debounceTimers.set(eventName, timer);
  }
  
  /**
   * 處理節流
   */
  handleThrottle(eventName, callback, delay) {
    if (this.throttleTimers.has(eventName)) {
      return; // 正在節流中，忽略此次調用
    }
    
    callback();
    
    const timer = setTimeout(() => {
      this.throttleTimers.delete(eventName);
    }, delay);
    
    this.throttleTimers.set(eventName, timer);
  }
  
  /**
   * 記錄事件歷史
   */
  recordEvent(event) {
    this.eventHistory.push(event);
    
    // 限制歷史記錄大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * 根據ID移除監聽器
   */
  removeListenerById(eventName, listenerId) {
    // 從普通監聽器中移除
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const index = listeners.findIndex(l => l.id === listenerId);
      if (index > -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          this.listeners.delete(eventName);
        }
        return true;
      }
    }
    
    // 從一次性監聽器中移除
    const onceListeners = this.onceListeners.get(eventName);
    if (onceListeners) {
      const index = onceListeners.findIndex(l => l.id === listenerId);
      if (index > -1) {
        onceListeners.splice(index, 1);
        if (onceListeners.length === 0) {
          this.onceListeners.delete(eventName);
        }
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 生成監聽器ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 獲取事件監聽器數量
   */
  getListenerCount(eventName) {
    const listeners = this.listeners.get(eventName) || [];
    const onceListeners = this.onceListeners.get(eventName) || [];
    return listeners.length + onceListeners.length;
  }
  
  /**
   * 獲取所有事件名稱
   */
  getEventNames() {
    const names = new Set();
    
    this.listeners.forEach((_, name) => names.add(name));
    this.onceListeners.forEach((_, name) => names.add(name));
    
    return Array.from(names);
  }
  
  /**
   * 獲取事件歷史
   */
  getEventHistory(eventName = null, limit = 10) {
    let history = this.eventHistory;
    
    if (eventName) {
      history = history.filter(event => event.name === eventName);
    }
    
    return history.slice(-limit);
  }
  
  /**
   * 清除事件歷史
   */
  clearEventHistory() {
    this.eventHistory = [];
  }
  
  /**
   * 等待特定事件
   */
  waitFor(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const listenerId = this.once(eventName, (data) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });
      
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          this.off(eventName, listenerId);
          reject(new Error(`等待事件 ${eventName} 超時`));
        }, timeout);
      }
    });
  }
  
  /**
   * 創建事件代理
   */
  createProxy(targetEventName, sourceEventName, transform = null) {
    return this.on(sourceEventName, (data) => {
      const transformedData = transform ? transform(data) : data;
      this.emit(targetEventName, transformedData);
    });
  }
  
  /**
   * 批量觸發事件
   */
  emitBatch(events) {
    events.forEach(({ name, data, options }) => {
      this.emit(name, data, options);
    });
  }
  
  /**
   * 創建事件命名空間
   */
  createNamespace(namespace) {
    return {
      on: (eventName, callback, options) => {
        return this.on(`${namespace}:${eventName}`, callback, options);
      },
      once: (eventName, callback, options) => {
        return this.once(`${namespace}:${eventName}`, callback, options);
      },
      off: (eventName, listenerId) => {
        return this.off(`${namespace}:${eventName}`, listenerId);
      },
      emit: (eventName, data, options) => {
        return this.emit(`${namespace}:${eventName}`, data, options);
      }
    };
  }
  
  /**
   * 獲取調試資訊
   */
  getDebugInfo() {
    const listenerCounts = {};
    
    this.listeners.forEach((listeners, eventName) => {
      listenerCounts[eventName] = (listenerCounts[eventName] || 0) + listeners.length;
    });
    
    this.onceListeners.forEach((listeners, eventName) => {
      listenerCounts[eventName] = (listenerCounts[eventName] || 0) + listeners.length;
    });
    
    return {
      totalEvents: this.getEventNames().length,
      listenerCounts,
      eventHistorySize: this.eventHistory.length,
      activeDebounceTimers: this.debounceTimers.size,
      activeThrottleTimers: this.throttleTimers.size
    };
  }
  
  /**
   * 清理所有資源
   */
  destroy() {
    // 清除所有監聽器
    this.listeners.clear();
    this.onceListeners.clear();
    
    // 清除所有計時器
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    
    // 清除事件歷史
    this.eventHistory = [];
  }
}

