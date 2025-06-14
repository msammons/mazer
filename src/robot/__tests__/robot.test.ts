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
    // Create a maze with open paths to the right
    const maze: Maze = {
      width: 3,
      height: 3,
      grid: [
        ['wall', 'empty', 'empty'],
        ['wall', 'empty', 'empty'],
        ['wall', 'wall', 'wall']
      ]
    };

    // Create robot at starting position with initial direction to the right
    let robot = createRobot(maze, { x: 1, y: 1 }, 'right');
    // Reset robot state to ensure clean test
    robot.currentTile = { x: 1, y: 1 };
    robot.targetTile = { x: 1, y: 1 };
    robot.progress = 0;

    // First update should set up the movement to (2,1)
    robot = updateRobotMovement(robot, maze, 0.016);

    // Should be moving right to (2,1)
    expect(robot.direction).toBe('right');
    expect(robot.targetTile).toEqual({ x: 2, y: 1 });
    expect(robot.progress).toBeGreaterThan(0);

    // Simulate reaching the target tile
    robot.currentTile = { x: 2, y: 1 };
    robot.targetTile = { x: 2, y: 1 };
    robot.progress = 0;

    // Update robot movement again - should stay at the edge
    robot = updateRobotMovement(robot, maze, 0.016);
    
    // Should stay at the same position since right is blocked
    expect(robot.direction).toBe('right');
    expect(robot.targetTile).toEqual({ x: 2, y: 1 });
    expect(robot.progress).toBe(0);
    
    // Change direction to up and update
    robot.direction = 'up';
    robot = updateRobotMovement(robot, maze, 0.016);
    
    // Should move up to (2,0)
    expect(robot.direction).toBe('up');
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
