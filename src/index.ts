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

  // --- DIAGNOSTICS ---
  // Print maze grid with player position
  console.log("Maze grid (0=wall, 1=empty, P=player):");
  maze.grid.forEach((row, y) => {
    console.log(row.map((cell, x) => (x === player.currentTile.x && y === player.currentTile.y ? "P" : cell === "wall" ? "0" : "1")).join(" "));
  });
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
    w: 'up',
    ArrowDown: 'down',
    s: 'down',
    ArrowLeft: 'left',
    a: 'left',
    ArrowRight: 'right',
    d: 'right',
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
      // Debug log: show direction and player grid position
      console.log(`[KEYDOWN] Direction: ${dir}, Player: (${player.currentTile.x}, ${player.currentTile.y}), Facing: ${player.direction}`);
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
    0, // alpha: look from +Z, so +X is right, +Z is down (Babylon.js default XZ plane)
    0.01,        // beta: looking almost straight down
    Math.max(maze.width, maze.height) * 1.2,
    new Vector3(maze.width / 2, 0, maze.height / 2),
    scene,
  );
  // Print camera alpha, target, and position
  console.log("Camera alpha:", camera.alpha, "Camera target:", camera.target, "Camera position:", camera.position);
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
  const wallHeight = 1.5;

  // Render non-wall cells (fish, powerup, hazard, shortcut, spawn)
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y][x];
      if (cell === 'fish') {
        const fish = MeshBuilder.CreateSphere(`fish_${x}_${y}`, { diameter: 0.4 }, scene);
        fish.position = new Vector3(x, 0.25, y);
        const mat = new StandardMaterial(`fishMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.9, 0.8, 0.2);
        fish.material = mat;
        meshCount++;
      } else if (cell === 'powerup') {
        const powerup = MeshBuilder.CreateSphere(`powerup_${x}_${y}`, { diameter: 0.5 }, scene);
        powerup.position = new Vector3(x, 0.3, y);
        const mat = new StandardMaterial(`powerupMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.8, 0.1, 0.7);
        powerup.material = mat;
        meshCount++;
      } else if (cell === 'hazard') {
        const hazard = MeshBuilder.CreateTorus(`hazard_${x}_${y}`, { diameter: 0.6, thickness: 0.15 }, scene);
        hazard.position = new Vector3(x, 0.15, y);
        const mat = new StandardMaterial(`hazardMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.1, 0.9, 0.9);
        hazard.material = mat;
        meshCount++;
      } else if (cell === 'shortcut') {
        const shortcut = MeshBuilder.CreateBox(`shortcut_${x}_${y}`, { size: 0.8, height: 0.2 }, scene);
        shortcut.position = new Vector3(x, 0.1, y);
        const mat = new StandardMaterial(`shortcutMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(0.1, 0.8, 0.2);
        shortcut.material = mat;
        meshCount++;
      } else if (cell === 'spawn') {
        const spawn = MeshBuilder.CreateBox(`spawn_${x}_${y}`, { size: 0.9, height: 0.2 }, scene);
        spawn.position = new Vector3(x, 0.1, y);
        const mat = new StandardMaterial(`spawnMat_${x}_${y}`, scene);
        mat.diffuseColor = new Color3(1, 1, 1);
        spawn.material = mat;
        meshCount++;
        console.log(`Created spawn mesh at position ${x}, ${y}`);
      }
    }
  }

  // --- Seamless Pac-Man-style wall arms: each wall cell renders arms to all adjacent wall cells ---
  const wallThickness = 0.28;
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.grid[y][x] !== 'wall') continue;
      // Always render a center block (for junction/solidness)
      const centerMesh = MeshBuilder.CreateBox(`wall_center_${x}_${y}`, {
        width: wallThickness,
        depth: wallThickness,
        height: wallHeight
      }, scene);
      centerMesh.position = new Vector3(x + 0.5, wallHeight / 2, y + 0.5);
      const centerMat = new StandardMaterial(`wallMat_center_${x}_${y}`, scene);
      centerMat.diffuseColor = new Color3(0.1, 0.3, 0.8);
      centerMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
      centerMesh.material = centerMat;
      meshCount++;
      // North arm
      if (y > 0 && maze.grid[y - 1][x] === 'wall') {
        const nMesh = MeshBuilder.CreateBox(`wall_n_${x}_${y}`, {
          width: wallThickness,
          depth: 1,
          height: wallHeight
        }, scene);
        nMesh.position = new Vector3(x + 0.5, wallHeight / 2, y + 0.5 - 0.5);
        const nMat = new StandardMaterial(`wallMat_n_${x}_${y}`, scene);
        nMat.diffuseColor = new Color3(0.1, 0.3, 0.8);
        nMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
        nMesh.material = nMat;
        meshCount++;
      }
      // South arm
      if (y < maze.height - 1 && maze.grid[y + 1][x] === 'wall') {
        const sMesh = MeshBuilder.CreateBox(`wall_s_${x}_${y}`, {
          width: wallThickness,
          depth: 1,
          height: wallHeight
        }, scene);
        sMesh.position = new Vector3(x + 0.5, wallHeight / 2, y + 0.5 + 0.5);
        const sMat = new StandardMaterial(`wallMat_s_${x}_${y}`, scene);
        sMat.diffuseColor = new Color3(0.1, 0.3, 0.8);
        sMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
        sMesh.material = sMat;
        meshCount++;
      }
      // West arm
      if (x > 0 && maze.grid[y][x - 1] === 'wall') {
        const wMesh = MeshBuilder.CreateBox(`wall_w_${x}_${y}`, {
          width: 1,
          depth: wallThickness,
          height: wallHeight
        }, scene);
        wMesh.position = new Vector3(x + 0.5 - 0.5, wallHeight / 2, y + 0.5);
        const wMat = new StandardMaterial(`wallMat_w_${x}_${y}`, scene);
        wMat.diffuseColor = new Color3(0.1, 0.3, 0.8);
        wMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
        wMesh.material = wMat;
        meshCount++;
      }
      // East arm
      if (x < maze.width - 1 && maze.grid[y][x + 1] === 'wall') {
        const eMesh = MeshBuilder.CreateBox(`wall_e_${x}_${y}`, {
          width: 1,
          depth: wallThickness,
          height: wallHeight
        }, scene);
        eMesh.position = new Vector3(x + 0.5 + 0.5, wallHeight / 2, y + 0.5);
        const eMat = new StandardMaterial(`wallMat_e_${x}_${y}`, scene);
        eMat.diffuseColor = new Color3(0.1, 0.3, 0.8);
        eMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
        eMesh.material = eMat;
        meshCount++;
      }
    }
  }
  // Update debug overlay after mesh creation
  updateDebugOverlay(meshCount, getPlayerWorldPosition(player, maze.width), camera.target, camera.radius, camera.alpha, camera.beta);

  // Render player (shark)
  const shark = MeshBuilder.CreateSphere('shark', { diameter: 1.3 }, scene); // Slightly smaller player
  let playerPos = getPlayerWorldPosition(player, maze.width); // Pass maze width for X mirroring
  // Print player world position
  console.log("Player world position (initial):", playerPos);
  // Raise Y position above maze floor for visibility
  shark.position = new Vector3(playerPos.x, 1.1, playerPos.z);
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
    const pos = getPlayerWorldPosition(player, maze.width);
    shark.position = new Vector3(pos.x, 1.1, pos.z); // pos is now mirrored X
    updateDebugOverlay(meshCount, pos, camera.target, camera.radius, camera.alpha, camera.beta);
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Shark Robot Maze: Real-time player movement enabled.');
});
