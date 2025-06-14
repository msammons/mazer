import { Maze } from '../maze/maze';

interface Robot {
  currentTile: { x: number; y: number };
  targetTile: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  progress: number;
  speed: number;
  nextDirection?: 'up' | 'down' | 'left' | 'right' | null;
  mesh?: any;
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
  if (x === robot.targetTile.x && y === robot.targetTile.y) {
    robot.progress = 0;

    let testX = x;
    let testY = y;

    switch (robot.direction) {
      case 'up': testY = y - 1; break;
      case 'down': testY = y + 1; break;
      case 'left': testX = x - 1; break;
      case 'right': testX = x + 1; break;
    }

    const canMove = testX >= 0 && testX < width && testY >= 0 && testY < height && maze.grid[testY][testX] !== 'wall';
    if (canMove) {
      return {
        ...robot,
        targetTile: { x: testX, y: testY },
        progress: robot.speed * deltaTime
      };
    }

    // If blocked, try other directions
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

      const canMoveAlt = testX >= 0 && testX < width && testY >= 0 && testY < height && maze.grid[testY][testX] !== 'wall';
      if (canMoveAlt) {
        return {
          ...robot,
          direction: dir,
          targetTile: { x: testX, y: testY },
          progress: robot.speed * deltaTime
        };
      }
    }

    // If stuck, do nothing
    return robot;
  }

  // In motion — update progress
  const newProgress = robot.progress + robot.speed * deltaTime;
  if (newProgress >= 1) {
    return {
      ...robot,
      currentTile: { ...robot.targetTile },
      progress: 0
    };
  }

  return {
    ...robot,
    progress: newProgress
  };
}