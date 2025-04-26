// Entry point for Shark Robot Maze
import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder, Color3, Vector3, StandardMaterial } from '@babylonjs/core';

document.addEventListener('DOMContentLoaded', () => {
  const canvasElement = document.getElementById('gameCanvas');
  if (!(canvasElement instanceof HTMLCanvasElement)) {
    throw new Error('Game canvas not found!');
  }
  const canvas = canvasElement;

  // Babylon.js engine and basic scene
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  // Camera
  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 10, new Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);

  // Light
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Ground
  const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene);
  ground.position.y = -1;
  const groundMat = new StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new Color3(0, 0.2, 0.5);
  ground.material = groundMat;

  // Sphere (placeholder for shark)
  const sphere = MeshBuilder.CreateSphere('shark', { diameter: 1 }, scene);
  sphere.position.y = 0.5;
  const sharkMat = new StandardMaterial('sharkMat', scene);
  sharkMat.diffuseColor = new Color3(0.8, 0.8, 0.2);
  sphere.material = sharkMat;

  scene.clearColor = new Color3(0, 0.12, 0.18);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Shark Robot Maze: Babylon.js scene loaded successfully.');
});
