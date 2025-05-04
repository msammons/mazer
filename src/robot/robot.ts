import { MazeCell, Maze } from '../maze/maze';
import type { Direction } from '../player/player';

export interface Robot {
  currentTile: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  nextDirection: 'up' | 'down' | 'left' | 'right' | null;
  mesh: any; // Babylon.js mesh
}

export function createRobot(maze: Maze, startPosition: { x: number; y: number }): Robot {
  return {
    currentTile: { x: startPosition.x, y: startPosition.y },
    direction: 'right', // Start moving right
    nextDirection: null,
    mesh: null, // Will be set when robot is created in the scene
  };
}

export function updateRobotMovement(robot: Robot, maze: Maze): Robot {
  // Simple AI: move in straight lines, turn at walls
  const { x, y } = robot.currentTile;
  const { width, height } = maze;

  // Get current cell
  const currentCell = maze.grid[y][x];

  // Check if we can move in our current direction
  let canMoveForward = true;
  let nextX = x;
  let nextY = y;

  switch (robot.direction) {
    case 'up':
      nextY = y - 1;
      break;
    case 'down':
      nextY = y + 1;
      break;
    case 'left':
      nextX = x - 1;
      break;
    case 'right':
      nextX = x + 1;
      break;
  }

  // Check if next position is valid
  if (
    nextX >= 0 && nextX < width &&
    nextY >= 0 && nextY < height &&
    maze.grid[nextY][nextX] !== 'wall'
  ) {
    // Move forward
    robot.currentTile = { x: nextX, y: nextY };
  } else {
    // Choose a random direction to turn
    const directions = ['up', 'down', 'left', 'right'];
    const validDirections = directions.filter(dir => {
      let testX = x;
      let testY = y;
      
      switch (dir) {
        case 'up': testY = y - 1; break;
        case 'down': testY = y + 1; break;
        case 'left': testX = x - 1; break;
        case 'right': testX = x + 1; break;
      }

      return (
        testX >= 0 && testX < width &&
        testY >= 0 && testY < height &&
        maze.grid[testY][testX] !== 'wall'
      );
    });

    if (validDirections.length > 0) {
      robot.direction = validDirections[Math.floor(Math.random() * validDirections.length)] as 'up' | 'down' | 'left' | 'right';
    }
  }

  return robot;
}
