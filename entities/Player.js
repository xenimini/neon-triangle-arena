import * as THREE from 'three';

export class Player {
  constructor(id, username, color, isLocal = false) {
    this.id = id;
    this.username = username;
    this.isLocal = isLocal;
    this.mesh = this._createMesh(color);
  }

  _createMesh(color) {
    const geometry = new THREE.ConeGeometry(0.7, 2.2, 3); // Треугольник
    const material = new THREE.MeshStandardMaterial({ 
      color: color || 0x00ffff,
      emissive: color || 0x00ffff,
      emissiveIntensity: 0.7
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1.1;
    mesh.castShadow = true;
    return mesh;
  }

  updatePosition(position, rotation) {
    this.mesh.position.set(position.x, 1.1, position.z);
    if (rotation && rotation.y !== undefined) this.mesh.rotation.y = rotation.y;
  }

  addToScene(scene) {
    scene.add(this.mesh);
  }
}