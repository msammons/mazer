import { Vector3 } from '@babylonjs/core';

let debugOverlay: HTMLDivElement | null = null;

export function updateDebugOverlay(
  meshCount: number,
  playerPos: { x: number; y: number; z: number },
  cameraTarget: Vector3,
  cameraRadius: number,
  cameraAlpha: number,
  cameraBeta: number,
  score: number
) {
  if (!debugOverlay) {
    debugOverlay = document.createElement('div');
    debugOverlay.style.position = 'absolute';
    debugOverlay.style.top = '10px';
    debugOverlay.style.left = '10px';
    debugOverlay.style.color = 'white';
    debugOverlay.style.fontSize = '14px';
    debugOverlay.style.zIndex = '1000';
    debugOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugOverlay.style.padding = '10px';
    debugOverlay.style.borderRadius = '5px';
    document.body.appendChild(debugOverlay);
  }

  try {
    debugOverlay.innerHTML = `
      <b>Shark Robot Maze Debug</b><br>
      Mesh count: ${meshCount}<br>
      Player pos: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})<br>
      Score: ${score}<br>
      Camera target: (${cameraTarget.x.toFixed(2)}, ${cameraTarget.y.toFixed(2)}, ${cameraTarget.z.toFixed(2)})<br>
      Camera radius: ${cameraRadius.toFixed(2)}<br>
      Camera alpha: ${cameraAlpha.toFixed(2)}<br>
      Camera beta: ${cameraBeta.toFixed(2)}
    `;
  } catch (e) {
    debugOverlay.innerHTML = '<b>Shark Robot Maze Debug</b><br><span style="color: red">Error updating overlay</span>';
  }
}
