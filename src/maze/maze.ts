// Maze logic and data structures

export type MazeCell = 'empty' | 'wall' | 'fish' | 'powerup' | 'hazard' | 'shortcut' | 'spawn';

export interface Maze {
  width: number;
  height: number;
  grid: MazeCell[][];
}

export function createSimpleMaze(): Maze {
  // Simple hardcoded maze for initial visualization
  // 'wall' on borders, 'empty' in center, 'fish' at some positions
  const width = 11;
  const height = 9;
  const grid: MazeCell[][] = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) return 'wall';
      if ((x === 5 && y === 4) || (x === 3 && y === 2)) return 'powerup';
      if ((x === 1 && y === 1) || (x === 9 && y === 7)) return 'hazard';
      if ((x === 2 && y === 4) || (x === 8 && y === 4)) return 'shortcut';
      if ((x + y) % 3 === 0) return 'fish';
      return 'empty';
    })
  );
  return { width, height, grid };
}
