// Entry point for Shark Robot Maze
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, StandardMaterial, Color3, Color4 } from '@babylonjs/core';
import { createSimpleMaze, MazeCell } from './maze/maze';
import { createInitialPlayer, getPlayerWorldPosition, Direction, Player } from './player/player';
import { updatePlayerMovement, bufferInput, canMove, isIntersection } from './player/movement';
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
    // Only process movement keys if not Tab and not when an input field is focused
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    const key = e.key.toLowerCase();
    const dir = keyToDir[key] || keyToDir[e.key];
    if (dir) {
      // Instant reversal: if opposite and path is clear, apply immediately
      if (
        isOpposite(dir, player.direction) &&
        canMove(maze, player.position.x, player.position.y, dir)
      ) {
        player = bufferInput(player, dir);
        // Update movement target right away
        const target = getPlayerWorldPosition(player);
        sharkTargetPos.x = target.x;
        sharkTargetPos.z = target.z;
        bufferedDirection = null;
      } else {
        bufferedDirection = dir;
      }
    }
  });
  function updateDebugOverlay(meshCount: number, playerPos: {x: number, y: number, z: number}, cameraTarget: Vector3, cameraRadius: number, cameraAlpha?: number, cameraBeta?: number) {
    if (!debugOverlay) return;
    try {
      // Show player grid position and direction
      const playerGrid = player && player.position ? player.position : { x: '?', y: '?' };
      const playerDir = player && player.direction ? player.direction : '?';
      debugOverlay.innerHTML = `
        <b>Shark Robot Maze Debug</b><br>
        Mesh count: ${meshCount}<br>
        Player pos: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})<br>
        Player grid: (${playerGrid.x}, ${playerGrid.y}) dir: ${playerDir}<br>
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
  shark.position = new Vector3(playerPos.x, 1.1, playerPos.z);
  const sharkMat = new StandardMaterial('sharkMat', scene);
  sharkMat.diffuseColor = new Color3(1, 0.5, 0); // bright orange
  shark.material = sharkMat;
  console.log('Player initial position:', playerPos);

  scene.clearColor = new Color4(0, 0.12, 0.18, 1);

  // Keyboard input
  const keyToDir: Record<string, Direction> = {
    arrowup: 'up',
    w: 'up',
    arrowdown: 'down',
    s: 'down',
    arrowleft: 'left',
    a: 'left',
    arrowright: 'right',
    d: 'right',
  };
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    const dir = keyToDir[key] || keyToDir[e.key];
    if (dir) bufferedDirection = dir;
  });

  // Game loop for player movement
  let lastTime = performance.now();
  let initialPos = getPlayerWorldPosition(player);
  let sharkRenderPos = { x: initialPos.x, y: 1.1, z: initialPos.z };
  let sharkTargetPos = { x: initialPos.x, y: 1.1, z: initialPos.z };
  let isMoving = false;
  engine.runRenderLoop(() => {
    const now = performance.now();
    let dt = now - lastTime;
    lastTime = now;

    // --- CONTINUOUS, SMOOTH, PAC-MAN STYLE MOVEMENT ---
    const speed = 0.004; // tiles per ms (about 4 tiles per second)
    // If shark is at target, try to advance to next cell if possible
    const dx = sharkTargetPos.x - sharkRenderPos.x;
    const dz = sharkTargetPos.z - sharkRenderPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    // --- Allow instant reversal of direction between grid centers ---
    if (
      bufferedDirection &&
      isOpposite(bufferedDirection, player.direction) &&
      canMove(maze, player.position.x, player.position.y, bufferedDirection)
    ) {
      player = bufferInput(player, bufferedDirection);
      bufferedDirection = null;
      // Update new movement target
      const target = getPlayerWorldPosition(player);
      sharkTargetPos.x = target.x;
      sharkTargetPos.z = target.z;
    }

    if (dist < 0.01) {
      // At grid center: update player state
      sharkRenderPos.x = sharkTargetPos.x;
      sharkRenderPos.z = sharkTargetPos.z;

      // Always buffer the latest direction if set
      if (bufferedDirection) {
        player = bufferInput(player, bufferedDirection);
        bufferedDirection = null;
      }
      // Always update movement, even if blocked
      player = updatePlayerMovement(player, maze);
      const target = getPlayerWorldPosition(player);
      sharkTargetPos.x = target.x;
      sharkTargetPos.z = target.z;
      // Check if player actually moved
      isMoving = (player.position.x !== sharkRenderPos.x || player.position.y !== sharkRenderPos.z);
    
    } else {
      isMoving = true;
      // Move smoothly toward target
      const moveStep = Math.min(speed * dt, dist);
      sharkRenderPos.x += (dx / dist) * moveStep;
      sharkRenderPos.z += (dz / dist) * moveStep;
    }
    // Y stays at 1.1
    shark.position = new Vector3(maze.width - 1 - sharkRenderPos.x, 1.1, sharkRenderPos.z);
    // Update debug overlay with new player position
    updateDebugOverlay(meshCount, getPlayerWorldPosition(player), camera.target, camera.radius, camera.alpha, camera.beta);
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Shark Robot Maze: Real-time player movement enabled.');
});
