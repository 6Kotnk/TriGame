const steps = [{
  title: "Welcome to Our Tour!",
  content: "We are excited to show you the key features of our website. Click 'Next' to start the tour.",
  order: 0,
  // No target for this step, as it's a title screen
}, {
  title: "Target",
  content: "This is your target area",
  target: "#target",
  order: 1,
}, 
];

const tg = new tourguide.TourGuideClient({
  steps: steps,
});

function startTour() {
	tg.start()
}
// Attach the touruide start evene to the button press
var tourbutton = document.getElementById("tourbutton");
tourbutton.addEventListener("click", startTour);