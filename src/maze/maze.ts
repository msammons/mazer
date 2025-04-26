// Maze logic and data structures

export type MazeCell = 'empty' | 'wall' | 'fish' | 'powerup' | 'hazard' | 'shortcut' | 'spawn';

export interface Maze {
  width: number;
  height: number;
  grid: MazeCell[][];
}



export function createSimpleMaze(): Maze {
  const width = 11;
  const height = 9;
  const grid: MazeCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < width; x++) {
      // Borders and center wall as cell occupancy
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        row.push('wall');
      } else if (x === 5 && y >= 1 && y <= 7) {
        row.push('wall'); // center vertical wall
      } else {
        row.push('empty');
      }
    }
    grid.push(row);
  }
  return { width, height, grid };
}
