# Shark Robot Maze Project Plan

## Maze Representation (Classic Pac-Man Style)
- The maze is a 2D array of cells, each cell is either `'empty'` (path) or `'wall'` (impassable).
- No per-cell wall flags or connection-based logic.
- Walls are rendered as thin, inset lines or boxes along cell borders, not as full cubes.
- The player sprite is larger than a cell and overlaps walls for a classic arcade look.

## Rendering
- Render walls as thin, inset lines/boxes (not full cubes) along the borders between `'wall'` and `'empty'` cells.
- Pull walls back from the cell edges for a visually appealing effect.
- Player and enemies are drawn larger than a single cell.

## Movement and Collision
- Movement and collision are based on cell type: `'wall'` is impassable, `'empty'` is passable.
- Sprites can extend beyond cell boundaries for smooth movement.

## Authoring Mazes
- Mazes are easy to author as 2D arrays (0 = wall, 1 = path).
- This approach is user-friendly and easy to maintain.

## Next Steps
- Refactor rendering logic to draw thin, inset walls.
- Adjust player sprite size and movement to overlap cell edges.
- Add collectibles and hazards as needed.

## Core Features
- [x] Babylon.js scene setup
- [x] Maze grid and player (shark) rendering
- [x] Real-time keyboard input (WASD/arrows)
- [x] Debug overlay for dev info
- [x] Camera setup and controls
- [x] Smooth, continuous player movement
- [x] Input buffering (direction change)
- [ ] Internal maze walls (not just boundaries)
- [ ] Collectibles (fish, powerups)
- [ ] Hazards (robots, etc)
- [ ] Win/lose/game over logic
- [ ] Sound effects and polish

## Dev/UX Features
- [x] Toggle debug overlay with Tab
- [x] Camera lock (no zoom/pan)
- [ ] Project plan/checklist

---

Check off features as they are completed. Add new features or requests below!
