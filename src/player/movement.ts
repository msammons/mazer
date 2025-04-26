// Player movement logic for axis-aligned, buffered input and intersection handling
import { Player, Direction } from './player';
import { Maze } from '../maze/maze';
import { isOpposite } from './reverse';

export function isIntersection(maze: Maze, x: number, y: number): boolean {
  // An intersection is where the player can turn (more than 2 non-wall neighbors)
  const dirs = [
    [0, -1], // up
    [0, 1],  // down
    [-1, 0], // left
    [1, 0],  // right
  ];
  let open = 0;
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      nx < maze.width &&
      ny >= 0 &&
      ny < maze.height &&
      maze.grid[ny][nx] !== 'wall'
    ) {
      open++;
    }
  }
  return open > 2;
}

export function canMove(maze: Maze, x: number, y: number, dir: Direction): boolean {
  // x, y are integer tile coordinates
  let nx = x, ny = y;
  if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  else if (dir === 'left') nx--; // left = x - 1
  else if (dir === 'right') nx++; // right = x + 1
  return (
    nx >= 0 &&
    nx < maze.width &&
    ny >= 0 &&
    ny < maze.height &&
    maze.grid[ny][nx] !== 'wall'
  );
}

export function updatePlayerMovement(player: Player, maze: Maze, dt: number, speed: number): Player {
  // Calculate new progress
  let progress = player.progress;
  if (player.currentTile.x !== player.targetTile.x || player.currentTile.y !== player.targetTile.y) {
    progress += speed * dt;
    if (progress >= 1) {
      // Snap to target tile
      const newCurrentTile = { ...player.targetTile };
      // After snapping to the new tile, always update direction and targetTile based on buffered or current direction
      // Always start with previous direction
      let chosenDirection: Direction = player.direction;
      let nextDir = player.nextDirection;
      let canTurn = nextDir && canMove(maze, newCurrentTile.x, newCurrentTile.y, nextDir);
      let canContinue = canMove(maze, newCurrentTile.x, newCurrentTile.y, player.direction);

      if (canTurn) {
        chosenDirection = nextDir as Direction;
        nextDir = null;
      } else if (!canContinue) {
        // Blocked in both directions
        return {
          ...player,
          currentTile: { ...newCurrentTile },
          targetTile: { ...newCurrentTile },
          progress: 0,
          direction: player.direction,
          nextDirection: nextDir,
        };
      }

      // Set new target tile based on chosen direction (guaranteed to be a valid Direction)
      let newTargetTile: { x: number; y: number };
      if (chosenDirection === 'up') newTargetTile = { x: newCurrentTile.x, y: newCurrentTile.y - 1 };
      else if (chosenDirection === 'down') newTargetTile = { x: newCurrentTile.x, y: newCurrentTile.y + 1 };
      else if (chosenDirection === 'left') newTargetTile = { x: newCurrentTile.x - 1, y: newCurrentTile.y }; // left = x - 1
      else newTargetTile = { x: newCurrentTile.x + 1, y: newCurrentTile.y }; // right = x + 1

      return {
        ...player,
        currentTile: { ...newCurrentTile },
        targetTile: { ...newTargetTile },
        progress: 0,
        direction: chosenDirection,
        nextDirection: nextDir,
      };
    }
    return { ...player, progress };
  }

  // Already at a tile and not moving: check for buffered turn or continue in direction
  let { currentTile, direction, nextDirection } = player;
  let chosenDirection = direction;
  let nextDir = nextDirection;
  let newTargetTile = { ...currentTile };

  if (nextDir && canMove(maze, currentTile.x, currentTile.y, nextDir)) {
    chosenDirection = nextDir;
    nextDir = null;
  } else if (!canMove(maze, currentTile.x, currentTile.y, chosenDirection)) {
    // Blocked, can't move
    return {
      ...player,
      currentTile: { ...currentTile },
      targetTile: { ...currentTile },
      progress: 0,
      direction: chosenDirection,
      nextDirection: nextDir,
    };
  }

  if (chosenDirection === 'up') newTargetTile = { x: currentTile.x, y: currentTile.y - 1 };
  else if (chosenDirection === 'down') newTargetTile = { x: currentTile.x, y: currentTile.y + 1 };
  else if (chosenDirection === 'left') newTargetTile = { x: currentTile.x - 1, y: currentTile.y }; // left = x - 1
  else if (chosenDirection === 'right') newTargetTile = { x: currentTile.x + 1, y: currentTile.y }; // right = x + 1

  return {
    ...player,
    currentTile: { ...currentTile },
    targetTile: { ...newTargetTile },
    progress: 0,
    direction: chosenDirection,
    nextDirection: nextDir,
  };
}

export function bufferInput(player: Player, input: Direction): Player {
  // Always store the latest input as nextDirection
  return { ...player, nextDirection: input };
}

/**
 * Instantly reverses the player's direction, swapping current and target tiles and inverting progress.
 * Keeps the player on the grid and enables classic arcade instant reversal responsiveness.
 */
export function reversePlayerDirection(player: Player): Player {
  // Swap current and target tiles
  const newCurrentTile = { ...player.targetTile };
  const newTargetTile = { ...player.currentTile };
  // Invert progress
  const newProgress = 1 - player.progress;
  // Get opposite direction
  let newDirection: Direction;
  if (player.direction === 'up') newDirection = 'down';
  else if (player.direction === 'down') newDirection = 'up';
  else if (player.direction === 'left') newDirection = 'right';
  else newDirection = 'left';
  return {
    ...player,
    currentTile: newCurrentTile,
    targetTile: newTargetTile,
    progress: newProgress,
    direction: newDirection,
    // Clear the buffer so reversal is instant
    nextDirection: null,
  };
}
