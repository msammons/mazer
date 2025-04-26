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
    // Move player to intersection (simulate)
    player = { ...player, currentTile: { x: 5, y: 4 }, direction: 'right' };
    player = bufferInput(player, 'up');
    const turned = updatePlayerMovement(player, maze, dt, 1);
    // Should turn up at intersection
    expect(turned.direction).toBe('up');
    expect(turned.currentTile.y).toBe(3);
  });

  it('does not move through walls', () => {
    // Place player next to wall
    player = { ...player, currentTile: { x: 0, y: 1 }, direction: 'left' };
    const stayed = updatePlayerMovement(player, maze, dt, 1);
    expect(stayed.currentTile.x).toBe(0);
    expect(stayed.currentTile.y).toBe(1);
  });

  it('moves away from wall when blocked and new direction is buffered', () => {
    // Place player next to wall, facing wall
    player = { ...player, currentTile: { x: 0, y: 1 }, direction: 'left' };
    // Blocked by wall, now buffer 'down' (should be open in simple maze)
    player = bufferInput(player, 'down');
    // Simulate game loop: repeatedly call updatePlayerMovement until direction changes
    let moved = player;
    let steps = 0;
    while (moved.direction !== 'down' && steps < 5) {
      moved = updatePlayerMovement(moved, maze, dt, 1);
      steps++;
    }
    expect(moved.direction).toBe('down');
    expect(moved.currentTile.x).toBe(0);
    expect(moved.currentTile.y).toBe(2);
  });
});
