import { updateRobotMovement, RobotBehavior, Robot } from '../src/robots/robot';
import { createSimpleMaze } from '../src/maze/maze';

describe('Robot idle behavior', () => {
  it('does not accumulate progress when stationary', () => {
    const maze = createSimpleMaze();
    const robot: Robot = {
      id: 1,
      currentTile: { x: 1, y: 1 },
      targetTile: { x: 1, y: 1 },
      progress: 0,
      direction: 'right',
      behavior: RobotBehavior.PATROL,
      chaseTarget: null,
      mesh: null,
      isProtected: true,
      spawnArea: { x: 1, y: 1 }
    };
    const player = { x: 0, y: 0 };
    const dt = 0.5;
    const speed = 1;

    let updated = updateRobotMovement(robot, maze, player, dt, speed);
    expect(updated.progress).toBe(0);

    updated = updateRobotMovement(updated, maze, player, dt, speed);
    expect(updated.progress).toBe(0);
  });
});
