import "@sjmc11/tourguidejs/src/scss/tour.scss" // Styles
import {TourGuideClient} from "@sjmc11/tourguidejs/src/Tour" // JS

function createTourSteps() {
  const steps = [{
    title: "Welcome to TriGame!",
    content: "Welcome to the tutorial! This game challenges you to create spherical triangles between cities with specific target areas. Let's learn how to play!",
    order: 0,
  }];

  // Check if difficulty panel is still visible
  const difficultyPanel = document.getElementById("difficultyPanel");
  const isDifficultyVisible = difficultyPanel && 
    window.getComputedStyle(difficultyPanel).display !== "none" && 
    !difficultyPanel.hidden;

  let currentOrder = 1;

  // Add difficulty step only if panel is visible
  if (isDifficultyVisible) {
    steps.push({
      title: "Choose Your Difficulty",
      content: "First, select your difficulty level and number of guesses. In Easy mode, you can choose any 3 cities. Medium locks 1 city, and Hard locks 2 cities, making the challenge progressively harder.",
      target: "#difficultyPanel",
      order: currentOrder++,
    });
  }

  // Add the main game steps
  steps.push({
    title: "Your Target Area",
    content: "This shows your target area in square kilometers. Your triangle's area must be within 10% of this target to win!",
    target: "#target",
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
    title: "Ready to Play!",
    content: "That's everything you need to know! Keep submitting guesses until you hit the target area. The map will show your triangles as you create them. Good luck!",
    order: currentOrder++,
  });

  return steps;
}

const tg = new TourGuideClient({
  steps: [], // We'll set this dynamically
  completeOnFinish: true,
  keyboardControls: true,
  showStepProgress: true,
});

function startTour() {
  // Generate steps dynamically when tour starts
  const dynamicSteps = createTourSteps();
  
  // Update the tour with new steps
  tg.setOptions({
    steps: dynamicSteps
  });
  
  tg.start();
}

// Attach the tourguide start event to the button press
const tourButton = document.getElementById("tourButton");
if (tourButton) {
  tourButton.addEventListener("click", startTour);
}