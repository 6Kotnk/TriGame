import { Game } from "./game.js";


const HTMLElements = {
  Game: {
    difficultyPanel:                        document.getElementById('difficultyPanel'),
    winPanel:                               document.getElementById('winPanel'),
    epicWinPanel:                           document.getElementById('epicWinPanel'),
    losePanel:                              document.getElementById('losePanel'),
    winPanelGuessesLeft:                    document.getElementById('winPanelGuessesLeft'),
    epicWinPanelGuessesLeft:                document.getElementById('epicWinPanelGuessesLeft'),
    target:                                 document.getElementById('target'),

    GFXDisplay: {
      mapCanvas:                            document.getElementById('mapCanvas'),
      containerDiv:                         document.getElementById('rightPanel'),
    },

    UserInterface: {
      errorDisplay:                         document.getElementById('errorDisplay'),

      CityInputs: {
        city1:                              document.getElementById('city1'),
        city2:                              document.getElementById('city2'),
        city3:                              document.getElementById('city3'),
        city1Lock:                          document.getElementById('city1Lock'),
        city2Lock:                          document.getElementById('city2Lock'),
        city3Lock:                          document.getElementById('city3Lock'),
        cities:                             document.getElementById('cities'),
        dashboard:                          document.getElementById('dashboard'),
      },

      History: {
        history:                            document.getElementById('history'),
      },

      GuessDisplay: {
        element:                            document.getElementById('guessDisplayValue'),
      },

      TargetDisplay: {
        element:                            document.getElementById('targetDisplayValue'),
      },

      GuessSlider: {
        element:                            document.getElementById('guessSlider'),
        elementValue:                       document.getElementById('guessSliderValue'),
      },

      Tour: {
        tourButton:                         document.getElementById('tourButton'),
      },

    },
  },
};

const game = new Game(HTMLElements.Game);

function startGame(gameType) {
  game.startGame(gameType);
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