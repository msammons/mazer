// Entry point for Shark Robot Maze
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Color4 } from '@babylonjs/core';
import { createSimpleMaze, MazeCell } from './maze/maze';
import { createInitialPlayer, getPlayerWorldPosition, Direction, Player } from './player/player';
import { bufferInput, canMove, isIntersection, updatePlayerMovement, reversePlayerDirection } from './player/movement';
import { isOpposite } from './player/reverse';

document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('gameCanvas');
  if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas not found!');
  }
  const canvas = canvasElement;

  // Babylon.js engine and basic scene
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  // Maze and player setup
  const maze = createSimpleMaze();
  let player: Player = createInitialPlayer();
  let moving = false;
  let moveTimer = 0;
  const moveInterval = 180; // ms per tile
  let bufferedDirection: Direction | null = null;

  // Debug overlay
  const debugOverlay = document.getElementById('debugOverlay') as HTMLDivElement;
  let debugVisible = false;
  if (debugOverlay) {
    debugOverlay.innerHTML = '<b>Shark Robot Maze Debug</b><br>Loading...';
    debugOverlay.style.display = 'none';
  }
  window.addEventListener('keydown', (e) => {
    console.log('keydown event!', e.key);
    if (e.key === 'Tab') {
      debugVisible = !debugVisible;
      debugOverlay.style.display = debugVisible ? 'block' : 'none';
      e.preventDefault();
      return;
    }
  });

  // Keyboard input handling (multi-key, arcade-style)
  const keyToDir: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  // Track all currently held directions in order of most recent press
  let heldDirections: Direction[] = [];

  function bufferDirectionFromHeld() {
    if (heldDirections.length > 0) {
      player.nextDirection = heldDirections[heldDirections.length - 1];
    } else {
      player.nextDirection = null;
    }
  }

  document.addEventListener('keydown', (e) => {
    const dir = keyToDir[e.key];
    if (dir) {
      // Remove if already present, then add to end (most recent)
      heldDirections = heldDirections.filter(d => d !== dir);
      heldDirections.push(dir);
      // If instant reversal is possible, do it immediately
      if (isOpposite(dir, player.direction)) {
        player = reversePlayerDirection(player);
      } else {
        player.nextDirection = heldDirections[heldDirections.length - 1];
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    const dir = keyToDir[e.key];
    if (dir) {
      heldDirections = heldDirections.filter(d => d !== dir);
      // Always update buffer to the most recent held key (if any)
      player.nextDirection = heldDirections.length > 0 ? heldDirections[heldDirections.length - 1] : null;
    }
  });

  function updateDebugOverlay(meshCount: number, playerPos: {x: number, y: number, z: number}, cameraTarget: Vector3, cameraRadius: number, cameraAlpha?: number, cameraBeta?: number) {
    if (!debugOverlay) return;
    try {
      // Show player grid position and direction
      const playerDir = player && player.direction ? player.direction : '?';
      debugOverlay.innerHTML = `
        <b>Shark Robot Maze Debug</b><br>
        Mesh count: ${meshCount}<br>
        Player pos: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})<br>
        Player dir: ${playerDir}<br>
        Camera target: (${cameraTarget.x.toFixed(2)}, ${cameraTarget.y.toFixed(2)}, ${cameraTarget.z.toFixed(2)})<br>
        Camera radius: ${cameraRadius.toFixed(2)}<br>
        Camera alpha: ${cameraAlpha?.toFixed(2)}<br>
        Camera beta: ${cameraBeta?.toFixed(2)}
      `;
    } catch (e) {
      debugOverlay.innerHTML = '<b>Shark Robot Maze Debug</b><br><span style="color: red">Error updating overlay</span>';
    }
  }

  // Camera
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2, // alpha: top-down
    0.01,        // beta: looking almost straight down
    Math.max(maze.width, maze.height) * 1.2,
    new Vector3(maze.width / 2, 0, maze.height / 2),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = 0.01;
  camera.upperBetaLimit = 0.01;
  camera.lowerAlphaLimit = Math.PI / 2;
  camera.upperAlphaLimit = Math.PI / 2;
  camera.lowerRadiusLimit = camera.radius;
  camera.upperRadiusLimit = camera.radius;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 0; // disables zoom
  camera.radius = Math.max(maze.width, maze.height) * 1.1;
  camera.target = new Vector3(maze.width / 2, 0, maze.height / 2);
  console.log('Camera position:', camera.target, 'radius:', camera.radius, 'alpha:', camera.alpha, 'beta:', camera.beta);

  // Light
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Render maze
  let meshCount = 0;
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y][x];
      const pos = new Vector3(x, 0, y);
      if (cell === 'wall') {
        const wall = MeshBuilder.CreateBox(`wall_${x}_${y}`, { size: 1, height: 1.5 }, scene);
        wall.position = pos.add(new Vector3(0, 0.75, 0));
        const mat = new StandardMaterial(`wallMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.1, 0.3, 0.8); // restore blue
        mat.emissiveColor = new Color3(0.1, 0.3, 0.8);
        wall.material = mat;
        meshCount++;
      } else if (cell === 'fish') {
        const fish = MeshBuilder.CreateSphere(`fish_${x}_${y}`, { diameter: 0.4 }, scene);
        fish.position = pos.add(new Vector3(0, 0.25, 0));
        const mat = new StandardMaterial(`fishMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.9, 0.8, 0.2);
        fish.material = mat;
        meshCount++;
      } else if (cell === 'powerup') {
        const powerup = MeshBuilder.CreateSphere(`powerup_${x}_${y}`, { diameter: 0.5 }, scene);
        powerup.position = pos.add(new Vector3(0, 0.3, 0));
        const mat = new StandardMaterial(`powerupMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.8, 0.1, 0.7);
        powerup.material = mat;
        meshCount++;
      } else if (cell === 'hazard') {
        const hazard = MeshBuilder.CreateTorus(`hazard_${x}_${y}`, { diameter: 0.6, thickness: 0.15 }, scene);
        hazard.position = pos.add(new Vector3(0, 0.15, 0));
        const mat = new StandardMaterial(`hazardMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.1, 0.9, 0.9);
        hazard.material = mat;
        meshCount++;
      } else if (cell === 'shortcut') {
        const shortcut = MeshBuilder.CreateBox(`shortcut_${x}_${y}`, { size: 0.8, height: 0.2 }, scene);
        shortcut.position = pos.add(new Vector3(0, 0.1, 0));
        const mat = new StandardMaterial(`shortcutMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.1, 0.8, 0.2);
        shortcut.material = mat;
        meshCount++;
      } else if (cell === 'spawn') {
        const spawn = MeshBuilder.CreateBox(`spawn_${x}_${y}`, { size: 0.9, height: 0.2 }, scene);
        spawn.position = pos.add(new Vector3(0, 0.1, 0));
        const mat = new StandardMaterial(`spawnMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(1, 1, 1);
        spawn.material = mat;
        meshCount++;
        console.log(`Created spawn mesh at position ${pos}`);
      }
    }
  }
  // Update debug overlay after mesh creation
  updateDebugOverlay(meshCount, getPlayerWorldPosition(player), camera.target, camera.radius, camera.alpha, camera.beta);

  // Render player (shark)
  const shark = MeshBuilder.CreateSphere('shark', { diameter: 0.7 }, scene); // original size
  let playerPos = getPlayerWorldPosition(player);
  // Raise Y position above maze floor for visibility
  shark.position = new Vector3(maze.width - 1 - playerPos.x, 1.1, playerPos.z);
  const sharkMat = new StandardMaterial('sharkMat', scene);
  sharkMat.diffuseColor = new Color3(1, 0.5, 0); // bright orange
  shark.material = sharkMat;
  console.log('Player initial position:', playerPos);

  scene.clearColor = new Color4(0, 0.12, 0.18, 1);

  // Game loop for player movement
  const SHARK_SPEED = 4; // tiles/sec
  let lastTime = performance.now();
  engine.runRenderLoop(() => {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    player = updatePlayerMovement(player, maze, dt, SHARK_SPEED);
    const pos = getPlayerWorldPosition(player);
    shark.position = new Vector3(maze.width - 1 - pos.x, 1.1, pos.z);
    updateDebugOverlay(meshCount, pos, camera.target, camera.radius, camera.alpha, camera.beta);
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Shark Robot Maze: Real-time player movement enabled.');
});
