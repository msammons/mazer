export interface Robot {
  id: number;
  currentTile: { x: number; y: number };
  targetTile: { x: number; y: number };
  progress: number;
  direction: 'up' | 'down' | 'left' | 'right';
  behavior: RobotBehavior;
  chaseTarget: { x: number; y: number } | null;
  mesh: any; // Babylon.js mesh
  isProtected: boolean;
  spawnArea: { x: number; y: number };
}

export type RobotBehavior = 'idle' | 'chase' | 'scatter' | 'frightened';
