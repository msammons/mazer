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

export function createRobot(maze: Maze, startPosition: { x: number; y: number }): Robot {
  return {
    currentTile: { x: startPosition.x, y: startPosition.y },
    targetTile: { x: startPosition.x, y: startPosition.y },
    direction: 'right', // Start moving right
    nextDirection: null,
    mesh: null, // Will be set when robot is created in the scene
    progress: 0,
    speed: 0.05, // Base movement speed
  };
}

export function updateRobotMovement(robot: Robot, maze: Maze, deltaTime: number): Robot {
  const { x, y } = robot.currentTile;
  const { width, height } = maze;

  // Update progress first
  let progress = robot.progress;
  progress += robot.speed * deltaTime;
  if (progress >= 1) {
    // Snap to target tile
    const newCurrentTile = { ...robot.targetTile };
    
    return {
      ...robot,
      currentTile: { ...newCurrentTile },
      targetTile: robot.targetTile,
      progress: 0
    };
  }

  // If we're at a tile, choose a direction
  if (robot.currentTile.x === robot.targetTile.x && robot.currentTile.y === robot.targetTile.y) {
    // Try to continue in current direction if possible
    let testX = x;
    let testY = y;
    
    switch (robot.direction) {
      case 'up': testY = y - 1; break;
      case 'down': testY = y + 1; break;
      case 'left': testX = x - 1; break;
      case 'right': testX = x + 1; break;
    }

    // If current direction is valid, keep it
    if (testX >= 0 && testX < width && testY >= 0 && testY < height && maze.grid[testY][testX] !== 'wall') {
      return {
        ...robot,
        targetTile: { x: testX, y: testY },
        progress,
      };
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
          progress,
        };
      }
    }
  }

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
