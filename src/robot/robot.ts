import { MazeCell, Maze } from '../maze/maze';
import type { Direction } from '../player/player';

export interface Robot {
  currentTile: { x: number; y: number };
  targetTile: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right' | null;
  mesh: any; // Babylon.js mesh
  progress: number;
  speed: number;
}

export function createRobot(maze: Maze, startPosition: { x: number; y: number }, direction: 'up' | 'down' | 'left' | 'right' = 'right'): Robot {
  return {
    currentTile: { x: startPosition.x, y: startPosition.y },
    targetTile: { x: startPosition.x, y: startPosition.y },
    direction: direction, // Use the provided direction
    nextDirection: null,
    mesh: null, // Will be set when robot is created in the scene
    progress: 0,
    speed: 0.05, // Base movement speed
  };
}

export function updateRobotMovement(robot: Robot, maze: Maze, deltaTime: number): Robot {
  console.log('updateRobotMovement called with:', { 
    currentTile: robot.currentTile, 
    targetTile: robot.targetTile, 
    direction: robot.direction,
    progress: robot.progress 
  });
  
  const { x, y } = robot.currentTile;
  const { width, height } = maze;

  // If we're at a tile, choose a direction
  if (robot.currentTile.x === robot.targetTile.x && robot.currentTile.y === robot.targetTile.y) {
    // Reset progress when we reach a tile
    robot.progress = 0;
    
    // Try to continue in current direction if possible
    let testX = x;
    let testY = y;
    
    // Get the next position in current direction
    switch (robot.direction) {
      case 'up': testY = y - 1; break;
      case 'down': testY = y + 1; break;
      case 'left': testX = x - 1; break;
      case 'right': testX = x + 1; break;
    }

    // If current direction is valid, keep it
    const canMove = testX >= 0 && testX < width && testY >= 0 && testY < height && maze.grid[testY][testX] !== 'wall';
    if (canMove) {
      return {
        ...robot,
        targetTile: { x: testX, y: testY },
        progress: robot.speed * deltaTime // Start moving immediately
      };
    }
    
    // Special case: if we're at the boundary in the current direction, stay in place
    if ((robot.direction === 'up' && y === 0) ||
        (robot.direction === 'down' && y === height - 1) ||
        (robot.direction === 'left' && x === 0) ||
        (robot.direction === 'right' && x === width - 1)) {
      return robot;
    }

    // If current direction is not valid, try other directions
    const directions = ['up', 'down', 'left', 'right'] as const;
    for (const dir of directions) {
      testX = x;
      testY = y;
      
      switch (dir) {
        case 'up': testY = y - 1; break;
        case 'down': testY = y + 1; break;
        case 'left': testX = x - 1; break;
        case 'right': testX = x + 1; break;
      }

      if (testX >= 0 && testX < width && testY >= 0 && testY < height && maze.grid[testY][testX] !== 'wall') {
        return {
          ...robot,
          direction: dir,
          targetTile: { x: testX, y: testY },
          progress: robot.speed * deltaTime // Start moving immediately
        };
      }
    }
    
    // If no valid direction, stay in place
    return robot;
  }
  
  // If we're moving between tiles, update progress
  const progress = robot.progress + (robot.speed * deltaTime);
  
  if (progress >= 1) {
    // Snap to target tile and continue moving in the same direction
    return {
      ...robot,
      currentTile: { ...robot.targetTile },
      progress: 0
    };
  }

  // Normal movement between tiles
  return {
    ...robot,
    progress
  };
}

function getNewTargetTile(x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x, y: y - 1 };
    case 'down':
      return { x, y: y + 1 };
    case 'left':
      return { x: x - 1, y };
    case 'right':
      return { x: x + 1, y };
  }
}

function updateProgress(robot: Robot, deltaTime: number): Robot {
  let progress = robot.progress;
  if (robot.currentTile.x !== robot.targetTile.x || robot.currentTile.y !== robot.targetTile.y) {
    // Calculate progress based on deltaTime and speed
    progress += robot.speed * deltaTime;
    if (progress >= 1) {
      // Snap to target tile
      const newCurrentTile = { ...robot.targetTile };
      
      return {
        ...robot,
        currentTile: { ...newCurrentTile },
        targetTile: robot.targetTile,
        progress: 0,
      };
    }
  }

  return {
    ...robot,
    progress
  };
}
