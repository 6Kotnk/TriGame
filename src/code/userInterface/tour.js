import "@sjmc11/tourguidejs/src/scss/tour.scss" // Styles
import {TourGuideClient} from "@sjmc11/tourguidejs/src/Tour" // JS

export {Tour};

class Tour {

  constructor(HTMLElements) {
    this.HTMLElements = HTMLElements;
    this.tg = new TourGuideClient({
      steps: [], // We'll set this dynamically
      completeOnFinish: true,
      keyboardControls: true,
      showStepProgress: true,
    });

    // Add event listeners that stop the tour button animation on the first user interaction
    document.body.addEventListener('click', this.stopTutorialAnimation, { once: true });
    document.body.addEventListener('keydown', this.stopTutorialAnimation, { once: true });
  }

  startTour(isDifficultyVisible) {
    // Generate steps dynamically when tour starts
    const dynamicSteps = this.createTourSteps(isDifficultyVisible);
    
    // Update the tour with new steps
    this.tg.setOptions({
      steps: dynamicSteps,
      targetPadding: 10,
      dialogMaxWidth: 300,
      dialogClass: "custom"
    });
    
    this.tg.start();
  }

  // Function to remove the tour button animation
  stopTutorialAnimation = () => {
    if (this.tourButton && this.tourButton.classList.contains("tutorial-pulse")) {
      this.tourButton.classList.remove("tutorial-pulse");
      // Remove the event listeners so this doesn't keep firing
      document.body.removeEventListener('click', this.stopTutorialAnimation);
      document.body.removeEventListener('keydown', this.stopTutorialAnimation);
    }
  }


  createTourSteps(isDifficultyVisible) {
    const steps = [{
      title: "Welcome to TriGame!",
      content: "Welcome to the tutorial! This game challenges you to create spherical triangles between cities with specific target areas. Let's learn how to play!",
      order: 0,
    }];

    let currentOrder = 1;

    // Add title screen step only if panel is visible
    if (isDifficultyVisible) {
      steps.push({
        title: "Game Modes",
        content: "Choose 'Play' to start today's daily challenge - a unique puzzle that's the same for everyone today! The game will randomly select a difficulty and number of guesses for you.",
        target: "#titleScreen",
        propagateEvents: true,
        order: currentOrder++,
      });
    }

    // Add the main game steps
    steps.push({
      title: "Your Target Area",
      content: "This shows your target area in square kilometers. Your triangle's area must be within 10% of this target to win!",
      target: "#targetDisplay",
      order: currentOrder++,
    });

    steps.push({
      title: "City Selection",
      content: "Enter three cities here to form your triangle. Start typing and select from the dropdown suggestions.",
      target: "#cityInputs",
      propagateEvents: true,
      order: currentOrder++,
    });

    steps.push({
      title: "Submit Your Guess",
      content: "Once you've selected three cities, click this button to calculate your triangle's area and see how close you are to the target.",
      target: "#submitButton",
      order: currentOrder++,
    });

    steps.push({
      title: "Game Dashboard",
      content: "Track your progress here! You'll see how many guesses you have remaining and the results of your previous attempts.",
      target: "#dashboard",
      order: currentOrder++,
    });

    steps.push({
      title: "Visualize Your Triangle",
      content: "Your selected cities will form a triangle on this world map, helping you visualize your guess.",
      target: "#rightPanel",
      order: currentOrder++,
    });

    steps.push({
      title: "Ready to Play!",
      content: "That's everything you need to know! Keep submitting guesses until you hit the target area. Good luck!",
      order: currentOrder++,
    });

    return steps;
  }

}