import { createSimpleMaze } from '../src/maze/maze';
import { createInitialPlayer, Player, Direction } from '../src/player/player';
import { updatePlayerMovement, bufferInput } from '../src/player/movement';

describe('Player Movement', () => {
  let maze = createSimpleMaze();
  let player: Player;
  let dt: number;

  beforeEach(() => {
    maze = createSimpleMaze();
    player = {
      currentTile: { x: 1, y: 1 },
      targetTile: { x: 2, y: 1 },
      progress: 0,
      direction: 'right',
      nextDirection: null,
      lives: 3,
      score: 0,
      poweredUp: false,
      powerupTimer: 0,
    };
    dt = 0.008;
  });

  it('moves right by default if open', () => {
    const moved = updatePlayerMovement(player, maze, dt, 1);
    expect(moved.currentTile.x + (moved.targetTile.x - moved.currentTile.x) * moved.progress)
      .toBeGreaterThan(player.currentTile.x);
    expect(moved.currentTile.y + (moved.targetTile.y - moved.currentTile.y) * moved.progress)
      .toBe(player.currentTile.y);
  });

  it('buffers a left turn and turns at intersection', () => {
    // Move player to a valid intersection (1,1) which is an open cell with multiple paths
    player = { 
      ...player, 
      currentTile: { x: 1, y: 1 }, 
      targetTile: { x: 1, y: 1 },
      direction: 'right',
      nextDirection: 'down',
      progress: 0 
    };
    
    // First update to process the movement
    let moved = updatePlayerMovement(player, maze, dt, 1);
    
    // Should turn down at intersection
    expect(moved.direction).toBe('down');
    expect(moved.targetTile.y).toBe(2);
  });

  it('does not move through walls', () => {
    // Place player next to wall
    player = { ...player, currentTile: { x: 0, y: 1 }, direction: 'left' };
    const stayed = updatePlayerMovement(player, maze, dt, 1);
    expect(stayed.currentTile.x).toBe(0);
    expect(stayed.currentTile.y).toBe(1);
  });

  it('moves away from wall when blocked and new direction is buffered', () => {
    // Place player at (1,1) facing left into open space, with down buffered
    player = { 
      ...player, 
      currentTile: { x: 1, y: 1 }, 
      targetTile: { x: 1, y: 1 },
      direction: 'left',
      nextDirection: 'down',
      progress: 0 
    };
    
    // First update should process the buffered down direction
    let moved = updatePlayerMovement(player, maze, dt, 1);
    
    // Should now be moving down
    expect(moved.direction).toBe('down');
    expect(moved.targetTile.y).toBe(2);
    expect(moved.targetTile.x).toBe(1);
  });
});
