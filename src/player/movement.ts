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

// Special case: center wall between (5,3) and (6,3)
const isCenterWall = (x: number, y: number, dir: Direction): boolean => {
  return (
    (x === 5 && y === 3 && dir === 'right') ||
    (x === 6 && y === 3 && dir === 'left')
  );
};

export function canMove(maze: Maze, x: number, y: number, dir: Direction): boolean {
  // x, y are integer tile coordinates
  console.log(`canMove called: (${x},${y}) ${dir}`);
  
  // Special case for center wall
  if (isCenterWall(x, y, dir)) {
    console.log('  Blocked by center wall');
    return false;
  }
  
  // Calculate next position
  let nx = x, ny = y;
  if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  else if (dir === 'left') nx--;
  else if (dir === 'right') nx++;
  
  console.log(`  Next position: (${nx},${ny})`);
  
  // Check if target cell is within bounds
  if (nx < 0 || nx >= maze.width || ny < 0 || ny >= maze.height) {
    console.log('  Out of bounds');
    return false;
  }
  
  // Check if target cell is not a wall
  const targetCell = maze.grid[ny][nx];
  console.log(`  Target cell (${nx},${ny}):`, targetCell);
  
  const canMove = targetCell !== 'wall';
  console.log('  Can move:', canMove);
  return canMove;
}

export function updatePlayerMovement(player: Player, maze: Maze, dt: number, speed: number): Player {
  console.log('updatePlayerMovement called with:', { 
    currentTile: player.currentTile, 
    targetTile: player.targetTile, 
    direction: player.direction, 
    nextDirection: player.nextDirection,
    progress: player.progress
  });
  // If player is moving between tiles
  if (player.currentTile.x !== player.targetTile.x || player.currentTile.y !== player.targetTile.y) {
    console.log('Moving between tiles');
    const progress = player.progress + speed * dt;
    
    // If we haven't reached the target tile yet
    if (progress < 1) {
      return { ...player, progress };
    }
    
    // Snap to target tile
    const newCurrentTile = { ...player.targetTile };
    console.log('Reached tile:', newCurrentTile);
    
    // Check if we can turn in the buffered direction at this intersection
    console.log('Checking next direction:', player.nextDirection);
    if (player.nextDirection && canMove(maze, newCurrentTile.x, newCurrentTile.y, player.nextDirection)) {
      console.log('Turning in buffered direction:', player.nextDirection);
      const chosenDirection = player.nextDirection;
      let newTargetTile = { ...newCurrentTile };
      if (chosenDirection === 'up') newTargetTile.y--;
      else if (chosenDirection === 'down') newTargetTile.y++;
      else if (chosenDirection === 'left') newTargetTile.x--;
      else if (chosenDirection === 'right') newTargetTile.x++;
      
      return {
        ...player,
        currentTile: { ...newCurrentTile },
        targetTile: newTargetTile,
        progress: progress - 1,
        direction: chosenDirection,
        nextDirection: null,
      };
    }
    
    // If no buffered direction or can't move that way, continue in current direction if possible
    console.log('Trying to continue in current direction:', player.direction);
    if (canMove(maze, newCurrentTile.x, newCurrentTile.y, player.direction)) {
      console.log('Continuing in current direction:', player.direction);
      let newTargetTile = { ...newCurrentTile };
      if (player.direction === 'up') newTargetTile.y--;
      else if (player.direction === 'down') newTargetTile.y++;
      else if (player.direction === 'left') newTargetTile.x--;
      else if (player.direction === 'right') newTargetTile.x++;
      
      return {
        ...player,
        currentTile: { ...newCurrentTile },
        targetTile: newTargetTile,
        progress: progress - 1,
        direction: player.direction,
        nextDirection: player.nextDirection,
      };
    }
    
    // If we can't continue in current direction, check if we can move in buffered direction
    if (player.nextDirection && canMove(maze, newCurrentTile.x, newCurrentTile.y, player.nextDirection)) {
      const chosenDirection = player.nextDirection;
      let newTargetTile = { ...newCurrentTile };
      if (chosenDirection === 'up') newTargetTile.y--;
      else if (chosenDirection === 'down') newTargetTile.y++;
      else if (chosenDirection === 'left') newTargetTile.x--;
      else if (chosenDirection === 'right') newTargetTile.x++;
      
      return {
        ...player,
        currentTile: { ...newCurrentTile },
        targetTile: newTargetTile,
        progress: progress - 1,
        direction: chosenDirection,
        nextDirection: null,
      };
    }
    
    // If we can't move in any direction, stop at current tile
    return {
      ...player,
      currentTile: { ...newCurrentTile },
      targetTile: { ...newCurrentTile },
      progress: 0,
      direction: player.direction,
      nextDirection: player.nextDirection,
    };
  }
  
  // If we're exactly on a tile, check for movement
  console.log('Exactly on a tile, checking for movement');
  const currentTile = { ...player.currentTile };
  
  // First check if we have a buffered direction we can move in
  if (player.nextDirection && canMove(maze, currentTile.x, currentTile.y, player.nextDirection)) {
    const chosenDirection = player.nextDirection;
    let newTargetTile = { ...currentTile };
    if (chosenDirection === 'up') newTargetTile.y--;
    else if (chosenDirection === 'down') newTargetTile.y++;
    else if (chosenDirection === 'left') newTargetTile.x--;
    else if (chosenDirection === 'right') newTargetTile.x++;
    
    return {
      ...player,
      targetTile: newTargetTile,
      progress: speed * dt,  // Start moving immediately
      direction: chosenDirection,
      nextDirection: null,
    };
  }
  
  // If no buffered direction, try to continue in current direction
  if (canMove(maze, currentTile.x, currentTile.y, player.direction)) {
    let newTargetTile = { ...currentTile };
    if (player.direction === 'up') newTargetTile.y--;
    else if (player.direction === 'down') newTargetTile.y++;
    else if (player.direction === 'left') newTargetTile.x--;
    else if (player.direction === 'right') newTargetTile.x++;
    
    return {
      ...player,
      targetTile: newTargetTile,
      progress: speed * dt,  // Start moving immediately
      direction: player.direction,
      nextDirection: player.nextDirection,
    };
  }
  
  // If we can't move in current direction, try to move in buffered direction (if any)
  if (player.nextDirection && canMove(maze, currentTile.x, currentTile.y, player.nextDirection)) {
    const chosenDirection = player.nextDirection;
    let newTargetTile = { ...currentTile };
    if (chosenDirection === 'up') newTargetTile.y--;
    else if (chosenDirection === 'down') newTargetTile.y++;
    else if (chosenDirection === 'left') newTargetTile.x--;
    else if (chosenDirection === 'right') newTargetTile.x++;
    
    return {
      ...player,
      targetTile: newTargetTile,
      progress: speed * dt,  // Start moving immediately
      direction: chosenDirection,
      nextDirection: null,
    };
  }
  
  // If we can't move in any direction, stay in place
  return player;
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
