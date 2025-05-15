import { Game } from "./Game";

const game = new Game(10.49);

function resetGame() {
  game.resetGame();
}

function continueGame() {
  game.continueGame();
}

function submitCities() {
  game.submitCities();
}

window.resetGame = resetGame;
window.continueGame = continueGame;
window.submitCities = submitCities;