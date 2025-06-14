// Robot types and interface
import { Direction } from '../player/player';
import { Maze } from '../maze/maze';
import { isIntersection, canMove } from '../player/movement';
import { isOpposite } from './reverse';
import { Vector3, MeshBuilder, Color3 } from '@babylonjs/core';
import { createMaterial } from '../utils/materials';

export interface Robot {
  id: number;
  currentTile: { x: number; y: number };
  targetTile: { x: number; y: number };
  progress: number;
  direction: Direction;
  behavior: RobotBehavior;
  chaseTarget: { x: number; y: number } | null;
  mesh: any; // Babylon.js mesh
  isProtected: boolean; // True when in spawn area
  spawnArea: { x: number; y: number };
}

export enum RobotBehavior {
  PATROL = 'patrol',
  CHASE = 'chase',
  AMBUSH = 'ambush'
}

export function createRobot(id: number, x: number, y: number, behavior: RobotBehavior, scene: any): Robot {
  // Create robot mesh
  const mesh = MeshBuilder.CreateSphere(`robot_${id}`, { diameter: 0.8 }, scene);
  mesh.material = createMaterial(`robotMat_${id}`, new Color3(0.8, 0.1, 0.1), scene);
  
  return {
    id,
    currentTile: { x, y },
    targetTile: { x, y },
    progress: 0,
    direction: 'right',
    behavior,
    chaseTarget: null,
    mesh,
    isProtected: true,
    spawnArea: { x, y }
  };
}

export function getRobotWorldPosition(robot: Robot): { x: number; y: number; z: number } {
  const { x: currentX, y: currentY } = robot.currentTile;
  const { x: targetX, y: targetY } = robot.targetTile;
  const progress = robot.progress;
  
  // Calculate position between current and target tile
  const positionX = currentX + (targetX - currentX) * progress;
  const positionY = 0.5;
  const positionZ = currentY + (targetY - currentY) * progress;
  
  // Update mesh position
  if (robot.mesh) {
    robot.mesh.position = new Vector3(positionX, positionY, positionZ);
  }
  
  return { x: positionX, y: positionY, z: positionZ };
}

export function updateRobotMovement(robot: Robot, maze: Maze, player: { x: number; y: number }, dt: number, speed: number): Robot {
  // Update progress
  let progress = robot.progress;
  if (robot.currentTile.x !== robot.targetTile.x || robot.currentTile.y !== robot.targetTile.y) {
    progress += dt * speed;
    if (progress >= 1) {
      // Reached target tile
      robot.currentTile = { ...robot.targetTile };
      progress = 0;
      
      // Choose next direction based on behavior
      const nextDirection = getNextDirection(robot, maze, player);
      if (nextDirection) {
        robot.direction = nextDirection;
        
        // Calculate next target tile
        const dx = nextDirection === 'right' ? 1 : nextDirection === 'left' ? -1 : 0;
        const dy = nextDirection === 'down' ? 1 : nextDirection === 'up' ? -1 : 0;
        
        // Check if we're still in spawn area
        if (robot.isProtected) {
          const distanceFromSpawn = Math.abs(robot.currentTile.x - robot.spawnArea.x) +
                                 Math.abs(robot.currentTile.y - robot.spawnArea.y);
          if (distanceFromSpawn >= 2) {
            robot.isProtected = false;
          }
        }
        
        // Set new target tile
        robot.targetTile = {
          x: robot.currentTile.x + dx,
          y: robot.currentTile.y + dy
        };
      }
    }
  } else {
    // Remain idle without accumulating progress
    progress = 0;
    if (progress >= 1) {
      // Snap to target tile
      const newCurrentTile = { ...robot.targetTile };
      
      // Update direction based on behavior
      let newDirection: Direction = robot.direction;
      let newTargetTile = { ...newCurrentTile };
      
      switch (robot.behavior) {
        case RobotBehavior.PATROL:
          // Simple patrol: turn at intersections
          if (isIntersection(maze, newCurrentTile.x, newCurrentTile.y)) {
            const dirs: Direction[] = ['up', 'down', 'left', 'right'];
            const validDirs = dirs.filter(dir => canMove(maze, newCurrentTile.x, newCurrentTile.y, dir as Direction));
            if (validDirs.length > 0) {
              // Choose a random direction that's not the opposite of current direction
              const oppositeDir = isOpposite(robot.direction);
              const validNonOpposite = validDirs.filter(dir => dir !== oppositeDir);
              newDirection = validNonOpposite[Math.floor(Math.random() * validNonOpposite.length)] as Direction;
            }
          }
          break;
        
        case RobotBehavior.CHASE:
          // Chase player
          if (robot.chaseTarget) {
            const dx = robot.chaseTarget.x - newCurrentTile.x;
            const dy = robot.chaseTarget.y - newCurrentTile.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
              newDirection = dx > 0 ? 'right' : 'left';
            } else {
              newDirection = dy > 0 ? 'down' : 'up';
            }
          }
          break;
        
        case RobotBehavior.AMBUSH:
          // Ambush behavior: stay still until player is nearby
          if (robot.chaseTarget) {
            const dx = robot.chaseTarget.x - newCurrentTile.x;
            const dy = robot.chaseTarget.y - newCurrentTile.y;
            
            if (Math.abs(dx) + Math.abs(dy) <= 2) { // Within 2 tiles
              if (Math.abs(dx) > Math.abs(dy)) {
                newDirection = dx > 0 ? 'right' : 'left';
              } else {
                newDirection = dy > 0 ? 'down' : 'up';
              }
            }
          }
          break;
      }
      
      // Update target tile based on direction
      if (newDirection === 'up') newTargetTile = { x: newCurrentTile.x, y: newCurrentTile.y - 1 };
      else if (newDirection === 'down') newTargetTile = { x: newCurrentTile.x, y: newCurrentTile.y + 1 };
      else if (newDirection === 'left') newTargetTile = { x: newCurrentTile.x - 1, y: newCurrentTile.y };
      else if (newDirection === 'right') newTargetTile = { x: newCurrentTile.x + 1, y: newCurrentTile.y };
      
      // Validate move
      if (
        newTargetTile.x >= 0 &&
        newTargetTile.x < maze.width &&
        newTargetTile.y >= 0 &&
        newTargetTile.y < maze.height &&
        maze.grid[newTargetTile.y][newTargetTile.x] !== 'wall'
      ) {
        return {
          ...robot,
          currentTile: { ...newCurrentTile },
          targetTile: { ...newTargetTile },
          progress: 0,
          direction: newDirection
        };
      }
    }
    return { ...robot, progress };
  }
  
  // Already at a tile and not moving: update chase target if needed
  if (robot.behavior === RobotBehavior.CHASE || robot.behavior === RobotBehavior.AMBUSH) {
    robot.chaseTarget = { x: player.x, y: player.y };
  }
  
  return {
    ...robot,
    progress,
    mesh: robot.mesh
  };
}

