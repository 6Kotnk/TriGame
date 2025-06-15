export {Slider};

class Slider {

  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;
    this.element = this.HTMLElements.element;
    this.elementValue = this.HTMLElements.elementValue;

    // Initialize with default value (6 guesses)
    this.selectedGuesses = this.sliderToGuesses(parseInt(this.element.value));
    this.elementValue.textContent = this.selectedGuesses;

    this.element.addEventListener("input", this.handleInput);

  }

  handleInput = (event) => {
    this.selectedGuesses = this.sliderToGuesses(parseInt(event.target.value));
    this.elementValue.textContent = this.selectedGuesses === Infinity ? '∞' : this.selectedGuesses;
  }

  getSliderValue(){
    return this.selectedGuesses;
  }

  sliderToGuesses(sliderValue) {
    if (sliderValue === parseInt(this.element.max)) {
      return Infinity;
    } else {
      return sliderValue;
    }
  }

}








