const tg = new tourguide.TourGuideClient()

function startTour() {
	tg.start()
}
// Attach the touruide start evene to the button press
var tourbutton = document.getElementById("tourbutton");
tourbutton.addEventListener("click", startTour);