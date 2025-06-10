export {GuessSlider};

class GuessSlider {

  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    // Update slider value display
    this.element = this.HTMLElements.element;
    this.elementValue = this.HTMLElements.elementValue;

    // Initialize with default value (5 guesses)
    this.selectedGuesses = this.sliderToGuesses(6);
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
    if (sliderValue === 11) {
      return Infinity;
    } else {
      return sliderValue;
    }
  }

}








