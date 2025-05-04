import { PBRMaterial, Color3, Scene } from '@babylonjs/core';

export function createMaterial(name: string, color: Color3, scene: Scene): PBRMaterial {
  const mat = new PBRMaterial(name, scene);
  mat.albedoColor = color;
  mat.metallic = 0;  // Non-metallic material
  mat.roughness = 0.5;  // Medium roughness for consistent appearance
  mat.emissiveColor = new Color3(0, 0, 0);  // No emissive light
  mat.specularIntensity = 0.5;  // Reduced specular intensity for softer highlights
  return mat;
}