// Helper function to choose next direction based on behavior
function getNextDirection(robot: Robot, maze: Maze, player: { x: number; y: number }): Direction | null {
  const { x, y } = robot.currentTile;
  const possibleDirections: Direction[] = [];

  // Check all possible directions
  if (y > 0 && maze.grid[y - 1][x] !== 'wall') possibleDirections.push('up');
  if (y < maze.height - 1 && maze.grid[y + 1][x] !== 'wall') possibleDirections.push('down');
  if (x > 0 && maze.grid[y][x - 1] !== 'wall') possibleDirections.push('left');
  if (x < maze.width - 1 && maze.grid[y][x + 1] !== 'wall') possibleDirections.push('right');

  // Remove current direction if we're not at an intersection
  if (!isIntersection(maze, robot.currentTile.x, robot.currentTile.y)) {
    const index = possibleDirections.indexOf(robot.direction);
    if (index !== -1) {
      possibleDirections.splice(index, 1);
    }
  }

  // Choose direction based on behavior
  switch (robot.behavior) {
    case RobotBehavior.PATROL:
      // Patrol behavior: move randomly
      return possibleDirections[Math.floor(Math.random() * possibleDirections.length)] || null;
    case RobotBehavior.CHASE:
      // Chase behavior: move towards player
      if (!robot.chaseTarget) return null;
      
      const dx = robot.chaseTarget.x - x;
      const dy = robot.chaseTarget.y - y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Move horizontally
        return dx > 0 ? 'right' : 'left';
      } else {
        // Move vertically
        return dy > 0 ? 'down' : 'up';
      }
    case RobotBehavior.AMBUSH:
      // Ambush behavior: stay still until player is close
      if (!robot.chaseTarget) return null;
      
      const distance = Math.abs(robot.chaseTarget.x - x) + Math.abs(robot.chaseTarget.y - y);
      if (distance <= 2) {
        return getNextDirection({
          ...robot,
          behavior: RobotBehavior.CHASE
        }, maze, player);
      }
      return null;
    default:
      return null;
  }
}

// Helper function to check if two robots are in the same tile
export function areRobotsColliding(robot1: Robot, robot2: Robot): boolean {
  return (
    robot1.currentTile.x === robot2.currentTile.x &&
    robot1.currentTile.y === robot2.currentTile.y
  );
}
