export {GuessCounter};

class GuessCounter {

  constructor(element, resetCount) {
    this.element = element;
    this.resetCount = resetCount;
    this.update(this.resetCount);
  }

  update(newCount){
    this.element.textContent = newCount;
  }

  reset(){
    this.update(this.resetCount);
  }

}