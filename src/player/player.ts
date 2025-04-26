// Player (shark) logic and types

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Player {
  position: { x: number; y: number };
  direction: Direction;
  nextDirection: Direction | null;
  lives: number;
  score: number;
  poweredUp: boolean;
  powerupTimer: number;
}

export function createInitialPlayer(): Player {
  return {
    position: { x: 1, y: 1 },
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
  // Converts maze grid position to world coordinates
  return { x: player.position.x, y: 0.5, z: player.position.y };
}
