import * as UTILS from '../utils.js';

export {StateDisplay};

class StateDisplay {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;

    this.element = this.HTMLElements.element;
    this.value = this.HTMLElements.value;
    this.reset();
  }

  update(newCount, totalCount = null){
    this.value.textContent = newCount;
    
    // Apply color based on remaining count if total is provided
    if (totalCount !== null && typeof newCount === 'number' && totalCount > 0) {
      const value = 1 - ((newCount - 1) / (totalCount - 1)); // 0 = good/green, 1 = bad/red
      const color = UTILS.getColorFromValue(value);
      this.element.style.borderColor = color;
    } else {
      // Reset to default color
      this.element.style.color = '';
    }
  }

  reset(){
    this.update("?");
  }

}