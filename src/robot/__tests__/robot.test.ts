import { createRobot, updateRobotMovement } from '../robot';
import { Maze, MazeCell } from '../../maze/maze';

describe('Robot Movement', () => {
  it('should move right when starting', () => {
    // Create a simple maze with one open path
    const maze: Maze = {
      width: 3,
      height: 3,
      grid: [
        ['wall', 'wall', 'wall'],
        ['wall', 'empty', 'empty'],
        ['wall', 'wall', 'wall']
      ]
    };

    // Create robot at starting position
    let robot = createRobot(maze, { x: 1, y: 1 });

    // Update robot movement
    robot = updateRobotMovement(robot, maze, 0.016);

    // Should move right
    expect(robot.direction).toBe('right');
    expect(robot.targetTile).toEqual({ x: 2, y: 1 });
    expect(robot.progress).toBeGreaterThan(0);
  });

  it('should continue in current direction when possible', () => {
    // Create a maze with open paths in all directions
    const maze: Maze = {
      width: 3,
      height: 3,
      grid: [
        ['wall', 'wall', 'wall'],
        ['wall', 'empty', 'empty'],
        ['wall', 'wall', 'wall']
      ]
    };

    // Create robot at starting position with initial direction
    let robot = createRobot(maze, { x: 1, y: 1 });
    robot.direction = 'up'; // Set initial direction
    robot.targetTile = { x: 1, y: 1 }; // Start at current position

    // Update robot movement to move up
    robot = updateRobotMovement(robot, maze, 0.016);

    // Move to the top and update again
    robot.currentTile = { x: 1, y: 0 };
    robot.targetTile = { x: 1, y: 0 };
    robot.progress = 0;

    // Update robot movement
    robot = updateRobotMovement(robot, maze, 0.016);

    // Should continue in up direction
    expect(robot.direction).toBe('up');
    expect(robot.targetTile).toEqual({ x: 1, y: 0 });
    expect(robot.progress).toBeGreaterThan(0);

    // Move to the top and update again
    robot.currentTile = { x: 1, y: 0 };
    robot.targetTile = { x: 1, y: 0 };
    robot.progress = 0;

    // Update robot movement again
    robot = updateRobotMovement(robot, maze, 0.016);

    // Should choose right direction since up is blocked
    expect(robot.direction).toBe('right');
    expect(robot.targetTile).toEqual({ x: 2, y: 0 });
    expect(robot.progress).toBeGreaterThan(0);
  });

  it('should not move through walls', () => {
    // Create a maze with a wall to the left
    const maze: Maze = {
      width: 3,
      height: 3,
      grid: [
        ['wall', 'wall', 'wall'],
        ['wall', 'empty', 'wall'],
        ['wall', 'wall', 'wall']
      ]
    };

    // Create robot at starting position
    let robot = createRobot(maze, { x: 1, y: 1 });

    // Set direction to left (should be blocked)
    robot.direction = 'left';

    // Update robot movement
    robot = updateRobotMovement(robot, maze, 0.016);

    // Should not have moved
    expect(robot.currentTile).toEqual({ x: 1, y: 1 });
    expect(robot.targetTile).toEqual({ x: 1, y: 1 });
    expect(robot.progress).toBe(0);
  });
});
