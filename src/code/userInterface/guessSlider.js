export {GuessSlider};

class GuessSlider {

  constructor() {

    // Update slider value display
    this.guessSlider = document.getElementById('guessSlider');
    this.guessValue = document.getElementById('guessValue');

    // Initialize with default value (5 guesses)
    this.selectedGuesses = this.sliderToGuesses(6);
    this.guessValue.textContent = this.selectedGuesses;

    this.guessSlider.addEventListener("input", this.handleInput);

  }

  handleInput = (event) => {
    this.selectedGuesses = this.sliderToGuesses(parseInt(event.target.value));
    this.guessValue.textContent = this.selectedGuesses === Infinity ? '∞' : this.selectedGuesses;
  }

  getSliderValue(){
    return this.selectedGuesses;
  }

  sliderToGuesses(sliderValue) {
    if (sliderValue === 10) {
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








