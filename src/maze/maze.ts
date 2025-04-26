// Maze logic and data structures

export type MazeCell = 'empty' | 'wall' | 'fish' | 'powerup' | 'hazard' | 'shortcut' | 'spawn';

export interface Maze {
  width: number;
  height: number;
  grid: MazeCell[][];
}



export function createSimpleMaze(): Maze {
  // More complex, classic Pac-Man–like layout
  // 0 = wall, 1 = empty
  const layout = [
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,0,1,0,1,1,1,0],
    [0,1,0,1,0,1,0,1,0,1,0],
    [0,1,0,1,1,1,1,1,0,1,0],
    [0,1,0,0,0,0,0,0,0,1,0],
    [0,1,1,1,0,1,0,1,1,1,0],
    [0,0,0,1,0,1,0,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0],
  ];
  const width = layout[0].length;
  const height = layout.length;
  const grid: MazeCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push(layout[y][x] === 0 ? 'wall' : 'empty');
    }
    grid.push(row);
  }
  return { width, height, grid };
}
