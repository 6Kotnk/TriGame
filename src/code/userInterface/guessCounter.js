export {GuessCounter};

class GuessCounter {

  constructor(element) {
    this.element = element;
    this.update("?");
  }

  update(newCount){
    this.element.textContent = newCount;
  }

  reset(){
    this.update("?");
  }

}