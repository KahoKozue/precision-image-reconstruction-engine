/**
 * 動畫效果 - 提供各種動畫和過渡效果
 */

export class Animations {
  constructor() {
    // 動畫配置
    this.config = {
      defaultDuration: 300,
      defaultEasing: 'ease-out',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    // 活動動畫追蹤
    this.activeAnimations = new Map();
    this.animationCounter = 0;
  }
  
  /**
   * 淡入動畫
   */
  fadeIn(element, duration = this.config.defaultDuration, easing = this.config.defaultEasing) {
    if (this.config.reducedMotion) {
      element.style.opacity = '1';
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { opacity: 0 },
      { opacity: 1 }
    ], {
      duration,
      easing,
      fill: 'forwards'
    });
  }
  
  /**
   * 淡出動畫
   */
  fadeOut(element, duration = this.config.defaultDuration, easing = this.config.defaultEasing) {
    if (this.config.reducedMotion) {
      element.style.opacity = '0';
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { opacity: 1 },
      { opacity: 0 }
    ], {
      duration,
      easing,
      fill: 'forwards'
    });
  }
  
  /**
   * 滑入動畫
   */
  slideIn(element, direction = 'right', duration = this.config.defaultDuration) {
    if (this.config.reducedMotion) {
      element.style.transform = 'translateX(0)';
      return Promise.resolve();
    }
    
    const transforms = {
      'right': ['translateX(100%)', 'translateX(0)'],
      'left': ['translateX(-100%)', 'translateX(0)'],
      'up': ['translateY(-100%)', 'translateY(0)'],
      'down': ['translateY(100%)', 'translateY(0)']
    };
    
    return this.animate(element, [
      { transform: transforms[direction][0] },
      { transform: transforms[direction][1] }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }
  
  /**
   * 滑出動畫
   */
  slideOut(element, direction = 'right', duration = this.config.defaultDuration) {
    if (this.config.reducedMotion) {
      element.style.transform = direction === 'right' ? 'translateX(100%)' : 
                                direction === 'left' ? 'translateX(-100%)' :
                                direction === 'up' ? 'translateY(-100%)' : 'translateY(100%)';
      return Promise.resolve();
    }
    
    const transforms = {
      'right': ['translateX(0)', 'translateX(100%)'],
      'left': ['translateX(0)', 'translateX(-100%)'],
      'up': ['translateY(0)', 'translateY(-100%)'],
      'down': ['translateY(0)', 'translateY(100%)']
    };
    
    return this.animate(element, [
      { transform: transforms[direction][0] },
      { transform: transforms[direction][1] }
    ], {
      duration,
      easing: 'ease-in',
      fill: 'forwards'
    });
  }
  
  /**
   * 縮放動畫
   */
  scale(element, fromScale = 0, toScale = 1, duration = this.config.defaultDuration) {
    if (this.config.reducedMotion) {
      element.style.transform = `scale(${toScale})`;
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { transform: `scale(${fromScale})` },
      { transform: `scale(${toScale})` }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }
  
  /**
   * 彈跳動畫
   */
  bounce(element, intensity = 1, duration = 600) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    const bounceHeight = 20 * intensity;
    
    return this.animate(element, [
      { transform: 'translateY(0)' },
      { transform: `translateY(-${bounceHeight}px)`, offset: 0.3 },
      { transform: 'translateY(0)', offset: 0.6 },
      { transform: `translateY(-${bounceHeight / 2}px)`, offset: 0.8 },
      { transform: 'translateY(0)' }
    ], {
      duration,
      easing: 'ease-out'
    });
  }
  
  /**
   * 搖擺動畫
   */
  shake(element, intensity = 1, duration = 500) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    const shakeDistance = 10 * intensity;
    
    return this.animate(element, [
      { transform: 'translateX(0)' },
      { transform: `translateX(-${shakeDistance}px)`, offset: 0.1 },
      { transform: `translateX(${shakeDistance}px)`, offset: 0.2 },
      { transform: `translateX(-${shakeDistance}px)`, offset: 0.3 },
      { transform: `translateX(${shakeDistance}px)`, offset: 0.4 },
      { transform: `translateX(-${shakeDistance}px)`, offset: 0.5 },
      { transform: `translateX(${shakeDistance}px)`, offset: 0.6 },
      { transform: `translateX(-${shakeDistance}px)`, offset: 0.7 },
      { transform: `translateX(${shakeDistance}px)`, offset: 0.8 },
      { transform: `translateX(-${shakeDistance}px)`, offset: 0.9 },
      { transform: 'translateX(0)' }
    ], {
      duration,
      easing: 'ease-in-out'
    });
  }
  
  /**
   * 脈衝動畫
   */
  pulse(element, scale = 1.1, duration = 1000) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { transform: 'scale(1)' },
      { transform: `scale(${scale})` },
      { transform: 'scale(1)' }
    ], {
      duration,
      easing: 'ease-in-out',
      iterations: Infinity
    });
  }
  
  /**
   * 旋轉動畫
   */
  rotate(element, fromAngle = 0, toAngle = 360, duration = 1000) {
    if (this.config.reducedMotion) {
      element.style.transform = `rotate(${toAngle}deg)`;
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { transform: `rotate(${fromAngle}deg)` },
      { transform: `rotate(${toAngle}deg)` }
    ], {
      duration,
      easing: 'linear',
      fill: 'forwards'
    });
  }
  
  /**
   * 載入旋轉動畫
   */
  spin(element, duration = 1000) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], {
      duration,
      easing: 'linear',
      iterations: Infinity
    });
  }
  
  /**
   * 圖塊放置動畫
   */
  tilePlacement(element, fromPosition, toPosition, duration = 400) {
    if (this.config.reducedMotion) {
      element.style.left = `${toPosition.x}px`;
      element.style.top = `${toPosition.y}px`;
      return Promise.resolve();
    }
    
    // 計算移動距離
    const deltaX = toPosition.x - fromPosition.x;
    const deltaY = toPosition.y - fromPosition.y;
    
    return this.animate(element, [
      { 
        transform: `translate(${-deltaX}px, ${-deltaY}px) scale(1.1)`,
        opacity: 0.8
      },
      { 
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      }
    ], {
      duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards'
    });
  }
  
  /**
   * 圖塊吸附動畫
   */
  tileSnap(element, duration = 200) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { transform: 'scale(1)' },
      { transform: 'scale(1.05)', offset: 0.5 },
      { transform: 'scale(1)' }
    ], {
      duration,
      easing: 'ease-out'
    });
  }
  
  /**
   * 高亮動畫
   */
  highlight(element, color = '#3b82f6', duration = 1000) {
    if (this.config.reducedMotion) {
      return Promise.resolve();
    }
    
    const originalBoxShadow = element.style.boxShadow;
    
    return this.animate(element, [
      { boxShadow: `0 0 0 0 ${color}` },
      { boxShadow: `0 0 0 10px ${color}00` }
    ], {
      duration,
      easing: 'ease-out'
    }).then(() => {
      element.style.boxShadow = originalBoxShadow;
    });
  }
  
  /**
   * 進度條動畫
   */
  progressBar(element, fromWidth = 0, toWidth = 100, duration = 1000) {
    if (this.config.reducedMotion) {
      element.style.width = `${toWidth}%`;
      return Promise.resolve();
    }
    
    return this.animate(element, [
      { width: `${fromWidth}%` },
      { width: `${toWidth}%` }
    ], {
      duration,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }
  
  /**
   * 數字計數動畫
   */
  countUp(element, fromValue = 0, toValue = 100, duration = 1000) {
    if (this.config.reducedMotion) {
      element.textContent = toValue.toString();
      return Promise.resolve();
    }
    
    const startTime = performance.now();
    const range = toValue - fromValue;
    
    return new Promise((resolve) => {
      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用緩動函數
        const easedProgress = this.easeOutCubic(progress);
        const currentValue = Math.round(fromValue + range * easedProgress);
        
        element.textContent = currentValue.toString();
        
        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(updateCount);
    });
  }
  
  /**
   * 打字機效果
   */
  typewriter(element, text, speed = 50) {
    if (this.config.reducedMotion) {
      element.textContent = text;
      return Promise.resolve();
    }
    
    element.textContent = '';
    let index = 0;
    
    return new Promise((resolve) => {
      const typeChar = () => {
        if (index < text.length) {
          element.textContent += text.charAt(index);
          index++;
          setTimeout(typeChar, speed);
        } else {
          resolve();
        }
      };
      
      typeChar();
    });
  }
  
  /**
   * 基礎動畫方法
   */
  animate(element, keyframes, options = {}) {
    if (!element || !element.animate) {
      return Promise.resolve();
    }
    
    const animationId = this.generateAnimationId();
    
    const animation = element.animate(keyframes, {
      duration: this.config.defaultDuration,
      easing: this.config.defaultEasing,
      fill: 'none',
      ...options
    });
    
    this.activeAnimations.set(animationId, animation);
    
    return new Promise((resolve, reject) => {
      animation.onfinish = () => {
        this.activeAnimations.delete(animationId);
        resolve();
      };
      
      animation.oncancel = () => {
        this.activeAnimations.delete(animationId);
        reject(new Error('動畫被取消'));
      };
    });
  }
  
  /**
   * 停止元素的所有動畫
   */
  stopAnimations(element) {
    this.activeAnimations.forEach((animation, id) => {
      if (animation.effect && animation.effect.target === element) {
        animation.cancel();
        this.activeAnimations.delete(id);
      }
    });
  }
  
  /**
   * 停止所有動畫
   */
  stopAllAnimations() {
    this.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.activeAnimations.clear();
  }
  
  /**
   * 緩動函數
   */
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
  
  easeInCubic(t) {
    return t * t * t;
  }
  
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * 彈性緩動
   */
  easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
  
  /**
   * 生成動畫ID
   */
  generateAnimationId() {
    return `animation_${++this.animationCounter}_${Date.now()}`;
  }
  
  /**
   * 設置動畫配置
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * 獲取活動動畫數量
   */
  getActiveAnimationCount() {
    return this.activeAnimations.size;
  }
  
  /**
   * 檢查是否支援動畫
   */
  isAnimationSupported() {
    return !this.config.reducedMotion && 
           typeof Element !== 'undefined' && 
           Element.prototype.animate;
  }
  
  /**
   * 清理資源
   */
  destroy() {
    this.stopAllAnimations();
  }
}

