// client/src/components/flashcards/Flashcard3D.js
class Flashcard3D {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    this.options = {
      width: 350,
      height: 250,
      perspective: 1000,
      transitionSpeed: 0.6,
      autoRotate: false,
      autoRotateSpeed: 2,
      shadow: true,
      onFlip: null,
      onReview: null,
      ...options
    };
    
    this.isFlipped = false;
    this.rotation = { x: 0, y: 0 };
    this.autoRotateId = null;
    
    this.init();
  }
  
  init() {
    // Create card element
    this.card = document.createElement('div');
    this.card.className = 'flashcard-3d';
    this.card.style.cssText = `
      width: ${this.options.width}px;
      height: ${this.options.height}px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform ${this.options.transitionSpeed}s;
      cursor: pointer;
      ${this.options.shadow ? 'box-shadow: 0 10px 30px rgba(0,0,0,0.2);' : ''}
    `;
    
    // Create front and back faces
    this.front = this.createFace('front');
    this.back = this.createFace('back');
    
    // Add content to faces
    this.frontContent = document.createElement('div');
    this.frontContent.className = 'flashcard-content';
    this.frontContent.style.cssText = `
      padding: 20px;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    `;
    
    this.backContent = document.createElement('div');
    this.backContent.className = 'flashcard-content';
    this.backContent.style.cssText = this.frontContent.style.cssText;
    
    this.front.appendChild(this.frontContent);
    this.back.appendChild(this.backContent);
    
    // Add faces to card
    this.card.appendChild(this.front);
    this.card.appendChild(this.back);
    
    // Add card to container
    this.container.innerHTML = '';
    this.container.appendChild(this.card);
    
    // Add event listeners
    this.addEventListeners();
    
    // Start auto-rotation if enabled
    if (this.options.autoRotate) {
      this.startAutoRotate();
    }
  }
  
  createFace(face) {
    const element = document.createElement('div');
    element.className = `flashcard-face flashcard-${face}`;
    element.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: ${face === 'front' ? '#ffffff' : '#f8f9fa'};
      ${face === 'back' ? 'transform: rotateY(180deg);' : ''}
    `;
    return element;
  }
  
  setContent(frontHtml, backHtml) {
    this.frontContent.innerHTML = frontHtml;
    this.backContent.innerHTML = backHtml;
  }
  
  setStyles(styles = {}) {
    // Apply styles to front and back
    Object.entries(styles).forEach(([face, style]) => {
      if (face === 'front' || face === 'back') {
        const element = this[`${face}Content`];
        Object.entries(style).forEach(([prop, value]) => {
          element.style[prop] = value;
        });
      }
    });
  }
  
  flip() {
    this.isFlipped = !this.isFlipped;
    this.updateTransform();
    
    if (typeof this.options.onFlip === 'function') {
      this.options.onFlip(this.isFlipped);
    }
  }
  
  updateTransform() {
    const rotateY = this.isFlipped ? 180 : 0;
    this.card.style.transform = `rotateY(${rotateY}deg)`;
  }
  
  addEventListeners() {
    // Click to flip
    this.card.addEventListener('click', () => this.flip());
    
    // 3D tilt effect on mouse move
    if (this.options.tilt) {
      this.card.addEventListener('mousemove', (e) => {
        if (this.isFlipped) return;
        
        const rect = this.card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        this.rotation.x = (y - centerY) / 20;
        this.rotation.y = (centerX - x) / 20;
        
        this.card.style.transform = `
          rotateX(${this.rotation.x}deg)
          rotateY(${this.rotation.y}deg)
          ${this.isFlipped ? 'rotateY(180deg)' : ''}
        `;
      });
      
      this.card.addEventListener('mouseleave', () => {
        if (this.isFlipped) return;
        
        this.rotation = { x: 0, y: 0 };
        this.card.style.transform = this.isFlipped ? 'rotateY(180deg)' : 'none';
        
        if (this.options.autoRotate) {
          this.startAutoRotate();
        }
      });
    }
  }
  
  startAutoRotate() {
    if (this.autoRotateId) {
      cancelAnimationFrame(this.autoRotateId);
    }
    
    let angle = 0;
    const rotate = () => {
      if (this.isFlipped || !this.options.autoRotate) return;
      
      angle += 0.005 * this.options.autoRotateSpeed;
      this.rotation.y = Math.sin(angle) * 5;
      this.rotation.x = Math.cos(angle) * 2.5;
      
      this.card.style.transform = `
        rotateX(${this.rotation.x}deg)
        rotateY(${this.rotation.y}deg)
      `;
      
      this.autoRotateId = requestAnimationFrame(rotate);
    };
    
    rotate();
  }
  
  destroy() {
    if (this.autoRotateId) {
      cancelAnimationFrame(this.autoRotateId);
    }
    
    this.card.removeEventListener('click', this.flip);
    this.container.innerHTML = '';
  }
}

// Add review buttons to the flashcard
Flashcard3D.addReviewButtons = (container, onReview) => {
  const buttons = document.createElement('div');
  buttons.className = 'flashcard-review-buttons';
  buttons.style.cssText = `
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    width: 100%;
  `;
  
  const difficulties = [
    { text: '❌ Again', value: 0, color: '#ff6b6b' },
    { text: '😓 Hard', value: 1, color: '#ffa502' },
    { text: '😃 Good', value: 2, color: '#2ed573' },
    { text: '🎯 Easy', value: 3, color: '#1e90ff' }
  ];
  
  difficulties.forEach(diff => {
    const btn = document.createElement('button');
    btn.textContent = diff.text;
    btn.style.cssText = `
      padding: 8px 12px;
      border: none;
      border-radius: 20px;
      background: ${diff.color};
      color: white;
      cursor: pointer;
      font-size: 14px;
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'none';
      btn.style.boxShadow = 'none';
    });
    
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof onReview === 'function') {
        onReview(diff.value);
      }
    });
    
    buttons.appendChild(btn);
  });
  
  container.appendChild(buttons);
  return buttons;
};

export default Flashcard3D;
