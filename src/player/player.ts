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

export function getPlayerWorldPosition(player: Player): SimpleVector3 {
  // Linear interpolate between currentTile and targetTile using progress
  const x = player.currentTile.x + (player.targetTile.x - player.currentTile.x) * player.progress;
  const y = 0.5;
  const z = player.currentTile.y + (player.targetTile.y - player.currentTile.y) * player.progress;
  return { x, y, z };
}
