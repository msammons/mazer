// Player (shark) logic and types

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Player {
  currentTile: { x: number; y: number };
  targetTile: { x: number; y: number };
  progress: number;
  direction: Direction;
  nextDirection: Direction | null;
  lives: number;
  score: number;
  poweredUp: boolean;
  powerupTimer: number;
}

export function createInitialPlayer(): Player {
  return {
    // Start in upper left open cell (just inside the top-left wall)
    currentTile: { x: 1, y: 1 },
    targetTile: { x: 2, y: 1 }, // start moving right
    progress: 0,
    direction: 'right',
    nextDirection: null,
    lives: 3,
    score: 0,
    poweredUp: false,
    powerupTimer: 0,
  };
}

// Minimal Vector3 type for logic/testing
export interface SimpleVector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Returns the player's world position, mirroring X so logical (0, y) is rightmost and (mazeWidth-1, y) is leftmost.
 */
export function getPlayerWorldPosition(player: Player, mazeWidth: number): SimpleVector3 {
  // Mirror X axis for Babylon.js ArcRotateCamera alpha=0
  const logicalX = player.currentTile.x + (player.targetTile.x - player.currentTile.x) * player.progress;
  const x = (mazeWidth - 1) - logicalX + 0.5;
  const y = 0.5;
  const z = player.currentTile.y + (player.targetTile.y - player.currentTile.y) * player.progress + 0.5;
  return { x, y, z };
}
