import { Game } from "./game.js";


const HTMLElements = {
  Game: {
    difficultyPanel:                        document.getElementById('difficultyPanel'),
    winPanel:                               document.getElementById('winPanel'),
    epicWinPanel:                           document.getElementById('epicWinPanel'),
    losePanel:                              document.getElementById('losePanel'),
    guessCounterValueWinPanel:              document.getElementById('guessCounterValueWinPanel'),
    guessCounterValueEpicWinPanel:          document.getElementById('guessCounterValueEpicWinPanel'),
    target:                                 document.getElementById('target'),

    Display: {
      mapCanvas:                            document.getElementById('mapCanvas'),
      rightPanel:                           document.getElementById('rightPanel'),
    },

    UserInterface: {
      error:                                document.getElementById('error'),

      CityInputs: {
        city1:                              document.getElementById('city1'),
        city2:                              document.getElementById('city2'),
        city3:                              document.getElementById('city3'),
        city1Lock:                          document.getElementById('city1Lock'),
        city2Lock:                          document.getElementById('city2Lock'),
        city3Lock:                          document.getElementById('city3Lock'),
        cities:                             document.getElementById('cities'),
        coordsDisplay:                      document.getElementById('coordsDisplay'),
        dashboard:                          document.getElementById('dashboard'),
      },

      History: {
        history:                            document.getElementById('history'),
      },

      GuessCounter: {
        guessCounterValueDisplayPanel:      document.getElementById('guessCounterValueDisplayPanel'),
      },

      GuessSlider: {
        guessSlider:                        document.getElementById('guessSlider'),
        guessSliderValue:                   document.getElementById('guessSliderValue'),
      },

      Tour: {
        tourButton:                         document.getElementById('tourButton'),
      },

    },
  },
};


const game = new Game(HTMLElements.Game);

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

function startTour() {
  game.startTour();
}

window.startGame = startGame;
window.resetGame = resetGame;
window.continueGame = continueGame;
window.submitGuess = submitGuess;
window.startTour = startTour;