import "@sjmc11/tourguidejs/src/scss/tour.scss" // Styles 
import {TourGuideClient} from "@sjmc11/tourguidejs/src/Tour" // JS 

const steps = [{
  title: "Welcome to the tutorial",
  content: "Here is how to play the game",
  order: 0,
}, {
  title: "The game",
  content: "The objective of the game is to create a spherical triangle, between 3 cities.\n" + 
           "The area of the triangle should be within 10% of the target",
  order: 1,
}, {
  title: "Target",
  content: "This is your target area." + "The area of your triangle should be within 10% of this target",
  target: "#target",
  order: 2,
}, {
  title: "City inputs",
  content: "Put 3 cities in here and see the area of the triangle they form.",
  target: "#cityInputs",
  propagateEvents: "true",
  order: 3,
}, {
  title: "Submit button",
  content: "Press this button to submit the triplet.",
  target: "#submitButton",
  propagateEvents: "true",
  order: 4,
}, {
  title: "Dashboard",
  content: "Here you can see how many guesses you have used, and their results.",
  target: "#dashboard",
  order: 5,
}, {
  title: "The goal",
  content: "Continue submiting guesses until you hit the target.\n" + 
           "Good luck",
  order: 6,
}
];

const tg = new TourGuideClient({
  steps: steps,
});

function startTour() {
    tg.start()
}
// Attach the tourguide start event to the button press
var tourbutton = document.getElementById("tourButton");
tourbutton.addEventListener("click", startTour);