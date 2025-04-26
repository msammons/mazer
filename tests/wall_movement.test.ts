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

  it('allows movement up/down through the gap', () => {
    // No wall up or down at (4,3)
    expect(canMove(maze, 4, 3, 'up')).toBe(true);
    expect(canMove(maze, 4, 3, 'down')).toBe(true);
  });

  it('blocks movement at maze outer borders', () => {
    expect(canMove(maze, 0, 0, 'up')).toBe(false);
    expect(canMove(maze, 0, 0, 'left')).toBe(false);
    expect(canMove(maze, maze.width-1, 0, 'right')).toBe(false);
    expect(canMove(maze, 0, maze.height-1, 'down')).toBe(false);
  });

  it('allows movement through open cells', () => {
    expect(canMove(maze, 4, 4, 'right')).toBe(true);
    expect(canMove(maze, 7, 4, 'left')).toBe(true);
  });
});
