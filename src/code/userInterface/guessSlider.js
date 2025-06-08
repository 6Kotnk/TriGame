export {GuessSlider};

class GuessSlider {

  constructor(HTMLElements) {

    this.HTMLElements = HTMLElements;

    // Update slider value display
    this.guessSlider = this.HTMLElements.guessSlider;
    this.guessSliderValue = this.HTMLElements.guessSliderValue;

    // Initialize with default value (5 guesses)
    this.selectedGuesses = this.sliderToGuesses(6);
    this.guessSliderValue.textContent = this.selectedGuesses;

    this.guessSlider.addEventListener("input", this.handleInput);

  }

  handleInput = (event) => {
    this.selectedGuesses = this.sliderToGuesses(parseInt(event.target.value));
    this.guessSliderValue.textContent = this.selectedGuesses === Infinity ? '∞' : this.selectedGuesses;
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

  // Function to convert guess count back to slider value (for reset)
  guessesToSlider(guesses) {
    if (guesses === Infinity) {
      return 10;
    } else {
      return guesses;
    }
  }

}








