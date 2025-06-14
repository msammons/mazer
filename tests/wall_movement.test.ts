import { createSimpleMaze } from '../src/maze/maze';
import { canMove } from '../src/player/movement';

describe('Maze wall collision logic', () => {
  const maze = createSimpleMaze();

  it('blocks movement right into the center wall', () => {
    // Try to move right from (5,3) into wall at (5,3).walls.right
    expect(canMove(maze, 5, 3, 'right')).toBe(false);
  });

  it('blocks movement left into the center wall', () => {
    // Try to move left from (6,3) into wall at (6,3).walls.left
    expect(canMove(maze, 6, 3, 'left')).toBe(false);
  });

  it('allows movement through open cells', () => {
    // Test horizontal movement in open areas
    // Row 1: [0,1,1,1,0,1,0,1,1,1,0] - has several open cells
    expect(canMove(maze, 1, 1, 'right')).toBe(true);  // (1,1) to (2,1)
    expect(canMove(maze, 2, 1, 'right')).toBe(true);  // (2,1) to (3,1)
    
    // Test another row with open cells (row 7: [0,1,1,1,1,1,1,1,1,1,0])
    expect(canMove(maze, 2, 7, 'right')).toBe(true);  // (2,7) to (3,7)
    expect(canMove(maze, 3, 7, 'right')).toBe(true);  // (3,7) to (4,7)
  });
  
  it('blocks movement into walls', () => {
    // Center walls
    expect(canMove(maze, 5, 3, 'right')).toBe(false);  // Center wall
    expect(canMove(maze, 6, 3, 'left')).toBe(false);   // Center wall
    
    // Other walls
    expect(canMove(maze, 4, 3, 'down')).toBe(false);   // (4,3) to (4,4) is a wall
    expect(canMove(maze, 4, 3, 'up')).toBe(false);     // (4,3) to (4,2) is a wall
  });

  it('blocks movement at maze outer borders', () => {
    // Top-left corner
    expect(canMove(maze, 0, 0, 'up')).toBe(false);
    expect(canMove(maze, 0, 0, 'left')).toBe(false);
    
    // Top-right corner
    expect(canMove(maze, maze.width-1, 0, 'right')).toBe(false);
    
    // Bottom-left corner
    expect(canMove(maze, 0, maze.height-1, 'down')).toBe(false);
  });
});
