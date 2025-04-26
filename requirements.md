# Game Requirements Document

## 1. Core Gameplay
- The player controls a shark in a 3D top-down maze.
- The goal is to eat all edible fish scattered throughout the maze.
- The player is pursued by multiple AI-controlled robots.
- The game ends when:
  - All required fish are eaten (win).
  - The player runs out of lives (lose).

## 2. Player
- Moves only in four cardinal directions (up, down, left, right).
- Input buffering: player can hold a direction before a turn; at intersections, the shark will turn to the latest buffered direction, even if a diagonal is held.
- Movement is restricted to the axis of the corridor; no free movement within corridors, only along their axis.
- Has a limited number of lives. When caught by a robot, loses a life and respawns at the starting point.
- When the player loses a life, all robots return to their spawn areas.

## 3. Enemies (Robots)
- Multiple robots patrol the maze.
- Each robot has a unique movement pattern (e.g., random, chase, ambush).
- Robots increase in difficulty as levels progress (speed, intelligence).
- Robots have one or more spawning areas where they appear and respawn after being eaten; they are protected (cannot be eaten or eat the player) until they leave the spawn area.
- When the player loses a life, robots return to their spawn areas.

## 4. Collectibles
- Edible Fish: Must be consumed to win.
- Special Fish Powerup: Stationary; consuming this allows the shark to eat robots for a limited time.
- Powerups (move around the maze):
  - Energy pill: Temporarily increases the shark’s speed.
  - Lightning projectile: Grants a one-time-use projectile that can stun robots.
  - Point powerups: Grant only additional score, no special ability.

## 5. Maze/Environment
- The maze is a series of linear corridors with intersections.
- Player can only change direction at intersections.
- No free movement within a corridor; movement is always axis-aligned.
- Environmental hazard: Whirlpool, which spawns and despawns after a set period of time. Contact with a whirlpool slows the player down.
- Shortcuts: One or more corridors connect one edge of the maze to the opposite edge, allowing the player and robots to traverse quickly from side to side.
- Multiple levels with increasing complexity.

## 6. Scoring & Progression
- Points for eating fish, robots (when powered up), collecting powerups, and point powerups.
- Bonus points for clearing levels quickly.
- High score tracking (local storage).

## 7. UI, UX, and FX
- Top-down 3D camera view.
- HUD: score, lives, powerup timers.
- Start, pause, and game over screens.
- Audio: background music, sound effects for actions.
- FX: Visual effects for big events (e.g., eating powerups, eating robots).
- Short pause/freeze when the player eats a robot or powerup to emphasize the event. During this pause, visuals are frozen but sound continues to play.

## 8. Technical
- Built with Babylon.js and TypeScript.
- Modular code structure (player, enemies, maze, powerups, UI).
- Linting, formatting, and documentation enforced.
- Runs in modern web browsers.

## 9. Development Process & Testing
- Features are developed incrementally, step by step.
- Track and test dependencies as each new feature is added.
- Automated tests for as many components as possible.
- AI will assist with debugging and present features for human testing when needed.

## 10. Stretch Goals (Optional)
- Multiple shark characters with different abilities.
- Online leaderboards.
- Level editor.
- Mobile/touch controls.
