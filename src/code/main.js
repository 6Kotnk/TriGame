import { Game } from "./game.js";

// Get all the HTML elements and then pass them down the class hierarchy
// Would be useful, if everything wasn't a singleton... maybe.
const HTMLElements = {
  Game: {
    titlePanel:                             document.getElementById('titlePanel'),
    endPanel:                               document.getElementById('endPanel'),
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
        element:                            document.getElementById('guessDisplay'),
        value:                              document.getElementById('guessDisplayValue'),
      },

      TargetDisplay: {
        element:                            document.getElementById('targetDisplay'),
        value:                              document.getElementById('targetDisplayValue'),
      },


      Tour: {
        tourButton:                         document.getElementById('tourButton'),
      },

    },
  },
};

const game = new Game(HTMLElements.Game);

function startGame() {
  game.startGame();
}

function submitGuess() {
  game.submitGuess();
}

function startTour() {
  game.startTour();
}

window.startGame = startGame;
window.submitGuess = submitGuess;
window.startTour = startTour;