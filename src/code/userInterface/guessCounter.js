export {GuessCounter};

class GuessCounter {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;

    this.element = this.HTMLElements.element;
    this.update("?");
  }

  update(newCount){
    this.element.textContent = newCount;
  }

  reset(){
    this.update("?");
  }

}