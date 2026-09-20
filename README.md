# NEON DODGE 🎮

A simple browser-based survival arcade game built using **HTML, CSS, and Vanilla JavaScript**.

The main objective of the game is to survive as long as possible by avoiding falling red obstacles while collecting orange energy items to increase the score.

The project focuses on implementing fundamental web development and game development concepts without using any external game engine or framework.

---

# 1. Project Overview

NEON DODGE is a 2D survival game that runs directly inside a web browser.

The player controls a green circular character using:

- W / A / S / D
- Arrow Keys

During the game:

- Red objects fall from the top of the screen.
- The player must avoid these red obstacles.
- Orange energy objects can be collected.
- Collecting energy gives +100 score.
- The longer the player survives, the higher the score becomes.
- The game becomes harder as the level increases.
- If the player collides with an obstacle, the game ends.
- A beep sound plays during gameplay.
- A boom sound plays when the player collides with an obstacle.
- The highest score is saved using browser Local Storage.

---

# 2. Technologies Used

The project uses only basic web technologies.

## HTML

HTML is used to create the structure of the webpage.

It contains:

- Game title
- Score display
- Timer
- Level display
- Best score
- Game canvas
- Start screen
- Game over screen
- Buttons
- Game legend
- Footer

---

## CSS

CSS is used for:

- Page layout
- Dark theme
- Professional UI
- Responsive design
- Buttons
- Statistics cards
- Start/game-over overlays
- Game legend
- Colors
- Spacing
- Borders
- Shadows
- Responsive mobile layout

The CSS is intentionally kept simple so that the project is easy to understand and explain.

---

## JavaScript

JavaScript contains the main game logic.

It handles:

- Player movement
- Keyboard controls
- Game loop
- Object creation
- Object movement
- Collision detection
- Score calculation
- Level calculation
- Energy collection
- Game over
- Sound effects
- High-score storage
- Canvas drawing

---

# 3. Project Structure

```text
NEON-DODGE/
│
├── index.html
├── style.css
├── script.js
└── README.md
