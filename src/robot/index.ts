// Re-export types and enums from robots/robot
export type { Robot } from '../robots/robot';
export { RobotBehavior } from '../robots/robot';

// Re-export createRobot and other functions from robots/robot
export { 
  createRobot,
  getRobotWorldPosition,
  updateRobotMovement,
  getNextDirection,
  areRobotsColliding 
} from '../robots/robot';

// Re-export the local robot module's exports
export * from './robot';
