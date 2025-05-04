import { Direction } from '../player/player';

// Robot direction reversal utility
export function isOpposite(direction: Direction): Direction {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
    default: return 'right';
  }
}
