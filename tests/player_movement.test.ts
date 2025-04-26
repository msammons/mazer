import { createSimpleMaze } from '../src/maze/maze';
import { createInitialPlayer, Player, Direction } from '../src/player/player';
import { updatePlayerMovement, bufferInput } from '../src/player/movement';

describe('Player Movement', () => {
  let maze = createSimpleMaze();
  let player: Player;

  beforeEach(() => {
    maze = createSimpleMaze();
    player = createInitialPlayer();
  });

  it('moves right by default if open', () => {
    const moved = updatePlayerMovement(player, maze);
    expect(moved.position.x).toBe(player.position.x + 1);
    expect(moved.position.y).toBe(player.position.y);
  });

  it('buffers a left turn and turns at intersection', () => {
    // Move player to intersection (simulate)
    player = { ...player, position: { x: 5, y: 4 }, direction: 'right' };
    player = bufferInput(player, 'up');
    const turned = updatePlayerMovement(player, maze);
    // Should turn up at intersection
    expect(turned.direction).toBe('up');
    expect(turned.position.y).toBe(3);
  });

  it('does not move through walls', () => {
    // Place player next to wall
    player = { ...player, position: { x: 0, y: 1 }, direction: 'left' };
    const stayed = updatePlayerMovement(player, maze);
    expect(stayed.position.x).toBe(0);
    expect(stayed.position.y).toBe(1);
  });

  it('moves away from wall when blocked and new direction is buffered', () => {
    // Place player next to wall, facing wall
    player = { ...player, position: { x: 0, y: 1 }, direction: 'left' };
    // Blocked by wall, now buffer 'down' (should be open in simple maze)
    player = bufferInput(player, 'down');
    // Simulate game loop: repeatedly call updatePlayerMovement until direction changes
    let moved = player;
    let steps = 0;
    while (moved.direction !== 'down' && steps < 5) {
      moved = updatePlayerMovement(moved, maze);
      steps++;
    }
    expect(moved.direction).toBe('down');
    expect(moved.position.x).toBe(0);
    expect(moved.position.y).toBe(2);
  });
});
