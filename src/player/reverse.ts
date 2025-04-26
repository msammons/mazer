// Utility to check if two directions are opposites
import { Direction } from './player';

export function isOpposite(dir1: Direction, dir2: Direction): boolean {
  return (
    (dir1 === 'left' && dir2 === 'right') ||
    (dir1 === 'right' && dir2 === 'left') ||
    (dir1 === 'up' && dir2 === 'down') ||
    (dir1 === 'down' && dir2 === 'up')
  );
}
