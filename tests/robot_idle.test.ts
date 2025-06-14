// Mock Babylon.js imports
jest.mock('@babylonjs/core', () => ({
  Vector3: class {},
  MeshBuilder: {
    CreateSphere: jest.fn().mockReturnValue({
      material: null,
    }),
  },
  Color3: class {}
}));

import { updateRobotMovement, RobotBehavior, Robot } from '../src/robots/robot';
import { createSimpleMaze } from '../src/maze/maze';
import { MeshBuilder } from '@babylonjs/core';

// Mock the materials module
jest.mock('../src/utils/materials', () => ({
  createMaterial: jest.fn().mockReturnValue({})
}));

// Mock the movement module
jest.mock('../src/player/movement', () => ({
  isIntersection: jest.fn().mockReturnValue(false),
  canMove: jest.fn().mockReturnValue(true)
}));

// Mock the reverse module
jest.mock('../src/robots/reverse', () => ({
  isOpposite: jest.fn().mockReturnValue(false)
}));

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
