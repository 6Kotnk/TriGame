# TriGame Codebase Summary

## Project Overview
TriGame is a geography-based guessing game where players select 3 cities to form a spherical triangle on Earth's surface. The goal is to match or get close to a target area within a limited number of guesses.

## Core Game Mechanics
- **Objective**: Create triangles with areas close to a randomly generated target area
- **Scoring**: Uses logarithmic distance (`logDist`) to measure accuracy between guess area and target area
- **Winning**: Exact match or within 10% tolerance using logarithmic distance
- **Difficulty**: Varies by number of pre-selected cities (0-2) and guess limits

## Key File Structure

### Core Game Logic
- **`src/code/game.js`**: Main game controller
  - Manages game state, guess validation, scoring
  - Uses `logDist(a, b = 1)` for accuracy calculations (imported from utils)
  - Handles win/loss conditions and confetti effects
  - Sets triangle colors based on accuracy before rendering

### Data Models
- **`src/code/guess.js`**: Guess class representing a triangle
  - Contains 3 cities with coordinates
  - Calculates spherical triangle area using haversine formula
  - Has `colors` property for visual rendering (verts, edges, fill)

### Graphics & Rendering
- **`src/code/gfxDisplay/gfxDisplay.js`**: Main graphics controller
  - Manages 3D Earth globe using Three.js
  - Updates triangle rendering via `update(guess)` method

- **`src/code/gfxDisplay/sphericalTriangle/`**: Triangle rendering system
  - **`sphericalTriangle.js`**: Main triangle orchestrator
    - Creates vertices, edges, and fill components
    - `setColors(colors)` method applies colors to all components
    - `reconfigure()` applies coordinates and colors to render
  - **`sphericalTriangleFill.js`**: Canvas-based triangle fill rendering
  - **`sphericalTriangleEdge.js`**: Curved edge rendering using SLERP
  - **`sphericalTriangleVertex.js`**: Vertex point rendering

### User Interface
- **`src/code/userInterface/userInterface.js`**: UI controller
  - Coordinates between game logic and UI components
  - `update(guessHistory, latestGuess, newCount, totalCount)` method

- **`src/code/userInterface/guessHistory.js`**: Guess history display
  - `update(guessList, latestGuess)` renders guess list
  - `setTargetArea(targetArea)` enables accuracy-based coloring
  - Uses `UTILS.getAccuracyColor()` for colored borders

- **`src/code/userInterface/stateDisplay.js`**: Generic numeric displays
  - `update(newCount, totalCount)` with color support
  - Used for guess counter and target area display

- **`src/code/userInterface/cityInputs.js`**: City selection interface
- **`src/code/userInterface/tour.js`**: Game tutorial system
- **`src/code/userInterface/slider.js`**: Difficulty slider component

### Utilities
- **`src/code/utils.js`**: Shared utility functions
  - `logDist(a, b = 1)`: Logarithmic distance calculation
  - `getColorFromValue(value)`: Green→yellow→red gradient (0=good, 1=bad)
  - `getAccuracyColor(guessArea, targetArea)`: Accuracy-based coloring
  - `degToRad(degrees)`: Degree to radian conversion
  - `randomFromSeed(seed, min, max)`: Seeded random number generation

### Styling
- **`src/css/components/resultItem.css`**: Guess display styling
  - `.resultItem` class with 3px colored borders
  - Dark mode support

## Color System (Recently Added)
The game now uses a comprehensive color feedback system:

### Color Function
- **`getColorFromValue(value)`**: Takes 0-1 input, returns RGB color
  - 0 = green (good), 0.5 = yellow (medium), 1 = red (bad)
  - Used consistently across all visual feedback

### Applications
1. **Guess History Borders**: Colored borders based on accuracy
2. **Triangle Rendering**: Globe triangles colored by accuracy
3. **Guess Counter**: Text color changes as guesses decrease

### Implementation Flow
1. Game calculates accuracy using `UTILS.logDist()`
2. Normalizes to 0-1 range for color function
3. Sets colors in game.js before passing to display components
4. Components apply colors to their respective elements

## Data Flow
1. **Game Start**: `game.js` generates target area and initializes UI
2. **User Guess**: Cities selected via `cityInputs.js`
3. **Validation**: `game.js` validates guess and calculates accuracy
4. **Coloring**: Accuracy-based colors calculated and applied to guess
5. **Rendering**: Triangle rendered on globe with accuracy colors
6. **UI Update**: History and counter updated with colored feedback

## Build System
- **Vite**: Modern build tool for development and production
- **Three.js**: 3D graphics library for globe rendering
- **Commands**: `npm run dev` (development), `npm run build` (production)

## Key Patterns
- **Color Consistency**: All visual feedback uses the same color scale
- **Separation of Concerns**: Game logic separate from rendering
- **Component Communication**: Data flows down from game controller
- **Utility Functions**: Shared logic centralized in utils.js

## Recent Enhancements
- Moved `logDist` function to utils for reusability
- Added generic color system with smooth gradients
- Implemented accuracy-based visual feedback across all components
- Enhanced guess counter with color-coded remaining attempts