// Player movement logic for axis-aligned, buffered input and intersection handling
import { Player, Direction } from './player';
import { Maze } from '../maze/maze';

export function isIntersection(maze: Maze, x: number, y: number): boolean {
  // An intersection is where the player can turn (more than 2 non-wall neighbors)
  const dirs = [
    [0, -1], // up
    [0, 1],  // down
    [-1, 0], // left
    [1, 0],  // right
  ];
  let open = 0;
  for (const [dx, dy] of dirs) {
    const nx = x + dx;
    const ny = y + dy;
    if (
      nx >= 0 &&
      nx < maze.width &&
      ny >= 0 &&
      ny < maze.height &&
      maze.grid[ny][nx] !== 'wall'
    ) {
      open++;
    }
  }
  return open > 2;
}

export function canMove(maze: Maze, x: number, y: number, dir: Direction): boolean {
  let nx = x, ny = y;
  if (dir === 'up') ny--;
  else if (dir === 'down') ny++;
  else if (dir === 'left') nx--;
  else if (dir === 'right') nx++;
  return (
    nx >= 0 &&
    nx < maze.width &&
    ny >= 0 &&
    ny < maze.height &&
    maze.grid[ny][nx] !== 'wall'
  );
}

export function updatePlayerMovement(player: Player, maze: Maze): Player {
  // Improved diagnostic logging
  console.log(`[updatePlayerMovement] pos: (${player.position.x},${player.position.y}) dir: ${player.direction} nextDir: ${player.nextDirection}`);
  console.log(`  canMove current: ${canMove(maze, player.position.x, player.position.y, player.direction)}, canMove next: ${player.nextDirection ? canMove(maze, player.position.x, player.position.y, player.nextDirection) : 'n/a'}`);
  let { x, y } = player.position;
  let dir = player.direction;
  let nextDir = player.nextDirection;
  // Always check for buffered direction first
  // Always try to use buffered direction first
  if (nextDir && canMove(maze, x, y, nextDir)) {
    console.log('  Turning and moving in buffered direction:', nextDir);
    dir = nextDir;
    nextDir = null; // Only clear if used
    if (dir === 'up') y--;
    else if (dir === 'down') y++;
    else if (dir === 'left') x--;
    else if (dir === 'right') x++;
  } else if (canMove(maze, x, y, dir)) {
    // If can't use buffered direction, try to move in current direction
    if (dir === 'up') y--;
    else if (dir === 'down') y++;
    else if (dir === 'left') x--;
    else if (dir === 'right') x++;
    // Do not clear nextDir if not used
  } else {
    console.log('  Blocked in both directions. Staying in place.');
    // If blocked in both directions, stay in place and retain nextDir
  }




  return {
    ...player,
    position: { x, y },
    direction: dir,
    nextDirection: nextDir,
  };
}

export function bufferInput(player: Player, input: Direction): Player {
  // Always store the latest input as nextDirection
  return { ...player, nextDirection: input };
}
