import { Game } from "./game.js";

const game = new Game();

function startGame(citiesLocked) {
  game.startGame(citiesLocked);
}

function resetGame() {
  game.resetGame();
}

function continueGame() {
  game.continueGame();
}

function submitGuess() {
  game.submitGuess();
}

window.startGame = startGame;
window.resetGame = resetGame;
window.continueGame = continueGame;
window.submitGuess = submitGuess;