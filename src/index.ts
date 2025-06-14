// Entry point for Shark Robot Maze
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3, PBRMaterial, Color3, Color4, Mesh, DynamicTexture } from '@babylonjs/core';
import { createSimpleMaze, MazeCell } from './maze/maze';
import { createInitialPlayer, getPlayerWorldPosition, Direction, Player } from './player/player';
import { bufferInput, canMove, isIntersection, updatePlayerMovement, reversePlayerDirection } from './player/movement';
import { isOpposite } from './player/reverse';
import { createRobot, updateRobotMovement, Robot } from './robot/robot';

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
  
  // Create robots
  const robots: Robot[] = [];
  // Place robots at spawn points (if any)
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.grid[y][x] === 'spawn') {
        const robot = createRobot(maze, { x, y });
        // Create robot mesh
        robot.mesh = MeshBuilder.CreateSphere(`robot_${robots.length}`, { diameter: 0.8 }, scene);
        robot.mesh.position = new Vector3(x + 0.5, 0.5, y + 0.5);
        robot.mesh.material = createMaterial('robotMat', new Color3(0.2, 0.2, 0.8), scene);
        robots.push(robot);
      }
    }
  }
  
  // If no spawn points, place robots at random empty locations
  if (robots.length === 0) {
    for (let i = 0; i < 3; i++) { // Create 3 robots
      let x, y;
      do {
        x = Math.floor(Math.random() * maze.width);
        y = Math.floor(Math.random() * maze.height);
      } while (maze.grid[y][x] === 'wall');
      const robot = createRobot(maze, { x, y });
      // Create robot mesh
      robot.mesh = MeshBuilder.CreateSphere(`robot_${robots.length}`, { diameter: 0.8 }, scene);
      robot.mesh.position = new Vector3(x + 0.5, 0.5, y + 0.5);
      robot.mesh.material = createMaterial('robotMat', new Color3(0.2, 0.2, 0.8), scene);
      robots.push(robot);
    }
  }

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

  function updateDebugOverlay(meshCount: number, playerPos: {x: number, y: number, z: number}, cameraTarget: Vector3, cameraRadius: number, cameraAlpha?: number, cameraBeta?: number, score: number = 0) {
    if (!debugOverlay) return;
    try {
      // Show player grid position and direction
      const playerDir = player && player.direction ? player.direction : '?';
      debugOverlay.innerHTML = `
        <b>Shark Robot Maze Debug</b><br>
        Mesh count: ${meshCount}<br>
        Player pos: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})<br>
        Player dir: ${playerDir}<br>
        Score: ${score}<br>
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

  // Initialize mesh count
  let meshCount = 0;

  // Light
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Score display using HTML
  const scoreElement = document.createElement('div');
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '10px';
  scoreElement.style.left = '10px';
  scoreElement.style.fontSize = '24px';
  scoreElement.style.color = 'white';
  scoreElement.style.zIndex = '100';
  scoreElement.style.pointerEvents = 'none'; // Make it not interfere with game controls
  scoreElement.textContent = 'Score: 0';
  document.body.appendChild(scoreElement);

  // Render maze
  const wallHeight = 1.5;

  // Render pellets and other non-wall cells
  let score = 0;
  const pelletMeshes: { [key: string]: Mesh } = {};
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.grid[y][x];
      if (cell === 'pellet') {
        const pellet = MeshBuilder.CreateSphere(`pellet_${x}_${y}`, { diameter: 0.4 }, scene);
        pellet.position = new Vector3(x + 0.5, 0.25, y + 0.5); // Center in cell
        const mat = createMaterial(`pelletMat_${x}_${y}`, new Color3(1, 1, 0.3), scene);
        pellet.material = mat;
        pelletMeshes[`${x},${y}`] = pellet;
        meshCount++;
      } else if (cell === 'powerup') {
        const powerup = MeshBuilder.CreateSphere(`powerup_${x}_${y}`, { diameter: 0.5 }, scene);
        powerup.position = new Vector3(x, 0.3, y);
        const mat = createMaterial(`powerupMat_${x}_${y}`, new Color3(0.8, 0.1, 0.7), scene);
        powerup.material = mat;
        meshCount++;
      } else if (cell === 'hazard') {
        const hazard = MeshBuilder.CreateTorus(`hazard_${x}_${y}`, { diameter: 0.6, thickness: 0.15 }, scene);
        hazard.position = new Vector3(x, 0.15, y);
        const mat = createMaterial(`hazardMat_${x}_${y}`, new Color3(0.1, 0.9, 0.9), scene);
        hazard.material = mat;
        meshCount++;
      } else if (cell === 'shortcut') {
        const shortcut = MeshBuilder.CreateBox(`shortcut_${x}_${y}`, { size: 0.8, height: 0.2 }, scene);
        shortcut.position = new Vector3(x, 0.1, y);
        const mat = createMaterial(`shortcutMat_${x}_${y}`, new Color3(0.1, 0.8, 0.2), scene);
        shortcut.material = mat;
        meshCount++;
      } else if (cell === 'spawn') {
        const spawn = MeshBuilder.CreateBox(`spawn_${x}_${y}`, { size: 0.9, height: 0.2 }, scene);
        spawn.position = new Vector3(x, 0.1, y);
        const mat = createMaterial(`spawnMat_${x}_${y}`, new Color3(1, 1, 1), scene);
        spawn.material = mat;
        meshCount++;
        console.log(`Created spawn mesh at position ${x}, ${y}`);
      }
    }
  }

  // Create robot meshes
  robots.forEach((robot, index) => {
    const robotMesh = MeshBuilder.CreateBox(`robot_${index}`, { size: 0.8 }, scene);
    robotMesh.position = new Vector3(robot.currentTile.x + 0.5, 0.5, robot.currentTile.y + 0.5);
    const robotMat = createMaterial(`robotMat_${index}`, new Color3(0.5, 0, 0.5), scene);
    robotMesh.material = robotMat;
    robot.mesh = robotMesh;
  });

  // --- Seamless Pac-Man-style wall arms: each wall cell renders arms to all adjacent wall cells ---
  const wallThickness = 0.50;
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
      const wallColor = new Color3(0.5, 0.5, 0.5);  // Consistent gray color for all walls
      const centerMat = createMaterial(`wallMat_center_${x}_${y}`, wallColor, scene);
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
        const nMat = createMaterial(`wallMat_n_${x}_${y}`, wallColor, scene);
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
        const sMat = createMaterial(`wallMat_s_${x}_${y}`, wallColor, scene);
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
        const wMat = createMaterial(`wallMat_w_${x}_${y}`, wallColor, scene);
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
        const eMat = createMaterial(`wallMat_e_${x}_${y}`, wallColor, scene);
        eMesh.material = eMat;
        meshCount++;
      }
    }
  }
  // Update debug overlay after mesh creation
  updateDebugOverlay(meshCount, getPlayerWorldPosition(player, maze.width), camera.target, camera.radius, camera.alpha, camera.beta);

  // Render player (shark)
  const shark = MeshBuilder.CreateSphere('shark', { diameter: 0.88 }, scene); // Classic Pac-Man player size
  let playerPos = getPlayerWorldPosition(player, maze.width); // Pass maze width for X mirroring
  // Print player world position
  console.log("Player world position (initial):", playerPos);
  // Raise Y position above maze floor for visibility
  shark.position = new Vector3(playerPos.x, 1.1, playerPos.z);
  // Helper function to create materials
  function createMaterial(name: string, color: Color3, scene: Scene): PBRMaterial {
    const mat = new PBRMaterial(name, scene);
    mat.albedoColor = color;
    mat.metallic = 0;  // Non-metallic material
    mat.roughness = 0.5;  // Medium roughness for consistent appearance
    mat.emissiveColor = new Color3(0, 0, 0);  // No emissive light
    mat.specularIntensity = 0.5;  // Reduced specular intensity for softer highlights
    return mat;
  }

  const sharkMat = createMaterial('sharkMat', new Color3(1, 0.5, 0), scene);
  shark.material = sharkMat;
  console.log('Player initial position:', playerPos);

  scene.clearColor = new Color4(0, 0.12, 0.18, 1);

  // Game loop for player movement
  const SHARK_SPEED = 4; // tiles/sec
  let lastTime = performance.now();
  let lastUpdateTime = Date.now();
  const ROBOT_MOVE_INTERVAL = 300; // ms between robot movements
  let lastRobotUpdate = 0;

  engine.runRenderLoop(() => {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;

    // Update robots every frame
    robots.forEach((robot, i) => {
      const updated = updateRobotMovement(robot, maze, deltaTime / 1000);
      robots[i] = updated;
      // Update robot mesh position with interpolation
      if (updated.mesh) {
        const { x: currentX, y: currentY } = updated.currentTile;
        const { x: targetX, y: targetY } = updated.targetTile;
        
        // Interpolate between current and target position based on progress
        const interpolatedX = currentX + (targetX - currentX) * updated.progress;
        const interpolatedY = currentY + (targetY - currentY) * updated.progress;
        updated.mesh.position = new Vector3(interpolatedX + 0.5, 0.5, interpolatedY + 0.5);
      }
    });

    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    player = updatePlayerMovement(player, maze, dt, SHARK_SPEED);
    const pos = getPlayerWorldPosition(player, maze.width);
    shark.position = new Vector3(pos.x, 1.1, pos.z); // pos is now mirrored X
    // Check for pellet collection
    const px = Math.floor(pos.x);
    const py = Math.floor(pos.z);
    if (maze.grid[py][px] === 'pellet') {
      maze.grid[py][px] = 'empty';
      const key = `${px},${py}`;
      if (pelletMeshes[key]) {
        pelletMeshes[key].dispose();
        delete pelletMeshes[key];
      }
      score++;
    }
    // Update score display
    scoreElement.textContent = `Score: ${score}`;
    updateDebugOverlay(meshCount, pos, camera.target, camera.radius, camera.alpha, camera.beta, score);
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Shark Robot Maze: Real-time player movement enabled.');
});
